import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Gift, Sparkles } from 'lucide-react-native';
import {
  Coin3D,
  ConfettiBurst,
  GameButton,
  GameHud,
  ProgressBar,
  Star3D,
} from '@/components/game';
import { LeoMascot } from '@/components/mascot/LeoMascot';
import { Badge, Card, Screen, SectionHeader, StaggeredEntrance } from '@/components/ui';
import { GeneratedAssets } from '@/constants/GeneratedAssets';
import { useAppTheme } from '@/constants/Theme';
import { api } from '@/lib/api';
import type { DayQuest, QuestType } from '@/lib/api/types';
import { useKidsApp } from '@/providers/KidsAppProvider';
import { playCorrectFeedback, playVictoryFeedback } from '@/utils/soundFeedback';

const QUEST_COPY: Record<QuestType, { title: string; desc: (t: number) => string }> = {
  EXERCISES: {
    title: 'Complete Exercises',
    desc: (t) => `Finish ${t} fun ${t === 1 ? 'exercise' : 'exercises'} with Leo today.`,
  },
  GOOD_SCORE: {
    title: 'Super Accuracy',
    desc: (t) => `Score high on ${t} ${t === 1 ? 'exercise' : 'exercises'} today.`,
  },
  WORDS: {
    title: 'Word Explorer',
    desc: (t) => `Review ${t} English flashcards in Word Cards.`,
  },
  MISTAKES: {
    title: 'Fix Mistakes',
    desc: (t) => `Practice ${t} tricky ${t === 1 ? 'question' : 'questions'}.`,
  },
  XP: {
    title: 'Earn Daily XP',
    desc: (t) => `Collect ${t} XP across your Impulse Kids courses.`,
  },
};

