import React from 'react';
import { DailyGroup } from '../types';
import { PROJECTS } from '../constants';
import { formatDate } from '../lib/utils';
import { Clock, Trash2, Calendar } from 'lucide-react';

interface HistoryListProps {
  groups: DailyGroup[];
  onDelete: (id: string) => void;
  isLoading: boolean;
}

export const HistoryList: React.FC<HistoryListProps> = ({ groups, onDelete, isLoading }) => {
  if (isLoading && groups.length === 0) {
    return (
      <div className="flex justify-center p-12 text-gray-500">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-4 w-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="text-center p-12 bg-white rounded-lg border border-dashed border-gray-300">
        <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">No entries yet</h3>
        <p className="text-gray-500 mt-1">Start tracking your time by adding an entry above.</p>
      </div>
    );
  }

  const getProjectName = (id: string) => PROJECTS.find(p => p.id === id)?.name || id;

  const grandTotal = groups.reduce((sum, group) => sum + group.totalHours, 0);

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-600" />
            History
          </h2>
          <div className="text-sm font-medium text-gray-600 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
            Grand Total: <span className="text-blue-600 font-bold">{grandTotal.toFixed(2)}h</span>
          </div>
       </div>

      {groups.map((group) => (
        <div key={group.date} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="font-semibold text-gray-900">{formatDate(group.date)}</span>
            </div>
            <span className="text-sm font-medium text-gray-600">
              Total: <span className="text-gray-900">{group.totalHours.toFixed(2)}h</span>
            </span>
          </div>
          
          <div className="divide-y divide-gray-100">
            {group.entries.map((entry) => (
              <div key={entry.id} className="p-4 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                <div className="flex-1 min-w-0">
                   <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {getProjectName(entry.projectId)}
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        {entry.hours}h
                      </span>
                   </div>
                   <p className="text-sm text-gray-600 truncate">{entry.description}</p>
                </div>
                
                <button 
                  onClick={() => onDelete(entry.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none"
                  aria-label="Delete entry"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};