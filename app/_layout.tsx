import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Jost_300Light, Jost_400Regular, Jost_500Medium, Jost_600SemiBold } from '@expo-google-fonts/jost';
import { AuthProvider } from '../src/contexts/AuthContext';
import { StoreProvider } from '../src/contexts/StoreContext';
import { ThemeProvider } from '../src/contexts/ThemeContext';
import { I18nProvider } from '../src/contexts/I18nContext';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StoreGate } from '../src/components/StorePicker';
import { ActiveServiceProvider } from '../src/contexts/ActiveServiceContext';

export default function RootLayout() {
  // Fix iOS Safari: set viewport-fit=cover so safe area insets work,
  // prevent auto-zoom on input focus, and add bottom padding for home indicator
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const meta = document.querySelector('meta[name="viewport"]');
    if (meta) {
      meta.setAttribute(
        'content',
        'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover'
      );
    }
    // Removed: padding-bottom on <html> doesn't affect RN Web's absolute layout.
    // Safe area is handled per-component (e.g. tab bar bottom inset).
  }, []);
  const [fontsLoaded] = useFonts({
    Jost_300Light,
    Jost_400Regular,
    Jost_500Medium,
    Jost_600SemiBold,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#D6BC8A" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <I18nProvider>
          <AuthProvider>
            <StoreProvider>
              <ActiveServiceProvider>
                <StatusBar style="auto" />
                <View style={{ flex: 1 }}>
                  <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="index" />
                    <Stack.Screen name="login" />
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="notifications" options={{ presentation: 'modal' }} />
                  </Stack>
                  <StoreGate />
                </View>
              </ActiveServiceProvider>
            </StoreProvider>
          </AuthProvider>
        </I18nProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F0E8' },
});
