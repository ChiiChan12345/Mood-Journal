import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Goal } from './storage';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Request permissions
export async function requestNotificationsPermission() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return true;
}

// Schedule a goal reminder
export async function scheduleGoalReminder(goal: Goal) {
  const identifier = `goal-reminder-${goal.id}`;
  
  // Cancel any existing notifications for this goal
  await cancelGoalNotifications(goal.id);

  // Schedule daily reminder if the goal is not completed
  if (!goal.completed) {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0); // Set to 10 AM

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Goal Reminder',
        body: `Don't forget to work on your goal: ${goal.title}`,
        data: { goalId: goal.id },
      },
      trigger: {
        hour: 10,
        minute: 0,
        repeats: true,
      } as Notifications.NotificationTriggerInput,
      identifier,
    });
  }
}

// Schedule an inactive goal reminder
export async function scheduleInactiveGoalReminder(goal: Goal) {
  const identifier = `goal-inactive-${goal.id}`;
  
  // If the goal hasn't been updated in 3 days and is not completed
  if (!goal.completed) {
    const lastUpdate = new Date(goal.updatedAt);
    const now = new Date();
    const daysSinceUpdate = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceUpdate >= 3) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Resume Your Goal',
          body: `You haven't made progress on "${goal.title}" in ${daysSinceUpdate} days. Keep going!`,
          data: { goalId: goal.id },
        },
        trigger: {
          seconds: 1,
        } as Notifications.NotificationTriggerInput,
        identifier,
      });
    }
  }
}

// Cancel all notifications for a goal
export async function cancelGoalNotifications(goalId: string) {
  const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
  const goalNotifications = scheduledNotifications.filter(
    notification => 
      notification.identifier?.startsWith(`goal-reminder-${goalId}`) ||
      notification.identifier?.startsWith(`goal-inactive-${goalId}`)
  );

  await Promise.all(
    goalNotifications.map(notification =>
      Notifications.cancelScheduledNotificationAsync(notification.identifier || '')
    )
  );
}

// Handle notification response
export function addNotificationResponseHandler(
  handler: (response: Notifications.NotificationResponse) => void
) {
  return Notifications.addNotificationResponseReceivedListener(handler);
}

// Initialize notifications
export async function initializeNotifications() {
  await requestNotificationsPermission();
  
  // Set up notification categories/actions
  await Notifications.setNotificationCategoryAsync('goal', [
    {
      identifier: 'view',
      buttonTitle: 'View Goal',
      options: {
        opensAppToForeground: true,
      },
    },
    {
      identifier: 'complete',
      buttonTitle: 'Mark Complete',
      options: {
        opensAppToForeground: false,
      },
    },
  ]);
} 