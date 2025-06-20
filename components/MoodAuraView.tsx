import React, { useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface MoodAuraViewProps {
  colors: string[];
  intensity?: number;
}

export default function MoodAuraView({ colors, intensity = 3 }: MoodAuraViewProps) {
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    const pulse = Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]);

    Animated.loop(pulse).start();
  }, []);

  // Ensure we have at least 2 colors for the gradient
  const gradientColors = colors.length > 0 
    ? colors.length === 1 
      ? [colors[0], colors[0]]
      : [...colors]
    : ['#ffffff', '#ffffff'];

  // Calculate gradient locations
  const gradientLocations = colors.length > 1
    ? Array.from({ length: colors.length }, (_, i) => i / (colors.length - 1))
    : [0, 1];

  // Adjust opacity based on intensity (1-5)
  const opacity = 0.3 + (intensity * 0.1);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.auraContainer,
          {
            transform: [{ scale: pulseAnim }],
            opacity,
          },
        ]}
      >
        <LinearGradient
          colors={gradientColors}
          style={styles.aura}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          locations={gradientLocations}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: -1,
  },
  auraContainer: {
    width: '150%',
    aspectRatio: 1,
    overflow: 'hidden',
  },
  aura: {
    flex: 1,
    borderRadius: 999,
  },
}); 