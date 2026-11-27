import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Crown, Flame, Trophy } from 'lucide-react-native';
import { Coin3D, GameHud, XpBolt3D } from '@/components/game';
import { LEO_ART, LeoMascot } from '@/components/mascot/LeoMascot';
import {
  AnimatedCounter,
  Badge,
  Card,
  Chip,
  Screen,
  SectionHeader,
  SegmentedControl,
  StaggeredEntrance,
} from '@/components/ui';
import { GeneratedAssets } from '@/constants/GeneratedAssets';
import { useAppTheme } from '@/constants/Theme';
import { api } from '@/lib/api';
import type { LeaderboardScope } from '@/lib/api/types';
import { useKidsApp } from '@/providers/KidsAppProvider';

interface DisplayRow {
  id: string;
  name: string;
  avatarUrl?: string | null;
  score: number;
  unitLabel: string;
  streak: number;
  me: boolean;
  rank: number;
}

const SCOPES: Array<{ key: LeaderboardScope; label: string }> = [
  { key: 'center', label: 'Center' },
  { key: 'branch', label: 'Branch' },
  { key: 'level', label: 'Level' },
  { key: 'group', label: 'Group' },
];

export default function KidsLeaderboardScreen() {
  const router = useRouter();
  const { colors, typography, radii } = useAppTheme();
  const {
    league,
    leaderboard,
    leaderboardScope,
    gamification,
    studentId,
    loadLeaderboardScope,
  } = useKidsApp();
  const [boardMode, setBoardMode] = useState<'league' | 'coins'>('league');

  const leagueRows: DisplayRow[] = (league?.members ?? []).map((m) => ({
    id: m.studentId,
    name: m.name,
    avatarUrl: m.avatarUrl,
    score: m.xp,
    unitLabel: 'XP',
    streak: 0,
    me: m.me,
    rank: m.rank,
  }));

  const coinRows: DisplayRow[] = leaderboard.map((entry, idx) => {
    const first = entry.student?.contact?.firstName ?? 'Student';
    const last = entry.student?.contact?.lastName ?? '';
    return {
      id: entry.studentId,
      name: `${first} ${last}`.trim(),
      avatarUrl: entry.student?.contact?.avatarUrl,
      score: entry.cachedCoinBalance,
      unitLabel: 'Coins',
      streak: entry.student?.streak?.currentStreak ?? 0,
      me: entry.studentId === studentId,
      rank: idx + 1,
    };
  });

  const rows = boardMode === 'league' ? leagueRows : coinRows;
  const topThree = rows.slice(0, 3);
  const podiumOrder = [topThree[1], topThree[0], topThree[2]].filter(Boolean);
  const myRow = rows.find((r) => r.me);
  const tierName = league?.tiers?.[league.tier] ?? 'League';
  const totalXp = gamification?.wallet?.cachedXp ?? 0;
  const totalCoins = gamification?.wallet?.cachedCoinBalance ?? 0;

  return (
    <Screen hasTabBar>
      <GameHud onAvatarPress={() => router.push('/(tabs)/profile')} />

      <View style={styles.headerBlock}>
        <Text style={[typography.display, { color: colors.textPrimary }]}>
          Impulse League
        </Text>
        <Text style={[typography.body, { color: colors.textSecondary }]}>
          {league?.promote
            ? `Top ${league.promote} students climb to the next league each week!`
            : 'Complete lessons with Leo to earn XP and Coins!'}
        </Text>
      </View>

      <SegmentedControl
        value={boardMode}
        onChange={setBoardMode}
        options={[
          { label: 'Weekly League', value: 'league' },
          { label: 'Coin Leaders', value: 'coins' },
        ]}
      />

      {boardMode === 'coins' ? (
        <View style={styles.scopeRow}>
          {SCOPES.map((s) => (
            <Chip
              key={s.key}
              label={s.label}
              selected={leaderboardScope === s.key}
              onPress={() => void loadLeaderboardScope(s.key)}
            />
          ))}
        </View>
      ) : null}

      {/* Deep Midnight 3D Stepped Podium Stadium */}
      <StaggeredEntrance index={0}>
        <View style={[styles.stadiumCard, { borderRadius: radii.xl }]}>
          <View style={styles.stadiumKpiRow}>
            <View style={[styles.kpiPill, { backgroundColor: '#7C3AED' }]}>
              <Text style={styles.kpiValue}>
                {boardMode === 'league' ? `${myRow?.score ?? 0} XP` : `${totalCoins} Coins`}
              </Text>
              <Text style={styles.kpiLabel}>
                {boardMode === 'league' ? 'Your Weekly XP' : 'Your Coins'}
              </Text>
            </View>
            <View style={[styles.kpiPill, { backgroundColor: '#F59E0B' }]}>
              <Text style={styles.kpiValue}>#{myRow?.rank ?? '-'}</Text>
              <Text style={styles.kpiLabel}>{tierName}</Text>
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
                  value={boardMode === 'league' ? totalXp : totalCoins}
                  suffix={boardMode === 'league' ? ' XP' : ' Coins'}
                  style={styles.totalScoreNumber}
                />
                <View style={styles.divisionChip}>
                  <Trophy size={12} color="#FFFFFF" />
                  <Text style={styles.divisionChipText}>{tierName}</Text>
                </View>
              </View>
            </View>
          </View>

          {podiumOrder.length > 0 ? (
            <View style={styles.podiumRow}>
              {podiumOrder.map((entry) => {
                const isFirst = entry.rank === 1;
                const pillarHeight = entry.rank === 1 ? 104 : entry.rank === 2 ? 76 : 62;
                const pillarColor =
                  entry.rank === 1 ? '#F59E0B' : entry.rank === 2 ? '#1055F8' : '#6366F1';
                const ringColor =
                  entry.rank === 1 ? '#FDE047' : entry.rank === 2 ? '#93C5FD' : '#C4B5FD';
                const avatarUri = api.assetUrl(entry.avatarUrl);

                return (
                  <View key={entry.id} style={styles.podiumCol}>
                    {isFirst ? <Crown size={22} color="#FDE047" fill="#FDE047" /> : null}
                    <View style={[styles.podiumAvatarWrap, { borderColor: ringColor }]}>
                      <Image
                        source={avatarUri ? { uri: avatarUri } : LEO_ART[isFirst ? 'cheer' : 'wave']}
                        style={isFirst ? styles.podiumAvatarLg : styles.podiumAvatarSm}
                      />
                    </View>
                    <Text style={styles.podiumName} numberOfLines={1}>
                      {entry.me ? 'You' : entry.name.split(' ')[0]}
                    </Text>
                    <Text style={styles.podiumXp}>
                      {entry.score} {entry.unitLabel}
                    </Text>

                    <View
                      style={[
                        styles.pillar,
                        { height: pillarHeight, backgroundColor: pillarColor },
                      ]}
                    >
                      <Text style={styles.pillarNum}>{entry.rank}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyStadium}>
              <LeoMascot pose="cheer" size={84} />
              <Text style={styles.emptyStadiumText}>
                Complete 1 lesson to enter this week’s podium!
              </Text>
            </View>
          )}
        </View>
      </StaggeredEntrance>

      <SectionHeader
        title={boardMode === 'league' ? 'Weekly Standings' : 'Coin Leaders'}
        subtitle="Live rankings from Impulse"
      />

      {rows.length > 0 ? (
        <View style={styles.list}>
          {rows.map((entry) => {
            const avatarUri = api.assetUrl(entry.avatarUrl);
            return (
              <Card
                key={entry.id}
                style={[
                  styles.rankRow,
                  entry.me
                    ? { borderColor: '#1055F8', borderWidth: 2, backgroundColor: colors.accentMuted }
                    : null,
                ]}
              >
                <Text
                  style={[
                    styles.rankIndex,
                    { color: entry.rank <= 3 ? '#F59E0B' : colors.textSecondary },
                  ]}
                >
                  {entry.rank}
                </Text>
                <View style={styles.rowAvatarBox}>
                  <Image
                    source={avatarUri ? { uri: avatarUri } : LEO_ART.idle}
                    style={styles.rowAvatar}
                  />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <View style={styles.nameRow}>
                    <Text style={[typography.headline, { color: colors.textPrimary }]} numberOfLines={1}>
                      {entry.name}
                    </Text>
                    {entry.me ? <Badge label="You" tone="accent" /> : null}
                  </View>
                  {entry.streak > 0 ? (
                    <View style={styles.subRow}>
                      <Flame size={12} color={colors.streak} fill={colors.streak} />
                      <Text style={[typography.caption, { color: colors.textSecondary }]}>
                        {entry.streak}d streak
                      </Text>
                    </View>
                  ) : null}
                </View>
                <View style={styles.scoreChip}>
                  {boardMode === 'league' ? <XpBolt3D size={16} /> : <Coin3D size={16} />}
                  <Text
                    style={[
                      styles.rowScore,
                      { color: boardMode === 'league' ? '#3B8700' : '#B45309' },
                    ]}
                  >
                    {entry.score}
                  </Text>
                </View>
              </Card>
            );
          })}
        </View>
      ) : (
        <Card style={styles.emptyCard}>
          <Text style={[typography.callout, { color: colors.textSecondary, textAlign: 'center' }]}>
            No leaderboard entries yet for this scope.
          </Text>
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerBlock: {
    gap: 4,
  },
  scopeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
    paddingVertical: 11,
    paddingHorizontal: 10,
    alignItems: 'center',
    gap: 2,
  },
  kpiValue: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  kpiLabel: {
    color: 'rgba(255,255,255,0.86)',
    fontSize: 11,
    fontWeight: '700',
  },
  totalScoreCenter: {
    alignItems: 'center',
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
    fontSize: 27,
    fontWeight: '900',
  },
  divisionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#1055F8',
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
    backgroundColor: '#1F2937',
  },
  podiumAvatarLg: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  podiumAvatarSm: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  podiumName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  podiumXp: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '700',
  },
  pillar: {
    width: '100%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillarNum: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
  },
  emptyStadium: {
    alignItems: 'center',
    gap: 8,
    paddingBottom: 18,
  },
  emptyStadiumText: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  list: {
    gap: 10,
  },
  emptyCard: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingVertical: 11,
  },
  rankIndex: {
    width: 24,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '900',
  },
  rowAvatarBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    overflow: 'hidden',
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowAvatar: {
    width: 42,
    height: 42,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scoreChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rowScore: {
    fontSize: 15,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
});
