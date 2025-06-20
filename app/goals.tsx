import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import GoalsProgress from '../components/GoalsProgress';
import { Goal, getGoals, saveGoal, deleteGoal } from '../utils/storage';
import { generateUUID } from '../utils/security';
import { initializeNotifications, scheduleGoalReminder, scheduleInactiveGoalReminder } from '../utils/notifications';

export default function GoalsScreen() {
  const [goals, setGoals] = useState<Goal[]>([]);

  const loadGoals = async () => {
    const loadedGoals = await getGoals();
    setGoals(loadedGoals);
  };

  useEffect(() => {
    const setupNotifications = async () => {
      await initializeNotifications();
    };

    const checkInactiveGoals = async () => {
      const loadedGoals = await getGoals();
      setGoals(loadedGoals);
      loadedGoals.forEach(async (goal) => {
        await scheduleInactiveGoalReminder(goal);
        if (!goal.completed) {
          await scheduleGoalReminder(goal);
        }
      });
    };

    setupNotifications();
    // Check for inactive goals daily
    const interval = setInterval(checkInactiveGoals, 24 * 60 * 60 * 1000);
    checkInactiveGoals(); // Initial check

    return () => clearInterval(interval);
  }, []);

  const handleAddGoal = async (newGoal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const goal: Goal = {
      ...newGoal,
      id: generateUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await saveGoal(goal);
    await scheduleGoalReminder(goal);
    loadGoals();
  };

  const handleUpdateGoal = async (updatedGoal: Goal) => {
    const goal = {
      ...updatedGoal,
      updatedAt: new Date().toISOString(),
    };
    await saveGoal(goal);
    await scheduleGoalReminder(goal);
    loadGoals();
  };

  const handleDeleteGoal = async (goalId: string) => {
    await deleteGoal(goalId);
    loadGoals();
  };

  return (
    <View style={styles.container}>
      <GoalsProgress
        goals={goals}
        onAddGoal={handleAddGoal}
        onUpdateGoal={handleUpdateGoal}
        onDeleteGoal={handleDeleteGoal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
}); 