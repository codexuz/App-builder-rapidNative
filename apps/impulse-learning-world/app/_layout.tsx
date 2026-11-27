import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import 'react-native-reanimated';

import { GameButton } from '@/components/game';
import { LeoMascot } from '@/components/mascot/LeoMascot';
import { useColorScheme } from '@/components/useColorScheme';
import { useAppTheme } from '@/constants/Theme';
import { KidsAppProvider, useKidsApp } from '@/providers/KidsAppProvider';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

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

  return (
    <KidsAppProvider>
      <RootLayoutNav />
    </KidsAppProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { colors, typography } = useAppTheme();
  const { status, retryBoot } = useKidsApp();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (status === 'booting' || status === 'offline') return;
    const onAuthScreen = segments[0] === 'auth';

    if (status === 'signedOut' && !onAuthScreen) {
      router.replace('/auth');
    } else if (status === 'signedIn' && onAuthScreen) {
      router.replace('/(tabs)');
    }
  }, [router, segments, status]);

  if (status === 'booting') {
    return (
      <View style={[styles.centerState, { backgroundColor: colors.background }]}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <LeoMascot pose="wave" size={130} />
        <ActivityIndicator size="large" color="#1055F8" style={{ marginTop: 12 }} />
        <Text style={[typography.headline, { color: colors.textPrimary, marginTop: 10 }]}>
          Impulse Kids
        </Text>
        <Text style={[typography.caption, { color: colors.textSecondary }]}>
          Connecting to Impulse Learning Center...
        </Text>
      </View>
    );
  }

  if (status === 'offline') {
    return (
      <View style={[styles.centerState, { backgroundColor: colors.background, padding: 24 }]}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <LeoMascot pose="sleep" size={136} />
        <Text style={[typography.title1, { color: colors.textPrimary, textAlign: 'center', marginTop: 8 }]}>
          No Internet Connection
        </Text>
        <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginBottom: 16 }]}>
          Leo cannot reach the Impulse server right now. Check Wi-Fi or mobile data and try again.
        </Text>
        <View style={{ width: '100%', maxWidth: 280 }}>
          <GameButton
            label="Try Again"
            color="#1055F8"
            depthColor="#0A3BB3"
            onPress={() => void retryBoot()}
          />
        </View>
      </View>
    );
  }

  return (
    <>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="course/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="lesson/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="words" options={{ headerShown: false }} />
        <Stack.Screen name="shop" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
});