export default function KidsQuestsScreen() {
  const router = useRouter();
  const { colors, typography } = useAppTheme();
  const { today, products, gamification, soundEnabled, openDailyChest, orderShopProduct } =
    useKidsApp();

  const [notice, setNotice] = useState<string | null>(null);
  const [confettiKey, setConfettiKey] = useState(0);

  const quests: DayQuest[] = today?.quests ?? [];
  const doneCount = quests.filter((q) => q.done).length;
  const chestReady = Boolean(today?.chest.ready && !today?.chest.openedAt);
  const chestOpened = Boolean(today?.chest.openedAt);
  const coins = gamification?.wallet?.cachedCoinBalance ?? today?.coins ?? 0;

  const handleOpenChest = async () => {
    const res = await openDailyChest();
    setNotice(res.message);
    if (res.ok) {
      setConfettiKey((k) => k + 1);
      playVictoryFeedback(soundEnabled);
    }
  };

  const handleBuy = async (prod: (typeof products)[number]) => {
    const res = await orderShopProduct(prod);
    setNotice(res.message);
    if (res.ok) {
      setConfettiKey((k) => k + 1);
      playCorrectFeedback(soundEnabled);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Screen hasTabBar>
        <GameHud onAvatarPress={() => router.push('/(tabs)/profile')} />

        {/* Glowing Daily Treasure Chest Hero */}
        <StaggeredEntrance index={0}>
          <Card variant="gradient" gradientColors={['#F59E0B', '#EA580C']} style={styles.chestHero}>
            <View style={styles.chestRow}>
              <View style={styles.chestStage}>
                <Image
                  source={GeneratedAssets.treasureChest}
                  style={styles.chestImg}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.chestInfo}>
                <Text style={[typography.title1, { color: '#FFFFFF' }]}>
                  Daily Treasure Chest
                </Text>
                <Text style={styles.chestSub}>
                  {chestOpened && today?.chest.reward
                    ? `Opened today! You won +${today.chest.reward.coins} Coins${today.chest.reward.freeze ? ' & 1 Freeze' : ''}.`
                    : chestOpened
                      ? 'Chest opened today! Come back tomorrow for new loot!'
                      : chestReady
                        ? 'Your chest is unlocked! Tap below to claim your reward!'
                        : 'Finish today’s quests with Leo to unlock your bonus chest!'}
                </Text>
                <View style={styles.chestProgressRow}>
                  <ProgressBar
                    progress={quests.length > 0 ? doneCount / quests.length : 0}
                    color="#FEF08A"
                    secondaryColor="#FFFFFF"
                    trackColor="rgba(255,255,255,0.28)"
                    height={10}
                    style={{ flex: 1 }}
                  />
                  <Text style={styles.chestCount}>
                    {doneCount}/{quests.length}
                  </Text>
                </View>
              </View>
            </View>

            {chestReady ? (
              <GameButton
                label="Open Treasure Chest!"
                color="#58CC02"
                depthColor="#46A302"
                icon={<Gift size={17} color="#FFFFFF" />}
                onPress={handleOpenChest}
              />
            ) : null}
          </Card>
        </StaggeredEntrance>

        {notice ? (
          <Card variant="muted" style={styles.noticeBanner}>
            <Sparkles size={16} color="#1055F8" />
            <Text style={[typography.callout, { color: colors.textPrimary, flex: 1 }]}>
              {notice}
            </Text>
          </Card>
        ) : null}

        <SectionHeader
          title="Daily Quests"
          subtitle={`${doneCount} of ${quests.length} quests completed today`}
        />

        {quests.length > 0 ? (
          <View style={styles.listStack}>
            {quests.map((quest, idx) => {
              const meta = QUEST_COPY[quest.type] ?? {
                title: quest.type,
                desc: (t: number) => `Reach ${t} today`,
              };
              const ratio = Math.min(1, quest.progress / Math.max(1, quest.target));

              return (
                <StaggeredEntrance key={`${quest.type}-${idx}`} index={idx + 1}>
                  <Card style={styles.questCard}>
                    <View style={styles.questTop}>
                      <View style={{ flex: 1, gap: 2 }}>
                        <Text style={[typography.headline, { color: colors.textPrimary }]}>
                          {meta.title}
                        </Text>
                        <Text style={[typography.caption, { color: colors.textSecondary }]}>
                          {meta.desc(quest.target)}
                        </Text>
                      </View>
                      {quest.done ? (
                        <Badge label="Done!" tone="success" />
                      ) : (
                        <View style={[styles.countPill, { backgroundColor: colors.surfaceMuted }]}>
                          <Text style={[typography.caption, { color: colors.textPrimary }]}>
                            {quest.progress}/{quest.target}
                          </Text>
                        </View>
                      )}
                    </View>

                    <ProgressBar
                      progress={ratio}
                      color={quest.done ? '#58CC02' : '#1055F8'}
                      height={12}
                    />
                  </Card>
                </StaggeredEntrance>
              );
            })}
          </View>
        ) : (
          <Card style={styles.emptyCard}>
            <LeoMascot pose="idle" size={88} />
            <Text style={[typography.headline, { color: colors.textPrimary, textAlign: 'center' }]}>
              No Daily Quests Right Now
            </Text>
            <Text style={[typography.caption, { color: colors.textSecondary, textAlign: 'center' }]}>
              Start a lesson from Courses and check back soon!
            </Text>
          </Card>
        )}

        {/* Impulse Kids Coin Shop (from /shop/products) */}
        <SectionHeader
          title="Impulse Coin Shop"
          subtitle={`You have ${coins} Coins to spend`}
          actionLabel={products.length > 0 ? 'See All' : undefined}
          onActionPress={products.length > 0 ? () => router.push('/shop' as never) : undefined}
        />

        {products.length > 0 ? (
          <View style={styles.shopGrid}>
            {products.slice(0, 4).map((prod) => {
              const canAfford = coins >= prod.priceCoins;
              const imgUri = api.assetUrl(prod.imageUrl);
              return (
                <Card key={prod.id} style={styles.shopCard}>
                  <View style={styles.shopIconWrap}>
                    {imgUri ? (
                      <Image source={{ uri: imgUri }} style={styles.prodImg} resizeMode="cover" />
                    ) : (
                      <Star3D size={36} filled />
                    )}
                  </View>
                  <Text
                    style={[typography.headline, { color: colors.textPrimary, textAlign: 'center' }]}
                    numberOfLines={2}
                  >
                    {prod.name}
                  </Text>
                  {prod.description ? (
                    <Text
                      style={[typography.caption, { color: colors.textSecondary, textAlign: 'center' }]}
                      numberOfLines={2}
                    >
                      {prod.description}
                    </Text>
                  ) : null}
                  <View style={{ width: '100%', marginTop: 4 }}>
                    <GameButton
                      label={`${prod.priceCoins} Coins`}
                      size="md"
                      disabled={!canAfford}
                      color="#1055F8"
                      depthColor="#0A3BB3"
                      icon={<Coin3D size={16} />}
                      onPress={() => handleBuy(prod)}
                    />
                  </View>
                </Card>
              );
            })}
          </View>
        ) : (
          <Card style={styles.emptyCard}>
            <Text style={[typography.callout, { color: colors.textSecondary, textAlign: 'center' }]}>
              No shop prizes available yet from your center.
            </Text>
          </Card>
        )}
      </Screen>
      <ConfettiBurst triggerKey={confettiKey} intensity="grand" />
    </View>
  );
}

const styles = StyleSheet.create({
  chestHero: {
    gap: 14,
    paddingVertical: 16,
  },
  chestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  chestStage: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -4,
  },
  chestImg: {
    width: 90,
    height: 90,
  },
  chestInfo: {
    flex: 1,
    gap: 5,
  },
  chestSub: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  chestProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  chestCount: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  listStack: {
    gap: 12,
  },
  questCard: {
    gap: 10,
  },
  questTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  countPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  emptyCard: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 20,
  },
  shopGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  shopCard: {
    width: '48.2%',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 10,
  },
  shopIconWrap: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  prodImg: {
    width: 58,
    height: 58,
  },
});
