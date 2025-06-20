import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Goal } from '../utils/storage';
import { cancelGoalNotifications, scheduleGoalReminder } from '../utils/notifications';

export interface GoalsProgressProps {
  goals: Goal[];
  onAddGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateGoal: (goal: Goal) => void;
  onDeleteGoal: (goalId: string) => void;
}

export default function GoalsProgress({
  goals,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
}: GoalsProgressProps) {
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: '',
    activities: [],
    progress: 0,
    completed: false,
    notificationEnabled: true,
    reminderTime: { hour: 10, minute: 0 },
  });
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  const categories = ['Mental Health', 'Physical Health', 'Social', 'Personal Growth', 'Work'];

  const handleAddGoal = () => {
    if (!newGoal.title.trim()) return;

    onAddGoal({
      title: newGoal.title,
      description: newGoal.description,
      category: newGoal.category || categories[0],
      activities: newGoal.activities,
      progress: 0,
      completed: false,
      notificationEnabled: true,
      reminderTime: { hour: 10, minute: 0 },
    });

    setNewGoal({
      title: '',
      description: '',
      category: '',
      activities: [],
      progress: 0,
      completed: false,
      notificationEnabled: true,
      reminderTime: { hour: 10, minute: 0 },
    });
    setIsAddingGoal(false);
  };

  const updateProgress = (goal: Goal, increment: boolean) => {
    const newProgress = increment
      ? Math.min(100, goal.progress + 10)
      : Math.max(0, goal.progress - 10);

    onUpdateGoal({
      ...goal,
      progress: newProgress,
      completed: newProgress === 100,
      updatedAt: new Date().toISOString(),
    });
  };

  const toggleGoalCompletion = (goal: Goal) => {
    onUpdateGoal({
      ...goal,
      completed: !goal.completed,
      progress: !goal.completed ? 100 : goal.progress,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleNotificationToggle = (goal: Goal) => {
    const updatedGoal = {
      ...goal,
      notificationEnabled: !goal.notificationEnabled,
    };
    if (!updatedGoal.notificationEnabled) {
      cancelGoalNotifications(goal.id);
    } else {
      scheduleGoalReminder(updatedGoal);
    }
    onUpdateGoal(updatedGoal);
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(false);
    if (selectedDate && selectedGoal) {
      const updatedGoal = {
        ...selectedGoal,
        reminderTime: {
          hour: selectedDate.getHours(),
          minute: selectedDate.getMinutes(),
        },
      };
      scheduleGoalReminder(updatedGoal);
      onUpdateGoal(updatedGoal);
    }
  };

  const renderNotificationSettings = (goal: Goal) => (
    <View style={styles.notificationSettings}>
      <View style={styles.notificationRow}>
        <Text>Daily Reminders</Text>
        <Switch
          value={goal.notificationEnabled}
          onValueChange={() => handleNotificationToggle(goal)}
        />
      </View>
      {goal.notificationEnabled && (
        <TouchableOpacity
          style={styles.timeButton}
          onPress={() => {
            setSelectedGoal(goal);
            setShowTimePicker(true);
          }}
        >
          <Text>
            Reminder Time: {goal.reminderTime?.hour.toString().padStart(2, '0')}:
            {goal.reminderTime?.minute.toString().padStart(2, '0')}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Goals & Progress</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsAddingGoal(true)}
        >
          <Ionicons name="add-circle" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {isAddingGoal && (
        <View style={styles.addGoalForm}>
          <TextInput
            style={styles.input}
            placeholder="Goal Title"
            value={newGoal.title}
            onChangeText={(text) => setNewGoal({ ...newGoal, title: text })}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description (optional)"
            multiline
            numberOfLines={3}
            value={newGoal.description}
            onChangeText={(text) => setNewGoal({ ...newGoal, description: text })}
          />
          <ScrollView horizontal style={styles.categoryList}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  newGoal.category === category && styles.selectedCategory,
                ]}
                onPress={() => setNewGoal({ ...newGoal, category })}
              >
                <Text
                  style={[
                    styles.categoryText,
                    newGoal.category === category && styles.selectedCategoryText,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.formButtons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => setIsAddingGoal(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleAddGoal}
            >
              <Text style={[styles.buttonText, styles.saveButtonText]}>
                Add Goal
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {goals.map((goal) => (
        <View key={goal.id} style={styles.goalCard}>
          <View style={styles.goalHeader}>
            <View style={styles.goalTitleRow}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => toggleGoalCompletion(goal)}
              >
                <Ionicons
                  name={goal.completed ? 'checkmark-circle' : 'ellipse-outline'}
                  size={24}
                  color={goal.completed ? '#4CAF50' : '#666'}
                />
              </TouchableOpacity>
              <Text
                style={[
                  styles.goalTitle,
                  goal.completed && styles.completedGoalTitle,
                ]}
              >
                {goal.title}
              </Text>
              <TouchableOpacity onPress={() => onDeleteGoal(goal.id)}>
                <Ionicons name="trash-outline" size={20} color="#FF3B30" />
              </TouchableOpacity>
            </View>
            <Text style={styles.categoryLabel}>{goal.category}</Text>
          </View>

          {goal.description && (
            <Text style={styles.description}>{goal.description}</Text>
          )}

          <View style={styles.progressSection}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${goal.progress}%` },
                  goal.completed && styles.completedProgress,
                ]}
              />
            </View>
            <Text style={styles.progressText}>{goal.progress}%</Text>
            <View style={styles.progressControls}>
              <TouchableOpacity
                style={[styles.progressButton, styles.decrementButton]}
                onPress={() => updateProgress(goal, false)}
                disabled={goal.progress === 0}
              >
                <Ionicons name="remove" size={20} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.progressButton, styles.incrementButton]}
                onPress={() => updateProgress(goal, true)}
                disabled={goal.progress === 100}
              >
                <Ionicons name="add" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          {renderNotificationSettings(goal)}
        </View>
      ))}

      {showTimePicker && selectedGoal && (
        <DateTimePicker
          value={new Date().setHours(
            selectedGoal.reminderTime?.hour || 10,
            selectedGoal.reminderTime?.minute || 0,
            0
          )}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  addButton: {
    padding: 8,
  },
  addGoalForm: {
    backgroundColor: '#fff',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryList: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  selectedCategory: {
    backgroundColor: '#007AFF',
  },
  categoryText: {
    color: '#666',
    fontSize: 14,
  },
  selectedCategoryText: {
    color: '#fff',
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    fontSize: 16,
    color: '#666',
  },
  saveButtonText: {
    color: '#fff',
  },
  goalCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  goalHeader: {
    marginBottom: 8,
  },
  goalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    padding: 4,
  },
  goalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  completedGoalTitle: {
    color: '#4CAF50',
    textDecorationLine: 'line-through',
  },
  categoryLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  progressSection: {
    marginTop: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  completedProgress: {
    backgroundColor: '#4CAF50',
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  progressControls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  progressButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  decrementButton: {
    backgroundColor: '#fee2e2',
  },
  incrementButton: {
    backgroundColor: '#dcfce7',
  },
  notificationSettings: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
  },
  notificationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeButton: {
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 4,
    alignItems: 'center',
  },
}); 