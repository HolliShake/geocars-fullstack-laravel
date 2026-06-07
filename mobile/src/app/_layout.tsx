import { DarkTheme, DefaultTheme, Redirect, ThemeProvider } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View, useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { getToken } from '@/lib/api';
import { initDatabase } from '@/lib/database';
// Registers the background location task at module-level (required by expo-task-manager)
import '@/lib/tasks';
import { useSyncOnResume } from '@/lib/sync';

function AuthGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);

  // Start background sync whenever the app is foregrounded
  useSyncOnResume();

  useEffect(() => {
    (async () => {
      initDatabase();
      const token = await getToken();
      setAuthed(!!token);
      setReady(true);
    })();
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#208AEF" />
      </View>
    );
  }

  if (!authed) return <Redirect href="/login" />;

  return <>{children}</>;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <AuthGate>
        <AppTabs />
      </AuthGate>
    </ThemeProvider>
  );
}
