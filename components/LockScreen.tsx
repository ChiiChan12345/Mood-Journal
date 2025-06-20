import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSecurityContext } from '../contexts/SecurityContext';
import { Ionicons } from '@expo/vector-icons';

export default function LockScreen() {
  const { unlock } = useSecurityContext();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUnlock = async () => {
    setLoading(true);
    setError('');
    try {
      const success = await unlock(pin);
      if (!success) {
        setError('Invalid PIN. Please try again.');
        setPin('');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometric = async () => {
    setLoading(true);
    setError('');
    try {
      const success = await unlock();
      if (!success) {
        setError('Authentication failed. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="lock-closed" size={64} color="#666" style={styles.icon} />
        <Text style={styles.title}>Mood Journal</Text>
        <Text style={styles.subtitle}>Enter PIN to unlock</Text>
        
        <TextInput
          style={styles.input}
          value={pin}
          onChangeText={setPin}
          placeholder="Enter PIN"
          keyboardType="numeric"
          secureTextEntry
          maxLength={6}
          editable={!loading}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleUnlock}
          disabled={loading || !pin}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Unlock</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.biometricButton, loading && styles.buttonDisabled]}
          onPress={handleBiometric}
          disabled={loading}
        >
          <Ionicons name="finger-print" size={24} color="#666" />
          <Text style={styles.biometricText}>Use Biometric</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '80%',
    alignItems: 'center',
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 8,
  },
  error: {
    color: '#ff3b30',
    marginBottom: 16,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  biometricText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 16,
  },
}); 