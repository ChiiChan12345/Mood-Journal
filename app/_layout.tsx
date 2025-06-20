import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useColorScheme } from 'react-native';
import { SecurityProvider, useSecurityContext } from '../contexts/SecurityContext';
import LockScreen from '../components/LockScreen';
import { Ionicons } from '@expo/vector-icons';
import { addNotificationResponseHandler } from '../utils/notifications';

function ErrorScreen({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Oops! Something went wrong.</Text>
      <Text style={styles.subtitle}>Don't worry, your data is safe.</Text>
      <TouchableOpacity style={styles.button} onPress={retry}>
        <Text style={styles.buttonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
}

export function ErrorBoundary(props: { error: Error; retry: () => void }) {
  return <ErrorScreen error={props.error} retry={props.retry} />;
}

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  const router = useRouter();

  // Handle notification responses
  useEffect(() => {
    const subscription = addNotificationResponseHandler((response) => {
      const goalId = response.notification.request.content.data?.goalId;
      if (goalId) {
        // Navigate to the goals screen
        router.push('/goals');
      }
    });

    return () => {
      subscription.remove();
    };
  }, [router]);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <SecurityProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          <Stack.Screen
            name="goals"
            options={{
              title: 'Goals',
              headerStyle: {
                backgroundColor: '#4CAF50',
              },
              headerTintColor: '#fff',
            }}
          />
      </Stack>
      </SecurityProvider>
    </ThemeProvider>
  );
}

function AppTabs() {
  const { isLocked } = useSecurityContext();

  if (isLocked) {
    return <LockScreen />;
  }

  return (
    <Stack.Screen
      name="index"
      options={{
        title: 'Journal',
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="journal" size={size} color={color} />
        ),
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
