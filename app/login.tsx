import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import { useTheme } from '../src/contexts/ThemeContext';
import { useTranslation } from '../src/contexts/I18nContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    setError('');
    const success = login(email, password);
    if (success) {
      router.replace('/(tabs)/home');
    } else {
      setError(t('authInvalidCredentials'));
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.cream }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inner}>
        {/* Logo */}
        <View style={styles.logoSection}>
          <View style={[styles.diamond, { backgroundColor: colors.gold }]}>
            <Text style={[styles.diamondText, { color: colors.warmWhite }]}>O</Text>
          </View>
          <Text style={[styles.brandName, { color: colors.obsidian }]}>OPAL</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>{t('authWelcome')}</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.charcoal }]}>{t('authEmail')}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.creamDark, color: colors.obsidian, borderColor: colors.border }]}
              value={email}
              onChangeText={setEmail}
              placeholder="alex@opal.salon"
              placeholderTextColor={colors.textFaint}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.charcoal }]}>{t('authPassword')}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.creamDark, color: colors.obsidian, borderColor: colors.border }]}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={colors.textFaint}
              secureTextEntry
              testID="password-input"
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            style={[styles.button, { backgroundColor: colors.gold }]}
            onPress={handleLogin}
            accessibilityRole="button"
            accessibilityLabel="Sign In"
            testID="sign-in-button"
          >
            <Text style={[styles.buttonText, { color: colors.obsidian }]}>{t('authSignIn')}</Text>
          </Pressable>

          <Pressable style={styles.forgotLink}>
            <Text style={[styles.forgotText, { color: colors.goldDeep }]}>{t('authForgotPassword')}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 32 },
  logoSection: { alignItems: 'center', marginBottom: 48 },
  diamond: { width: 52, height: 52, borderRadius: 14, transform: [{ rotate: '45deg' }], justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  diamondText: { fontSize: 22, fontFamily: 'Jost_600SemiBold', transform: [{ rotate: '-45deg' }] },
  brandName: { fontSize: 28, fontFamily: 'Jost_300Light', letterSpacing: 8 },
  subtitle: { fontSize: 14, fontFamily: 'Jost_400Regular', marginTop: 8 },
  form: { gap: 16 },
  fieldGroup: { gap: 6 },
  label: { fontSize: 13, fontFamily: 'Jost_500Medium' },
  input: { height: 48, borderRadius: 12, paddingHorizontal: 16, fontSize: 15, fontFamily: 'Jost_400Regular', borderWidth: 1 },
  error: { color: '#C62828', fontSize: 13, fontFamily: 'Jost_400Regular', textAlign: 'center' },
  button: { height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  buttonText: { fontSize: 15, fontFamily: 'Jost_600SemiBold' },
  forgotLink: { alignItems: 'center', marginTop: 8 },
  forgotText: { fontSize: 14, fontFamily: 'Jost_500Medium' },
});
