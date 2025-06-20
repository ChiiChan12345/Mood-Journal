import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

export interface Location {
  latitude: number;
  longitude: number;
  name: string;
}

export interface MoodData {
  mood: string;
  intensity: number; // 1-5 scale
  primary: boolean;
}

export interface JournalEntry {
  id: string;
  date: string;
  mood: string; // Keeping for backward compatibility
  moods: MoodData[]; // New field for multiple moods
  note?: string;
  activities?: string[];
  voiceNote?: string;
  photos?: string[]; // Array of local file URIs
  location?: Location;
  tags?: string[];
  isPrivate?: boolean;
  intensity?: number; // Keeping for backward compatibility
}

const ENTRIES_KEY = '@journal_entries';
const CUSTOM_ACTIVITIES_KEY = 'custom_activities';
const PHOTOS_DIRECTORY = `${FileSystem.documentDirectory}journal_photos/`;

// Ensure photos directory exists
async function ensurePhotosDirectory() {
  const dirInfo = await FileSystem.getInfoAsync(PHOTOS_DIRECTORY);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(PHOTOS_DIRECTORY, { intermediates: true });
  }
}

// Save a photo and return its local URI
export async function savePhoto(photoUri: string): Promise<string> {
  await ensurePhotosDirectory();
  const filename = `photo_${Date.now()}.jpg`;
  const destinationUri = `${PHOTOS_DIRECTORY}${filename}`;
  
  await FileSystem.copyAsync({
    from: photoUri,
    to: destinationUri
  });
  
  return destinationUri;
}

// Delete a photo
export async function deletePhoto(photoUri: string): Promise<void> {
  try {
    await FileSystem.deleteAsync(photoUri);
  } catch (error) {
    console.error('Error deleting photo:', error);
  }
}

export interface CustomActivity {
  id: string;
  name: string;
  icon: string;
  category: string;
}

// Save entries
export async function saveEntries(entries: JournalEntry[]): Promise<void> {
  try {
    await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
  } catch (error) {
    console.error('Error saving entries:', error);
  }
}

// Add or update entry
export async function saveEntry(entry: JournalEntry): Promise<void> {
  const entries = await getEntries();
  const index = entries.findIndex(e => e.id === entry.id);
  
  // If updating an entry with new photos, handle old photos
  if (index !== -1 && entries[index].photos) {
    const oldPhotos = entries[index].photos || [];
    const newPhotos = entry.photos || [];
    const photosToDelete = oldPhotos.filter(photo => !newPhotos.includes(photo));
    
    // Delete photos that are no longer in use
    await Promise.all(photosToDelete.map(photo => deletePhoto(photo)));
  }
  
  if (index !== -1) {
    entries[index] = entry;
  } else {
    entries.push(entry);
  }
  
  await saveEntries(entries);
}

// Get entries
export async function getEntries(): Promise<JournalEntry[]> {
  try {
    const entriesJson = await AsyncStorage.getItem(ENTRIES_KEY);
    return entriesJson ? JSON.parse(entriesJson) : [];
  } catch (error) {
    console.error('Error getting entries:', error);
    return [];
  }
}

// Delete entry
export async function deleteEntry(entryId: string): Promise<void> {
  const entries = await getEntries();
  const entry = entries.find(e => e.id === entryId);
  
  // Delete associated photos
  if (entry?.photos) {
    await Promise.all(entry.photos.map(photo => deletePhoto(photo)));
  }
  
  const filteredEntries = entries.filter(e => e.id !== entryId);
  await saveEntries(filteredEntries);
}

// Get entries by tag
export async function getEntriesByTag(tag: string): Promise<JournalEntry[]> {
  const entries = await getEntries();
  return entries.filter(entry => entry.tags?.includes(tag));
}

// Search entries
export async function searchEntries(query: string): Promise<JournalEntry[]> {
  const entries = await getEntries();
  const lowercaseQuery = query.toLowerCase();
  
  return entries.filter(entry => {
    return (
      entry.note?.toLowerCase().includes(lowercaseQuery) ||
      entry.mood.toLowerCase().includes(lowercaseQuery) ||
      entry.moods?.some(m => m.mood.toLowerCase().includes(lowercaseQuery)) ||
      entry.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
      entry.location?.name.toLowerCase().includes(lowercaseQuery)
    );
  });
}

// Get entries by date range
export async function getEntriesByDateRange(startDate: Date, endDate: Date): Promise<JournalEntry[]> {
  const entries = await getEntries();
  return entries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate >= startDate && entryDate <= endDate;
  });
}

