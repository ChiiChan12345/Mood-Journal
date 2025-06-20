import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

interface VoiceRecorderProps {
  onRecordingComplete: (uri: string | undefined) => void;
  existingRecording?: string;
}

export default function VoiceRecorder({ onRecordingComplete, existingRecording }: VoiceRecorderProps) {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);

  useEffect(() => {
    setHasRecording(!!existingRecording);
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [existingRecording]);

  async function startRecording() {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setHasRecording(true);
      onRecordingComplete(uri || undefined);
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  }

  async function playSound() {
    if (!existingRecording && !recording) return;

    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: existingRecording || recording?.getURI() || '' }
      );
      setSound(newSound);
      setIsPlaying(true);
      await newSound.playAsync();
      newSound.setOnPlaybackStatusUpdate(status => {
        if (status && 'didJustFinish' in status && status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch (err) {
      console.error('Failed to play sound', err);
      setIsPlaying(false);
    }
  }

  async function stopSound() {
    if (!sound) return;

    try {
      await sound.stopAsync();
      setIsPlaying(false);
    } catch (err) {
      console.error('Failed to stop sound', err);
    }
  }

  async function deleteRecording() {
    if (sound) {
      await sound.unloadAsync();
    }
    setSound(null);
    setHasRecording(false);
    onRecordingComplete(undefined);
  }

  return (
    <View style={styles.container}>
      {!hasRecording ? (
        <TouchableOpacity
          style={styles.button}
          onPress={recording ? stopRecording : startRecording}
        >
          <Ionicons
            name={recording ? 'stop-circle' : 'mic'}
            size={24}
            color={recording ? '#FF3B30' : '#007AFF'}
          />
          <Text style={styles.buttonText}>
            {recording ? 'Stop Recording' : 'Start Recording'}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.recordingControls}>
          <TouchableOpacity
            style={styles.button}
            onPress={isPlaying ? stopSound : playSound}
          >
            <Ionicons
              name={isPlaying ? 'stop-circle' : 'play'}
              size={24}
              color="#007AFF"
            />
            <Text style={styles.buttonText}>
              {isPlaying ? 'Stop' : 'Play'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.deleteButton]}
            onPress={deleteRecording}
          >
            <Ionicons name="trash" size={24} color="#FF3B30" />
            <Text style={[styles.buttonText, styles.deleteButtonText]}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  buttonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#007AFF',
  },
  recordingControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  deleteButton: {
    backgroundColor: '#fee2e2',
  },
  deleteButtonText: {
    color: '#FF3B30',
  },
}); 