import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Coins, Crown, Flame, Trophy, Zap } from 'lucide-react-native';
import { GameHud } from '@/components/game';
import { LEO_ART, LeoMascot } from '@/components/mascot/LeoMascot';
import { Screen } from '@/components/ui';
import { DS } from '@/constants/DesignSystem';
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
  const {
    league,
    leaderboard,
    leaderboardScope,
    gamification,
    studentId,
    loading,
    refreshAll,
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
  const totalCoins = gamification?.wallet?.cachedCoinBalance ?? 0;

  return (
    <Screen hasTabBar refreshing={loading} onRefresh={() => void refreshAll()}>
      <GameHud onAvatarPress={() => router.push('/(tabs)/profile')} />

      {/* Clean Mode Switcher */}
      <View style={styles.segmentTrack}>
        <Pressable
          onPress={() => setBoardMode('league')}
          style={[styles.segmentBtn, boardMode === 'league' ? styles.segmentActive : null]}
        >
          <Text
            style={[
              styles.segmentLabel,
              boardMode === 'league' ? styles.segmentLabelActive : null,
            ]}
          >
            Weekly League
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setBoardMode('coins')}
          style={[styles.segmentBtn, boardMode === 'coins' ? styles.segmentActive : null]}
        >
          <Text
            style={[
              styles.segmentLabel,
              boardMode === 'coins' ? styles.segmentLabelActive : null,
            ]}
          >
            Coin Leaders
          </Text>
        </Pressable>
      </View>

      {boardMode === 'coins' ? (
        <View style={styles.scopeRow}>
          {SCOPES.map((s) => {
            const active = leaderboardScope === s.key;
            return (
              <Pressable
                key={s.key}
                onPress={() => void loadLeaderboardScope(s.key)}
                style={[styles.scopePill, active ? styles.scopePillActive : null]}
              >
                <Text style={[styles.scopeText, active ? styles.scopeTextActive : null]}>
                  {s.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      {/* Refined Midnight Podium Stage (calm hierarchy, no garish neon blocks) */}
      <View style={styles.podiumCard}>
        <View style={styles.podiumHeader}>
          <View style={styles.divisionPill}>
            <Trophy size={13} color="#FDE047" />
            <Text style={styles.divisionText}>
              {boardMode === 'league' ? `${tierName} League` : 'Top Coin Earners'}
            </Text>
          </View>
          <Text style={styles.rankSummary}>
            {myRow
              ? `#${myRow.rank}  ·  ${myRow.score} ${myRow.unitLabel}`
              : boardMode === 'coins'
                ? `${totalCoins} Coins`
                : 'Unranked'}
          </Text>
        </View>

        {podiumOrder.length > 0 ? (
          <View style={styles.podiumRow}>
            {podiumOrder.map((entry) => {
              const isFirst = entry.rank === 1;
              const pillarHeight = entry.rank === 1 ? 84 : entry.rank === 2 ? 62 : 48;
              const pillarBg =
                entry.rank === 1 ? '#F59E0B' : entry.rank === 2 ? '#2563EB' : '#334155';
              const ringColor =
                entry.rank === 1 ? '#FDE047' : entry.rank === 2 ? '#93C5FD' : '#64748B';
              const avatarUri = api.assetUrl(entry.avatarUrl);

              return (
                <View key={entry.id} style={styles.podiumCol}>
                  <View style={styles.crownSlot}>
                    {isFirst ? <Crown size={18} color="#FDE047" fill="#FDE047" /> : null}
                  </View>
                  <View style={[styles.podiumAvatarRing, { borderColor: ringColor }]}>
                    <Image
                      source={avatarUri ? { uri: avatarUri } : LEO_ART[isFirst ? 'cheer' : 'wave']}
                      style={isFirst ? styles.avatarLg : styles.avatarSm}
                    />
                  </View>
                  <Text style={styles.podiumName} numberOfLines={1}>
                    {entry.me ? 'You' : entry.name.split(' ')[0]}
                  </Text>
                  <Text style={styles.podiumScore}>
                    {entry.score} {entry.unitLabel}
                  </Text>
                  <View style={[styles.pillar, { height: pillarHeight, backgroundColor: pillarBg }]}>
                    <Text style={styles.pillarNum}>{entry.rank}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyPodium}>
            <LeoMascot pose="cheer" size={76} />
            <Text style={styles.emptyPodiumText}>
              Finish one lesson to join this week’s podium!
            </Text>
          </View>
        )}
      </View>

      {/* Unified Standings Card */}
      <View style={styles.section}>
        <View style={styles.sectionHead}>
          <Text style={DS.type.sectionTitle}>Standings</Text>
          {boardMode === 'league' && league?.promote ? (
            <Text style={DS.type.caption}>Top {league.promote} promote</Text>
          ) : null}
        </View>

        {rows.length > 0 ? (
          <View style={[DS.card, styles.listCard]}>
            {rows.map((entry, idx) => {
              const avatarUri = api.assetUrl(entry.avatarUrl);
              return (
                <View
                  key={entry.id}
                  style={[
                    styles.standingRow,
                    idx > 0 ? styles.rowDivider : null,
                    entry.me ? styles.myRowHighlight : null,
                  ]}
                >
                  <Text
                    style={[
                      styles.rankNum,
                      entry.rank <= 3 ? { color: DS.colors.amberDeep } : null,
                    ]}
                  >
                    {entry.rank}
                  </Text>

                  <View style={styles.rowAvatar}>
                    <Image
                      source={avatarUri ? { uri: avatarUri } : LEO_ART.idle}
                      style={styles.rowAvatarImg}
                    />
                  </View>

                  <View style={{ flex: 1, minWidth: 0, gap: 1 }}>
                    <Text
                      style={[
                        DS.type.cardTitle,
                        entry.me ? { color: DS.colors.brand } : null,
                      ]}
                      numberOfLines={1}
                    >
                      {entry.name}
                      {entry.me ? ' (You)' : ''}
                    </Text>
                    {entry.streak > 0 ? (
                      <View style={styles.streakInline}>
                        <Flame size={12} color={DS.colors.orange} fill={DS.colors.orange} />
                        <Text style={DS.type.caption}>{entry.streak}d streak</Text>
                      </View>
                    ) : null}
                  </View>

                  <View style={styles.scoreRight}>
                    {boardMode === 'league' ? (
                      <Zap size={14} color={DS.colors.brand} fill={DS.colors.brand} />
                    ) : (
                      <Coins size={14} color={DS.colors.amberDeep} />
                    )}
                    <Text style={styles.scoreVal}>{entry.score}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={[DS.card, styles.emptyCard]}>
            <Text style={DS.type.caption}>No leaderboard entries yet.</Text>
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  segmentTrack: {
    flexDirection: 'row',
    backgroundColor: '#E8EEF8',
    padding: 4,
    borderRadius: 12,
    gap: 4,
  },
  segmentBtn: {
    flex: 1,
    height: 36,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActive: {
    backgroundColor: DS.colors.surface,
    borderWidth: 1,
    borderColor: DS.colors.border,
  },
  segmentLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: DS.colors.inkMuted,
  },
  segmentLabelActive: {
    color: DS.colors.ink,
  },
  scopeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  scopePill: {
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: DS.colors.surface,
    borderWidth: 1,
    borderColor: DS.colors.border,
  },
  scopePillActive: {
    backgroundColor: DS.colors.brandSoft,
    borderColor: DS.colors.brandBorder,
  },
  scopeText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: DS.colors.inkSecondary,
  },
  scopeTextActive: {
    color: DS.colors.brand,
  },
  podiumCard: {
    backgroundColor: DS.colors.navy,
    borderRadius: 22,
    paddingTop: 16,
    paddingHorizontal: 16,
    overflow: 'hidden',
    gap: 14,
  },
  podiumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  divisionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 999,
  },
  divisionText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  rankSummary: {
    color: '#CBD5E1',
    fontSize: 12.5,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  podiumRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingTop: 4,
  },
  podiumCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  crownSlot: {
    height: 20,
    justifyContent: 'center',
  },
  podiumAvatarRing: {
    borderWidth: 2.5,
    borderRadius: 999,
    padding: 2,
    backgroundColor: DS.colors.navyCard,
  },
  avatarLg: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  avatarSm: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  podiumName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  podiumScore: {
    color: '#94A3B8',
    fontSize: 11.5,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    marginBottom: 4,
  },
  pillar: {
    width: '100%',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillarNum: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  emptyPodium: {
    alignItems: 'center',
    gap: 8,
    paddingBottom: 18,
  },
  emptyPodiumText: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  section: {
    gap: 10,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listCard: {
    overflow: 'hidden',
  },
  standingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  rowDivider: {
    borderTopWidth: 1,
    borderTopColor: DS.colors.border,
  },
  myRowHighlight: {
    backgroundColor: DS.colors.brandSoft,
  },
  rankNum: {
    width: 22,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '800',
    color: DS.colors.inkMuted,
    fontVariant: ['tabular-nums'],
  },
  rowAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: DS.colors.surfaceSubtle,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowAvatarImg: {
    width: 38,
    height: 38,
  },
  streakInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  scoreRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scoreVal: {
    fontSize: 14.5,
    fontWeight: '800',
    color: DS.colors.ink,
    fontVariant: ['tabular-nums'],
  },
  emptyCard: {
    padding: 20,
    alignItems: 'center',
  },
});
