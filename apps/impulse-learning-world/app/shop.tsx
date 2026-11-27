import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowLeft, Coins, Gift, ShoppingBag } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from '@/components/gluestack/actionsheet';
import { Badge, BadgeText } from '@/components/gluestack/badge';
import { Box } from '@/components/gluestack/box';
import { Button, ButtonSpinner, ButtonText } from '@/components/gluestack/button';
import { Card } from '@/components/gluestack/card';
import { Center } from '@/components/gluestack/center';
import { Divider } from '@/components/gluestack/divider';
import { Heading } from '@/components/gluestack/heading';
import { HStack } from '@/components/gluestack/hstack';
import { Image } from '@/components/gluestack/image';
import { Text } from '@/components/gluestack/text';
import {
  Toast,
  ToastDescription,
  ToastTitle,
  useToast,
} from '@/components/gluestack/toast';
import { VStack } from '@/components/gluestack/vstack';
import { ConfettiBurst } from '@/components/game';
import { LeoMascot } from '@/components/mascot/LeoMascot';
import { api } from '@/lib/api';
import { useKidsApp } from '@/providers/KidsAppProvider';
import { playCorrectFeedback } from '@/utils/soundFeedback';

export default function KidsCoinShopScreen() {
  const router = useRouter();
  const toast = useToast();
  const { products, orders, gamification, today, soundEnabled, orderShopProduct } =
    useKidsApp();

  const [selectedProd, setSelectedProd] = useState<(typeof products)[number] | null>(null);
  const [ordering, setOrdering] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);

  const coins = gamification?.wallet?.cachedCoinBalance ?? today?.coins ?? 0;

  const handleConfirmOrder = async () => {
    if (!selectedProd) return;
    setOrdering(true);
    const res = await orderShopProduct(selectedProd);
    setOrdering(false);
    setSelectedProd(null);

    toast.show({
      placement: 'top',
      duration: 3000,
      render: ({ id }) => (
        <Toast
          nativeID={`shop-toast-${id}`}
          action={res.ok ? 'success' : 'error'}
          variant="solid"
          className="rounded-xl px-4 py-3"
        >
          <ToastTitle className="font-bold">
            {res.ok ? 'Reward Ordered!' : 'Order Failed'}
          </ToastTitle>
          <ToastDescription>{res.message}</ToastDescription>
        </Toast>
      ),
    });

    if (res.ok) {
      setConfettiKey((k) => k + 1);
      playCorrectFeedback(soundEnabled);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ConfettiBurst triggerKey={confettiKey} intensity="grand" />

      <HStack className="items-center px-4 py-2.5 bg-card border-b border-border" space="sm">
        <Button
          size="icon"
          variant="secondary"
          className="h-9 w-9 rounded-full"
          onPress={() => router.back()}
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={18} color="#0F172A" />
        </Button>
        <Heading size="md" className="text-foreground flex-1">
          Coin Shop
        </Heading>
        <Badge
          variant="outline"
          className="rounded-full bg-amber-50 border-amber-200 px-3 py-1 gap-1.5"
        >
          <Coins size={14} color="#D97706" />
          <BadgeText className="text-amber-700 font-extrabold normal-case">
            {coins}
          </BadgeText>
        </Badge>
      </HStack>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <Box className="rounded-2xl overflow-hidden shadow-xs">
          <LinearGradient
            colors={['#2563EB', '#1055F8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <LeoMascot pose="cheer" size={64} />
            <VStack className="flex-1" space="xs">
              <Heading size="md" className="text-white">
                Spend Your Coins
              </Heading>
              <Text size="xs" className="text-white/90 leading-4">
                Order real Impulse rewards and pick them up at your center.
              </Text>
            </VStack>
          </LinearGradient>
        </Box>

        {products.length > 0 ? (
          <Box className="flex-row flex-wrap gap-2.5">
            {products.map((prod) => {
              const canAfford = coins >= prod.priceCoins;
              const imgUri = api.assetUrl(prod.imageUrl);
              return (
                <Card
                  key={prod.id}
                  className="bg-card border border-border rounded-2xl p-3.5 items-center gap-2"
                  style={{ width: '48.4%' }}
                >
                  <Center className="w-14 h-14 rounded-2xl bg-accent overflow-hidden">
                    {imgUri ? (
                      <Image
                        source={{ uri: imgUri }}
                        size="none"
                        alt={prod.name}
                        style={{ width: 56, height: 56 }}
                        resizeMode="cover"
                      />
                    ) : (
                      <Gift size={26} color="#1055F8" />
                    )}
                  </Center>
                  <Text
                    size="sm"
                    bold
                    className="text-foreground text-center"
                    numberOfLines={2}
                  >
                    {prod.name}
                  </Text>
                  {prod.description ? (
                    <Text
                      size="xs"
                      className="text-muted-foreground text-center"
                      numberOfLines={2}
                    >
                      {prod.description}
                    </Text>
                  ) : null}
                  <Button
                    size="sm"
                    variant={canAfford ? 'default' : 'secondary'}
                    isDisabled={!canAfford}
                    className="w-full rounded-xl h-9 mt-auto"
                    onPress={() => setSelectedProd(prod)}
                  >
                    <Coins size={13} color={canAfford ? '#FFFFFF' : '#64748B'} />
                    <ButtonText
                      className={`text-xs font-bold ${
                        canAfford ? 'text-white' : 'text-muted-foreground'
                      }`}
                    >
                      {prod.priceCoins} Coins
                    </ButtonText>
                  </Button>
                </Card>
              );
            })}
          </Box>
        ) : (
          <Card className="bg-card border border-border rounded-2xl p-6 items-center gap-2">
            <LeoMascot pose="idle" size={82} />
            <Heading size="sm" className="text-foreground">
              No prizes available yet
            </Heading>
            <Text size="xs" className="text-muted-foreground text-center">
              Check back soon when your center adds new items.
            </Text>
          </Card>
        )}

        {orders.length > 0 ? (
          <VStack space="sm">
            <Heading size="md" className="text-foreground">
              My Orders
            </Heading>
            <Card className="bg-card border border-border rounded-2xl p-0 overflow-hidden">
              {orders.slice(0, 6).map((ord, idx) => (
                <Box key={ord.id}>
                  {idx > 0 ? <Divider className="bg-border" /> : null}
                  <HStack className="items-center p-3.5" space="md">
                    <Center className="w-9 h-9 rounded-xl bg-accent">
                      <ShoppingBag size={16} color="#1055F8" />
                    </Center>
                    <VStack className="flex-1">
                      <Text size="sm" bold className="text-foreground">
                        {ord.totalCoins} Coins
                      </Text>
                      <Text size="xs" className="text-muted-foreground">
                        {new Date(ord.createdAt).toLocaleDateString()}
                      </Text>
                    </VStack>
                    <Badge className="rounded-full bg-accent border-0 px-2.5 py-0.5">
                      <BadgeText className="text-primary text-[11px] font-bold">
                        {ord.status}
                      </BadgeText>
                    </Badge>
                  </HStack>
                </Box>
              ))}
            </Card>
          </VStack>
        ) : null}
      </ScrollView>

      <Actionsheet isOpen={Boolean(selectedProd)} onClose={() => setSelectedProd(null)}>
        <ActionsheetBackdrop />
        <ActionsheetContent className="bg-card px-5 pb-7 pt-2 rounded-t-3xl">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator className="bg-border w-12" />
          </ActionsheetDragIndicatorWrapper>

          {selectedProd ? (
            <VStack space="md" className="w-full pt-3">
              <HStack className="items-center" space="md">
                <Center className="w-16 h-16 rounded-2xl bg-accent overflow-hidden">
                  {api.assetUrl(selectedProd.imageUrl) ? (
                    <Image
                      source={{ uri: api.assetUrl(selectedProd.imageUrl)! }}
                      size="none"
                      alt={selectedProd.name}
                      style={{ width: 64, height: 64 }}
                      resizeMode="cover"
                    />
                  ) : (
                    <Gift size={28} color="#1055F8" />
                  )}
                </Center>
                <VStack className="flex-1 min-w-0" space="xs">
                  <Heading size="md" className="text-foreground">
                    {selectedProd.name}
                  </Heading>
                  {selectedProd.description ? (
                    <Text size="xs" className="text-muted-foreground" numberOfLines={2}>
                      {selectedProd.description}
                    </Text>
                  ) : null}
                </VStack>
              </HStack>

              <Divider className="bg-border" />

              <HStack className="items-center justify-between">
                <Text size="sm" className="text-muted-foreground font-medium">
                  Order total
                </Text>
                <Badge
                  variant="outline"
                  className="rounded-full bg-amber-50 border-amber-200 px-3 py-1 gap-1"
                >
                  <Coins size={14} color="#D97706" />
                  <BadgeText className="text-amber-700 font-extrabold normal-case">
                    {selectedProd.priceCoins} Coins
                  </BadgeText>
                </Badge>
              </HStack>

              <HStack space="sm" className="mt-1">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 h-12 rounded-xl border-border"
                  onPress={() => setSelectedProd(null)}
                >
                  <ButtonText className="text-foreground font-semibold">Cancel</ButtonText>
                </Button>
                <Button
                  size="lg"
                  isDisabled={ordering}
                  className="flex-1 h-12 rounded-xl"
                  onPress={() => void handleConfirmOrder()}
                >
                  {ordering ? <ButtonSpinner color="#FFFFFF" /> : null}
                  <ButtonText className="font-bold">
                    {ordering ? 'Ordering...' : 'Confirm Order'}
                  </ButtonText>
                </Button>
              </HStack>
            </VStack>
          ) : null}
        </ActionsheetContent>
      </Actionsheet>
    </SafeAreaView>
  );
}
