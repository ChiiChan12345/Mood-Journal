import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getEntries, JournalEntry, getGoals, Goal } from '../utils/storage';
import MoodCalendar from '../components/MoodCalendar';

interface ActivityStats {
  totalCount: number;
  moodCorrelations: {
    [mood: string]: number;
  };
  averageMoodScore: number;
  goalCorrelations: {
    [goalId: string]: number;
  };
}

const MOOD_SCORES = {
  'Very Happy': 5,
  'Happy': 4,
  'Neutral': 3,
  'Sad': 2,
  'Very Sad': 1
};

const MOOD_COLORS = {
  'Very Happy': '#4CAF50',
  'Happy': '#8BC34A',
  'Neutral': '#FFC107',
  'Sad': '#FF9800',
  'Very Sad': '#F44336'
};

export default function InsightsScreen() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [error, setError] = useState<string | null>(null);
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [loadedEntries, loadedGoals] = await Promise.all([
        getEntries(),
        getGoals(),
      ]);
      setEntries(loadedEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      setGoals(loadedGoals);
      setError(null);
    } catch (err) {
      setError('Failed to load data. Please try again.');
      console.error('Error loading data:', err);
    }
  };

  const renderMoodDistribution = () => {
    try {
      const moodCounts = entries.reduce((acc, entry) => {
        if (entry.mood) {
          acc[entry.mood] = (acc[entry.mood] || 0) + 1;
        }
        return acc;
      }, {} as { [key: string]: number });

      const totalEntries = Object.values(moodCounts).reduce((a, b) => a + b, 0);

      if (totalEntries === 0) {
        return (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Mood Distribution</Text>
            <Text style={styles.noDataText}>No mood entries recorded yet</Text>
          </View>
        );
      }

      return (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Mood Distribution</Text>
          {Object.entries(MOOD_SCORES).map(([mood]) => {
            const count = moodCounts[mood] || 0;
            const percentage = (count / totalEntries) * 100;
            return (
              <View key={mood} style={styles.moodRow}>
                <View style={styles.moodLabelContainer}>
                  <Text style={styles.moodLabel}>{mood}</Text>
                  <Text style={styles.moodCount}>{count}</Text>
                </View>
                <View style={styles.barContainer}>
                  <View
                    style={[
                      styles.bar,
                      {
                        width: `${percentage}%`,
                        backgroundColor: MOOD_COLORS[mood as keyof typeof MOOD_COLORS]
                      }
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>
      );
    } catch (err) {
      console.error('Error rendering mood distribution:', err);
      return (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Mood Distribution</Text>
          <Text style={styles.errorText}>Failed to display mood distribution</Text>
        </View>
      );
    }
  };

  const renderActivitySummary = () => {
    try {
      const activityCounts = entries.reduce((acc, entry) => {
        if (entry.activities) {
          entry.activities.forEach(activity => {
            acc[activity] = (acc[activity] || 0) + 1;
          });
        }
        return acc;
      }, {} as { [key: string]: number });

      const sortedActivities = Object.entries(activityCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

      if (sortedActivities.length === 0) {
        return (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Top Activities</Text>
            <Text style={styles.noDataText}>No activities recorded yet</Text>
          </View>
        );
      }

      const maxCount = Math.max(...sortedActivities.map(([, count]) => count));

      return (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Top Activities</Text>
          {sortedActivities.map(([activity, count]) => {
            const percentage = (count / maxCount) * 100;
            return (
              <View key={activity} style={styles.activityRow}>
                <View style={styles.activityLabelContainer}>
                  <Text style={styles.activityLabel}>{activity}</Text>
                  <Text style={styles.activityCount}>{count}</Text>
                </View>
                <View style={styles.barContainer}>
                  <View
                    style={[
                      styles.bar,
                      {
                        width: `${percentage}%`,
                        backgroundColor: '#2196F3'
                      }
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>
      );
    } catch (err) {
      console.error('Error rendering activity summary:', err);
      return (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Top Activities</Text>
          <Text style={styles.errorText}>Failed to display activity summary</Text>
        </View>
      );
    }
  };

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <MoodCalendar entries={entries} />
      {renderMoodDistribution()}
      {renderActivitySummary()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  chartContainer: {
    marginVertical: 10,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  moodRow: {
    marginBottom: 12,
  },
  activityRow: {
    marginBottom: 12,
  },
  moodLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  activityLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 14,
    color: '#333',
  },
  activityLabel: {
    fontSize: 14,
    color: '#333',
  },
  moodCount: {
    fontSize: 14,
    color: '#666',
  },
  activityCount: {
    fontSize: 14,
    color: '#666',
  },
  barContainer: {
    height: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 6,
  },
  noDataText: {
    textAlign: 'center',
    color: '#666',
    marginVertical: 20,
  },
  errorText: {
    color: '#ff0000',
    textAlign: 'center',
    marginVertical: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 20,
  },
  retryButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});