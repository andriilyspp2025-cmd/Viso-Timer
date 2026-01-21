import { TimeEntry, CreateTimeEntryDTO, ApiResponse } from '../types';
import { generateId } from '../lib/utils';
import { MAX_DAILY_HOURS } from '../constants';

const STORAGE_KEY = 'viso_time_entries';

// Simulating database delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to get raw data
const getDb = (): TimeEntry[] => {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
};

// Helper to save raw data
const saveDb = (data: TimeEntry[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const TimeService = {
  async getAll(): Promise<ApiResponse<TimeEntry[]>> {
    await delay(300); // Simulate network latency
    const entries = getDb();
    // Sort by date desc, then created at desc
    entries.sort((a, b) => {
        if (a.date !== b.date) {
            return b.date.localeCompare(a.date);
        }
        return b.createdAt - a.createdAt;
    });
    return { success: true, data: entries };
  },

  async create(entry: CreateTimeEntryDTO): Promise<ApiResponse<TimeEntry>> {
    await delay(500); // Simulate network latency

    // Validation 1: Required fields (Backend check)
    if (!entry.date || !entry.projectId || !entry.hours || !entry.description) {
      return { success: false, error: "All fields are required." };
    }

    // Validation 2: Positive hours
    if (entry.hours <= 0) {
      return { success: false, error: "Hours must be greater than 0." };
    }

    const db = getDb();

    // Validation 3: 24h limit per day
    const entriesOnDate = db.filter(e => e.date === entry.date);
    const totalHoursOnDate = entriesOnDate.reduce((sum, e) => sum + e.hours, 0);

    if (totalHoursOnDate + entry.hours > MAX_DAILY_HOURS) {
      return { 
        success: false, 
        error: `Daily limit exceeded. You have ${MAX_DAILY_HOURS - totalHoursOnDate}h remaining for ${entry.date}.` 
      };
    }

    const newEntry: TimeEntry = {
      ...entry,
      id: generateId(),
      createdAt: Date.now(),
    };

    db.push(newEntry);
    saveDb(db);

    return { success: true, data: newEntry };
  },

  async delete(id: string): Promise<ApiResponse<void>> {
      await delay(300);
      const db = getDb();
      const filtered = db.filter(e => e.id !== id);
      saveDb(filtered);
      return { success: true };
  }
};