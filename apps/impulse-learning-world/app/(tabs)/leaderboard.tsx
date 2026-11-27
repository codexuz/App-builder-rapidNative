import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowUpRight,
  BookOpen,
  Crown,
  Flame,
  Gem,
  Map,
  Mic,
  Sparkles,
  Trophy,
  Zap,
} from 'lucide-react-native';
import { GameHud, ProgressBar } from '@/components/game';
import {
  AnimatedCounter,
  Badge,
  Card,
  Screen,
  SectionHeader,
  StaggeredEntrance,
} from '@/components/ui';
import { GeneratedAssets } from '@/constants/GeneratedAssets';
import { RegionPalette, useAppTheme } from '@/constants/Theme';
import { useGame } from '@/store/GameContext';
import type { Achievement } from '@/types/game';

function AchievementIcon({ name, color }: { name: Achievement['iconName']; color: string }) {
  switch (name) {
    case 'flame':
      return <Flame size={20} color={color} />;
    case 'map':
      return <Map size={20} color={color} />;
    case 'mic':
      return <Mic size={20} color={color} />;
    case 'sparkles':
      return <Sparkles size={20} color={color} />;
    case 'trophy':
      return <Trophy size={20} color={color} />;
    case 'book':
      return <BookOpen size={20} color={color} />;
  }
}

