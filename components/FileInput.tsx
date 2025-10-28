
import React, { useRef } from 'react';
import { UploadIcon } from './Icons';

interface FileInputProps {
  id: string;
  label: string;
  onFileSelect: (file: File | null) => void;
  fileName?: string;
}

export const FileInput: React.FC<FileInputProps> = ({ id, label, onFileSelect, fileName }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    onFileSelect(file);
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center">
      <label htmlFor={id} className="text-sm font-medium text-slate-700 mb-2">
        {label}
      </label>
      <input
        type="file"
        id={id}
        ref={inputRef}
        accept=".csv"
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        onClick={handleButtonClick}
        className="w-full flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors duration-200 cursor-pointer h-32 group"
      >
        <UploadIcon />
        <span
          className={`mt-2 text-sm text-center w-full block truncate ${
            fileName ? 'text-indigo-700 font-semibold' : 'text-slate-500'
          }`}
          title={fileName}
        >
          {fileName ? fileName : 'Click to select a file'}
        </span>
      </button>
    </div>
  );
};
