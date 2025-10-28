
import React from 'react';
import type { CsvFileData } from '../types';
import { SuccessIcon, ErrorIcon } from './Icons';

interface HeaderDisplayProps {
  fileData: CsvFileData;
}

export const HeaderDisplay: React.FC<HeaderDisplayProps> = ({ fileData }) => {
  const { name, headers, error } = fileData;

  return (
    <div className="bg-white rounded-lg shadow-md border border-slate-200 p-5 flex flex-col h-full">
      <div className="flex items-start mb-3">
        {error ? <ErrorIcon /> : <SuccessIcon />}
        <h3 className="ml-2 font-bold text-slate-800 break-all leading-tight">{name}</h3>
      </div>
      {error ? (
        <div className="flex-grow flex items-center justify-center bg-red-50 text-red-700 p-4 rounded-md">
          <p className="text-sm text-center font-medium">{error}</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
          {headers.length > 0 ? (
            headers.map((header, index) => (
              <span key={index} className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                {header}
              </span>
            ))
          ) : (
             <div className="flex-grow flex items-center justify-center bg-yellow-50 text-yellow-700 p-4 rounded-md w-full">
                <p className="text-sm text-center font-medium">No headers found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
