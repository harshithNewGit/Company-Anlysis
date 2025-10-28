import React, { useState, useCallback } from 'react';
import { FileInput } from './components/FileInput';
import { HeaderDisplay } from './components/HeaderDisplay';
import { CompanySummary } from './components/CompanySummary';
import { LinkedInAnalysis } from './components/LinkedInAnalysis';
import { KeyEmployees } from './components/KeyEmployees';
import { parseCsvHeaders, readCsvChunk } from './services/csvParser';
import { getCompanyInfoFromCsv, getLinkedInAnalysisFromCsv, getKeyEmployeesFromCsv } from './services/geminiService';
import type { CsvFileData, CompanyInfo, LinkedInAnalysis as LinkedInAnalysisData, KeyEmployee, Author } from './types';
import { ProcessIcon, ClearIcon, SpinnerIcon, DownloadIcon } from './components/Icons';

interface DownloadableProfile {
    name: string;
    linkedinUrl: string;
}

const App: React.FC = () => {
  const [files, setFiles] = useState<(File | null)[]>([null, null, null]);
  const [parsedData, setParsedData] = useState<(CsvFileData | null)[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [isCompanyInfoLoading, setIsCompanyInfoLoading] = useState<boolean>(false);
  const [companyInfoError, setCompanyInfoError] = useState<string | null>(null);

  const [linkedInAnalysis, setLinkedInAnalysis] = useState<LinkedInAnalysisData | null>(null);
  const [isLinkedInAnalysisLoading, setIsLinkedInAnalysisLoading] = useState<boolean>(false);
  const [linkedInAnalysisError, setLinkedInAnalysisError] = useState<string | null>(null);

  const [keyEmployees, setKeyEmployees] = useState<KeyEmployee[] | null>(null);
  const [isKeyEmployeesLoading, setIsKeyEmployeesLoading] = useState<boolean>(false);
  const [keyEmployeesError, setKeyEmployeesError] = useState<string | null>(null);
  
  const [downloadableProfiles, setDownloadableProfiles] = useState<DownloadableProfile[]>([]);


  const handleFileChange = useCallback((index: number, file: File | null) => {
    setFiles(prevFiles => {
      const newFiles = [...prevFiles];
      newFiles[index] = file;
      return newFiles;
    });
    // Clear results when files change
    setParsedData([]);
    setCompanyInfo(null);
    setCompanyInfoError(null);
    setLinkedInAnalysis(null);
    setLinkedInAnalysisError(null);
    setKeyEmployees(null);
    setKeyEmployeesError(null);
    setDownloadableProfiles([]);
  }, []);

  const processFiles = useCallback(async () => {
    setIsLoading(true);
    setParsedData([]);
    setCompanyInfo(null);
    setCompanyInfoError(null);
    setLinkedInAnalysis(null);
    setLinkedInAnalysisError(null);
    setKeyEmployees(null);
    setKeyEmployeesError(null);
    setDownloadableProfiles([]);

    const validFiles = files.filter((f): f is File => f !== null);

    const headerPromise = Promise.all(
      validFiles.map(async (file) => {
        try {
          const headers = await parseCsvHeaders(file);
          return { name: file.name, headers };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
          return { name: file.name, headers: [], error: errorMessage };
        }
      })
    );

    const companyFile = files[0];
    let companyInfoPromise: Promise<void> = Promise.resolve();

    if (companyFile) {
      setIsCompanyInfoLoading(true);
      companyInfoPromise = (async () => {
        try {
          const csvContent = await readCsvChunk(companyFile);
          const info = await getCompanyInfoFromCsv(csvContent);
          setCompanyInfo(info);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An unknown AI error occurred';
          setCompanyInfoError(errorMessage);
        } finally {
          setIsCompanyInfoLoading(false);
        }
      })();
    }
    
    const linkedInFile = files[1];
    let linkedInAnalysisPromise: Promise<LinkedInAnalysisData | null> = Promise.resolve(null);

    if (linkedInFile) {
      setIsLinkedInAnalysisLoading(true);
      linkedInAnalysisPromise = (async () => {
        try {
          const csvContent = await readCsvChunk(linkedInFile);
          const analysis = await getLinkedInAnalysisFromCsv(csvContent);
          setLinkedInAnalysis(analysis);
          return analysis;
        } catch (error) {
           const errorMessage = error instanceof Error ? error.message : 'An unknown AI error occurred';
          setLinkedInAnalysisError(errorMessage);
          return null;
        } finally {
          setIsLinkedInAnalysisLoading(false);
        }
      })();
    }

    const keyEmployeesFile = files[2];
    let keyEmployeesPromise: Promise<KeyEmployee[] | null> = Promise.resolve(null);
    if (keyEmployeesFile) {
      setIsKeyEmployeesLoading(true);
      keyEmployeesPromise = (async () => {
        try {
          const csvContent = await readCsvChunk(keyEmployeesFile);
          const employees = await getKeyEmployeesFromCsv(csvContent);
          setKeyEmployees(employees);
          return employees;
        } catch (error) {
           const errorMessage = error instanceof Error ? error.message : 'An unknown AI error occurred';
          setKeyEmployeesError(errorMessage);
          return null;
        } finally {
          setIsKeyEmployeesLoading(false);
        }
      })();
    }


    const [headerResults, analysisResult, employeesResult] = await Promise.all([headerPromise, linkedInAnalysisPromise, keyEmployeesPromise, companyInfoPromise]);
    
    // Aggregate profiles for download
    const profiles = new Map<string, DownloadableProfile>();
    
    (employeesResult || []).forEach(emp => {
        if (emp.name && emp.linkedinUrl) {
            profiles.set(emp.name.toLowerCase(), { name: emp.name, linkedinUrl: emp.linkedinUrl });
        }
    });

    (analysisResult?.authors || []).forEach(author => {
        if (author.name && author.linkedinUrl && !profiles.has(author.name.toLowerCase())) {
            profiles.set(author.name.toLowerCase(), { name: author.name, linkedinUrl: author.linkedinUrl });
        }
    });

    setDownloadableProfiles(Array.from(profiles.values()));
    
    setParsedData(headerResults);
    setIsLoading(false);
  }, [files]);
  
  const clearAll = useCallback(() => {
    setFiles([null, null, null]);
    setParsedData([]);
    setIsLoading(false);
    setCompanyInfo(null);
    setIsCompanyInfoLoading(false);
    setCompanyInfoError(null);
    setLinkedInAnalysis(null);
    setIsLinkedInAnalysisLoading(false);
    setLinkedInAnalysisError(null);
    setKeyEmployees(null);
    setIsKeyEmployeesLoading(false);
    setKeyEmployeesError(null);
    setDownloadableProfiles([]);
  }, []);

  const handleDownload = useCallback(() => {
    if (downloadableProfiles.length === 0) return;

    const header = 'Name,LinkedIn Profile URL\n';
    const rows = downloadableProfiles.map(p => `"${p.name.replace(/"/g, '""')}","${p.linkedinUrl}"`).join('\n');
    const csvContent = header + rows;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.href) {
      URL.revokeObjectURL(link.href);
    }
    link.href = URL.createObjectURL(blob);
    link.download = 'linkedin_profiles.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [downloadableProfiles]);

  const canProcess = files.some(f => f !== null);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 tracking-tight">
            CSV Header & Company Insights
          </h1>
          <p className="mt-3 text-lg text-slate-600 max-w-2xl mx-auto">
            Upload up to three CSV files for header extraction and AI-powered analysis of company details, LinkedIn posts, and employee lists.
          </p>
        </header>

        <main className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {files.map((file, index) => (
              <FileInput
                key={index}
                id={`file-input-${index}`}
                label={index === 0 ? "Company Details CSV" : index === 1 ? "LinkedIn Posts CSV" : `Employee List CSV`}
                onFileSelect={(selectedFile) => handleFileChange(index, selectedFile)}
                fileName={file?.name}
              />
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={processFiles}
              disabled={!canProcess || isLoading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isLoading ? (
                <>
                  <SpinnerIcon />
                  Processing...
                </>
              ) : (
                <>
                  <ProcessIcon />
                  Extract & Analyze
                </>
              )}
            </button>
            <button
              onClick={handleDownload}
              disabled={downloadableProfiles.length === 0 || isLoading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg shadow-md hover:bg-teal-700 disabled:bg-teal-300 disabled:cursor-not-allowed transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              <DownloadIcon />
              Download Profiles
            </button>
            <button
              onClick={clearAll}
               className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-500 text-white font-semibold rounded-lg shadow-md hover:bg-slate-600 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400"
            >
              <ClearIcon />
              Clear All
            </button>
          </div>
        </main>
        
        <div className="space-y-10 mt-10">
            {(isCompanyInfoLoading || companyInfo || companyInfoError) && (
              <section>
                <CompanySummary
                  isLoading={isCompanyInfoLoading}
                  info={companyInfo}
                  error={companyInfoError}
                />
              </section>
            )}
    
            {(isLinkedInAnalysisLoading || linkedInAnalysis || linkedInAnalysisError) && (
              <section>
                  <LinkedInAnalysis
                      isLoading={isLinkedInAnalysisLoading}
                      analysis={linkedInAnalysis}
                      error={linkedInAnalysisError}
                  />
              </section>
            )}

            {(isKeyEmployeesLoading || keyEmployees || keyEmployeesError) && (
              <section>
                  <KeyEmployees
                      isLoading={isKeyEmployeesLoading}
                      employees={keyEmployees}
                      error={keyEmployeesError}
                  />
              </section>
            )}
        </div>


        {parsedData.length > 0 && (
          <section className="mt-10">
            <h2 className="text-2xl font-bold text-slate-700 text-center mb-6">Extracted Headers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {parsedData.map((data, index) => 
                data ? <HeaderDisplay key={index} fileData={data} /> : null
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default App;