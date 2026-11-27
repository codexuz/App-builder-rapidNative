import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { Coins, Crown, Flame, Trophy, Zap } from 'lucide-react-native';
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from '@/components/gluestack/avatar';
import { Badge, BadgeText } from '@/components/gluestack/badge';
import { Box } from '@/components/gluestack/box';
import { Button, ButtonText } from '@/components/gluestack/button';
import { Card } from '@/components/gluestack/card';
import { Divider } from '@/components/gluestack/divider';
import { Heading } from '@/components/gluestack/heading';
import { HStack } from '@/components/gluestack/hstack';
import { Tabs, TabsList, TabsTrigger, TabsTriggerText } from '@/components/gluestack/tabs';
import { Text } from '@/components/gluestack/text';
import { VStack } from '@/components/gluestack/vstack';
import { GameHud } from '@/components/game';
import { LEO_ART, LeoMascot } from '@/components/mascot/LeoMascot';
import { Screen } from '@/components/ui';
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

      {/* Gluestack Tabs Switcher */}
      <Tabs
        value={boardMode}
        onValueChange={(v: string) => setBoardMode(v === 'coins' ? 'coins' : 'league')}
      >
        <TabsList className="w-full bg-slate-200/75 p-1 rounded-xl">
          <TabsTrigger
            value="league"
            className={`flex-1 rounded-lg py-2 items-center justify-center ${
              boardMode === 'league' ? 'bg-card shadow-xs' : 'bg-transparent'
            }`}
          >
            <TabsTriggerText
              className={`text-sm font-bold ${
                boardMode === 'league' ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              Weekly League
            </TabsTriggerText>
          </TabsTrigger>
          <TabsTrigger
            value="coins"
            className={`flex-1 rounded-lg py-2 items-center justify-center ${
              boardMode === 'coins' ? 'bg-card shadow-xs' : 'bg-transparent'
            }`}
          >
            <TabsTriggerText
              className={`text-sm font-bold ${
                boardMode === 'coins' ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              Coin Leaders
            </TabsTriggerText>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {boardMode === 'coins' ? (
        <HStack space="xs">
          {SCOPES.map((s) => {
            const active = leaderboardScope === s.key;
            return (
              <Button
                key={s.key}
                size="sm"
                variant={active ? 'default' : 'outline'}
                className={`rounded-full px-3.5 h-8 ${
                  active ? '' : 'bg-card border-border'
                }`}
                onPress={() => void loadLeaderboardScope(s.key)}
              >
                <ButtonText
                  className={`text-xs font-bold ${
                    active ? 'text-white' : 'text-muted-foreground'
                  }`}
                >
                  {s.label}
                </ButtonText>
              </Button>
            );
          })}
        </HStack>
      ) : null}

      {/* Podium Stage Card */}
      <Card className="bg-slate-900 border-0 rounded-3xl pt-4 px-4 pb-0 overflow-hidden">
        <VStack space="md">
          <HStack className="items-center justify-between" space="sm">
            <Badge className="rounded-full bg-white/10 border-0 px-3 py-1 gap-1.5">
              <Trophy size={13} color="#FDE047" />
              <BadgeText className="text-white font-bold normal-case">
                {boardMode === 'league' ? `${tierName} League` : 'Top Coin Earners'}
              </BadgeText>
            </Badge>
            <Text size="xs" bold className="text-slate-300">
              {myRow
                ? `#${myRow.rank}  ·  ${myRow.score} ${myRow.unitLabel}`
                : boardMode === 'coins'
                  ? `${totalCoins} Coins`
                  : 'Unranked'}
            </Text>
          </HStack>

          {podiumOrder.length > 0 ? (
            <HStack className="items-end pt-1" space="sm">
              {podiumOrder.map((entry) => {
                const isFirst = entry.rank === 1;
                const pillarHeight = entry.rank === 1 ? 82 : entry.rank === 2 ? 60 : 46;
                const pillarBg =
                  entry.rank === 1 ? '#F59E0B' : entry.rank === 2 ? '#2563EB' : '#334155';
                const ringClass =
                  entry.rank === 1
                    ? 'border-amber-300'
                    : entry.rank === 2
                      ? 'border-blue-300'
                      : 'border-slate-500';
                const avatarUri = api.assetUrl(entry.avatarUrl);

                return (
                  <VStack key={entry.id} className="flex-1 items-center" space="xs">
                    <Box className="h-5 justify-center">
                      {isFirst ? <Crown size={18} color="#FDE047" fill="#FDE047" /> : null}
                    </Box>
                    <Avatar
                      className={`${
                        isFirst ? 'h-14 w-14' : 'h-12 w-12'
                      } border-2 ${ringClass} bg-slate-800`}
                    >
                      {avatarUri ? (
                        <AvatarFallbackText className="text-white font-bold">
                          {entry.name}
                        </AvatarFallbackText>
                      ) : null}
                      <AvatarImage
                        source={
                          avatarUri
                            ? { uri: avatarUri }
                            : LEO_ART[isFirst ? 'cheer' : 'wave']
                        }
                        alt={entry.name}
                      />
                    </Avatar>
                    <Text size="xs" bold className="text-white" numberOfLines={1}>
                      {entry.me ? 'You' : entry.name.split(' ')[0]}
                    </Text>
                    <Text size="2xs" bold className="text-slate-400 mb-1">
                      {entry.score} {entry.unitLabel}
                    </Text>
                    <Box
                      className="w-full rounded-t-2xl items-center justify-center"
                      style={{ height: pillarHeight, backgroundColor: pillarBg }}
                    >
                      <Text size="xl" bold className="text-white">
                        {entry.rank}
                      </Text>
                    </Box>
                  </VStack>
                );
              })}
            </HStack>
          ) : (
            <VStack space="sm" className="items-center pb-5">
              <LeoMascot pose="cheer" size={76} />
              <Text size="xs" className="text-slate-300 text-center">
                Finish one lesson to join this week’s podium!
              </Text>
            </VStack>
          )}
        </VStack>
      </Card>

      {/* Standings List Card */}
      <VStack space="sm">
        <HStack className="items-center justify-between">
          <Heading size="md" className="text-foreground">
            Standings
          </Heading>
          {boardMode === 'league' && league?.promote ? (
            <Badge variant="secondary" className="rounded-full px-2.5">
              <BadgeText className="text-muted-foreground normal-case font-semibold">
                Top {league.promote} promote
              </BadgeText>
            </Badge>
          ) : null}
        </HStack>

        {rows.length > 0 ? (
          <Card className="bg-card border border-border rounded-2xl p-0 overflow-hidden">
            {rows.map((entry, idx) => {
              const avatarUri = api.assetUrl(entry.avatarUrl);
              return (
                <Box key={entry.id}>
                  {idx > 0 ? <Divider className="bg-border" /> : null}
                  <HStack
                    className={`items-center px-3.5 py-3 ${
                      entry.me ? 'bg-accent/70' : ''
                    }`}
                    space="sm"
                  >
                    <Text
                      size="sm"
                      bold
                      className={`w-6 text-center ${
                        entry.rank <= 3 ? 'text-amber-600' : 'text-muted-foreground'
                      }`}
                    >
                      {entry.rank}
                    </Text>

                    <Avatar className="h-9 w-9 bg-secondary">
                      {avatarUri ? (
                        <AvatarFallbackText className="text-foreground font-bold text-xs">
                          {entry.name}
                        </AvatarFallbackText>
                      ) : null}
                      <AvatarImage
                        source={avatarUri ? { uri: avatarUri } : LEO_ART.idle}
                        alt={entry.name}
                      />
                    </Avatar>

                    <VStack className="flex-1 min-w-0">
                      <HStack className="items-center" space="xs">
                        <Text
                          size="sm"
                          bold
                          className={`flex-shrink ${
                            entry.me ? 'text-primary' : 'text-foreground'
                          }`}
                          numberOfLines={1}
                        >
                          {entry.name}
                        </Text>
                        {entry.me ? (
                          <Badge className="rounded-full bg-primary/15 border-0 px-2 py-0.5">
                            <BadgeText className="text-primary text-[10px] font-bold normal-case">
                              You
                            </BadgeText>
                          </Badge>
                        ) : null}
                      </HStack>
                      {entry.streak > 0 ? (
                        <HStack className="items-center" space="xs">
                          <Flame size={11} color="#EA580C" fill="#EA580C" />
                          <Text size="2xs" className="text-muted-foreground">
                            {entry.streak}d streak
                          </Text>
                        </HStack>
                      ) : null}
                    </VStack>

                    <HStack className="items-center" space="xs">
                      {boardMode === 'league' ? (
                        <Zap size={14} color="#1055F8" fill="#1055F8" />
                      ) : (
                        <Coins size={14} color="#D97706" />
                      )}
                      <Text size="sm" bold className="text-foreground">
                        {entry.score}
                      </Text>
                    </HStack>
                  </HStack>
                </Box>
              );
            })}
          </Card>
        ) : (
          <Card className="bg-card border border-border rounded-2xl p-5 items-center">
            <Text size="xs" className="text-muted-foreground">
              No leaderboard entries yet.
            </Text>
          </Card>
        )}
      </VStack>
    </Screen>
  );
}
