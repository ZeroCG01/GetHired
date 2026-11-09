import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { View, ActivityIndicator } from 'react-native';

import { useAppStore } from '../store/useAppStore';
import { useAppTheme } from '../hooks/useAppTheme';
import { getDatabase } from '../db/client';
import '../i18n'; // initialize i18n

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const isHydrated = useAppStore((state) => state.isHydrated);
  const hydrate = useAppStore((state) => state.hydrate);
  const { colors, isDark } = useAppTheme();

  useEffect(() => {
    try {
      getDatabase();
    } catch (e) {
      console.warn('Database initialization error:', e);
    }
    hydrate().then(() => {
      SplashScreen.hideAsync().catch(() => {});
    });
  }, [hydrate]);

  if (!isHydrated) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="application/new"
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="application/[id]/index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="application/[id]/edit"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="statuses/index"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </View>
  );
}
