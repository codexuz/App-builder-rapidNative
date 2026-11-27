import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { ApiError, restoreSessionToken, setAccessToken, setUnauthorizedHandler } from '@/lib/api/client';
import type {
  AppLocale,
  AttemptResult,
  ChestReward,
  CodeChallenge,
  Course,
  DueWords,
  EngagementToday,
  Enrollment,
  Gamification,
  LeaderboardEntry,
  LeaderboardScope,
  LeagueWeek,
  Lesson,
  Me,
  Product,
  PublicCenter,
  ShopOrder,
} from '@/lib/api/types';
import { AppConfig } from '@/lib/config';
import { StorageKeys, storage } from '@/lib/storage';

export type SessionStatus = 'booting' | 'offline' | 'signedOut' | 'signedIn';

interface KidsAppContextValue {
  status: SessionStatus;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  center: PublicCenter | null;
  me: Me | null;
  studentId: string | null;
  studentIds: string[];
  locale: AppLocale;
  soundEnabled: boolean;
  courses: Course[];
  enrollments: Enrollment[];
  gamification: Gamification | null;
  today: EngagementToday | null;
  league: LeagueWeek | null;
  leaderboard: LeaderboardEntry[];
  leaderboardScope: LeaderboardScope;
  dueWords: DueWords | null;
  products: Product[];
  orders: ShopOrder[];
  pendingChallenge: CodeChallenge | null;

  // Actions — 100% live backend API (https://api.neezam.uz/api/v1)
  retryBoot: () => Promise<void>;
  signIn: (phoneOrStudentId: string, password: string) => Promise<{ ok: boolean; otpRequired?: boolean; error?: string }>;
  verifyOtp: (code: string) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => Promise<void>;
  switchStudent: (nextStudentId: string) => Promise<void>;
  setLocale: (next: AppLocale) => Promise<void>;
  setSoundEnabled: (next: boolean) => void;
  refreshAll: () => Promise<void>;
  loadCourseDetail: (courseId: string) => Promise<Course | null>;
  loadLessonDetail: (lessonId: string) => Promise<Lesson | null>;
  submitExerciseAttempt: (opts: {
    exerciseId: string;
    attemptId?: string;
    durationSeconds: number;
    answers: Array<{ questionId: string; answer: unknown }>;
  }) => Promise<AttemptResult>;
  openDailyChest: () => Promise<{ ok: boolean; reward?: ChestReward; message: string }>;
  buyStreakFreeze: () => Promise<{ ok: boolean; message: string }>;
  gradeVocabWord: (cardId: string, grade: 'AGAIN' | 'HARD' | 'GOOD' | 'EASY') => Promise<void>;
  orderShopProduct: (product: Product) => Promise<{ ok: boolean; message: string }>;
  loadLeaderboardScope: (scope: LeaderboardScope) => Promise<void>;
}

const KidsAppContext = createContext<KidsAppContextValue | null>(null);

