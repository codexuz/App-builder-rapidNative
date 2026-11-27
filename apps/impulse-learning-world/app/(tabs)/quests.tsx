import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  CheckCircle2,
  Coins,
  Compass,
  Crown,
  Flame,
  Gem,
  Lamp,
  Sparkles,
  Telescope,
  TrainFront,
  Zap,
} from 'lucide-react-native';
import {
  Coin3D,
  ConfettiBurst,
  GameButton,
  GameHud,
  Gem3D,
  ProgressBar,
  XpBolt3D,
} from '@/components/game';
import { Badge, Card, Screen, SectionHeader, StaggeredEntrance } from '@/components/ui';
import { GeneratedAssets } from '@/constants/GeneratedAssets';
import { RegionPalette, useAppTheme } from '@/constants/Theme';
import { COLLECTIBLE_RELICS } from '@/data/mockState';
import { useGame } from '@/store/GameContext';
import type { CollectibleRelic } from '@/types/game';

function RelicIcon({ name, color }: { name: CollectibleRelic['iconName']; color: string }) {
  switch (name) {
    case 'compass':
      return <Compass size={26} color={color} />;
    case 'lighthouse':
      return <Flame size={26} color={color} />;
    case 'train':
      return <TrainFront size={26} color={color} />;
    case 'lantern':
      return <Lamp size={26} color={color} />;
    case 'telescope':
      return <Telescope size={26} color={color} />;
    case 'crown':
      return <Crown size={26} color={color} />;
  }
}

