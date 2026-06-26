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
import { StaffPoliciesProvider } from '../src/contexts/StaffPoliciesContext';

export default function RootLayout() {
  // Fix iOS Safari / PWA: set viewport-fit=cover so safe area insets work,
  // prevent auto-zoom on input focus, and ensure the app fills the full viewport
  // without a white bar below the tab bar.
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const meta = document.querySelector('meta[name="viewport"]');
    if (meta) {
      meta.setAttribute(
        'content',
        'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover'
      );
    }
    // Inject styles to fix the white-bar-below-tabs issue on iOS PWA.
    // The default Expo template uses `height: 100%` on html/body/#root which
    // doesn't account for the dynamic viewport on mobile Safari (address bar
    // show/hide, home indicator area). Using position:fixed + inset:0 on #root
    // ensures the app always fills the exact visible viewport. We also set
    // html/body background to match the app so any sub-pixel gap is invisible.
    const style = document.createElement('style');
    style.textContent = `
      html, body {
        height: 100% !important;
        min-height: 100dvh;
        margin: 0;
        padding: 0;
        overflow: hidden;
        background-color: #F5F0E8;
      }
      #root {
        position: fixed !important;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        height: 100% !important;
        min-height: -webkit-fill-available;
        overflow: hidden;
      }
    `;
    document.head.appendChild(style);
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
              <StaffPoliciesProvider>
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
              </StaffPoliciesProvider>
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
