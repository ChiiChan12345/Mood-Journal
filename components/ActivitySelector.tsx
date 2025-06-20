import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ActivitySelectorProps {
  selectedActivities: string[];
  onSelect: (activity: string) => void;
}

const ACTIVITY_CATEGORIES = [
  {
    title: 'Self Care',
    activities: [
      { id: 'sleep', name: 'Sleep', icon: 'bed' },
      { id: 'exercise', name: 'Exercise', icon: 'fitness' },
      { id: 'meditation', name: 'Meditation', icon: 'leaf' },
      { id: 'reading', name: 'Reading', icon: 'book' },
    ],
  },
  {
    title: 'Social',
    activities: [
      { id: 'friends', name: 'Friends', icon: 'people' },
      { id: 'family', name: 'Family', icon: 'home' },
      { id: 'date', name: 'Date', icon: 'heart' },
      { id: 'party', name: 'Party', icon: 'wine' },
    ],
  },
  {
    title: 'Work',
    activities: [
      { id: 'work', name: 'Work', icon: 'briefcase' },
      { id: 'study', name: 'Study', icon: 'school' },
      { id: 'meeting', name: 'Meeting', icon: 'people-circle' },
      { id: 'coding', name: 'Coding', icon: 'code-slash' },
    ],
  },
  {
    title: 'Entertainment',
    activities: [
      { id: 'movies', name: 'Movies', icon: 'film' },
      { id: 'gaming', name: 'Gaming', icon: 'game-controller' },
      { id: 'music', name: 'Music', icon: 'musical-notes' },
      { id: 'shopping', name: 'Shopping', icon: 'cart' },
    ],
  },
  {
    title: 'Health',
    activities: [
      { id: 'doctor', name: 'Doctor', icon: 'medical' },
      { id: 'therapy', name: 'Therapy', icon: 'heart-half' },
      { id: 'workout', name: 'Workout', icon: 'barbell' },
      { id: 'yoga', name: 'Yoga', icon: 'body' },
    ],
  },
];

export default function ActivitySelector({ selectedActivities, onSelect }: ActivitySelectorProps) {
  return (
    <ScrollView>
      {ACTIVITY_CATEGORIES.map((category, categoryIndex) => (
        <View key={categoryIndex} style={styles.category}>
          <Text style={styles.categoryTitle}>{category.title}</Text>
          <View style={styles.activityGrid}>
            {category.activities.map((activity, activityIndex) => {
              const isSelected = selectedActivities.includes(activity.id);
              return (
                <TouchableOpacity
                  key={activityIndex}
                  style={[styles.activityButton, isSelected && styles.selectedActivity]}
                  onPress={() => onSelect(activity.id)}
                >
                  <Ionicons
                    name={activity.icon}
                    size={24}
                    color={isSelected ? '#007AFF' : '#666'}
                  />
                  <Text style={[styles.label, isSelected && styles.selectedLabel]}>
                    {activity.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
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
  activityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  activityButton: {
    width: '23%',
    aspectRatio: 1,
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  selectedActivity: {
    backgroundColor: '#e3f2fd',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  label: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
    color: '#666',
  },
  selectedLabel: {
    color: '#007AFF',
    fontWeight: '500',
  },
}); 