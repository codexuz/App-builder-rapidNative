import { INITIAL_PLAYER_STATE, MOCK_LEADERBOARD } from '@/data/mockState';
import { isSupabaseConfigured, supabaseRest } from '@/services/supabase';
import type { LeaderboardEntry, PlayerState } from '@/types/game';

export interface GameRepository {
  readonly mode: 'mock' | 'supabase';
  loadPlayer(): Promise<PlayerState>;
  savePlayer(state: PlayerState): Promise<void>;
  loadLeaderboard(currentUser: PlayerState): Promise<LeaderboardEntry[]>;
}

const STORAGE_KEY = 'impulse_learning_world_player_v1';

class MockLocalRepository implements GameRepository {
  readonly mode = 'mock' as const;

  async loadPlayer(): Promise<PlayerState> {
    if (typeof globalThis.localStorage !== 'undefined') {
      try {
        const raw = globalThis.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          return JSON.parse(raw) as PlayerState;
        }
      } catch {
        // Ignore storage read errors and fall back to initial state
      }
    }
    return INITIAL_PLAYER_STATE;
  }

  async savePlayer(state: PlayerState): Promise<void> {
    if (typeof globalThis.localStorage !== 'undefined') {
      try {
        globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        // Ignore quota errors in sandboxed webviews
      }
    }
  }

  async loadLeaderboard(currentUser: PlayerState): Promise<LeaderboardEntry[]> {
    const avatarMap: Record<string, LeaderboardEntry['avatarKey']> = {
      kai: 'avatarKai',
      maya: 'avatarMaya',
      nova: 'avatarNova',
    };
    const me: LeaderboardEntry = {
      id: currentUser.id,
      name: currentUser.displayName,
      avatarKey: avatarMap[currentUser.activeAvatarId] ?? 'avatarKai',
      level: currentUser.currentLevel,
      weeklyXp: currentUser.weeklyXp,
      streak: currentUser.streakDays,
      isCurrentUser: true,
    };

    return [...MOCK_LEADERBOARD, me].sort((a, b) => b.weeklyXp - a.weeklyXp);
  }
}

class SupabaseRepository implements GameRepository {
  readonly mode = 'supabase' as const;
  private readonly fallback = new MockLocalRepository();

  async loadPlayer(): Promise<PlayerState> {
    try {
      const rows = await supabaseRest<Array<Record<string, unknown>>>('profiles', {
        query: 'select=*&limit=1',
      });
      if (rows.length === 0) return this.fallback.loadPlayer();
      const row = rows[0];
      return {
        ...INITIAL_PLAYER_STATE,
        id: String(row.id ?? INITIAL_PLAYER_STATE.id),
        displayName: String(row.display_name ?? INITIAL_PLAYER_STATE.displayName),
        explorerTitle: String(row.explorer_title ?? INITIAL_PLAYER_STATE.explorerTitle),
        xp: Number(row.xp ?? INITIAL_PLAYER_STATE.xp),
        weeklyXp: Number(row.weekly_xp ?? INITIAL_PLAYER_STATE.weeklyXp),
        coins: Number(row.coins ?? INITIAL_PLAYER_STATE.coins),
        gems: Number(row.gems ?? INITIAL_PLAYER_STATE.gems),
        streakDays: Number(row.streak_days ?? INITIAL_PLAYER_STATE.streakDays),
      };
    } catch {
      return this.fallback.loadPlayer();
    }
  }

  async savePlayer(state: PlayerState): Promise<void> {
    await this.fallback.savePlayer(state);
    try {
      await supabaseRest('profiles', {
        method: 'PATCH',
        query: `id=eq.${encodeURIComponent(state.id)}`,
        body: {
          display_name: state.displayName,
          explorer_title: state.explorerTitle,
          current_level: state.currentLevel,
          xp: state.xp,
          weekly_xp: state.weeklyXp,
          coins: state.coins,
          gems: state.gems,
          streak_days: state.streakDays,
          active_avatar_id: state.activeAvatarId,
          unlocked_avatar_ids: state.unlockedAvatarIds,
          owned_relic_ids: state.ownedRelicIds,
          skill_mastery: state.skillMastery,
        },
      });
    } catch {
      // Keep local state resilient if offline
    }
  }

  async loadLeaderboard(currentUser: PlayerState): Promise<LeaderboardEntry[]> {
    return this.fallback.loadLeaderboard(currentUser);
  }
}

export function createGameRepository(): GameRepository {
  return isSupabaseConfigured() ? new SupabaseRepository() : new MockLocalRepository();
}
