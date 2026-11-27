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
import { Badge, Card, Screen, SectionHeader } from '@/components/ui';
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
          Compass League
        </Text>
        <Text style={[typography.body, { color: colors.textSecondary }]}>
          Top 3 explorers advance to Astral Division at the end of the week.
        </Text>
      </View>

      {/* Top 3 Illustrated Podium */}
      <Card variant="gradient" gradientColors={['#1E293B', '#312E81']} style={styles.podiumCard}>
        <View style={styles.leagueTopRow}>
          <View style={styles.leaguePill}>
            <Trophy size={14} color="#FDE047" />
            <Text style={styles.leaguePillText}>Crystal Division · 3d left</Text>
          </View>
          {myRank > 0 ? (
            <Text style={styles.myRankText}>Your Rank #{myRank}</Text>
          ) : null}
        </View>

        <View style={styles.podiumRow}>
          {podiumOrder.map((entry) => {
            const rank = leaderboard.findIndex((e) => e.id === entry.id) + 1;
            const isFirst = rank === 1;
            const ringColor =
              rank === 1 ? '#FACC15' : rank === 2 ? '#CBD5E1' : '#FB923C';

            return (
              <View
                key={entry.id}
                style={[styles.podiumCol, isFirst && styles.podiumFirst]}
              >
                {isFirst ? <Crown size={20} color="#FACC15" fill="#FACC15" /> : null}
                <View style={[styles.podiumAvatarWrap, { borderColor: ringColor }]}>
                  <Image
                    source={GeneratedAssets[entry.avatarKey]}
                    style={isFirst ? styles.podiumAvatarLg : styles.podiumAvatarSm}
                  />
                  <View style={[styles.rankPin, { backgroundColor: ringColor }]}>
                    <Text style={styles.rankPinText}>{rank}</Text>
                  </View>
                </View>
                <Text style={styles.podiumName} numberOfLines={1}>
                  {entry.isCurrentUser ? 'You' : entry.name.split(' ')[0]}
                </Text>
                <Text style={styles.podiumXp}>{entry.weeklyXp} XP</Text>
              </View>
            );
          })}
        </View>
      </Card>

      {/* Full Weekly Standings */}
      <SectionHeader title="Weekly Standings" subtitle="Live XP from expeditions & quests" />

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
                variant={entry.isCurrentUser ? 'elevated' : 'outlined'}
                style={[
                  styles.rankRowCard,
                  entry.isCurrentUser && {
                    borderColor: colors.accent,
                    borderWidth: 1.75,
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
                      CEFR {entry.level}
                    </Text>
                    <Text style={[typography.caption, { color: colors.textTertiary }]}>·</Text>
                    <Flame size={12} color={colors.streak} />
                    <Text style={[typography.caption, { color: colors.textSecondary }]}>
                      {entry.streak}d
                    </Text>
                  </View>
                </View>
                <View style={[styles.xpBadge, { backgroundColor: colors.xpMuted, borderRadius: radii.pill }]}>
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
        title="Achievements"
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
              height={7}
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
  podiumCard: {
    gap: 16,
  },
  leagueTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leaguePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  leaguePillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  myRankText: {
    color: '#FDE047',
    fontSize: 13,
    fontWeight: '800',
  },
  podiumRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingTop: 6,
  },
  podiumCol: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  podiumFirst: {
    marginBottom: 10,
  },
  podiumAvatarWrap: {
    borderWidth: 3,
    borderRadius: 999,
    padding: 2,
    position: 'relative',
  },
  podiumAvatarLg: {
    width: 68,
    height: 68,
    borderRadius: 34,
  },
  podiumAvatarSm: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  rankPin: {
    position: 'absolute',
    bottom: -6,
    alignSelf: 'center',
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankPinText: {
    color: '#0F172A',
    fontSize: 11,
    fontWeight: '900',
  },
  podiumName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  podiumXp: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
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