// Toggle entry privacy
export async function toggleEntryPrivacy(entryId: string): Promise<void> {
  const entries = await getEntries();
  const entry = entries.find(e => e.id === entryId);
  
  if (entry) {
    entry.isPrivate = !entry.isPrivate;
    await saveEntries(entries);
  }
}

export async function saveCustomActivity(activity: CustomActivity): Promise<void> {
  try {
    const activities = await getCustomActivities();
    const existingIndex = activities.findIndex(a => a.id === activity.id);
    
    if (existingIndex >= 0) {
      activities[existingIndex] = activity;
    } else {
      activities.push(activity);
    }
    
    await AsyncStorage.setItem(CUSTOM_ACTIVITIES_KEY, JSON.stringify(activities));
  } catch (error) {
    console.error('Error saving custom activity:', error);
    throw error;
  }
}

export async function getCustomActivities(): Promise<CustomActivity[]> {
  try {
    const activitiesJson = await AsyncStorage.getItem(CUSTOM_ACTIVITIES_KEY);
    return activitiesJson ? JSON.parse(activitiesJson) : [];
  } catch (error) {
    console.error('Error getting custom activities:', error);
    return [];
  }
}

export async function deleteCustomActivity(id: string): Promise<void> {
  try {
    const activities = await getCustomActivities();
    const filteredActivities = activities.filter(activity => activity.id !== id);
    await AsyncStorage.setItem(CUSTOM_ACTIVITIES_KEY, JSON.stringify(filteredActivities));
  } catch (error) {
    console.error('Error deleting custom activity:', error);
    throw error;
  }
}

const GOALS_KEY = '@journal_goals';

export interface Goal {
  id: string;
  title: string;
  category: string;
  progress: number;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  notificationEnabled: boolean;
  reminderTime?: {
    hour: number;
    minute: number;
  };
  activities: string[];
  description?: string;
}

// Get all goals
export async function getGoals(): Promise<Goal[]> {
  try {
    const goalsJson = await AsyncStorage.getItem(GOALS_KEY);
    return goalsJson ? JSON.parse(goalsJson) : [];
  } catch (error) {
    console.error('Error getting goals:', error);
    return [];
  }
}

// Save all goals
export async function saveGoals(goals: Goal[]): Promise<void> {
  try {
    await AsyncStorage.setItem(GOALS_KEY, JSON.stringify(goals));
  } catch (error) {
    console.error('Error saving goals:', error);
  }
}

// Add or update a goal
export async function saveGoal(goal: Goal): Promise<void> {
  const goals = await getGoals();
  const existingGoalIndex = goals.findIndex((g) => g.id === goal.id);

  if (existingGoalIndex >= 0) {
    goals[existingGoalIndex] = {
      ...goal,
      notificationEnabled: goal.notificationEnabled ?? true,
      reminderTime: goal.reminderTime ?? { hour: 10, minute: 0 },
    };
  } else {
    goals.push({
      ...goal,
      notificationEnabled: true,
      reminderTime: { hour: 10, minute: 0 },
    });
  }

  await saveGoals(goals);
}

// Delete a goal
export async function deleteGoal(goalId: string): Promise<void> {
  const goals = await getGoals();
  const filteredGoals = goals.filter(g => g.id !== goalId);
  await saveGoals(filteredGoals);
}

// Get goals by category
export async function getGoalsByCategory(category: string): Promise<Goal[]> {
  const goals = await getGoals();
  return goals.filter(goal => goal.category === category);
}

// Get goals by activity
export async function getGoalsByActivity(activityId: string): Promise<Goal[]> {
  const goals = await getGoals();
  return goals.filter(goal => goal.activities.includes(activityId));
}

// Get completed goals
export async function getCompletedGoals(): Promise<Goal[]> {
  const goals = await getGoals();
  return goals.filter(goal => goal.completed);
}

// Get active (incomplete) goals
export async function getActiveGoals(): Promise<Goal[]> {
  const goals = await getGoals();
  return goals.filter(goal => !goal.completed);
}

// Update goal progress
export async function updateGoalProgress(goalId: string, progress: number): Promise<void> {
  const goals = await getGoals();
  const goal = goals.find(g => g.id === goalId);
  
  if (goal) {
    goal.progress = Math.max(0, Math.min(100, progress));
    goal.completed = goal.progress === 100;
    goal.updatedAt = new Date().toISOString();
    await saveGoals(goals);
  }
}

// Toggle goal completion
export async function toggleGoalCompletion(goalId: string): Promise<void> {
  const goals = await getGoals();
  const goal = goals.find(g => g.id === goalId);
  
  if (goal) {
    goal.completed = !goal.completed;
    goal.progress = goal.completed ? 100 : goal.progress;
    goal.updatedAt = new Date().toISOString();
    await saveGoals(goals);
  }
} 