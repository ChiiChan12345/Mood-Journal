import { useMemo } from 'react';
import { MoodEntry } from '../utils/storage';

const POSITIVE_MOODS = [
  'Happy',
  'Excited',
  'Calm',
  'Grateful',
  'Loved',
  'Energetic',
  'Hopeful',
  'Proud',
];

export function useStreaks(entries: MoodEntry[]) {
  // Sort entries by date descending
  const sorted = useMemo(() =>
    [...entries].sort((a, b) => b.date.localeCompare(a.date)),
    [entries]
  );

  // Calculate streak
  const { streak, streakDates } = useMemo(() => {
    let streak = 0;
    let streakDates: string[] = [];
    let prevDate: Date | null = null;
    for (const entry of sorted) {
      if (!POSITIVE_MOODS.includes(entry.mood.label)) break;
      const entryDate = new Date(entry.date);
      if (prevDate) {
        // Check if the previous date is exactly one day after the current
        const diff = (prevDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24);
        if (diff !== 1) break;
      }
      streak++;
      streakDates.push(entry.date);
      prevDate = entryDate;
    }
    return { streak, streakDates };
  }, [sorted]);

  return { streak, streakDates };
} 