export default function LeaderboardScreen() {
  const router = useRouter();
  const { colors, typography, radii } = useAppTheme();
  const { player, leaderboard } = useGame();

  const topThree = leaderboard.slice(0, 3);
  const podiumOrder = [topThree[1], topThree[0], topThree[2]].filter(Boolean);
  const myRank = leaderboard.findIndex((e) => e.isCurrentUser) + 1;

  return (
    <Screen hasTabBar>
      <GameHud onAvatarPress={() => router.push('/(tabs)/profile')} />

      <View style={styles.headerBlock}>
        <Text style={[typography.display, { color: colors.textPrimary }]}>
          Explorer League
        </Text>
        <Text style={[typography.body, { color: colors.textSecondary }]}>
          Top 3 explorers advance to Astral Division this week!
        </Text>
      </View>

      {/* Dark Contrast 3D Stepped Podium Stadium Card (inspired by modern kids leaderboards) */}
      <StaggeredEntrance index={0}>
        <View style={[styles.stadiumCard, { borderRadius: radii.xl }]}>
          <View style={styles.stadiumKpiRow}>
            <View style={[styles.kpiPill, { backgroundColor: '#7C3AED' }]}>
              <Text style={styles.kpiValue}>{player.weeklyXp} XP</Text>
              <Text style={styles.kpiLabel}>Your Weekly XP</Text>
            </View>
            <View style={[styles.kpiPill, { backgroundColor: '#F59E0B' }]}>
              <Text style={styles.kpiValue}>#{myRank || 4}</Text>
              <Text style={styles.kpiLabel}>Crystal Division</Text>
            </View>
          </View>

          <View style={styles.totalScoreCenter}>
            <View style={styles.trophyScoreRow}>
              <Image
                source={GeneratedAssets.trophyGold}
                style={styles.stadiumTrophyImg}
                resizeMode="contain"
              />
              <View style={styles.trophyScoreTextCol}>
                <AnimatedCounter
                  value={player.xp}
                  suffix=" XP"
                  style={styles.totalScoreNumber}
                />
                <View style={styles.divisionChip}>
                  <Trophy size={12} color="#FFFFFF" />
                  <Text style={styles.divisionChipText}>3 days left in season</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.podiumRow}>
            {podiumOrder.map((entry) => {
              const rank = leaderboard.findIndex((e) => e.id === entry.id) + 1;
              const isFirst = rank === 1;
              const pillarHeight = rank === 1 ? 104 : rank === 2 ? 76 : 62;
              const pillarColor =
                rank === 1 ? '#F59E0B' : rank === 2 ? '#2563EB' : '#6366F1';
              const ringColor =
                rank === 1 ? '#FDE047' : rank === 2 ? '#93C5FD' : '#C4B5FD';

              return (
                <View key={entry.id} style={styles.podiumCol}>
                  {isFirst ? <Crown size={22} color="#FDE047" fill="#FDE047" /> : null}
                  <View style={[styles.podiumAvatarWrap, { borderColor: ringColor }]}>
                    <Image
                      source={GeneratedAssets[entry.avatarKey]}
                      style={isFirst ? styles.podiumAvatarLg : styles.podiumAvatarSm}
                    />
                  </View>
                  <Text style={styles.podiumName} numberOfLines={1}>
                    {entry.isCurrentUser ? 'You' : entry.name.split(' ')[0]}
                  </Text>
                  <Text style={styles.podiumXp}>{entry.weeklyXp} XP</Text>

                  <View
                    style={[
                      styles.pillar,
                      {
                        height: pillarHeight,
                        backgroundColor: pillarColor,
                      },
                    ]}
                  >
                    <Text style={styles.pillarNum}>{rank}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </StaggeredEntrance>

      {/* Weekly Standings */}
      <SectionHeader title="Weekly Standings" subtitle="Earn XP in any city to climb" />

      <View style={styles.listStack}>
        {leaderboard.map((entry, idx) => {
          const rank = idx + 1;
          const levelColor = RegionPalette[entry.level].primary;
          const showCutoff = idx === 3;

          return (
            <React.Fragment key={entry.id}>
              {showCutoff ? (
                <View style={styles.cutoffRow}>
                  <View style={[styles.cutoffLine, { backgroundColor: colors.success }]} />
                  <View style={[styles.cutoffPill, { backgroundColor: colors.successMuted }]}>
                    <ArrowUpRight size={13} color={colors.success} />
                    <Text style={[styles.cutoffText, { color: colors.success }]}>
                      Promotion Zone
                    </Text>
                  </View>
                  <View style={[styles.cutoffLine, { backgroundColor: colors.success }]} />
                </View>
              ) : null}

              <Card
                variant="elevated"
                style={[
                  styles.rankRowCard,
                  entry.isCurrentUser && {
                    borderColor: colors.accent,
                    borderWidth: 2,
                    backgroundColor: colors.accentMuted,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.rankNum,
                    { color: rank <= 3 ? colors.coin : colors.textSecondary },
                  ]}
                >
                  {rank}
                </Text>
                <Image
                  source={GeneratedAssets[entry.avatarKey]}
                  style={styles.listAvatar}
                />
                <View style={styles.listInfo}>
                  <View style={styles.nameLine}>
                    <Text
                      style={[typography.headline, { color: colors.textPrimary }]}
                      numberOfLines={1}
                    >
                      {entry.name}
                    </Text>
                    {entry.isCurrentUser ? <Badge label="You" tone="accent" /> : null}
                  </View>
                  <View style={styles.subLine}>
                    <Text style={[typography.caption, { color: levelColor }]}>
                      Level {entry.level}
                    </Text>
                    <Text style={[typography.caption, { color: colors.textTertiary }]}>·</Text>
                    <Flame size={12} color={colors.streak} />
                    <Text style={[typography.caption, { color: colors.textSecondary }]}>
                      {entry.streak}d
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.xpBadge,
                    { backgroundColor: colors.surface, borderRadius: radii.pill },
                  ]}
                >
                  <Zap size={12} color={colors.xp} />
                  <Text style={[styles.xpText, { color: colors.xp }]}>{entry.weeklyXp}</Text>
                </View>
              </Card>
            </React.Fragment>
          );
        })}
      </View>

      {/* Achievements Shelf */}
      <SectionHeader
        title="Trophy Badges"
        subtitle={`${player.achievements.filter((a) => a.unlocked).length}/${player.achievements.length} unlocked`}
      />

      <View style={styles.listStack}>
        {player.achievements.map((ach) => (
          <Card key={ach.id} style={styles.achCard}>
            <View style={styles.achTop}>
              <View
                style={[
                  styles.achIconBox,
                  {
                    backgroundColor: ach.unlocked ? colors.coinMuted : colors.surfaceMuted,
                    borderRadius: radii.md,
                  },
                ]}
              >
                <AchievementIcon
                  name={ach.iconName}
                  color={ach.unlocked ? colors.coin : colors.textTertiary}
                />
              </View>
              <View style={styles.achInfo}>
                <View style={styles.achTitleRow}>
                  <Text style={[typography.headline, { color: colors.textPrimary, flex: 1 }]}>
                    {ach.title}
                  </Text>
                  <View style={[styles.gemPill, { backgroundColor: colors.gemMuted }]}>
                    <Gem size={12} color={colors.gem} />
                    <Text style={[styles.gemText, { color: colors.gem }]}>
                      +{ach.rewardGems}
                    </Text>
                  </View>
                </View>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                  {ach.description}
                </Text>
              </View>
            </View>
            <ProgressBar
              progress={ach.progress / ach.target}
              color={ach.unlocked ? colors.coin : colors.accent}
              height={8}
            />
          </Card>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerBlock: {
    gap: 4,
  },
  stadiumCard: {
    backgroundColor: '#111827',
    paddingTop: 16,
    paddingHorizontal: 14,
    overflow: 'hidden',
    gap: 14,
  },
  stadiumKpiRow: {
    flexDirection: 'row',
    gap: 10,
  },
  kpiPill: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 2,
  },
  kpiValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  kpiLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    fontWeight: '700',
  },
  totalScoreCenter: {
    alignItems: 'center',
    gap: 6,
  },
  trophyScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stadiumTrophyImg: {
    width: 58,
    height: 58,
  },
  trophyScoreTextCol: {
    alignItems: 'flex-start',
    gap: 5,
  },
  totalScoreNumber: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
  },
  divisionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  divisionChipText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
  },
  podiumRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 8,
    paddingTop: 4,
  },
  podiumCol: {
    flex: 1,
    alignItems: 'center',
    gap: 5,
  },
  podiumAvatarWrap: {
    borderWidth: 3,
    borderRadius: 999,
    padding: 2,
  },
  podiumAvatarLg: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  podiumAvatarSm: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  podiumName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  podiumXp: {
    color: '#9CA3AF',
    fontSize: 11.5,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    marginBottom: 4,
  },
  pillar: {
    width: '100%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillarNum: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 32,
    fontWeight: '900',
  },
  listStack: {
    gap: 10,
  },
  cutoffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  cutoffLine: {
    flex: 1,
    height: 1.5,
    opacity: 0.4,
  },
  cutoffPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  cutoffText: {
    fontSize: 11,
    fontWeight: '800',
  },
  rankRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 12,
  },
  rankNum: {
    width: 22,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  listAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  listInfo: {
    flex: 1,
    gap: 2,
  },
  nameLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  subLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  xpText: {
    fontSize: 13,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  achCard: {
    gap: 12,
  },
  achTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  achIconBox: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achInfo: {
    flex: 1,
    gap: 3,
  },
  achTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gemPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  gemText: {
    fontSize: 12,
    fontWeight: '800',
  },
});
