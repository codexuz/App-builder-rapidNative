import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

/**
 * Matches erp-lms/apps/student/lib/storage.ts:
 * - secure: expo-secure-store on iOS/Android, AsyncStorage on Web (refresh tokens)
 * - plain: AsyncStorage across all platforms (prefs, student selection, locale)
 */
export const storage = {
  secure: {
    async get(key: string): Promise<string | null> {
      try {
        if (isWeb) return await AsyncStorage.getItem(key);
        return await SecureStore.getItemAsync(key);
      } catch {
        return null;
      }
    },
    async set(key: string, value: string): Promise<void> {
      try {
        if (isWeb) {
          await AsyncStorage.setItem(key, value);
        } else {
          await SecureStore.setItemAsync(key, value);
        }
      } catch {
        // Ignore storage quota/unavailable errors
      }
    },
    async remove(key: string): Promise<void> {
      try {
        if (isWeb) {
          await AsyncStorage.removeItem(key);
        } else {
          await SecureStore.deleteItemAsync(key);
        }
      } catch {
        // Ignore
      }
    },
  },
  plain: {
    async get(key: string): Promise<string | null> {
      try {
        return await AsyncStorage.getItem(key);
      } catch {
        return null;
      }
    },
    async set(key: string, value: string): Promise<void> {
      try {
        await AsyncStorage.setItem(key, value);
      } catch {
        // Ignore
      }
    },
    async remove(key: string): Promise<void> {
      try {
        await AsyncStorage.removeItem(key);
      } catch {
        // Ignore
      }
    },
  },
};

export const StorageKeys = {
  refreshToken: (center: string) => `auth.refresh.${center}`,
  selectedStudent: (center: string, userId: string) => `student.${center}.${userId}`,
  locale: 'impulse.kids.locale',
  soundEnabled: 'impulse.kids.sound',
} as const;
