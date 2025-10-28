export interface CsvFileData {
  name: string;
  headers: string[];
  error?: string;
}

export interface CompanyInfo {
  summary: string;
  website: string;
}

export type ActivityLevel = 'Active' | 'Less Active' | 'Inactive' | 'Unknown';

export interface Author {
    name: string;
    linkedinUrl: string;
}

export interface LinkedInAnalysis {
  activityLevel: ActivityLevel;
  authors: Author[];
  postSummary: string;
}

export interface KeyEmployee {
  name: string;
  role: string;
  linkedinUrl: string;
}