import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MoodEntry } from '../utils/storage';
import VoiceRecorder from './VoiceRecorder';

const MOTIVATION_MAP: Record<string, { message: string; suggestions: string[] }> = {
  Happy: {
    message: "Keep spreading your joy!",
    suggestions: ["Share your happiness with someone.", "Write down what made you happy today."]
  },
  Excited: {
    message: "Your excitement is contagious!",
    suggestions: ["Channel your energy into a new project.", "Celebrate your wins!"]
  },
  Calm: {
    message: "Enjoy the peace you feel.",
    suggestions: ["Take a mindful walk.", "Practice gratitude for this calm moment."]
  },
  Grateful: {
    message: "Gratitude brings more to be grateful for.",
    suggestions: ["Thank someone today.", "List three things you're grateful for."]
  },
  Loved: {
    message: "You are loved and appreciated!",
    suggestions: ["Reach out to someone you care about.", "Reflect on what makes you feel loved."]
  },
  Energetic: {
    message: "Use your energy for something positive!",
    suggestions: ["Go for a run or dance!", "Start a creative project."]
  },
  Hopeful: {
    message: "Hope lights the way forward.",
    suggestions: ["Set a small goal for tomorrow.", "Share your hopes with a friend."]
  },
  Proud: {
    message: "Be proud of your achievements!",
    suggestions: ["Reward yourself.", "Reflect on your progress."]
  },
  Okay: {
    message: "It's okay to have an average day.",
    suggestions: ["Do something small for yourself.", "Take a break if you need it."]
  },
  Tired: {
    message: "Rest is important.",
    suggestions: ["Take a nap or go to bed early.", "Drink some water and stretch."]
  },
  Bored: {
    message: "Boredom can spark creativity.",
    suggestions: ["Try a new hobby.", "Read or watch something inspiring."]
  },
  Reflective: {
    message: "Reflection leads to growth.",
    suggestions: ["Journal your thoughts.", "Talk to a friend about your reflections."]
  },
  Meh: {
    message: "Not every day is exciting, and that's okay.",
    suggestions: ["Do something comforting.", "Listen to your favorite music."]
  },
  Sad: {
    message: "It's okay to feel sad. Better days are ahead.",
    suggestions: ["Talk to someone you trust.", "Do something kind for yourself."]
  },
  Anxious: {
    message: "Take a deep breath. You are stronger than you think.",
    suggestions: ["Try a breathing exercise.", "Write down your worries and let them go."]
  },
  Angry: {
    message: "Anger is a valid emotion. Let it out in a healthy way.",
    suggestions: ["Go for a walk.", "Express your feelings through art or writing."]
  },
  Frustrated: {
    message: "Frustration means you care. Take a break.",
    suggestions: ["Step away for a moment.", "Talk it out with someone."]
  },
  Lonely: {
    message: "You are not alone. Reach out if you need to.",
    suggestions: ["Call a friend or family member.", "Join an online community."]
  },
  Overwhelmed: {
    message: "One step at a time. You can do this.",
    suggestions: ["Break tasks into small steps.", "Ask for help if you need it."]
  },
  Stressed: {
    message: "Remember to breathe. This too shall pass.",
    suggestions: ["Take a short walk.", "Try a relaxation exercise."]
  },
  Confused: {
    message: "It's okay to not have all the answers.",
    suggestions: ["Write down your thoughts.", "Talk to someone for perspective."]
  },
};

interface MotivationalModalProps {
  visible: boolean;
  entry: MoodEntry | null;
  onClose: () => void;
}

const MotivationalModal: React.FC<MotivationalModalProps> = ({ visible, entry, onClose }) => {
  if (!entry) return null;
  const moodData = MOTIVATION_MAP[entry.mood.label] || {
    message: "You're doing your best!",
    suggestions: ["Keep going.", "Take care of yourself."]
  };
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.emoji}>{entry.mood.emoji}</Text>
          <Text style={styles.moodLabel}>{entry.mood.label}</Text>
          <Text style={styles.date}>{entry.date}</Text>
          {entry.note ? <Text style={styles.note}>{entry.note}</Text> : null}
          {entry.voiceNotePath && (
            <VoiceRecorder value={entry.voiceNotePath} onRecordingComplete={() => {}} />
          )}
          <Text style={styles.motivation}>{moodData.message}</Text>
          <Text style={styles.suggestionsTitle}>Suggestions:</Text>
          {moodData.suggestions.map((s, i) => (
            <Text key={i} style={styles.suggestion}>• {s}</Text>
          ))}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    alignItems: 'center',
    elevation: 5,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  moodLabel: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 4,
  },
  date: {
    fontSize: 13,
    color: '#888',
    marginBottom: 8,
  },
  note: {
    fontSize: 15,
    marginBottom: 12,
    textAlign: 'center',
  },
  motivation: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginVertical: 8,
    textAlign: 'center',
  },
  suggestionsTitle: {
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 2,
    fontSize: 15,
  },
  suggestion: {
    fontSize: 14,
    marginBottom: 2,
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 18,
    backgroundColor: '#FFD700',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  closeButtonText: {
    fontWeight: 'bold',
    color: '#B8860B',
    fontSize: 16,
  },
});

export default MotivationalModal; 