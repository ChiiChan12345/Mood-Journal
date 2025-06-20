import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SECURITY_SETTINGS_KEY = 'security_settings';
const APP_LOCK_TIMESTAMP_KEY = 'app_lock_timestamp';
const PIN_KEY = 'app_pin';

interface SecuritySettings {
  isEnabled: boolean;
  useBiometric: boolean;
  usePin: boolean;
  lockTimeout: number; // in minutes, 0 means immediate
}

export async function getSecuritySettings(): Promise<SecuritySettings> {
  try {
    const settings = await AsyncStorage.getItem(SECURITY_SETTINGS_KEY);
    return settings ? JSON.parse(settings) : {
      isEnabled: false,
      useBiometric: false,
      usePin: false,
      lockTimeout: 0
    };
  } catch (error) {
    console.error('Error getting security settings:', error);
    return {
      isEnabled: false,
      useBiometric: false,
      usePin: false,
      lockTimeout: 0
    };
  }
}

export async function saveSecuritySettings(settings: SecuritySettings): Promise<void> {
  try {
    await AsyncStorage.setItem(SECURITY_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving security settings:', error);
    throw error;
  }
}

export async function setPin(pin: string): Promise<void> {
  try {
    await AsyncStorage.setItem(PIN_KEY, pin);
  } catch (error) {
    console.error('Error saving PIN:', error);
    throw error;
  }
}

export async function verifyPin(pin: string): Promise<boolean> {
  try {
    const storedPin = await AsyncStorage.getItem(PIN_KEY);
    return storedPin === pin;
  } catch (error) {
    console.error('Error verifying PIN:', error);
    return false;
  }
}

export async function isBiometricAvailable(): Promise<boolean> {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return hasHardware && isEnrolled;
  } catch (error) {
    console.error('Error checking biometric availability:', error);
    return false;
  }
}

export async function authenticateWithBiometric(): Promise<boolean> {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to access your journal',
      fallbackLabel: 'Use PIN instead',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
    });
    return result.success;
  } catch (error) {
    console.error('Error authenticating with biometric:', error);
    return false;
  }
}

export async function updateLastUnlockTime(): Promise<void> {
  try {
    await AsyncStorage.setItem(APP_LOCK_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    console.error('Error updating last unlock time:', error);
  }
}

export async function shouldRequireAuth(): Promise<boolean> {
  try {
    const settings = await getSecuritySettings();
    if (!settings.isEnabled) return false;

    const lastUnlockStr = await AsyncStorage.getItem(APP_LOCK_TIMESTAMP_KEY);
    if (!lastUnlockStr) return true;

    const lastUnlock = parseInt(lastUnlockStr, 10);
    const timeSinceUnlock = Date.now() - lastUnlock;
    return timeSinceUnlock >= settings.lockTimeout * 60 * 1000;
  } catch (error) {
    console.error('Error checking if auth is required:', error);
    return false;
  }
}

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
} 