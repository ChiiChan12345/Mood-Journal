import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getEntries, JournalEntry } from '../utils/storage';
import { format } from 'date-fns';

export default function JournalScreen() {
  const router = useRouter();
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    const journalEntries = await getEntries();
    setEntries(journalEntries.sort((a: JournalEntry, b: JournalEntry) => b.createdAt - a.createdAt));
  };

  const renderActivityIcons = (activities: string[]) => {
    return (
      <View style={styles.activityIconsContainer}>
        {activities.map((activityId) => {
          let iconName = 'help-circle';
          
          // Map activity IDs to their respective icons
          switch (activityId) {
            case 'sleep': iconName = 'bed'; break;
            case 'exercise': iconName = 'fitness'; break;
            case 'meditation': iconName = 'leaf'; break;
            case 'shower': iconName = 'water'; break;
            case 'friends': iconName = 'people'; break;
            case 'family': iconName = 'home'; break;
            case 'date': iconName = 'heart'; break;
            case 'party': iconName = 'wine'; break;
            case 'work': iconName = 'briefcase'; break;
            case 'study': iconName = 'book'; break;
            case 'meeting': iconName = 'people-circle'; break;
            case 'coding': iconName = 'code-slash'; break;
            case 'movies': iconName = 'film'; break;
            case 'gaming': iconName = 'game-controller'; break;
            case 'music': iconName = 'musical-notes'; break;
            case 'reading': iconName = 'book'; break;
            case 'sick': iconName = 'medical'; break;
            case 'doctor': iconName = 'fitness'; break;
            case 'therapy': iconName = 'happy'; break;
            case 'medicine': iconName = 'medical'; break;
          }

          return (
            <Ionicons
              key={activityId}
              name={iconName as any}
              size={16}
              color="#666"
              style={styles.activityIcon}
            />
          );
        })}
      </View>
    );
  };

  const renderEntry = ({ item }: { item: JournalEntry }) => (
    <TouchableOpacity
      style={styles.entryCard}
      onPress={() => router.push({
        pathname: '/(tabs)/entry',
        params: { id: item.id }
      })}
    >
      <View style={styles.entryHeader}>
        <Text style={styles.date}>
          {format(new Date(item.date), 'MMM d, yyyy h:mm a')}
        </Text>
        <Text style={styles.mood}>{item.mood}</Text>
      </View>
      
      {item.activities && item.activities.length > 0 && (
        renderActivityIcons(item.activities)
      )}
      
      {item.note && (
        <Text style={styles.note} numberOfLines={2}>
          {item.note}
        </Text>
      )}
      
      {item.voiceNote && (
        <View style={styles.voiceNoteIndicator}>
          <Ionicons name="mic" size={16} color="#666" />
          <Text style={styles.voiceNoteText}>Voice Note</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={entries}
        renderItem={renderEntry}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(tabs)/entry')}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  list: {
    padding: 16,
  },
  entryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  mood: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  activityIconsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
    gap: 8,
  },
  activityIcon: {
    marginRight: 4,
  },
  note: {
    fontSize: 14,
    color: '#333',
    marginTop: 8,
  },
  voiceNoteIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  voiceNoteText: {
    fontSize: 12,
    color: '#666',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#007AFF',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
}); 