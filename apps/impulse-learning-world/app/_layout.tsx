import '@/global.css';

import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { SafeAreaListener } from 'react-native-safe-area-context';
import { Uniwind } from 'uniwind';

import { Button, ButtonText } from '@/components/gluestack/button';
import { Center } from '@/components/gluestack/center';
import { GluestackUIProvider } from '@/components/gluestack/gluestack-ui-provider';
import { Heading } from '@/components/gluestack/heading';
import { Spinner } from '@/components/gluestack/spinner';
import { Text } from '@/components/gluestack/text';
import { VStack } from '@/components/gluestack/vstack';
import { LeoMascot } from '@/components/mascot/LeoMascot';
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaListener onChange={({ insets }) => Uniwind.updateInsets(insets)}>
        <GluestackUIProvider mode="light">
          <KidsAppProvider>
            <RootLayoutNav />
          </KidsAppProvider>
        </GluestackUIProvider>
      </SafeAreaListener>
    </GestureHandlerRootView>
  );
}

function RootLayoutNav() {
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
      <Center className="flex-1 bg-background px-6">
        <StatusBar style="dark" />
        <VStack space="md" className="items-center">
          <LeoMascot pose="wave" size={124} />
          <Spinner size="large" />
          <Heading size="lg" className="text-foreground">
            Impulse Kids
          </Heading>
          <Text size="sm" className="text-muted-foreground text-center">
            Connecting to Impulse Learning Center...
          </Text>
        </VStack>
      </Center>
    );
  }

  if (status === 'offline') {
    return (
      <Center className="flex-1 bg-background px-6">
        <StatusBar style="dark" />
        <VStack space="md" className="items-center w-full max-w-[300px]">
          <LeoMascot pose="sleep" size={132} />
          <Heading size="xl" className="text-foreground text-center">
            No Internet Connection
          </Heading>
          <Text size="sm" className="text-muted-foreground text-center">
            Leo cannot reach the Impulse server right now. Check Wi-Fi or mobile data and try again.
          </Text>
          <Button
            size="lg"
            className="w-full rounded-xl h-12 mt-2"
            onPress={() => void retryBoot()}
          >
            <ButtonText className="font-bold">Try Again</ButtonText>
          </Button>
        </VStack>
      </Center>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
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
