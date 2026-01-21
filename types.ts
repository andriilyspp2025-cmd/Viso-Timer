export interface TimeEntry {
  id: string;
  date: string; // YYYY-MM-DD
  projectId: string;
  hours: number;
  description: string;
  createdAt: number;
}

export interface Project {
  id: string;
  name: string;
}

export interface DailyGroup {
  date: string;
  entries: TimeEntry[];
  totalHours: number;
}

export type CreateTimeEntryDTO = Omit<TimeEntry, 'id' | 'createdAt'>;

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}