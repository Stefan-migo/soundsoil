/**
 * SoundSoil Companion - App Navigator
 * Stack navigation with all app screens
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { colors } from '../theme/colors';

import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/SettingsScreen';
import PresetsScreen from '../screens/PresetsScreen';
import PresetEditorScreen from '../screens/PresetEditorScreen';
import QrScannerScreen from '../screens/QrScannerScreen';
import QrDisplayScreen from '../screens/QrDisplayScreen';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background,
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTintColor: colors.textPrimary,
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 16,
          },
          cardStyle: {
            backgroundColor: colors.background,
          },
        }}>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: 'CONFIGURACIÓN',
            headerBackTitle: 'Atrás',
          }}
        />
        <Stack.Screen
          name="Presets"
          component={PresetsScreen}
          options={{
            title: 'PRESETS',
            headerBackTitle: 'Atrás',
          }}
        />
        <Stack.Screen
          name="PresetEditor"
          component={PresetEditorScreen}
          options={{
            title: 'EDITAR PRESET',
            headerBackTitle: 'Atrás',
          }}
        />
        <Stack.Screen
          name="QrScanner"
          component={QrScannerScreen}
          options={{
            title: 'ESCANEAR QR',
            headerBackTitle: 'Atrás',
          }}
        />
        <Stack.Screen
          name="QrDisplay"
          component={QrDisplayScreen}
          options={{
            title: 'COMPARTIR PRESET',
            headerBackTitle: 'Atrás',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
