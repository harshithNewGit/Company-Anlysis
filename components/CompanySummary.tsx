import React from 'react';
import type { CompanyInfo } from '../types';
import { SpinnerIcon, AiIcon, LinkIcon, ErrorIcon } from './Icons';

interface CompanySummaryProps {
  isLoading: boolean;
  info: CompanyInfo | null;
  error: string | null;
}

export const CompanySummary: React.FC<CompanySummaryProps> = ({ isLoading, info, error }) => {
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <SpinnerIcon className="text-indigo-500" />
          <p className="ml-3 text-slate-600 font-medium">Analyzing company data...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-start bg-red-50 text-red-800 p-4 rounded-md">
          <ErrorIcon />
          <div className="ml-3">
            <h3 className="font-bold text-sm">Analysis Failed</h3>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      );
    }

    if (info) {
      return (
        <div className="space-y-4">
          <p className="text-slate-700 leading-relaxed text-justify">{info.summary}</p>
          {info.website ? (
            <div className="flex items-center pt-3 border-t border-slate-100">
              <LinkIcon />
              <a 
                href={info.website} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="ml-2 text-indigo-600 hover:text-indigo-800 font-medium transition-colors break-all"
              >
                {info.website}
              </a>
            </div>
          ) : (
             <div className="text-sm text-slate-500 pt-3 border-t border-slate-100">
                No website found in the provided data.
            </div>
          )}
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-slate-200">
      <div className="flex items-center mb-4">
        <AiIcon />
        <h2 className="text-2xl font-bold text-slate-800 ml-3">Company Insights</h2>
      </div>
      {renderContent()}
    </div>
  );
};
