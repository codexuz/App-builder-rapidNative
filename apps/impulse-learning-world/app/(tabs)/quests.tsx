import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
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
import { ConfettiBurst, GameButton, GameHud } from '@/components/game';
import { LeoMascot } from '@/components/mascot/LeoMascot';
import { Screen } from '@/components/ui';
import { DS } from '@/constants/DesignSystem';
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
    bg: string;
    color: string;
    icon: React.ComponentType<{ size?: number; color?: string }>;
  }
> = {
  EXERCISES: {
    title: 'Complete exercises',
    desc: (t) => `Finish ${t} ${t === 1 ? 'exercise' : 'exercises'} today`,
    bg: DS.colors.brandSoft,
    color: DS.colors.brand,
    icon: Target,
  },
  GOOD_SCORE: {
    title: 'High accuracy',
    desc: (t) => `Score 80%+ on ${t} ${t === 1 ? 'exercise' : 'exercises'}`,
    bg: DS.colors.greenSoft,
    color: DS.colors.greenInk,
    icon: Sparkles,
  },
  WORDS: {
    title: 'Review vocabulary',
    desc: (t) => `Practice ${t} word cards`,
    bg: DS.colors.amberSoft,
    color: DS.colors.amberDeep,
    icon: BookOpen,
  },
  MISTAKES: {
    title: 'Fix mistakes',
    desc: (t) => `Retry ${t} tricky ${t === 1 ? 'question' : 'questions'}`,
    bg: DS.colors.orangeSoft,
    color: DS.colors.orange,
    icon: RotateCcw,
  },
  XP: {
    title: 'Earn daily XP',
    desc: (t) => `Collect ${t} XP today`,
    bg: DS.colors.greenSoft,
    color: DS.colors.greenInk,
    icon: Zap,
  },
};

