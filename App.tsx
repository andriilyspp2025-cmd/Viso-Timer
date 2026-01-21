import React, { useEffect, useState, useMemo } from 'react';
import { TimeEntry, DailyGroup, CreateTimeEntryDTO } from './types';
import { TimeService } from './services/api';
import { EntryForm } from './components/EntryForm';
import { HistoryList } from './components/HistoryList';
import { AlertCircle } from 'lucide-react';

function App() {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initial Fetch
  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    setIsLoading(true);
    try {
      const response = await TimeService.getAll();
      if (response.success && response.data) {
        setEntries(response.data);
      } else {
        setError(response.error || 'Failed to fetch entries');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEntry = async (data: CreateTimeEntryDTO) => {
    setFormLoading(true);
    setError(null);
    try {
      const response = await TimeService.create(data);
      if (response.success && response.data) {
        // Optimistic update or refetch. We'll refetch to keep it simple and consistent.
        await fetchEntries(); 
      } else {
        setError(response.error || 'Failed to create entry');
      }
    } catch (err) {
      setError('Failed to connect to the server');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    // Optimistic delete
    const previousEntries = [...entries];
    setEntries(entries.filter(e => e.id !== id));

    try {
      const response = await TimeService.delete(id);
      if (!response.success) {
        throw new Error(response.error);
      }
    } catch (err) {
      // Revert if failed
      setEntries(previousEntries);
      setError("Failed to delete entry");
    }
  };

  // Group entries by date
  const groupedEntries = useMemo(() => {
    const groups: Record<string, DailyGroup> = {};
    
    entries.forEach(entry => {
      if (!groups[entry.date]) {
        groups[entry.date] = {
          date: entry.date,
          entries: [],
          totalHours: 0
        };
      }
      groups[entry.date].entries.push(entry);
      groups[entry.date].totalHours += entry.hours;
    });

    // Convert to array and sort by date descending
    return Object.values(groups).sort((a, b) => 
      b.date.localeCompare(a.date)
    );
  }, [entries]);

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">
              V
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">VisoTime</h1>
          </div>
          <div className="text-sm text-gray-500 hidden sm:block">
            Candidate Test Assignment
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 text-red-700 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold">Error</h3>
              <p className="text-sm mt-1">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-sm hover:underline">Dismiss</button>
          </div>
        )}

        <EntryForm onSubmit={handleCreateEntry} isLoading={formLoading} />
        
        <HistoryList 
          groups={groupedEntries} 
          onDelete={handleDeleteEntry}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
}

export default App;