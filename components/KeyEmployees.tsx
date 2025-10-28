import React from 'react';
import type { KeyEmployee } from '../types';
import { SpinnerIcon, ErrorIcon, KeyEmployeeIcon } from './Icons';

interface KeyEmployeesProps {
  isLoading: boolean;
  employees: KeyEmployee[] | null;
  error: string | null;
}

export const KeyEmployees: React.FC<KeyEmployeesProps> = ({ isLoading, employees, error }) => {
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <SpinnerIcon className="text-teal-500" />
          <p className="ml-3 text-slate-600 font-medium">Identifying key employees...</p>
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

    if (employees) {
      if (employees.length === 0) {
        return (
            <p className="text-sm text-slate-500 text-center py-4">No key employees were identified from the provided data.</p>
        )
      }
      return (
        <ul className="space-y-3">
            {employees.map((employee, index) => (
                <li key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="font-semibold text-slate-800">{employee.name}</span>
                    <span className="text-sm text-teal-700 bg-teal-100 font-medium px-2.5 py-1 rounded-full">{employee.role}</span>
                </li>
            ))}
        </ul>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-slate-200">
      <div className="flex items-center mb-4">
        <KeyEmployeeIcon />
        <h2 className="text-2xl font-bold text-slate-800 ml-3">Key Employee Identification</h2>
      </div>
      {renderContent()}
    </div>
  );
};
