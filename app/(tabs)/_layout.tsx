import React from 'react';
import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useTranslation } from '../../src/contexts/I18nContext';

export default function TabLayout() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.warmWhite,
          borderTopWidth: 0.5,
          borderTopColor: colors.border,
          height: 52 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 6,
        },
        tabBarActiveTintColor: colors.goldDeep,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: 'Jost_500Medium',
          letterSpacing: 0.5,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t('navHome'),
          tabBarIcon: ({ color, size }) => (
            <View>
              <Feather name="home" size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: t('navAppts'),
          tabBarIcon: ({ color }) => <Feather name="calendar" size={22} color={color} />,
        }}
        listeners={({ navigation }) => ({
          tabPress: () => {
            navigation.navigate('appointments', { screen: 'index' });
          },
        })}
      />
      <Tabs.Screen
        name="turns"
        options={{
          title: t('navTurns'),
          tabBarIcon: ({ color }) => <Feather name="layers" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: t('navMore'),
          tabBarIcon: ({ color }) => <Feather name="more-horizontal" size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}
