import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSecuritySettings, shouldRequireAuth, updateLastUnlockTime, authenticateWithBiometric, verifyPin } from '../utils/security';

interface SecurityContextType {
  isLocked: boolean;
  isLoading: boolean;
  unlock: (pin?: string) => Promise<boolean>;
  lock: () => void;
  checkAuthStatus: () => Promise<void>;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export function useSecurityContext() {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurityContext must be used within a SecurityProvider');
  }
  return context;
}

export function SecurityProvider({ children }: { children: React.ReactNode }) {
  const [isLocked, setIsLocked] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuthStatus = async () => {
    try {
      const requiresAuth = await shouldRequireAuth();
      setIsLocked(requiresAuth);
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsLocked(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const unlock = async (pin?: string) => {
    try {
      const settings = await getSecuritySettings();
      
      if (!settings.isEnabled) {
        setIsLocked(false);
        return true;
      }

      let isAuthenticated = false;

      if (settings.useBiometric) {
        isAuthenticated = await authenticateWithBiometric();
      }

      if (!isAuthenticated && settings.usePin && pin) {
        isAuthenticated = await verifyPin(pin);
      }

      if (isAuthenticated) {
        await updateLastUnlockTime();
        setIsLocked(false);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error unlocking:', error);
      return false;
    }
  };

  const lock = () => {
    setIsLocked(true);
  };

  return (
    <SecurityContext.Provider value={{ isLocked, isLoading, unlock, lock, checkAuthStatus }}>
      {children}
    </SecurityContext.Provider>
  );
} 