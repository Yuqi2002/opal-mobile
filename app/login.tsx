import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../src/contexts/AuthContext';
import { useTheme } from '../src/contexts/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const PERSONAS = [
  { label: 'Owner', sublabel: 'Alex Moreau', icon: 'star' as const, email: 'alex@opal.salon', password: 'owner123' },
  { label: 'Receptionist', sublabel: 'Naomi Walsh', icon: 'clipboard' as const, email: 'naomi@opal.salon', password: 'front123' },
  { label: 'Staff', sublabel: 'Sofia Reyes', icon: 'scissors' as const, email: 'sofia@opal.salon', password: 'staff123' },
];

export default function LoginScreen() {
  const { colors } = useTheme();
  const { login } = useAuth();
  const router = useRouter();

  const handlePersona = (email: string, password: string) => {
    const success = login(email, password);
    if (success) {
      router.replace('/(tabs)/home');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.cream }]}>
      <View style={styles.inner}>
        {/* Logo */}
        <View style={styles.logoSection}>
          <View style={[styles.diamond, { backgroundColor: colors.gold }]}>
            <Text style={[styles.diamondText, { color: colors.warmWhite }]}>O</Text>
          </View>
          <Text style={[styles.brandName, { color: colors.obsidian }]}>OPAL</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>Choose a persona to continue</Text>
        </View>

        {/* Persona buttons */}
        <View style={styles.personas}>
          {PERSONAS.map((p) => (
            <Pressable
              key={p.email}
              style={({ pressed }) => [
                styles.personaBtn,
                { backgroundColor: colors.warmWhite, borderColor: colors.border },
                pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
              ]}
              onPress={() => handlePersona(p.email, p.password)}
            >
              <View style={[styles.personaIcon, { backgroundColor: colors.gold + '20' }]}>
                <Feather name={p.icon} size={20} color={colors.gold} />
              </View>
              <View style={styles.personaText}>
                <Text style={[styles.personaLabel, { color: colors.obsidian }]}>{p.label}</Text>
                <Text style={[styles.personaSublabel, { color: colors.textMuted }]}>{p.sublabel}</Text>
              </View>
              <Feather name="chevron-right" size={18} color={colors.textMuted} />
            </Pressable>
          ))}
        </View>
      </View>
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
  personas: { gap: 12 },
  personaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 14,
  },
  personaIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  personaText: { flex: 1, gap: 2 },
  personaLabel: { fontSize: 16, fontFamily: 'Jost_600SemiBold' },
  personaSublabel: { fontSize: 13, fontFamily: 'Jost_400Regular' },
});
