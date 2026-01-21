import React, { useState } from 'react';
import { CreateTimeEntryDTO } from '../types';
import { PROJECTS, MAX_DAILY_HOURS } from '../constants';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { PlusCircle, AlertCircle } from 'lucide-react';

interface EntryFormProps {
  onSubmit: (data: CreateTimeEntryDTO) => Promise<void>;
  isLoading: boolean;
}

export const EntryForm: React.FC<EntryFormProps> = ({ onSubmit, isLoading }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [projectId, setProjectId] = useState('');
  const [hours, setHours] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!date) newErrors.date = 'Date is required';
    if (!projectId) newErrors.projectId = 'Project is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    
    const numHours = parseFloat(hours);
    if (!hours || isNaN(numHours)) {
      newErrors.hours = 'Hours must be a number';
    } else if (numHours <= 0) {
      newErrors.hours = 'Hours must be greater than 0';
    } else if (numHours > MAX_DAILY_HOURS) {
      newErrors.hours = `Max ${MAX_DAILY_HOURS} hours`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await onSubmit({
        date,
        projectId,
        hours: parseFloat(hours),
        description
      });
      // Reset form on success (except date, usually convenient to keep)
      setProjectId('');
      setHours('');
      setDescription('');
      setErrors({});
    } catch (error) {
      // Error handling is done in parent, but we can set form errors here if needed
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <PlusCircle className="text-blue-600 h-5 w-5" />
        <h2 className="text-lg font-semibold text-gray-900">New Time Entry</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        <Input 
          id="date"
          type="date" 
          label="Date" 
          value={date} 
          onChange={(e) => setDate(e.target.value)}
          error={errors.date}
          required
        />
        
        <Select
          id="project"
          label="Project"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          options={PROJECTS.map(p => ({ value: p.id, label: p.name }))}
          error={errors.projectId}
          required
        />

        <Input 
          id="hours"
          type="number" 
          label="Hours" 
          step="0.25"
          min="0.25"
          max="24"
          placeholder="e.g. 2.5"
          value={hours} 
          onChange={(e) => setHours(e.target.value)}
          error={errors.hours}
          required
        />

        <Input 
          id="description"
          type="text" 
          label="Description" 
          placeholder="What did you work on?"
          value={description} 
          onChange={(e) => setDescription(e.target.value)}
          error={errors.description}
          required
        />
      </div>

      <div className="mt-4 flex justify-end">
        <Button type="submit" isLoading={isLoading} className="w-full md:w-auto">
          Save Entry
        </Button>
      </div>
    </form>
  );
};