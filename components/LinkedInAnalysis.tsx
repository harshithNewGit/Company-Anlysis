import React from 'react';
import type { LinkedInAnalysis as LinkedInAnalysisData } from '../types';
import { SpinnerIcon, ErrorIcon, LinkedInIcon, ActivityIcon, AuthorsIcon, SummaryIcon } from './Icons';

interface LinkedInAnalysisProps {
  isLoading: boolean;
  analysis: LinkedInAnalysisData | null;
  error: string | null;
}

const ActivityBadge: React.FC<{ level: LinkedInAnalysisData['activityLevel'] }> = ({ level }) => {
  const levelStyles: Record<typeof level, string> = {
    Active: 'bg-green-100 text-green-800',
    'Less Active': 'bg-yellow-100 text-yellow-800',
    Inactive: 'bg-red-100 text-red-800',
    Unknown: 'bg-slate-100 text-slate-800',
  };

  return (
    <span className={`px-3 py-1 text-sm font-bold rounded-full ${levelStyles[level] || levelStyles.Unknown}`}>
      {level}
    </span>
  );
};

export const LinkedInAnalysis: React.FC<LinkedInAnalysisProps> = ({ isLoading, analysis, error }) => {
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <SpinnerIcon className="text-blue-500" />
          <p className="ml-3 text-slate-600 font-medium">Analyzing LinkedIn posts...</p>
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

    if (analysis) {
      return (
        <div className="space-y-5">
          <div className="flex items-center">
            <ActivityIcon />
            <h4 className="font-semibold text-slate-700 ml-2 mr-3">Activity Level:</h4>
            <ActivityBadge level={analysis.activityLevel} />
          </div>
          
          {analysis.postSummary && (
            <div className="pt-5 border-t border-slate-100">
              <div className="flex items-center mb-3">
                <SummaryIcon />
                <h4 className="font-semibold text-slate-700 ml-2">Post Highlights:</h4>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{analysis.postSummary}</p>
            </div>
          )}

          <div className="pt-5 border-t border-slate-100">
            <div className="flex items-center mb-3">
              <AuthorsIcon />
              <h4 className="font-semibold text-slate-700 ml-2">Post Authors:</h4>
            </div>
            {analysis.authors.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                    {analysis.authors.map((author, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                            {author.name}
                        </span>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-slate-500">No authors identified from the data.</p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-slate-200">
      <div className="flex items-center mb-4">
        <LinkedInIcon />
        <h2 className="text-2xl font-bold text-slate-800 ml-3">LinkedIn Post Analysis</h2>
      </div>
      {renderContent()}
    </div>
  );
};