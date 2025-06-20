import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { saveEntry, getEntries, JournalEntry, MoodData, Location as LocationData, savePhoto } from '../utils/storage';
import MoodSelector from '../components/MoodSelector';
import MoodAuraView from '../components/MoodAuraView';
import ActivitySelector from '../components/ActivitySelector';
import VoiceRecorder from '../components/VoiceRecorder';
import { MOOD_CATEGORIES } from '../components/MoodSelector';

interface EntryScreenProps {
  entryId?: string;
  date?: string;
}

// Update MoodData interface to include color
interface ExtendedMoodData extends MoodData {
  color?: string;
}

export default function EntryScreen({ entryId, date }: EntryScreenProps) {
  const [entry, setEntry] = useState<JournalEntry>({
    id: entryId || Date.now().toString(),
    date: date || new Date().toISOString(),
    mood: '',
    moods: [],
    note: '',
    activities: [],
    photos: [],
    tags: [],
    isPrivate: false
  });
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [auraColors, setAuraColors] = useState<string[]>([]);
  const [averageIntensity, setAverageIntensity] = useState(3);

  useEffect(() => {
    if (entryId) {
      loadEntry();
    }
    requestPermissions();
  }, [entryId]);

  const loadEntry = async () => {
    const entries = await getEntries();
    const existingEntry = entries.find(e => e.id === entryId);
    if (existingEntry) {
      setEntry(existingEntry);
      if (existingEntry.location) {
        setLocation(existingEntry.location);
      }
    }
  };

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status: imageStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (imageStatus !== 'granted') {
        alert('Sorry, we need camera roll permissions to add photos!');
      }

      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      if (locationStatus !== 'granted') {
        alert('Location permission is needed for location tagging!');
      }
    }
  };

  const handleMoodSelect = (selectedMood: string, intensity: number = 3, isMultiSelect: boolean = false) => {
    const moodOption = MOOD_CATEGORIES
      .flatMap((category: { moods: Array<{ label: string; color: string }> }) => category.moods)
      .find((m: { label: string; color: string }) => m.label === selectedMood);

    if (!moodOption) return;

    const newMood: ExtendedMoodData = {
      mood: selectedMood,
      intensity,
      primary: entry.moods.length === 0,
      color: moodOption.color
    };

    setEntry(prev => {
      let newMoods: ExtendedMoodData[];
      
      if (isMultiSelect) {
        // For multi-select, add or remove the mood
        const exists = prev.moods.some(m => m.mood === selectedMood);
        if (exists) {
          newMoods = prev.moods.filter(m => m.mood !== selectedMood);
        } else if (prev.moods.length < 3) {
          newMoods = [...prev.moods, newMood];
        } else {
          return prev; // Max 3 moods reached
        }
      } else {
        // For single select, replace all moods
        newMoods = [newMood];
      }

      // Update aura colors and average intensity
      const colors = newMoods.map(m => (m as ExtendedMoodData).color || '#ffffff');
      setAuraColors(colors);
      
      const avgIntensity = newMoods.reduce((sum, m) => sum + (m.intensity || 3), 0) / newMoods.length;
      setAverageIntensity(avgIntensity || 3);

      return {
        ...prev,
        mood: newMoods[0]?.mood || '', // Keep for backward compatibility
        moods: newMoods
      };
    });
  };

  const removeMood = (index: number) => {
    setEntry(prev => {
      const newMoods = prev.moods.filter((_, i) => i !== index);
      return {
        ...prev,
        moods: newMoods,
        mood: newMoods[0]?.mood || '' // Update primary mood if needed
      };
    });
  };

  const handleActivitySelect = (activity: string) => {
    setEntry(prev => ({
      ...prev,
      activities: prev.activities?.includes(activity)
        ? prev.activities.filter(a => a !== activity)
        : [...(prev.activities || []), activity]
    }));
  };

  const addPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = await savePhoto(result.assets[0].uri);
      setEntry(prev => ({
        ...prev,
        photos: [...(prev.photos || []), uri]
      }));
    }
  };

  const removePhoto = (index: number) => {
    setEntry(prev => ({
      ...prev,
      photos: prev.photos?.filter((_, i) => i !== index)
    }));
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !entry.tags?.includes(tag)) {
      setEntry(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tag.trim()]
      }));
    }
  };

  const removeTag = (tag: string) => {
    setEntry(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tag)
    }));
  };

  const getCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });

      const locationName = address 
        ? `${address.name || ''} ${address.street || ''} ${address.city || ''}`
        : 'Unknown location';

      const locationData: LocationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        name: locationName.trim()
      };

      setLocation(locationData);
      setEntry(prev => ({
        ...prev,
        location: locationData
      }));
    } catch (error) {
      console.error('Error getting location:', error);
      alert('Error getting location');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const togglePrivacy = () => {
    setEntry(prev => ({
      ...prev,
      isPrivate: !prev.isPrivate
    }));
  };

  const handleSave = async () => {
    if (!entry.mood && entry.moods.length === 0) {
      alert('Please select at least one mood');
      return;
    }

    try {
      await saveEntry(entry);
      router.back();
    } catch (error) {
      console.error('Error saving entry:', error);
      alert('Error saving entry');
    }
  };

  const handleTagInputKeyPress = (e: any) => {
    if (e.nativeEvent.key === 'Enter' || e.nativeEvent.key === ',') {
      e.preventDefault();
      const value = e.nativeEvent.text.trim();
      if (value) {
        addTag(value);
        e.target.value = '';
      }
    }
  };

  return (
    <View style={styles.container}>
      <MoodAuraView colors={auraColors} intensity={averageIntensity} />
      <ScrollView>
        <View style={styles.content}>
          <Text style={styles.label}>How are you feeling?</Text>
          <MoodSelector
            onSelect={handleMoodSelect}
            selectedMoods={entry.moods.map(m => m.mood)}
            allowMultiSelect={true}
          />

          {entry.moods.length > 0 && (
            <View style={styles.selectedMoods}>
              <Text style={styles.subLabel}>Selected Moods:</Text>
              {entry.moods.map((mood, index) => (
                <View key={index} style={styles.moodChip}>
                  <Text style={styles.moodChipText}>
                    {mood.mood} (Intensity: {mood.intensity || 3})
                  </Text>
                  <TouchableOpacity onPress={() => removeMood(index)}>
                    <Ionicons name="close-circle" size={20} color="#666" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What are you doing?</Text>
            <ActivitySelector
              selectedActivities={entry.activities || []}
              onSelect={handleActivitySelect}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <TextInput
              style={styles.noteInput}
              multiline
              placeholder="Write your thoughts..."
              value={entry.note}
              onChangeText={(text) => setEntry(prev => ({ ...prev, note: text }))}
            />
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Photos</Text>
              <TouchableOpacity onPress={addPhoto} style={styles.addButton}>
                <Ionicons name="camera" size={24} color="#007AFF" />
              </TouchableOpacity>
            </View>
            {entry.photos && entry.photos.length > 0 && (
              <ScrollView horizontal style={styles.photoList}>
                {entry.photos.map((photo, index) => (
                  <View key={index} style={styles.photoContainer}>
                    <Image source={{ uri: photo }} style={styles.photo} />
                    <TouchableOpacity
                      style={styles.removePhotoButton}
                      onPress={() => removePhoto(index)}
                    >
                      <Ionicons name="close-circle" size={24} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Location</Text>
              <TouchableOpacity
                onPress={getCurrentLocation}
                style={styles.addButton}
                disabled={isLoadingLocation}
              >
                <Ionicons
                  name={location ? 'location' : 'location-outline'}
                  size={24}
                  color="#007AFF"
                />
              </TouchableOpacity>
            </View>
            {isLoadingLocation && (
              <Text style={styles.locationText}>Getting location...</Text>
            )}
            {location && (
              <Text style={styles.locationText}>{location.name}</Text>
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Voice Note</Text>
            </View>
            <VoiceRecorder
              onRecordingComplete={(uri) => setEntry(prev => ({ ...prev, voiceNote: uri }))}
              existingRecording={entry.voiceNote}
            />
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Tags</Text>
            </View>
            <View style={styles.tagInput}>
              <TextInput
                placeholder="Add tags (press space to add)"
                onKeyPress={handleTagInputKeyPress}
                style={styles.tagInputField}
              />
            </View>
            {entry.tags && entry.tags.length > 0 && (
              <View style={styles.tagList}>
                {entry.tags.map((tag, index) => (
                  <View key={index} style={styles.tagChip}>
                    <Text style={styles.tagChipText}>#{tag}</Text>
                    <TouchableOpacity onPress={() => removeTag(tag)}>
                      <Ionicons name="close-circle" size={20} color="#666" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <TouchableOpacity
              style={styles.privacyToggle}
              onPress={togglePrivacy}
            >
              <Ionicons
                name={entry.isPrivate ? 'lock-closed' : 'lock-open'}
                size={24}
                color={entry.isPrivate ? '#007AFF' : '#666'}
              />
              <Text style={[styles.privacyText, entry.isPrivate && styles.privacyTextActive]}>
                {entry.isPrivate ? 'Private Entry' : 'Public Entry'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Entry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  subLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#666',
  },
  selectedMoods: {
    marginTop: 16,
    marginBottom: 24,
  },
  moodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  moodChipText: {
    flex: 1,
    marginRight: 8,
    color: '#333',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  noteInput: {
    height: 100,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  photoList: {
    flexDirection: 'row',
    marginTop: 8,
  },
  photoContainer: {
    marginRight: 8,
    position: 'relative',
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  addButton: {
    padding: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  tagInput: {
    marginBottom: 8,
  },
  tagInputField: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
  },
  tagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
  },
  tagChipText: {
    fontSize: 14,
    marginRight: 4,
    color: '#007AFF',
  },
  privacyToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  privacyText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666',
  },
  privacyTextActive: {
    color: '#007AFF',
  },
  buttonContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 