export default function QuestsScreen() {
  const router = useRouter();
  const { colors, typography, radii } = useAppTheme();
  const { player, claimQuest, buyRelic } = useGame();
  const [notice, setNotice] = useState<string | null>(null);
  const [confettiKey, setConfettiKey] = useState(0);

  const completedQuests = player.dailyQuests.filter(
    (q) => q.claimed || q.progress >= q.target
  ).length;
  const claimableCount = player.dailyQuests.filter(
    (q) => !q.claimed && q.progress >= q.target
  ).length;

  const handleClaim = (questId: string, title: string) => {
    const ok = claimQuest(questId);
    if (ok) {
      setNotice(`Treasure unlocked for "${title}"!`);
      setConfettiKey((k) => k + 1);
    }
  };

  const handleBuyRelic = (relicId: string) => {
    const res = buyRelic(relicId);
    setNotice(res.message);
    if (res.ok) {
      setConfettiKey((k) => k + 1);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Screen hasTabBar>
        <GameHud onAvatarPress={() => router.push('/(tabs)/profile')} />

      {/* Glowing Treasure Chest Daily Goal Hero */}
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
                Finish today's missions to earn bonus coins, gems & stickers!
              </Text>
              <View style={styles.chestProgressRow}>
                <ProgressBar
                  progress={completedQuests / Math.max(1, player.dailyQuests.length)}
                  color="#FEF08A"
                  trackColor="rgba(255,255,255,0.28)"
                  height={9}
                  style={{ flex: 1 }}
                />
                <Text style={styles.chestCount}>
                  {completedQuests}/{player.dailyQuests.length}
                </Text>
              </View>
            </View>
          </View>
        </Card>
      </StaggeredEntrance>

      {notice ? (
        <Card variant="muted" style={styles.noticeBanner}>
          <Sparkles size={16} color={colors.accent} />
          <Text style={[typography.callout, { color: colors.textPrimary, flex: 1 }]}>
            {notice}
          </Text>
        </Card>
      ) : null}

      <SectionHeader
        title="Daily Quests"
        subtitle={
          claimableCount > 0
            ? `${claimableCount} reward waiting to claim!`
            : 'Play any city stop to fill your bars'
        }
      />

      <View style={styles.listStack}>
        {player.dailyQuests.map((quest, idx) => {
          const ratio = quest.progress / quest.target;
          const isReady = quest.progress >= quest.target;

          return (
            <StaggeredEntrance key={quest.id} index={idx + 1}>
              <Card style={styles.questCard}>
                <View style={styles.questTop}>
                  <View style={styles.questTitleCol}>
                    <Text style={[typography.headline, { color: colors.textPrimary }]}>
                      {quest.title}
                    </Text>
                    <Text style={[typography.caption, { color: colors.textSecondary }]}>
                      {quest.description}
                    </Text>
                  </View>
                  {quest.claimed ? (
                    <Badge label="Claimed" tone="success" />
                  ) : isReady ? (
                    <Badge label="Ready!" tone="accent" dot />
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
                  color={quest.claimed || isReady ? colors.success : colors.accent}
                  height={11}
                />

                <View style={styles.questFooter}>
                  <View style={styles.rewardPills}>
                    <View style={[styles.miniReward, { backgroundColor: colors.xpMuted }]}>
                      <XpBolt3D size={16} />
                      <Text style={[styles.miniRewardText, { color: colors.xp }]}>
                        +{quest.xpReward}
                      </Text>
                    </View>
                    <View style={[styles.miniReward, { backgroundColor: colors.coinMuted }]}>
                      <Coin3D size={16} />
                      <Text style={[styles.miniRewardText, { color: colors.coin }]}>
                        +{quest.coinReward}
                      </Text>
                    </View>
                    <View style={[styles.miniReward, { backgroundColor: colors.gemMuted }]}>
                      <Gem3D size={16} />
                      <Text style={[styles.miniRewardText, { color: colors.gem }]}>
                        +{quest.gemReward}
                      </Text>
                    </View>
                  </View>

                  {!quest.claimed && isReady ? (
                    <GameButton
                      label="Claim!"
                      size="md"
                      fullWidth={false}
                      color={colors.success}
                      depthColor="#047857"
                      onPress={() => handleClaim(quest.id, quest.title)}
                    />
                  ) : null}
                </View>
              </Card>
            </StaggeredEntrance>
          );
        })}
      </View>

      {/* Playful 2-Column Stickerbook Relic Vault */}
      <SectionHeader
        title="Relic Stickerbook"
        subtitle={`${player.ownedRelicIds.length} of ${COLLECTIBLE_RELICS.length} collected`}
      />

      <View style={styles.stickerGrid}>
        {COLLECTIBLE_RELICS.map((relic) => {
          const owned = player.ownedRelicIds.includes(relic.id);
          const palette = RegionPalette[relic.level];
          const canAfford =
            player.coins >= relic.costCoins && player.gems >= relic.costGems;

          return (
            <Card
              key={relic.id}
              style={[
                styles.stickerCard,
                owned && { borderColor: palette.primary, borderWidth: 1.75 },
              ]}
            >
              <View style={styles.stickerTop}>
                <Badge
                  label={relic.rarity}
                  tone={
                    relic.rarity === 'Legendary'
                      ? 'warning'
                      : relic.rarity === 'Epic'
                        ? 'accent'
                        : 'neutral'
                  }
                />
                <Text style={[typography.caption, { color: palette.primary }]}>
                  {relic.level}
                </Text>
              </View>

              <View
                style={[
                  styles.stickerMedallion,
                  { backgroundColor: palette.soft, borderRadius: radii.lg },
                ]}
              >
                <RelicIcon name={relic.iconName} color={palette.primary} />
              </View>

              <Text
                style={[typography.callout, { color: colors.textPrimary, textAlign: 'center' }]}
                numberOfLines={2}
              >
                {relic.name}
              </Text>
              <Text
                style={[typography.caption, { color: colors.textSecondary, textAlign: 'center' }]}
                numberOfLines={1}
              >
                {relic.cityName}
              </Text>

              {owned ? (
                <View style={[styles.ownedPill, { backgroundColor: colors.successMuted }]}>
                  <CheckCircle2 size={14} color={colors.success} />
                  <Text style={[styles.ownedText, { color: colors.success }]}>Collected</Text>
                </View>
              ) : (
                <GameButton
                  label={
                    relic.costGems > 0
                      ? `${relic.costCoins}c · ${relic.costGems}g`
                      : `${relic.costCoins} Coins`
                  }
                  size="md"
                  disabled={!canAfford}
                  color={palette.primary}
                  depthColor={palette.deep}
                  onPress={() => handleBuyRelic(relic.id)}
                />
              )}
            </Card>
          );
        })}
      </View>
      </Screen>
      <ConfettiBurst triggerKey={confettiKey} intensity="grand" />
    </View>
  );
}

const styles = StyleSheet.create({
  chestHero: {
    paddingVertical: 16,
  },
  chestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
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
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
  },
  listStack: {
    gap: 12,
  },
  questCard: {
    gap: 12,
  },
  questTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  questTitleCol: {
    flex: 1,
    gap: 2,
  },
  countPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  questFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  rewardPills: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  miniReward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
  },
  miniRewardText: {
    fontSize: 12,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  stickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  stickerCard: {
    width: '48%',
    flexGrow: 1,
    alignItems: 'center',
    gap: 8,
    padding: 12,
  },
  stickerTop: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stickerMedallion: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  ownedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    width: '100%',
    paddingVertical: 9,
    borderRadius: 12,
  },
  ownedText: {
    fontSize: 12.5,
    fontWeight: '800',
  },
});
