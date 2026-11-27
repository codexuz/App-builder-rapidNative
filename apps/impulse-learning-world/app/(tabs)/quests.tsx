import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
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
import { GameButton, GameHud, ProgressBar } from '@/components/game';
import { Badge, Card, Screen, SectionHeader } from '@/components/ui';
import { RegionPalette, useAppTheme } from '@/constants/Theme';
import { COLLECTIBLE_RELICS } from '@/data/mockState';
import { useGame } from '@/store/GameContext';
import type { CollectibleRelic } from '@/types/game';

function RelicIcon({ name, color }: { name: CollectibleRelic['iconName']; color: string }) {
  switch (name) {
    case 'compass':
      return <Compass size={22} color={color} />;
    case 'lighthouse':
      return <Flame size={22} color={color} />;
    case 'train':
      return <TrainFront size={22} color={color} />;
    case 'lantern':
      return <Lamp size={22} color={color} />;
    case 'telescope':
      return <Telescope size={22} color={color} />;
    case 'crown':
      return <Crown size={22} color={color} />;
  }
}

export default function QuestsScreen() {
  const router = useRouter();
  const { colors, typography, radii } = useAppTheme();
  const { player, claimQuest, buyRelic } = useGame();
  const [notice, setNotice] = useState<string | null>(null);

  const claimableCount = player.dailyQuests.filter(
    (q) => !q.claimed && q.progress >= q.target
  ).length;

  const handleClaim = (questId: string, title: string) => {
    const ok = claimQuest(questId);
    if (ok) {
      setNotice(`Claimed rewards for "${title}"!`);
    }
  };

  const handleBuyRelic = (relicId: string) => {
    const res = buyRelic(relicId);
    setNotice(res.message);
  };

  return (
    <Screen hasTabBar>
      <GameHud onAvatarPress={() => router.push('/(tabs)/profile')} />

      <View style={styles.headerBlock}>
        <Text style={[typography.display, { color: colors.textPrimary }]}>
          Quests & Vault
        </Text>
        <Text style={[typography.body, { color: colors.textSecondary }]}>
          Complete daily missions for coins and gems, then unlock rare world relics.
        </Text>
      </View>

      {notice ? (
        <Card variant="muted" style={styles.noticeBanner}>
          <Sparkles size={16} color={colors.accent} />
          <Text style={[typography.callout, { color: colors.textPrimary, flex: 1 }]}>
            {notice}
          </Text>
        </Card>
      ) : null}

      <SectionHeader
        title="Daily Missions"
        subtitle={
          claimableCount > 0
            ? `${claimableCount} reward ready to claim`
            : 'Progress updates automatically after each lesson'
        }
      />

      <View style={styles.listStack}>
        {player.dailyQuests.map((quest) => {
          const ratio = quest.progress / quest.target;
          const isReady = quest.progress >= quest.target;

          return (
            <Card key={quest.id} style={styles.questCard}>
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
                  <Badge label="Ready" tone="accent" dot />
                ) : (
                  <Text style={[typography.callout, { color: colors.textSecondary }]}>
                    {quest.progress}/{quest.target}
                  </Text>
                )}
              </View>

              <ProgressBar
                progress={ratio}
                color={quest.claimed || isReady ? colors.success : colors.accent}
                height={9}
              />

              <View style={styles.questFooter}>
                <View style={styles.rewardPills}>
                  <View style={[styles.miniReward, { backgroundColor: colors.xpMuted }]}>
                    <Zap size={12} color={colors.xp} />
                    <Text style={[styles.miniRewardText, { color: colors.xp }]}>
                      +{quest.xpReward}
                    </Text>
                  </View>
                  <View style={[styles.miniReward, { backgroundColor: colors.coinMuted }]}>
                    <Coins size={12} color={colors.coin} />
                    <Text style={[styles.miniRewardText, { color: colors.coin }]}>
                      +{quest.coinReward}
                    </Text>
                  </View>
                  <View style={[styles.miniReward, { backgroundColor: colors.gemMuted }]}>
                    <Gem size={12} color={colors.gem} />
                    <Text style={[styles.miniRewardText, { color: colors.gem }]}>
                      +{quest.gemReward}
                    </Text>
                  </View>
                </View>

                {!quest.claimed && isReady ? (
                  <GameButton
                    label="Claim"
                    size="md"
                    fullWidth={false}
                    color={colors.success}
                    depthColor="#166534"
                    onPress={() => handleClaim(quest.id, quest.title)}
                  />
                ) : null}
              </View>
            </Card>
          );
        })}
      </View>

      <SectionHeader
        title="Collectible Relics"
        subtitle={`${player.ownedRelicIds.length}/${COLLECTIBLE_RELICS.length} collected across A1–B2 cities`}
      />

      <View style={styles.listStack}>
        {COLLECTIBLE_RELICS.map((relic) => {
          const owned = player.ownedRelicIds.includes(relic.id);
          const palette = RegionPalette[relic.level];
          const canAfford =
            player.coins >= relic.costCoins && player.gems >= relic.costGems;

          return (
            <Card key={relic.id} style={styles.relicCard}>
              <View style={styles.relicRow}>
                <View
                  style={[
                    styles.relicIconBox,
                    { backgroundColor: palette.soft, borderRadius: radii.md },
                  ]}
                >
                  <RelicIcon name={relic.iconName} color={palette.primary} />
                </View>

                <View style={styles.relicInfo}>
                  <View style={styles.relicTitleRow}>
                    <Text
                      style={[typography.headline, { color: colors.textPrimary, flex: 1 }]}
                      numberOfLines={1}
                    >
                      {relic.name}
                    </Text>
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
                  </View>
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>
                    {relic.cityName} · {relic.level}
                  </Text>
                  <Text style={[typography.body, { color: colors.textSecondary, fontSize: 13 }]}>
                    {relic.description}
                  </Text>
                </View>
              </View>

              <View style={styles.relicActionRow}>
                <View style={styles.costGroup}>
                  {relic.costCoins > 0 ? (
                    <View style={[styles.miniReward, { backgroundColor: colors.coinMuted }]}>
                      <Coins size={13} color={colors.coin} />
                      <Text style={[styles.miniRewardText, { color: colors.coin }]}>
                        {relic.costCoins}
                      </Text>
                    </View>
                  ) : null}
                  {relic.costGems > 0 ? (
                    <View style={[styles.miniReward, { backgroundColor: colors.gemMuted }]}>
                      <Gem size={13} color={colors.gem} />
                      <Text style={[styles.miniRewardText, { color: colors.gem }]}>
                        {relic.costGems}
                      </Text>
                    </View>
                  ) : null}
                </View>

                {owned ? (
                  <View style={styles.ownedTag}>
                    <CheckCircle2 size={16} color={colors.success} />
                    <Text style={[typography.callout, { color: colors.success }]}>
                      In Vault
                    </Text>
                  </View>
                ) : (
                  <GameButton
                    label={canAfford ? 'Collect' : 'Need More'}
                    size="md"
                    fullWidth={false}
                    disabled={!canAfford}
                    color={palette.primary}
                    depthColor={palette.deep}
                    onPress={() => handleBuyRelic(relic.id)}
                  />
                )}
              </View>
            </Card>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerBlock: {
    gap: 4,
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
  relicCard: {
    gap: 12,
  },
  relicRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  relicIconBox: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  relicInfo: {
    flex: 1,
    gap: 3,
  },
  relicTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  relicActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  costGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ownedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