export function KidsAppProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<SessionStatus>('booting');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [center, setCenter] = useState<PublicCenter | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [locale, setLocaleState] = useState<AppLocale>('en');
  const [soundEnabled, setSoundEnabledState] = useState(true);
  const [pendingChallenge, setPendingChallenge] = useState<CodeChallenge | null>(null);

  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [gamification, setGamification] = useState<Gamification | null>(null);
  const [today, setToday] = useState<EngagementToday | null>(null);
  const [league, setLeague] = useState<LeagueWeek | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardScope, setLeaderboardScope] = useState<LeaderboardScope>('center');
  const [dueWords, setDueWords] = useState<DueWords | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<ShopOrder[]>([]);

  const clearSessionData = useCallback(() => {
    setMe(null);
    setStudentId(null);
    setPendingChallenge(null);
    setCourses([]);
    setEnrollments([]);
    setGamification(null);
    setToday(null);
    setLeague(null);
    setLeaderboard([]);
    setDueWords(null);
    setProducts([]);
    setOrders([]);
  }, []);

  const fetchLiveDashboard = useCallback(async (sid: string, scope: LeaderboardScope = 'center') => {
    setLoading(true);
    setError(null);
    try {
      const [
        rawCoursesRes,
        enrollRes,
        gamRes,
        todayRes,
        leagueRes,
        lbRes,
        wordsRes,
        prodRes,
        ordersRes,
      ] = await Promise.allSettled([
        api.courses(),
        api.enrollments(sid),
        api.gamification(sid),
        api.today(sid),
        api.league(sid),
        api.leaderboard(scope),
        api.dueWords(sid),
        api.products(),
        api.orders(),
      ]);

      if (rawCoursesRes.status === 'fulfilled') {
        const list = Array.isArray(rawCoursesRes.value) ? rawCoursesRes.value : [];
        // Fetch per-lesson lock & progress for every enrolled course, matching erp-lms/apps/student
        const detailed = await Promise.all(
          list.map(async (c) => {
            try {
              return await api.course(c.id, sid);
            } catch {
              return c;
            }
          })
        );
        setCourses(detailed);
      } else {
        setCourses([]);
        const reason = rawCoursesRes.reason;
        if (reason instanceof Error) setError(reason.message);
      }

      if (enrollRes.status === 'fulfilled') {
        const val = enrollRes.value as unknown;
        setEnrollments(
          Array.isArray(val)
            ? (val as Enrollment[])
            : ((val as { items?: Enrollment[] })?.items ?? [])
        );
      }
      if (gamRes.status === 'fulfilled') setGamification(gamRes.value);
      if (todayRes.status === 'fulfilled') setToday(todayRes.value);
      if (leagueRes.status === 'fulfilled') setLeague(leagueRes.value);
      if (lbRes.status === 'fulfilled') {
        const val = lbRes.value as unknown;
        setLeaderboard(
          Array.isArray(val)
            ? (val as LeaderboardEntry[])
            : ((val as { items?: LeaderboardEntry[] })?.items ?? [])
        );
      }
      if (wordsRes.status === 'fulfilled') setDueWords(wordsRes.value);
      if (prodRes.status === 'fulfilled') {
        const val = prodRes.value as unknown;
        setProducts(
          Array.isArray(val)
            ? (val as Product[])
            : ((val as { items?: Product[] })?.items ?? [])
        );
      }
      if (ordersRes.status === 'fulfilled') {
        const val = ordersRes.value as unknown;
        setOrders(
          Array.isArray(val)
            ? (val as ShopOrder[])
            : ((val as { items?: ShopOrder[] })?.items ?? [])
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const finishLiveAuth = useCallback(
    async (access: string, refresh: string, expiresIn: number) => {
      setAccessToken(access, expiresIn || 900);
      await storage.secure.set(StorageKeys.refreshToken(AppConfig.centerSlug), refresh);

      const profile = await api.me();
      const ids = profile.studentIds ?? [];
      if (ids.length === 0) {
        await api.logout(refresh).catch(() => {});
        await storage.secure.remove(StorageKeys.refreshToken(AppConfig.centerSlug));
        setAccessToken(null);
        throw new Error('This account has no student profile linked.');
      }

      const savedSid = await storage.plain.get(
        StorageKeys.selectedStudent(AppConfig.centerSlug, profile.id)
      );
      const chosenSid = savedSid && ids.includes(savedSid) ? savedSid : ids[0];

      setMe(profile);
      setStudentId(chosenSid);
      setPendingChallenge(null);
      setStatus('signedIn');
      await fetchLiveDashboard(chosenSid, leaderboardScope);
    },
    [fetchLiveDashboard, leaderboardScope]
  );

  const bootSession = useCallback(async () => {
    setStatus('booting');
    setError(null);

    const [savedLocale, savedSound] = await Promise.all([
      storage.plain.get(StorageKeys.locale),
      storage.plain.get(StorageKeys.soundEnabled),
    ]);

    if (savedLocale === 'en' || savedLocale === 'uz' || savedLocale === 'ru') {
      setLocaleState(savedLocale);
    }
    if (savedSound === 'false') {
      setSoundEnabledState(false);
    }

    // Fetch public Impulse center branding (non-blocking)
    api
      .publicCenter(AppConfig.centerSlug)
      .then((c) => setCenter(c))
      .catch(() => {});

    const storedRefresh = await storage.secure.get(
      StorageKeys.refreshToken(AppConfig.centerSlug)
    );
    if (!storedRefresh) {
      clearSessionData();
      setStatus('signedOut');
      return;
    }

    const restored = await restoreSessionToken();
    if (restored === 'offline') {
      setStatus('offline');
      return;
    }
    if (restored !== 'ok') {
      clearSessionData();
      setStatus('signedOut');
      return;
    }

    try {
      const profile = await api.me();
      const ids = profile.studentIds ?? [];
      if (ids.length === 0) {
        clearSessionData();
        setStatus('signedOut');
        return;
      }

      const savedSid = await storage.plain.get(
        StorageKeys.selectedStudent(AppConfig.centerSlug, profile.id)
      );
      const chosenSid = savedSid && ids.includes(savedSid) ? savedSid : ids[0];
      setMe(profile);
      setStudentId(chosenSid);
      setStatus('signedIn');
      await fetchLiveDashboard(chosenSid, 'center');
    } catch (err) {
      if (err instanceof ApiError && err.offline) {
        setStatus('offline');
        return;
      }
      clearSessionData();
      setStatus('signedOut');
    }
  }, [clearSessionData, fetchLiveDashboard]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSessionData();
      setStatus('signedOut');
    });

    void bootSession();

    return () => {
      setUnauthorizedHandler(null);
    };
  }, [bootSession, clearSessionData]);

  const signIn = useCallback(
    async (phoneOrStudentId: string, password: string) => {
      try {
        const res = await api.login(phoneOrStudentId, password);
        if ('otpRequired' in res && res.otpRequired) {
          setPendingChallenge(res);
          return { ok: true, otpRequired: true };
        }
        if ('accessToken' in res) {
          await finishLiveAuth(res.accessToken, res.refreshToken, res.expiresIn);
          return { ok: true };
        }
        return { ok: false, error: 'Unexpected login response from Impulse server.' };
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'Could not connect to Impulse server.';
        return { ok: false, error: message };
      }
    },
    [finishLiveAuth]
  );

  const verifyOtp = useCallback(
    async (code: string) => {
      if (!pendingChallenge) return { ok: false, error: 'No verification challenge active.' };
      try {
        const res = await api.verifyLogin(pendingChallenge.challengeId, code);
        await finishLiveAuth(res.accessToken, res.refreshToken, res.expiresIn);
        return { ok: true };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Invalid code. Try again.';
        return { ok: false, error: message };
      }
    },
    [finishLiveAuth, pendingChallenge]
  );

  const signOut = useCallback(async () => {
    const ref = await storage.secure.get(StorageKeys.refreshToken(AppConfig.centerSlug));
    if (ref) {
      await api.logout(ref).catch(() => {});
      await storage.secure.remove(StorageKeys.refreshToken(AppConfig.centerSlug));
    }
    setAccessToken(null);
    clearSessionData();
    setStatus('signedOut');
  }, [clearSessionData]);

  const switchStudent = useCallback(
    async (nextStudentId: string) => {
      if (!me) return;
      setStudentId(nextStudentId);
      await storage.plain.set(
        StorageKeys.selectedStudent(AppConfig.centerSlug, me.id),
        nextStudentId
      );
      await fetchLiveDashboard(nextStudentId, leaderboardScope);
    },
    [fetchLiveDashboard, leaderboardScope, me]
  );

  const setLocale = useCallback(
    async (next: AppLocale) => {
      setLocaleState(next);
      await storage.plain.set(StorageKeys.locale, next);
      if (status === 'signedIn' && (next === 'uz' || next === 'ru')) {
        api.updateLocale(next).catch(() => {});
      }
    },
    [status]
  );

  const setSoundEnabled = useCallback((next: boolean) => {
    setSoundEnabledState(next);
    void storage.plain.set(StorageKeys.soundEnabled, next ? 'true' : 'false');
  }, []);

  const refreshAll = useCallback(async () => {
    if (status === 'signedIn' && studentId) {
      await fetchLiveDashboard(studentId, leaderboardScope);
    }
  }, [fetchLiveDashboard, leaderboardScope, status, studentId]);

  const loadCourseDetail = useCallback(
    async (courseId: string): Promise<Course | null> => {
      if (!studentId) return null;
      const detail = await api.course(courseId, studentId);
      setCourses((prev) => {
        const exists = prev.some((c) => c.id === courseId);
        return exists ? prev.map((c) => (c.id === courseId ? detail : c)) : [...prev, detail];
      });
      return detail;
    },
    [studentId]
  );

  const loadLessonDetail = useCallback(
    async (lessonId: string): Promise<Lesson | null> => {
      if (!studentId) return null;
      return api.lesson(lessonId, studentId);
    },
    [studentId]
  );

  const submitExerciseAttempt = useCallback<KidsAppContextValue['submitExerciseAttempt']>(
    async ({ exerciseId, attemptId, durationSeconds, answers }) => {
      if (!studentId) {
        throw new Error('Please sign in to submit answers.');
      }
      const res = await api.submitAttempt(exerciseId, {
        studentId,
        attemptId,
        durationSeconds,
        answers,
      });
      void fetchLiveDashboard(studentId, leaderboardScope);
      return res;
    },
    [fetchLiveDashboard, leaderboardScope, studentId]
  );

  const openDailyChest = useCallback(async () => {
    if (!studentId) return { ok: false, message: 'Sign in first.' };
    try {
      const res = await api.openChest(studentId);
      void fetchLiveDashboard(studentId, leaderboardScope);
      return {
        ok: res.opened,
        reward: res.reward,
        message: `You won +${res.reward.coins} Coins${res.reward.freeze ? ' + 1 Streak Freeze' : ''}!`,
      };
    } catch (err) {
      return { ok: false, message: err instanceof Error ? err.message : 'Chest not ready yet.' };
    }
  }, [fetchLiveDashboard, leaderboardScope, studentId]);

  const buyStreakFreeze = useCallback(async () => {
    if (!studentId) return { ok: false, message: 'Sign in first.' };
    try {
      await api.buyFreeze(studentId);
      void fetchLiveDashboard(studentId, leaderboardScope);
      return { ok: true, message: 'Streak Freeze added!' };
    } catch (err) {
      return { ok: false, message: err instanceof Error ? err.message : 'Could not buy freeze.' };
    }
  }, [fetchLiveDashboard, leaderboardScope, studentId]);

  const gradeVocabWord = useCallback(
    async (cardId: string, grade: 'AGAIN' | 'HARD' | 'GOOD' | 'EASY') => {
      if (!studentId) return;
      await api.gradeWord(cardId, studentId, grade);
      const refreshed = await api.dueWords(studentId).catch(() => null);
      if (refreshed) {
        setDueWords(refreshed);
      } else {
        setDueWords((prev) =>
          prev
            ? {
                cards: prev.cards.filter((c) => c.id !== cardId),
                counts: {
                  ...prev.counts,
                  due: Math.max(0, prev.counts.due - 1),
                },
              }
            : prev
        );
      }
    },
    [studentId]
  );

  const orderShopProduct = useCallback(
    async (product: Product) => {
      if (!studentId) return { ok: false, message: 'Sign in first.' };
      try {
        await api.placeOrder(studentId, product.id, 1);
        void fetchLiveDashboard(studentId, leaderboardScope);
        return { ok: true, message: `Ordered "${product.name}"!` };
      } catch (err) {
        return { ok: false, message: err instanceof Error ? err.message : 'Order failed.' };
      }
    },
    [fetchLiveDashboard, leaderboardScope, studentId]
  );

  const loadLeaderboardScope = useCallback(async (scope: LeaderboardScope) => {
    setLeaderboardScope(scope);
    const val = (await api.leaderboard(scope)) as unknown;
    setLeaderboard(
      Array.isArray(val)
        ? (val as LeaderboardEntry[])
        : ((val as { items?: LeaderboardEntry[] })?.items ?? [])
    );
  }, []);

  const value = useMemo<KidsAppContextValue>(
    () => ({
      status,
      isAuthenticated: status === 'signedIn',
      loading,
      error,
      center,
      me,
      studentId,
      studentIds: me?.studentIds ?? (studentId ? [studentId] : []),
      locale,
      soundEnabled,
      courses,
      enrollments,
      gamification,
      today,
      league,
      leaderboard,
      leaderboardScope,
      dueWords,
      products,
      orders,
      pendingChallenge,
      retryBoot: bootSession,
      signIn,
      verifyOtp,
      signOut,
      switchStudent,
      setLocale,
      setSoundEnabled,
      refreshAll,
      loadCourseDetail,
      loadLessonDetail,
      submitExerciseAttempt,
      openDailyChest,
      buyStreakFreeze,
      gradeVocabWord,
      orderShopProduct,
      loadLeaderboardScope,
    }),
    [
      bootSession,
      buyStreakFreeze,
      center,
      courses,
      dueWords,
      enrollments,
      error,
      gamification,
      gradeVocabWord,
      leaderboard,
      leaderboardScope,
      league,
      loadCourseDetail,
      loadLeaderboardScope,
      loadLessonDetail,
      loading,
      locale,
      me,
      openDailyChest,
      orderShopProduct,
      orders,
      pendingChallenge,
      products,
      refreshAll,
      setLocale,
      setSoundEnabled,
      signIn,
      signOut,
      soundEnabled,
      status,
      studentId,
      submitExerciseAttempt,
      switchStudent,
      today,
      verifyOtp,
    ]
  );

  return <KidsAppContext.Provider value={value}>{children}</KidsAppContext.Provider>;
}

export function useKidsApp(): KidsAppContextValue {
  const ctx = useContext(KidsAppContext);
  if (!ctx) throw new Error('useKidsApp must be used inside KidsAppProvider');
  return ctx;
}
