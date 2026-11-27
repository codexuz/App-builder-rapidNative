import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  COLLECTIBLE_RELICS,
  EXPLORER_AVATARS,
  INITIAL_PLAYER_STATE,
} from '@/data/mockState';
import { ALL_LESSONS, WORLD_CITIES, getLessonById } from '@/data/worldData';
import { createGameRepository } from '@/services/repository';
import type { CEFRLevel, LeaderboardEntry, LessonNode, PlayerState } from '@/types/game';

export interface LessonCompletionSummary {
  xpEarned: number;
  coinsEarned: number;
  gemsEarned: number;
  accuracyPercent: number;
  firstClear: boolean;
  unlockedNextLessonTitle?: string;
}

interface GameContextValue {
  player: PlayerState;
  leaderboard: LeaderboardEntry[];
  backendMode: 'mock' | 'supabase';
  isLessonUnlocked: (lessonId: string) => boolean;
  isCityUnlocked: (cityId: string) => boolean;
  getNextRecommendedLesson: () => LessonNode;
  completeLesson: (lessonId: string, accuracyPercent: number) => LessonCompletionSummary;
  claimQuest: (questId: string) => boolean;
  selectOrBuyAvatar: (avatarId: string) => { ok: boolean; message: string };
  buyRelic: (relicId: string) => { ok: boolean; message: string };
  resetDemoProgress: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

function computeCurrentCEFR(completedIds: string[]): CEFRLevel {
  const completedSet = new Set(completedIds);
  const b2Done = WORLD_CITIES[3].lessons.some((l) => completedSet.has(l.id));
  if (b2Done) return 'B2';
  const b1Done = WORLD_CITIES[2].lessons.filter((l) => completedSet.has(l.id)).length >= 2;
  if (b1Done) return 'B2';
  const a2Done = WORLD_CITIES[1].lessons.filter((l) => completedSet.has(l.id)).length >= 2;
  if (a2Done) return 'B1';
  const a1Done = WORLD_CITIES[0].lessons.filter((l) => completedSet.has(l.id)).length >= 2;
  if (a1Done) return 'A2';
  return 'A1';
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const repository = useMemo(() => createGameRepository(), []);
  const [player, setPlayer] = useState<PlayerState>(INITIAL_PLAYER_STATE);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    let active = true;
    void (async () => {
      const loaded = await repository.loadPlayer();
      if (!active) return;
      setPlayer(loaded);
      const board = await repository.loadLeaderboard(loaded);
      if (active) setLeaderboard(board);
    })();
    return () => {
      active = false;
    };
  }, [repository]);

  const persistAndRefresh = useCallback(
    (updater: (prev: PlayerState) => PlayerState) => {
      setPlayer((prev) => {
        const next = updater(prev);
        void repository.savePlayer(next);
        void repository.loadLeaderboard(next).then(setLeaderboard);
        return next;
      });
    },
    [repository]
  );

  const isCityUnlocked = useCallback(
    (cityId: string): boolean => {
      const cityIndex = WORLD_CITIES.findIndex((c) => c.id === cityId);
      if (cityIndex <= 0) return true;
      const prevCity = WORLD_CITIES[cityIndex - 1];
      const doneInPrev = prevCity.lessons.filter((l) =>
        player.completedLessonIds.includes(l.id)
      ).length;
      return doneInPrev >= 2;
    },
    [player.completedLessonIds]
  );

  const isLessonUnlocked = useCallback(
    (lessonId: string): boolean => {
      const lesson = getLessonById(lessonId);
      if (!lesson) return false;
      if (!isCityUnlocked(lesson.cityId)) return false;
      const city = WORLD_CITIES.find((c) => c.id === lesson.cityId);
      if (!city) return false;
      const indexInCity = city.lessons.findIndex((l) => l.id === lessonId);
      if (indexInCity === 0) return true;
      const previousLesson = city.lessons[indexInCity - 1];
      return player.completedLessonIds.includes(previousLesson.id);
    },
    [isCityUnlocked, player.completedLessonIds]
  );

  const getNextRecommendedLesson = useCallback((): LessonNode => {
    const nextUnfinished = ALL_LESSONS.find(
      (lesson) =>
        isLessonUnlocked(lesson.id) && !player.completedLessonIds.includes(lesson.id)
    );
    return nextUnfinished ?? ALL_LESSONS[0];
  }, [isLessonUnlocked, player.completedLessonIds]);

  const completeLesson = useCallback(
    (lessonId: string, accuracyPercent: number): LessonCompletionSummary => {
      const lesson = getLessonById(lessonId);
      if (!lesson) {
        return {
          xpEarned: 0,
          coinsEarned: 0,
          gemsEarned: 0,
          accuracyPercent,
          firstClear: false,
        };
      }

      const firstClear = !player.completedLessonIds.includes(lessonId);
      const accuracyMultiplier = accuracyPercent >= 90 ? 1.2 : accuracyPercent >= 70 ? 1.0 : 0.75;
      const xpEarned = Math.round(lesson.xpReward * (firstClear ? accuracyMultiplier : 0.45));
      const coinsEarned = Math.round(lesson.coinReward * (firstClear ? 1 : 0.4));
      const gemsEarned = firstClear ? lesson.gemReward : 1;

      const globalIndex = ALL_LESSONS.findIndex((l) => l.id === lessonId);
      const nextLesson = ALL_LESSONS[globalIndex + 1];

      persistAndRefresh((prev) => {
        const completedLessonIds = prev.completedLessonIds.includes(lessonId)
          ? prev.completedLessonIds
          : [...prev.completedLessonIds, lessonId];

        const bump = (v: number, delta: number) => Math.min(100, v + delta);
        const skillMastery = {
          vocabulary: bump(prev.skillMastery.vocabulary, firstClear ? 4 : 1),
          grammar: bump(prev.skillMastery.grammar, firstClear ? 4 : 1),
          listening: bump(prev.skillMastery.listening, firstClear ? 5 : 1),
          reading: bump(prev.skillMastery.reading, firstClear ? 3 : 1),
          speaking: bump(prev.skillMastery.speaking, firstClear ? 6 : 2),
        };

        const dailyQuests = prev.dailyQuests.map((q) => {
          if (q.claimed) return q;
          if (q.kind === 'lessons') {
            return { ...q, progress: Math.min(q.target, q.progress + 1) };
          }
          if (q.kind === 'xp') {
            return { ...q, progress: Math.min(q.target, q.progress + xpEarned) };
          }
          if (q.kind === 'speaking') {
            return { ...q, progress: Math.min(q.target, q.progress + 1) };
          }
          return q;
        });

        const weekActivity = [...prev.weekActivity];
        const wasTodayActive = weekActivity[6];
        weekActivity[6] = true;
        const streakDays = wasTodayActive ? prev.streakDays : prev.streakDays + 1;

        const achievements = prev.achievements.map((ach) => {
          if (ach.id === 'ach-week-flame') {
            const progress = Math.min(ach.target, streakDays);
            return { ...ach, progress, unlocked: progress >= ach.target };
          }
          if (ach.id === 'ach-city-hopper') {
            const progress = Math.min(ach.target, completedLessonIds.length);
            return { ...ach, progress, unlocked: progress >= ach.target };
          }
          if (ach.id === 'ach-voice-pro') {
            const progress = Math.min(ach.target, skillMastery.speaking);
            return { ...ach, progress, unlocked: progress >= ach.target };
          }
          return ach;
        });

        return {
          ...prev,
          xp: prev.xp + xpEarned,
          weeklyXp: prev.weeklyXp + xpEarned,
          coins: prev.coins + coinsEarned,
          gems: prev.gems + gemsEarned,
          streakDays,
          weekActivity,
          currentLevel: computeCurrentCEFR(completedLessonIds),
          completedLessonIds,
          lessonScores: {
            ...prev.lessonScores,
            [lessonId]: Math.max(prev.lessonScores[lessonId] ?? 0, accuracyPercent),
          },
          skillMastery,
          dailyQuests,
          achievements,
        };
      });

      return {
        xpEarned,
        coinsEarned,
        gemsEarned,
        accuracyPercent,
        firstClear,
        unlockedNextLessonTitle: firstClear ? nextLesson?.title : undefined,
      };
    },
    [persistAndRefresh, player.completedLessonIds]
  );

  const claimQuest = useCallback(
    (questId: string): boolean => {
      const quest = player.dailyQuests.find((q) => q.id === questId);
      if (!quest || quest.claimed || quest.progress < quest.target) return false;

      persistAndRefresh((prev) => ({
        ...prev,
        coins: prev.coins + quest.coinReward,
        gems: prev.gems + quest.gemReward,
        xp: prev.xp + quest.xpReward,
        weeklyXp: prev.weeklyXp + quest.xpReward,
        dailyQuests: prev.dailyQuests.map((q) =>
          q.id === questId ? { ...q, claimed: true } : q
        ),
      }));
      return true;
    },
    [persistAndRefresh, player.dailyQuests]
  );

  const selectOrBuyAvatar = useCallback(
    (avatarId: string): { ok: boolean; message: string } => {
      const avatar = EXPLORER_AVATARS.find((a) => a.id === avatarId);
      if (!avatar) return { ok: false, message: 'Avatar not found.' };

      if (player.unlockedAvatarIds.includes(avatarId)) {
        persistAndRefresh((prev) => ({
          ...prev,
          activeAvatarId: avatarId,
          explorerTitle: avatar.title,
        }));
        return { ok: true, message: `${avatar.name} is now your active explorer.` };
      }

      if (player.coins < avatar.costCoins || player.gems < avatar.costGems) {
        return { ok: false, message: 'Earn more coins or gems to recruit this explorer.' };
      }

      persistAndRefresh((prev) => ({
        ...prev,
        coins: prev.coins - avatar.costCoins,
        gems: prev.gems - avatar.costGems,
        activeAvatarId: avatarId,
        explorerTitle: avatar.title,
        unlockedAvatarIds: [...prev.unlockedAvatarIds, avatarId],
      }));
      return { ok: true, message: `Unlocked ${avatar.name}!` };
    },
    [persistAndRefresh, player.coins, player.gems, player.unlockedAvatarIds]
  );

  const buyRelic = useCallback(
    (relicId: string): { ok: boolean; message: string } => {
      const relic = COLLECTIBLE_RELICS.find((r) => r.id === relicId);
      if (!relic) return { ok: false, message: 'Relic not found.' };
      if (player.ownedRelicIds.includes(relicId)) {
        return { ok: false, message: 'Already in your Relic Vault.' };
      }
      if (player.coins < relic.costCoins || player.gems < relic.costGems) {
        return { ok: false, message: 'Not enough coins or gems yet.' };
      }

      persistAndRefresh((prev) => {
        const ownedRelicIds = [...prev.ownedRelicIds, relicId];
        const achievements = prev.achievements.map((ach) =>
          ach.id === 'ach-relic-collector'
            ? {
                ...ach,
                progress: Math.min(ach.target, ownedRelicIds.length),
                unlocked: ownedRelicIds.length >= ach.target,
              }
            : ach
        );
        return {
          ...prev,
          coins: prev.coins - relic.costCoins,
          gems: prev.gems - relic.costGems,
          ownedRelicIds,
          achievements,
        };
      });
      return { ok: true, message: `Collected ${relic.name}!` };
    },
    [persistAndRefresh, player.coins, player.gems, player.ownedRelicIds]
  );

  const resetDemoProgress = useCallback(() => {
    persistAndRefresh(() => INITIAL_PLAYER_STATE);
  }, [persistAndRefresh]);

  const value = useMemo<GameContextValue>(
    () => ({
      player,
      leaderboard,
      backendMode: repository.mode,
      isLessonUnlocked,
      isCityUnlocked,
      getNextRecommendedLesson,
      completeLesson,
      claimQuest,
      selectOrBuyAvatar,
      buyRelic,
      resetDemoProgress,
    }),
    [
      player,
      leaderboard,
      repository.mode,
      isLessonUnlocked,
      isCityUnlocked,
      getNextRecommendedLesson,
      completeLesson,
      claimQuest,
      selectOrBuyAvatar,
      buyRelic,
      resetDemoProgress,
    ]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside GameProvider');
  return ctx;
}
