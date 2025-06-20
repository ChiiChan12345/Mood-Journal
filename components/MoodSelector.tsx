import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

interface MoodOption {
  label: string;
  emoji: string;
  color: string;
  intensity?: number;
}

interface MoodCategory {
  title: string;
  moods: MoodOption[];
}

interface MoodSelectorProps {
  onSelect: (mood: string, intensity: number, isMultiSelect?: boolean) => void;
  selectedMoods?: string[];
  allowMultiSelect?: boolean;
}

export const MOOD_CATEGORIES: MoodCategory[] = [
  {
    title: 'Positive',
    moods: [
      { label: 'Happy', emoji: '😀', color: '#FFD700' },
      { label: 'Excited', emoji: '🤩', color: '#FF8C00' },
      { label: 'Calm', emoji: '😌', color: '#ADD8E6' },
      { label: 'Grateful', emoji: '🙏', color: '#FFE4B5' },
      { label: 'Loved', emoji: '❤️', color: '#FF69B4' },
      { label: 'Energetic', emoji: '⚡', color: '#00FF00' },
      { label: 'Hopeful', emoji: '🌈', color: '#87CEEB' },
      { label: 'Proud', emoji: '🏆', color: '#DAA520' },
    ],
  },
  {
    title: 'Neutral',
    moods: [
      { label: 'Okay', emoji: '🙂', color: '#D3D3D3' },
      { label: 'Tired', emoji: '😴', color: '#B0C4DE' },
      { label: 'Bored', emoji: '😐', color: '#CCCCCC' },
      { label: 'Reflective', emoji: '🤔', color: '#C0C0C0' },
      { label: 'Meh', emoji: '😑', color: '#A9A9A9' },
    ],
  },
  {
    title: 'Negative',
    moods: [
      { label: 'Sad', emoji: '😢', color: '#1E90FF' },
      { label: 'Anxious', emoji: '😰', color: '#FF6347' },
      { label: 'Angry', emoji: '😠', color: '#FF4500' },
      { label: 'Frustrated', emoji: '😤', color: '#DC143C' },
      { label: 'Lonely', emoji: '😔', color: '#708090' },
      { label: 'Overwhelmed', emoji: '😩', color: '#8B0000' },
      { label: 'Stressed', emoji: '😣', color: '#A52A2A' },
      { label: 'Confused', emoji: '😕', color: '#9370DB' },
    ],
  },
];

export default function MoodSelector({ onSelect, selectedMoods = [], allowMultiSelect = false }: MoodSelectorProps) {
  const [selectedIntensity, setSelectedIntensity] = useState(3);
  const [selectedMoodsList, setSelectedMoodsList] = useState<string[]>(selectedMoods);
  const [scaleAnim] = useState(new Animated.Value(1));

  const handleMoodSelect = (moodLabel: string) => {
    let newSelectedMoods: string[];
    
    if (allowMultiSelect) {
      if (selectedMoodsList.includes(moodLabel)) {
        newSelectedMoods = selectedMoodsList.filter(mood => mood !== moodLabel);
      } else if (selectedMoodsList.length < 3) {
        newSelectedMoods = [...selectedMoodsList, moodLabel];
      } else {
        return; // Max 3 moods
      }
      setSelectedMoodsList(newSelectedMoods);
    } else {
      newSelectedMoods = [moodLabel];
      setSelectedMoodsList(newSelectedMoods);
    }

    // Animate the selection
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onSelect(moodLabel, selectedIntensity, allowMultiSelect);
  };

  return (
    <ScrollView>
      <View style={styles.intensityContainer}>
        <Text style={styles.intensityLabel}>Intensity: {selectedIntensity}</Text>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={5}
          step={1}
          value={selectedIntensity}
          onValueChange={setSelectedIntensity}
          minimumTrackTintColor="#4A90E2"
          maximumTrackTintColor="#D3D3D3"
          thumbTintColor="#4A90E2"
        />
      </View>

      {allowMultiSelect && (
        <Text style={styles.multiSelectHint}>
          Select up to 3 moods to express mixed feelings
        </Text>
      )}

      {MOOD_CATEGORIES.map((category, categoryIndex) => (
        <View key={categoryIndex} style={styles.category}>
          <Text style={styles.categoryTitle}>{category.title}</Text>
          <View style={styles.moodGrid}>
            {category.moods.map((mood, moodIndex) => (
              <Animated.View
                key={moodIndex}
                style={[
                  { transform: [{ scale: selectedMoodsList.includes(mood.label) ? scaleAnim : 1 }] },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.moodButton,
                    { backgroundColor: mood.color },
                    selectedMoodsList.includes(mood.label) && styles.selectedMood,
                  ]}
                  onPress={() => handleMoodSelect(mood.label)}
                >
                  <Text style={styles.emoji}>{mood.emoji}</Text>
                  <Text style={styles.label}>{mood.label}</Text>
                  {selectedMoodsList.includes(mood.label) && (
                    <View style={styles.selectedIndicator}>
                      <Ionicons name="checkmark-circle" size={16} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  category: {
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  moodButton: {
    width: '23%',
    aspectRatio: 1,
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.8,
  },
  selectedMood: {
    opacity: 1,
    transform: [{ scale: 1.05 }],
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  emoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    textAlign: 'center',
    color: '#333',
    fontWeight: '500',
  },
  intensityContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
  },
  intensityLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  slider: {
    height: 40,
  },
  multiSelectHint: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 10,
    padding: 2,
  },
}); 