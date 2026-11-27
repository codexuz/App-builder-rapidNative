import React, { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  BookOpen,
  Check,
  ChevronRight,
  Coins,
  Gift,
  RotateCcw,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react-native';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from '@/components/gluestack/actionsheet';
import { Badge, BadgeText } from '@/components/gluestack/badge';
import { Box } from '@/components/gluestack/box';
import { Button, ButtonIcon, ButtonSpinner, ButtonText } from '@/components/gluestack/button';
import { Card } from '@/components/gluestack/card';
import { Center } from '@/components/gluestack/center';
import { Divider } from '@/components/gluestack/divider';
import { Heading } from '@/components/gluestack/heading';
import { HStack } from '@/components/gluestack/hstack';
import { Image } from '@/components/gluestack/image';
import { Pressable } from '@/components/gluestack/pressable';
import { Progress, ProgressFilledTrack } from '@/components/gluestack/progress';
import { Text } from '@/components/gluestack/text';
import {
  Toast,
  ToastDescription,
  ToastTitle,
  useToast,
} from '@/components/gluestack/toast';
import { VStack } from '@/components/gluestack/vstack';
import { ConfettiBurst, GameHud } from '@/components/game';
import { LeoMascot } from '@/components/mascot/LeoMascot';
import { Screen } from '@/components/ui';
import { GeneratedAssets } from '@/constants/GeneratedAssets';
import { api } from '@/lib/api';
import type { DayQuest, QuestType } from '@/lib/api/types';
import { useKidsApp } from '@/providers/KidsAppProvider';
import { playCorrectFeedback, playVictoryFeedback } from '@/utils/soundFeedback';

const QUEST_META: Record<
  QuestType,
  {
    title: string;
    desc: (t: number) => string;
    bgClass: string;
    asset: keyof typeof GeneratedAssets;
  }
> = {
  EXERCISES: {
    title: 'Complete exercises',
    desc: (t) => `Finish ${t} ${t === 1 ? 'exercise' : 'exercises'} today`,
    bgClass: 'bg-accent',
    asset: 'courseBook',
  },
  GOOD_SCORE: {
    title: 'High accuracy',
    desc: (t) => `Score 80%+ on ${t} ${t === 1 ? 'exercise' : 'exercises'}`,
    bgClass: 'bg-amber-50',
    asset: 'badgeMedal',
  },
  WORDS: {
    title: 'Review vocabulary',
    desc: (t) => `Practice ${t} word cards`,
    bgClass: 'bg-blue-50',
    asset: 'wordCards',
  },
  MISTAKES: {
    title: 'Fix mistakes',
    desc: (t) => `Retry ${t} tricky ${t === 1 ? 'question' : 'questions'}`,
    bgClass: 'bg-orange-50',
    asset: 'streakFlame',
  },
  XP: {
    title: 'Earn daily XP',
    desc: (t) => `Collect ${t} XP today`,
    bgClass: 'bg-yellow-50',
    asset: 'xpBolt',
  },
};

export default function KidsQuestsScreen() {
  const router = useRouter();
  const toast = useToast();
  const {
    today,
    products,
    gamification,
    soundEnabled,
    loading,
    refreshAll,
    openDailyChest,
    orderShopProduct,
  } = useKidsApp();

  const [selectedProd, setSelectedProd] = useState<(typeof products)[number] | null>(null);
  const [ordering, setOrdering] = useState(false);
  const [openingChest, setOpeningChest] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);

  const quests: DayQuest[] = today?.quests ?? [];
  const doneCount = quests.filter((q) => q.done).length;
  const chestPct = quests.length ? Math.round((doneCount / quests.length) * 100) : 0;
  const chestReady = Boolean(today?.chest.ready && !today?.chest.openedAt);
  const chestOpened = Boolean(today?.chest.openedAt);
  const coins = gamification?.wallet?.cachedCoinBalance ?? today?.coins ?? 0;

  const showToast = (title: string, description: string, action: 'success' | 'error' = 'success') => {
    toast.show({
      placement: 'top',
      duration: 3000,
      render: ({ id }) => (
        <Toast
          nativeID={`toast-${id}`}
          action={action}
          variant="solid"
          className="rounded-xl px-4 py-3"
        >
          <ToastTitle className="font-bold">{title}</ToastTitle>
          <ToastDescription>{description}</ToastDescription>
        </Toast>
      ),
    });
  };

  const handleOpenChest = async () => {
    setOpeningChest(true);
    const res = await openDailyChest();
    setOpeningChest(false);
    showToast(res.ok ? 'Treasure Unlocked!' : 'Not Ready Yet', res.message, res.ok ? 'success' : 'error');
    if (res.ok) {
      setConfettiKey((k) => k + 1);
      playVictoryFeedback(soundEnabled);
    }
  };

  const handleConfirmOrder = async () => {
    if (!selectedProd) return;
    setOrdering(true);
    const res = await orderShopProduct(selectedProd);
    setOrdering(false);
    setSelectedProd(null);
    showToast(res.ok ? 'Reward Ordered!' : 'Could Not Order', res.message, res.ok ? 'success' : 'error');
    if (res.ok) {
      setConfettiKey((k) => k + 1);
      playCorrectFeedback(soundEnabled);
    }
  };

  return (
    <Box className="flex-1">
      <Screen hasTabBar refreshing={loading} onRefresh={() => void refreshAll()}>
        <GameHud onAvatarPress={() => router.push('/(tabs)/profile')} />

        {/* Daily Treasure Chest Banner */}
        <Box className="rounded-3xl overflow-hidden border-2 border-[#EA580C] border-b-[5px] border-b-[#C2410C]">
          <LinearGradient
            colors={['#F59E0B', '#EA580C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: 18, gap: 14 }}
          >
            <HStack className="items-center" space="md">
              <Center className="w-18 h-18 rounded-2xl bg-white/20">
                <Image
                  source={GeneratedAssets.treasureChest}
                  size="none"
                  alt="Daily Treasure Chest"
                  style={{ width: 58, height: 58 }}
                  resizeMode="contain"
                />
              </Center>
              <VStack className="flex-1 min-w-0" space="xs">
                <Heading size="md" className="text-white">
                  Daily Chest
                </Heading>
                <Text size="xs" className="text-white/90 leading-4" numberOfLines={2}>
                  {chestOpened && today?.chest.reward
                    ? `Claimed +${today.chest.reward.coins} Coins today.`
                    : chestOpened
                      ? 'Chest opened today. Come back tomorrow!'
                      : chestReady
                        ? 'Ready to open! Claim your bonus coins.'
                        : 'Complete all daily quests to unlock.'}
                </Text>
                <HStack className="items-center mt-1" space="sm">
                  <Box className="flex-1">
                    <Progress value={chestPct} className="h-3.5 bg-white/30">
                      <ProgressFilledTrack className="bg-white" />
                    </Progress>
                  </Box>
                  <Text size="xs" bold className="text-white">
                    {doneCount}/{quests.length}
                  </Text>
                </HStack>
              </VStack>
            </HStack>

            {chestReady ? (
              <Button
                size="lg"
                variant="secondary"
                isDisabled={openingChest}
                className="bg-white border-white border-b-orange-200 active:bg-slate-100 w-full"
                onPress={handleOpenChest}
              >
                {openingChest ? (
                  <ButtonSpinner color="#EA580C" />
                ) : (
                  <ButtonIcon as={Gift} className="text-orange-600" />
                )}
                <ButtonText className="text-orange-700 font-extrabold">
                  Open Treasure Chest
                </ButtonText>
              </Button>
            ) : null}
          </LinearGradient>
        </Box>

        {/* Daily Quests Card */}
        <VStack space="sm">
          <HStack className="items-center justify-between">
            <Heading size="md" className="text-foreground">
              Daily Quests
            </Heading>
            <Badge variant="secondary" className="rounded-full px-2.5">
              <BadgeText className="text-muted-foreground normal-case font-semibold">
                {doneCount} of {quests.length} done
              </BadgeText>
            </Badge>
          </HStack>

          {quests.length > 0 ? (
            <Card className="p-0 overflow-hidden">
              {quests.map((quest, idx) => {
                const meta = QUEST_META[quest.type] ?? {
                  title: quest.type,
                  desc: (t: number) => `Reach ${t} today`,
                  bgClass: 'bg-accent',
                  asset: 'xpBolt' as const,
                };
                const pct = Math.min(
                  100,
                  Math.round((quest.progress / Math.max(1, quest.target)) * 100)
                );

                return (
                  <Box key={`${quest.type}-${idx}`}>
                    {idx > 0 ? <Divider className="bg-border" /> : null}
                    <HStack className="items-center p-3.5" space="md">
                      <Center className={`w-12 h-12 rounded-2xl ${meta.bgClass}`}>
                        <Image
                          source={GeneratedAssets[meta.asset]}
                          alt={meta.title}
                          size="none"
                          resizeMode="contain"
                          style={{ width: 38, height: 38 }}
                        />
                      </Center>

                      <VStack className="flex-1 min-w-0" space="xs">
                        <HStack className="items-center justify-between" space="sm">
                          <Text
                            size="sm"
                            bold
                            className="text-foreground flex-1"
                            numberOfLines={1}
                          >
                            {meta.title}
                          </Text>
                          {quest.done ? (
                            <Center className="w-5 h-5 rounded-full bg-emerald-500">
                              <Check size={12} color="#FFFFFF" strokeWidth={3} />
                            </Center>
                          ) : (
                            <Text size="xs" bold className="text-muted-foreground">
                              {quest.progress}/{quest.target}
                            </Text>
                          )}
                        </HStack>
                        <Text size="xs" className="text-muted-foreground" numberOfLines={1}>
                          {meta.desc(quest.target)}
                        </Text>
                        <Progress
                          value={pct}
                          className="h-3 mt-0.5"
                        >
                          <ProgressFilledTrack
                            className={quest.done ? 'bg-success' : 'bg-primary'}
                          />
                        </Progress>
                      </VStack>
                    </HStack>
                  </Box>
                );
              })}
            </Card>
          ) : (
            <Card className="p-6">
              <VStack space="sm" className="items-center">
                <LeoMascot pose="idle" size={76} />
                <Heading size="sm" className="text-foreground">
                  No daily quests right now
                </Heading>
                <Text size="xs" className="text-muted-foreground text-center">
                  Start a lesson from Learn and check back soon.
                </Text>
              </VStack>
            </Card>
          )}
        </VStack>

        {/* Coin Shop Preview */}
        <VStack space="sm">
          <HStack className="items-center justify-between">
            <Heading size="md" className="text-foreground">
              Coin Shop
            </Heading>
            {products.length > 0 ? (
              <Button
                variant="link"
                size="sm"
                className="px-0"
                onPress={() => router.push('/shop' as never)}
              >
                <ButtonText className="text-primary font-bold text-xs">
                  See all
                </ButtonText>
                <ChevronRight size={14} color="#1055F8" />
              </Button>
            ) : null}
          </HStack>

          {products.length > 0 ? (
            <Box className="flex-row flex-wrap gap-2.5">
              {products.slice(0, 4).map((prod) => {
                const canAfford = coins >= prod.priceCoins;
                const imgUri = api.assetUrl(prod.imageUrl);
                return (
                  <Card
                    key={prod.id}
                    className="p-3.5 items-center gap-2.5"
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
                        <Image
                          source={GeneratedAssets.giftPrize}
                          alt={prod.name}
                          size="none"
                          resizeMode="contain"
                          style={{ width: 46, height: 46 }}
                        />
                      )}
                    </Center>
                    <Text
                      size="sm"
                      bold
                      className="text-foreground text-center min-h-9"
                      numberOfLines={2}
                    >
                      {prod.name}
                    </Text>
                    <Button
                      size="sm"
                      variant={canAfford ? 'default' : 'secondary'}
                      isDisabled={!canAfford}
                      className="w-full"
                      onPress={() => setSelectedProd(prod)}
                    >
                      <Coins size={13} color={canAfford ? '#FFFFFF' : '#64748B'} />
                      <ButtonText
                        className={`font-bold text-xs ${
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
            <Card className="p-5 items-center">
              <Text size="xs" className="text-muted-foreground">
                No shop prizes available from your center yet.
              </Text>
            </Card>
          )}
        </VStack>
      </Screen>

      {/* Gluestack Bottom Sheet (Actionsheet) for Order Confirmation */}
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
                    <Image
                      source={GeneratedAssets.giftPrize}
                      alt={selectedProd.name}
                      size="none"
                      resizeMode="contain"
                      style={{ width: 54, height: 54 }}
                    />
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
                  Price
                </Text>
                <Badge variant="outline" className="rounded-full bg-amber-50 border-amber-200 px-3 py-1 gap-1">
                  <Coins size={14} color="#D97706" />
                  <BadgeText className="text-amber-700 font-extrabold normal-case">
                    {selectedProd.priceCoins} Coins
                  </BadgeText>
                </Badge>
              </HStack>

              <HStack className="items-center justify-between">
                <Text size="sm" className="text-muted-foreground font-medium">
                  Balance after order
                </Text>
                <Text size="sm" bold className="text-foreground">
                  {Math.max(0, coins - selectedProd.priceCoins)} Coins
                </Text>
              </HStack>

              <HStack space="sm" className="mt-2">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 px-3"
                  onPress={() => setSelectedProd(null)}
                >
                  <ButtonText className="text-sm">Cancel</ButtonText>
                </Button>
                <Button
                  size="lg"
                  variant="success"
                  isDisabled={ordering}
                  className="flex-1 px-3"
                  onPress={() => void handleConfirmOrder()}
                >
                  {ordering ? <ButtonSpinner color="#FFFFFF" /> : null}
                  <ButtonText className="text-sm" numberOfLines={1}>
                    {ordering ? 'Ordering...' : 'Confirm Order'}
                  </ButtonText>
                </Button>
              </HStack>
            </VStack>
          ) : null}
        </ActionsheetContent>
      </Actionsheet>

      <ConfettiBurst triggerKey={confettiKey} intensity="grand" />
    </Box>
  );
}
