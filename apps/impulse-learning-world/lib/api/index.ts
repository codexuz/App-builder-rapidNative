import { AppConfig } from '../config';
import { assetUrl, request } from './client';
import type {
  AttemptResult,
  ChestReward,
  Course,
  DueWords,
  EarnedAchievement,
  EngagementToday,
  Enrollment,
  Gamification,
  LeaderboardEntry,
  LeaderboardScope,
  LeagueWeek,
  Lesson,
  LoginResponse,
  Me,
  Product,
  PublicCenter,
  ShopOrder,
  SignedIn,
  StartedAttempt,
} from './types';

/**
 * Production API methods matching codexuz/erp-lms/apps/student/lib/api/index.ts.
 * Note: GET /lms/courses is automatically server-scoped to the student's active enrollments.
 */
export const api = {
  assetUrl,

  // Center & Auth
  publicCenter: (center = AppConfig.centerSlug) =>
    request<PublicCenter>('/public/center', {
      auth: false,
      center,
      query: { center },
    }),

  login: (phoneOrStudentId: string, password: string) =>
    request<LoginResponse>('/auth/login', {
      method: 'POST',
      auth: false,
      body: { phone: phoneOrStudentId.trim(), password },
    }),

  verifyLogin: (challengeId: string, code: string) =>
    request<SignedIn>('/auth/login/verify', {
      method: 'POST',
      auth: false,
      body: { challengeId, code: code.trim() },
    }),

  logout: (refreshToken: string) =>
    request<unknown>('/auth/logout', {
      method: 'POST',
      auth: false,
      body: { refreshToken },
    }),

  me: () => request<Me>('/auth/me'),

  updateLocale: (locale: 'uz' | 'ru') =>
    request<{ locale: string | null }>('/auth/me/locale', {
      method: 'PUT',
      body: { locale },
    }),

  // LMS Courses (server-scoped to student's active enrollments), Lessons & Exercises
  courses: () => request<Course[]>('/lms/courses'),

  course: (courseId: string, studentId: string) =>
    request<Course>(`/lms/courses/${courseId}`, {
      query: { studentId },
    }),

  lesson: (lessonId: string, studentId: string) =>
    request<Lesson>(`/lms/lessons/${lessonId}`, {
      query: { studentId },
    }),

  markLessonViewed: (lessonId: string, studentId: string) =>
    request<NonNullable<Lesson['progress']>>(`/lms/lessons/${lessonId}/viewed`, {
      method: 'POST',
      body: { studentId },
    }),

  startAttempt: (exerciseId: string, studentId: string) =>
    request<StartedAttempt>(`/lms/exercises/${exerciseId}/start`, {
      method: 'POST',
      body: { studentId },
    }),

  submitAttempt: (
    exerciseId: string,
    payload: {
      studentId: string;
      attemptId?: string;
      durationSeconds?: number;
      answers: Array<{ questionId: string; answer: unknown }>;
    }
  ) =>
    request<AttemptResult>(`/lms/exercises/${exerciseId}/submit`, {
      method: 'POST',
      body: payload,
    }),

  myAttempts: (exerciseId: string, studentId: string) =>
    request<{ settings: Record<string, unknown>; attempts: AttemptResult[] }>(
      `/lms/exercises/${exerciseId}/attempts/mine`,
      { query: { studentId } }
    ),

  // Review & Vocabulary
  dueWords: (studentId: string) =>
    request<DueWords>('/lms/review/words', { query: { studentId } }),

  gradeWord: (cardId: string, studentId: string, grade: 'AGAIN' | 'HARD' | 'GOOD' | 'EASY') =>
    request<{ id: string; dueAt: string; intervalDays: number }>(`/lms/review/words/${cardId}`, {
      method: 'POST',
      body: { studentId, grade },
    }),

  // Gamification, Daily Quests, Chest, League & Leaderboard
  gamification: (studentId: string) =>
    request<Gamification>(`/gamification/students/${studentId}`),

  today: (studentId: string) =>
    request<EngagementToday>(`/gamification/students/${studentId}/today`),

  openChest: (studentId: string) =>
    request<{ reward: ChestReward; opened: boolean; achievements: EarnedAchievement[] }>(
      `/gamification/students/${studentId}/chest`,
      { method: 'POST', body: {} }
    ),

  buyFreeze: (studentId: string) =>
    request<{ freezes: number; balance: number }>(
      `/gamification/students/${studentId}/freeze`,
      { method: 'POST', body: {} }
    ),

  league: (studentId: string) =>
    request<LeagueWeek>(`/gamification/students/${studentId}/league`),

  leaderboard: (scope: LeaderboardScope = 'center') =>
    request<LeaderboardEntry[]>('/gamification/leaderboard', {
      query: { scope },
    }),

  // Coin Shop
  products: () => request<Product[]>('/shop/products'),

  orders: () => request<ShopOrder[]>('/shop/orders'),

  placeOrder: (studentId: string, productId: string, quantity = 1) =>
    request<ShopOrder>('/shop/orders', {
      method: 'POST',
      body: { studentId, items: [{ productId, quantity }] },
    }),

  // Academic Enrollments
  enrollments: (studentId: string) =>
    request<Enrollment[]>('/academic/enrollments', {
      query: { studentId },
    }),
};
