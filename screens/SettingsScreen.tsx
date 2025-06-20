import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { getSecuritySettings, saveSecuritySettings, setPin, isBiometricAvailable } from '../utils/security';
import { useSecurityContext } from '../contexts/SecurityContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import GoalsProgress from '../components/GoalsProgress';
import { Goal, getGoals, saveGoal, deleteGoal } from '../utils/storage';
import { generateUUID } from '../utils/security';

export default function SettingsScreen() {
  const { checkAuthStatus } = useSecurityContext();
  const [settings, setSettings] = useState({
    isEnabled: false,
    useBiometric: false,
    usePin: false,
    lockTimeout: 0,
  });
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPinInput, setShowPinInput] = useState(false);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(false);

  useEffect(() => {
    loadSettings();
    checkBiometricSupport();
    loadGoals();
  }, []);

  const loadSettings = async () => {
    const currentSettings = await getSecuritySettings();
    setSettings(currentSettings);
  };

  const checkBiometricSupport = async () => {
    const supported = await isBiometricAvailable();
    setIsBiometricSupported(supported);
  };

  const loadGoals = async () => {
    const loadedGoals = await getGoals();
    setGoals(loadedGoals);
  };

  const handleToggleSecurity = async (value: boolean) => {
    if (value && !settings.usePin && !settings.useBiometric) {
      setShowPinInput(true);
      return;
    }

    const newSettings = { ...settings, isEnabled: value };
    await saveSecuritySettings(newSettings);
    setSettings(newSettings);
    checkAuthStatus();
  };

  const handleToggleBiometric = async (value: boolean) => {
    if (!isBiometricSupported && value) {
      Alert.alert('Not Available', 'Biometric authentication is not available on this device.');
      return;
    }

    const newSettings = { ...settings, useBiometric: value };
    await saveSecuritySettings(newSettings);
    setSettings(newSettings);
  };

  const handleTogglePin = async (value: boolean) => {
    if (value) {
      setShowPinInput(true);
    } else {
      const newSettings = { ...settings, usePin: false };
      if (!newSettings.useBiometric) {
        newSettings.isEnabled = false;
      }
      await saveSecuritySettings(newSettings);
      setSettings(newSettings);
    }
  };

  const handleSetPin = async () => {
    if (pin.length < 4) {
      Alert.alert('Invalid PIN', 'PIN must be at least 4 digits long.');
      return;
    }

    if (pin !== confirmPin) {
      Alert.alert('PIN Mismatch', 'PINs do not match. Please try again.');
      return;
    }

    await setPin(pin);
    const newSettings = { ...settings, usePin: true, isEnabled: true };
    await saveSecuritySettings(newSettings);
    setSettings(newSettings);
    setShowPinInput(false);
    setPin('');
    setConfirmPin('');
  };

  const handleTimeoutChange = async (value: number) => {
    const newSettings = { ...settings, lockTimeout: value };
    await saveSecuritySettings(newSettings);
    setSettings(newSettings);
  };

  const handleAddGoal = async (newGoal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const goal: Goal = {
      ...newGoal,
      id: generateUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await saveGoal(goal);
    await loadGoals();
  };

  const handleUpdateGoal = async (updatedGoal: Goal) => {
    await saveGoal(updatedGoal);
    await loadGoals();
  };

  const handleDeleteGoal = async (goalId: string) => {
    await deleteGoal(goalId);
    await loadGoals();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.setting}>
          <View style={styles.settingLabel}>
            <Ionicons name="notifications-outline" size={24} color="#666" />
            <Text style={styles.settingText}>Notifications</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
          />
        </View>
        <View style={styles.setting}>
          <View style={styles.settingLabel}>
            <Ionicons name="moon-outline" size={24} color="#666" />
            <Text style={styles.settingText}>Dark Mode</Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
          />
        </View>
        <View style={styles.setting}>
          <View style={styles.settingLabel}>
            <Ionicons name="lock-closed-outline" size={24} color="#666" />
            <Text style={styles.settingText}>Privacy Mode</Text>
          </View>
          <Switch
            value={privacyMode}
            onValueChange={setPrivacyMode}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Goals & Progress</Text>
        <GoalsProgress
          goals={goals}
          onAddGoal={handleAddGoal}
          onUpdateGoal={handleUpdateGoal}
          onDeleteGoal={handleDeleteGoal}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.aboutItem}>
          <Text style={styles.aboutLabel}>Version</Text>
          <Text style={styles.aboutValue}>1.0.0</Text>
        </View>
        <View style={styles.aboutItem}>
          <Text style={styles.aboutLabel}>Build</Text>
          <Text style={styles.aboutValue}>2024.1</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  section: {
    backgroundColor: '#fff',
    marginVertical: 8,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  setting: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  settingLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    fontSize: 16,
    color: '#333',
  },
  aboutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  aboutLabel: {
    fontSize: 16,
    color: '#666',
  },
  aboutValue: {
    fontSize: 16,
    color: '#333',
  },
}); 