export default function KidsQuestsScreen() {
  const router = useRouter();
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
      <Screen hasTabBar refreshing={loading} onRefresh={() => void refreshAll()}>
        <GameHud onAvatarPress={() => router.push('/(tabs)/profile')} />

        {/* Daily Treasure Chest Banner */}
        <LinearGradient
          colors={['#F59E0B', '#EA580C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.chestCard}
        >
          <View style={styles.chestTop}>
            <View style={styles.chestImgBox}>
              <Image
                source={GeneratedAssets.treasureChest}
                style={styles.chestImg}
                resizeMode="contain"
              />
            </View>
            <View style={styles.chestTextCol}>
              <Text style={styles.chestTitle}>Daily Chest</Text>
              <Text style={styles.chestSub} numberOfLines={2}>
                {chestOpened && today?.chest.reward
                  ? `Claimed +${today.chest.reward.coins} Coins today.`
                  : chestOpened
                    ? 'Chest opened today. Come back tomorrow!'
                    : chestReady
                      ? 'Ready to open! Claim your bonus coins.'
                      : 'Complete all daily quests to unlock.'}
              </Text>
              <View style={styles.chestBarRow}>
                <View style={styles.chestTrack}>
                  <View
                    style={[
                      styles.chestFill,
                      { width: `${quests.length ? Math.round((doneCount / quests.length) * 100) : 0}%` },
                    ]}
                  />
                </View>
                <Text style={styles.chestCount}>
                  {doneCount}/{quests.length}
                </Text>
              </View>
            </View>
          </View>

          {chestReady ? (
            <GameButton
              label="Open Treasure Chest"
              color={DS.colors.green}
              depthColor={DS.colors.greenDeep}
              icon={<Gift size={16} color="#FFFFFF" />}
              onPress={handleOpenChest}
            />
          ) : null}
        </LinearGradient>

        {notice ? (
          <View style={[DS.card, styles.noticeRow]}>
            <Sparkles size={16} color={DS.colors.brand} />
            <Text style={[DS.type.body, { flex: 1, color: DS.colors.ink }]}>{notice}</Text>
          </View>
        ) : null}

        {/* Unified Daily Quests Card */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={DS.type.sectionTitle}>Daily Quests</Text>
            <Text style={DS.type.caption}>
              {doneCount} of {quests.length} done
            </Text>
          </View>

          {quests.length > 0 ? (
            <View style={[DS.card, styles.groupedCard]}>
              {quests.map((quest, idx) => {
                const meta = QUEST_META[quest.type] ?? {
                  title: quest.type,
                  desc: (t: number) => `Reach ${t} today`,
                  bg: DS.colors.brandSoft,
                  color: DS.colors.brand,
                  icon: Target,
                };
                const IconComp = meta.icon;
                const pct = Math.min(100, Math.round((quest.progress / Math.max(1, quest.target)) * 100));

                return (
                  <View
                    key={`${quest.type}-${idx}`}
                    style={[styles.questRow, idx > 0 ? styles.rowDivider : null]}
                  >
                    <View style={[styles.questIcon, { backgroundColor: meta.bg }]}>
                      <IconComp size={19} color={meta.color} />
                    </View>

                    <View style={styles.questBody}>
                      <View style={styles.questTitleRow}>
                        <Text style={[DS.type.cardTitle, { flex: 1 }]} numberOfLines={1}>
                          {meta.title}
                        </Text>
                        {quest.done ? (
                          <View style={styles.doneCircle}>
                            <Check size={13} color="#FFFFFF" strokeWidth={3} />
                          </View>
                        ) : (
                          <Text style={styles.questFraction}>
                            {quest.progress}/{quest.target}
                          </Text>
                        )}
                      </View>
                      <Text style={DS.type.caption} numberOfLines={1}>
                        {meta.desc(quest.target)}
                      </Text>
                      <View style={styles.questTrack}>
                        <View
                          style={[
                            styles.questFill,
                            {
                              width: `${pct}%`,
                              backgroundColor: quest.done ? DS.colors.green : DS.colors.brand,
                            },
                          ]}
                        />
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={[DS.card, styles.emptyBox]}>
              <LeoMascot pose="idle" size={76} />
              <Text style={DS.type.cardTitle}>No daily quests right now</Text>
              <Text style={[DS.type.caption, { textAlign: 'center' }]}>
                Start a lesson from Learn and check back soon.
              </Text>
            </View>
          )}
        </View>

        {/* Coin Shop Preview Grid */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={DS.type.sectionTitle}>Coin Shop</Text>
            {products.length > 0 ? (
              <Pressable
                onPress={() => router.push('/shop' as never)}
                style={styles.seeAllBtn}
              >
                <Text style={styles.seeAllText}>See all</Text>
                <ChevronRight size={15} color={DS.colors.brand} />
              </Pressable>
            ) : null}
          </View>

          {products.length > 0 ? (
            <View style={styles.shopGrid}>
              {products.slice(0, 4).map((prod) => {
                const canAfford = coins >= prod.priceCoins;
                const imgUri = api.assetUrl(prod.imageUrl);
                return (
                  <View key={prod.id} style={[DS.card, styles.shopTile]}>
                    <View style={styles.shopThumb}>
                      {imgUri ? (
                        <Image source={{ uri: imgUri }} style={styles.shopImg} resizeMode="cover" />
                      ) : (
                        <Gift size={26} color={DS.colors.brand} />
                      )}
                    </View>
                    <Text style={styles.shopName} numberOfLines={2}>
                      {prod.name}
                    </Text>
                    <View style={{ width: '100%', marginTop: 'auto' }}>
                      <GameButton
                        label={`${prod.priceCoins}`}
                        size="md"
                        disabled={!canAfford}
                        color={DS.colors.brand}
                        depthColor={DS.colors.brandDeep}
                        icon={<Coins size={14} color="#FFFFFF" />}
                        onPress={() => void handleBuy(prod)}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={[DS.card, styles.emptyBox]}>
              <Text style={DS.type.caption}>No shop prizes available from your center yet.</Text>
            </View>
          )}
        </View>
      </Screen>
      <ConfettiBurst triggerKey={confettiKey} intensity="grand" />
    </View>
  );
}

const styles = StyleSheet.create({
  chestCard: {
    borderRadius: 22,
    padding: 18,
    gap: 16,
  },
  chestTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  chestImgBox: {
    width: 74,
    height: 74,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chestImg: {
    width: 64,
    height: 64,
  },
  chestTextCol: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  chestTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  chestSub: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  chestBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  chestTrack: {
    flex: 1,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.28)',
    overflow: 'hidden',
  },
  chestFill: {
    height: 7,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  chestCount: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  noticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
  },
  section: {
    gap: 10,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: DS.colors.brand,
  },
  groupedCard: {
    overflow: 'hidden',
  },
  questRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  rowDivider: {
    borderTopWidth: 1,
    borderTopColor: DS.colors.border,
  },
  questIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questBody: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  questTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  doneCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: DS.colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questFraction: {
    fontSize: 12.5,
    fontWeight: '800',
    color: DS.colors.inkSecondary,
    fontVariant: ['tabular-nums'],
  },
  questTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: DS.colors.surfaceSubtle,
    overflow: 'hidden',
    marginTop: 2,
  },
  questFill: {
    height: 6,
    borderRadius: 3,
  },
  emptyBox: {
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  shopGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  shopTile: {
    width: '48.4%',
    padding: 14,
    alignItems: 'center',
    gap: 10,
    minHeight: 168,
  },
  shopThumb: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: DS.colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  shopImg: {
    width: 54,
    height: 54,
  },
  shopName: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    color: DS.colors.ink,
    textAlign: 'center',
  },
});
