import { GoogleGenAI, Type } from "@google/genai";
import type { CompanyInfo, LinkedInAnalysis, KeyEmployee, Author } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const callGemini = async <T>(prompt: string, schema: any): Promise<T> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
      },
    });

    const jsonText = response.text.trim();
    if (!jsonText) {
      throw new Error("The AI model returned an empty response.");
    }
    
    // The response is already a stringified JSON, so we parse it.
    return JSON.parse(jsonText) as T;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    throw new Error(`AI analysis failed: ${message}`);
  }
}

export const getCompanyInfoFromCsv = async (csvContent: string): Promise<CompanyInfo> => {
  const prompt = `
    Analyze the following CSV data which contains information about a company.
    Based on the data, perform the following tasks:
    1. Extract key information about the company.
    2. Write a brief, one-paragraph summary of the company.
    3. Provide the company's official website URL.

    CSV Data:
    ---
    ${csvContent}
    ---

    Return the response as a JSON object with two keys: "summary" and "website".
    If a website cannot be found, the "website" value should be an empty string.
  `;
  
  const schema = {
    type: Type.OBJECT,
    properties: {
      summary: {
        type: Type.STRING,
        description: 'A brief, one-paragraph summary of the company.',
      },
      website: {
        type: Type.STRING,
        description: "The official website URL of the company. Should be a full URL, e.g., 'https://www.example.com'.",
      },
    },
    required: ['summary', 'website'],
  };

  const result = await callGemini<CompanyInfo>(prompt, schema);
  if (typeof result.summary !== 'string' || typeof result.website !== 'string') {
    throw new Error("The AI model returned an invalid data structure for company info.");
  }
  return result;
};


export const getLinkedInAnalysisFromCsv = async (csvContent: string): Promise<LinkedInAnalysis> => {
    const prompt = `
        Analyze the following CSV data which contains LinkedIn posts from a company.
        Your task is to:
        1. Identify the post dates and authors. Assume date columns might be named 'date', 'post_date', or 'timestamp'. Assume author columns might be named 'author', 'posted_by', or 'name'.
        2. Calculate the posting frequency based on the dates.
        3. Classify the company's activity level based on this frequency. The categories are:
           - 'Active': 3 or more posts per week on average.
           - 'Less Active': At least 1 post per month, but less than 3 per week.
           - 'Inactive': 5 or fewer posts per year.
           - 'Unknown': If you cannot determine the frequency from the data.
        4. For each unique author, provide their name and generate a likely LinkedIn profile URL. The URL should follow the format 'https://www.linkedin.com/in/firstname-lastname'.
        5. Create a brief, one-paragraph summary of the posts that specifically discuss company products or company updates. If there are no such posts, this summary should be an empty string.

        CSV Data:
        ---
        ${csvContent}
        ---

        Return your analysis as a single JSON object with three keys: "activityLevel", "authors", and "postSummary".
        - "activityLevel" must be one of the following strings: 'Active', 'Less Active', 'Inactive', 'Unknown'.
        - "authors" must be an array of objects, where each object has two keys: "name" (a string) and "linkedinUrl" (a string).
        - "postSummary" must be a string containing the summary.
    `;
    
    const schema = {
        type: Type.OBJECT,
        properties: {
            activityLevel: {
                type: Type.STRING,
                description: "The company's activity level on LinkedIn. Must be 'Active', 'Less Active', 'Inactive', or 'Unknown'."
            },
            authors: {
                type: Type.ARRAY,
                items: { 
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING, description: "The full name of the author." },
                        linkedinUrl: { type: Type.STRING, description: "The generated LinkedIn profile URL for the author." }
                    },
                    required: ['name', 'linkedinUrl']
                },
                description: "A list of unique authors of the posts with their LinkedIn URLs."
            },
            postSummary: {
                type: Type.STRING,
                description: "A brief summary of posts related to company products and updates."
            }
        },
        required: ['activityLevel', 'authors', 'postSummary']
    };

    const result = await callGemini<LinkedInAnalysis>(prompt, schema);
    if (typeof result.activityLevel !== 'string' || !Array.isArray(result.authors) || typeof result.postSummary !== 'string') {
        throw new Error("The AI model returned an invalid data structure for LinkedIn analysis.");
    }
    return result;
};

export const getKeyEmployeesFromCsv = async (csvContent: string): Promise<KeyEmployee[]> => {
    const prompt = `
      Analyze the following CSV data which contains a list of employees. Assume column names for employee names could be 'name', 'full_name', or 'employee' and roles could be 'role', 'title', 'position', or 'job_title'.
      Your task is to identify key employees who are likely valuable points of contact for business inquiries, leads, or important communications. 
      These include roles like managers, directors, VPs, C-level executives (CEO, CTO, CFO), Public Relations (PR), and Human Resources (HR).
      
      For each key employee you identify, extract their full name, their role, and generate a likely LinkedIn profile URL for them. The URL should be in the format 'https://www.linkedin.com/in/firstname-lastname'.

      CSV Data:
      ---
      ${csvContent}
      ---

      Return your findings as a JSON array of objects. Each object in the array must have three keys: "name", "role", and "linkedinUrl".
      For example: [{"name": "Jane Doe", "role": "CEO", "linkedinUrl": "https://www.linkedin.com/in/jane-doe"}].
      If no key employees can be identified, return an empty array.
    `;
    
    const schema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: {
              type: Type.STRING,
              description: 'The full name of the key employee.',
            },
            role: {
              type: Type.STRING,
              description: 'The job title or role of the key employee.',
            },
            linkedinUrl: {
                type: Type.STRING,
                description: "A generated, likely LinkedIn profile URL for the employee."
            }
          },
          required: ['name', 'role', 'linkedinUrl'],
        },
    };

    const result = await callGemini<KeyEmployee[]>(prompt, schema);
    if (!Array.isArray(result) || !result.every(item => typeof item.name === 'string' && typeof item.role === 'string' && typeof item.linkedinUrl === 'string')) {
       throw new Error("The AI model returned an invalid data structure for key employees.");
    }
    return result;
};