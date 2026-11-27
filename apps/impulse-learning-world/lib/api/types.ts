/**
 * Production API types mirrored directly from codexuz/erp-lms/apps/student/lib/api/types.ts
 * so Impulse Kids talks seamlessly to https://api.neezam.uz/api/v1 (x-erp-tenant: impulse).
 */

export type AppLocale = 'en' | 'uz' | 'ru';

export type LmsSubject = 'ENGLISH' | 'RUSSIAN' | 'MATH';

export interface PublicCenter {
  id: string;
  name: string;
  slug: string;
  logoVersion?: string | number | null;
  colors?: string[];
}

export interface CenterRef {
  id: string;
  name: string;
  slug: string;
}

export interface Me {
  id: string;
  firstName: string;
  lastName?: string | null;
  phone?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  locale?: string | null;
  center?: CenterRef | null;
  centers?: CenterRef[];
  roles?: string[];
  permissions?: string[];
  studentIds?: string[];
}

export interface SignedIn {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user?: {
    id: string;
    firstName: string;
    lastName?: string | null;
    phone?: string | null;
    email?: string | null;
    centerId?: string;
    centerName?: string;
  };
  centers?: CenterRef[];
}

export interface CodeChallenge {
  otpRequired?: true;
  challengeId: string;
  channel: string;
  destination?: string | null;
  expiresAt?: string;
  resendAfter?: number;
}

export type LoginResponse = SignedIn | ({ otpRequired: true } & CodeChallenge);

export type LessonLock =
  | { reason: 'NOT_OPEN'; opensAt: string }
  | { reason: 'PREVIOUS_NOT_DONE'; previousLessonId: string; previousTitle: string }
  | {
      reason: 'NOT_IN_CLASS_YET';
      purpose: 'CLASSWORK' | 'HOMEWORK' | string;
      planPosition: number;
      planTitle: string;
    };

export interface LessonProgress {
  lessonId?: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | string;
  progressPercent: number;
  bestScore?: string | number | null;
  viewedAt?: string | null;
  completedAt?: string | null;
}

export interface CourseLesson {
  id: string;
  title: string;
  description?: string | null;
  type?: string;
  position: number;
  estimatedMinutes?: number | null;
  opensAt?: string | null;
  dueAt?: string | null;
  open?: boolean;
  lock?: LessonLock | null;
  overdue?: boolean;
  progress?: LessonProgress | null;
  _count?: {
    contentBlocks: number;
    exercises: number;
  };
}

export interface CourseUnit {
  id: string;
  title: string;
  position: number;
  lessons: CourseLesson[];
}

export interface Course {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  subject?: LmsSubject;
  sequential: boolean;
  lessonRewardCoins: number;
  completionRewardCoins: number;
  level?: {
    id: string;
    name: string;
    code?: string | null;
    courseId?: string;
    position?: number;
  } | null;
  groups?: Array<{ group: { id: string; name: string; code?: string | null } }>;
  practice?: boolean;
  units: CourseUnit[];
}

export interface VocabularyWord {
  term: string;
  meaning: string;
  example?: string | null;
  pronunciation?: string | null;
  partOfSpeech?: string | null;
  exampleTranslation?: string | null;
  meaningRu?: string | null;
  exampleTranslationRu?: string | null;
  imageSrc?: string | null;
}

export interface ContentBlock {
  id: string;
  type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'FILE' | 'EMBED' | 'VOCABULARY' | string;
  position: number;
  content: {
    markdown?: string;
    src?: string;
    url?: string;
    caption?: string;
    transcript?: string;
    name?: string;
    items?: VocabularyWord[];
  };
}

export type QuestionType =
  | 'SINGLE_CHOICE'
  | 'MULTI_CHOICE'
  | 'TRUE_FALSE'
  | 'TEXT'
  | 'NUMERIC'
  | 'MATCHING'
  | 'ORDER'
  | 'ESSAY'
  | 'SPEAKING'
  | 'TFNG'
  | 'MATCH_LIST'
  | 'GAP_FILL';

export interface QuestionOption {
  id: string;
  text: string;
  textRu?: string | null;
}

export interface Question {
  id: string;
  type: QuestionType;
  position: number;
  prompt: string;
  points: number | string;
  data: {
    promptRu?: string | null;
    options?: QuestionOption[];
    items?: Array<{ id: string; text: string; textRu?: string | null }>;
    left?: Array<{ id: string; text: string; textRu?: string | null }>;
    right?: Array<{ id: string; text: string; textRu?: string | null }>;
    text?: string;
    gaps?: Array<{
      id: string;
      accepted?: string[];
      kind?: 'CHOICE' | 'ORDER';
      options?: string[];
      words?: string[];
    }>;
    wordBank?: string[];
    hint?: string | null;
    unit?: string | null;
    minWords?: number;
    maxWords?: number;
    maxSeconds?: number;
    mediaSrc?: { audio?: string; image?: string };
  };
}

export interface ExerciseSettings {
  maxAttempts?: number | null;
  passPercent?: number | null;
  timeLimitMinutes?: number | null;
  questionCount?: number | null;
  showAnswers?: string;
  startRequired?: boolean;
}

export interface ExerciseMaterial {
  passage?: string | null;
  audioSrc?: string | null;
  playLimit?: number;
  hasTranscript?: boolean;
}

export interface LessonExercise {
  id: string;
  title: string;
  kind?: 'QUIZ' | 'READING' | 'LISTENING' | string;
  material?: ExerciseMaterial | null;
  instructions?: string | null;
  position: number;
  maxScore: number | string;
  settings: ExerciseSettings;
  mine?: {
    attemptsUsed: number;
    attemptsLeft?: number | null;
    best?: { score: number | string; maxScore: number | string } | null;
    waiting?: boolean;
    openAttempt?: { id: string } | null;
  };
  questions: Question[];
}

export interface Lesson {
  id: string;
  title: string;
  description?: string | null;
  estimatedMinutes?: number | null;
  dueAt?: string | null;
  overdue?: boolean;
  studentId?: string;
  unit?: {
    id: string;
    title: string;
    course: {
      id: string;
      title: string;
      subject?: LmsSubject;
    };
  };
  contentBlocks: ContentBlock[];
  exercises: LessonExercise[];
  progress?: LessonProgress | null;
}

export interface StartedAttempt {
  subject?: LmsSubject;
  attempt: {
    id: string;
    attemptNumber: number;
    startedAt: string;
    deadlineAt?: string | null;
    maxScore: number | string;
  };
  questions: Question[];
}

export interface Streak {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate?: string | null;
  activeToday?: boolean;
  today?: string;
  freezes?: number;
  frozenDays?: string[];
}

export interface StreakStep {
  day: string;
  before: number;
  after: number;
  changed: boolean;
  coins: number;
  frozen?: string[];
  perfectWeek?: number;
}

export type QuestType = 'EXERCISES' | 'GOOD_SCORE' | 'WORDS' | 'MISTAKES' | 'XP';

export interface DayQuest {
  type: QuestType;
  target: number;
  progress: number;
  done: boolean;
}

export interface ChestReward {
  coins: number;
  freeze: boolean;
  jackpot?: boolean;
}

export interface EarnedAchievement {
  id?: string;
  code?: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  coins?: number;
}

export interface LearningReward {
  xp: {
    gained: number;
    total: number;
    level: number;
    levelBefore: number;
    into: number;
    span: number;
  };
  levelUp?: { level: number; coins: number; rank?: boolean } | null;
  combo?: number;
  quests: DayQuest[];
  finished: DayQuest[];
  chestReady: boolean;
  achievements: EarnedAchievement[];
}

export interface AttemptAnswerResult {
  questionId: string;
  answer: unknown;
  isCorrect?: boolean | null;
  score?: number | string | null;
  feedback?: string | null;
}

export interface AttemptResult {
  id: string;
  attemptNumber: number;
  status: 'STARTED' | 'SUBMITTED' | 'GRADED' | string;
  score?: number | string | null;
  maxScore: number | string;
  isLate?: boolean;
  feedback?: string | null;
  answersShown?: boolean;
  aiMarking?: 'PENDING' | 'DONE' | null;
  streak?: StreakStep | null;
  reward?: LearningReward | null;
  answers: AttemptAnswerResult[];
}

export interface CoinTransaction {
  id: string;
  amount: number;
  type: string;
  description?: string | null;
  createdAt: string;
}

export interface Gamification {
  wallet: {
    cachedCoinBalance: number;
    cachedXp: number;
  } | null;
  streak: Streak | null;
  transactions: CoinTransaction[];
  achievements: Array<{
    id: string;
    earnedAt?: string | null;
    achievement: {
      id: string;
      name: string;
      description?: string | null;
      icon?: string | null;
    };
  }>;
  verified?: boolean;
}

export interface EngagementToday {
  day: string;
  quests: DayQuest[];
  chest: {
    ready: boolean;
    openedAt?: string | null;
    reward: ChestReward | null;
  };
  xpToday: number;
  level: {
    level: number;
    xp: number;
    into: number;
    span: number;
    next?: number;
  };
  coins: number;
  freeze: {
    enabled: boolean;
    price: number;
    max: number;
    held: number;
  };
  repair?: {
    streak: number;
    freezesNeeded: number;
    coins: number;
    affordable: boolean;
  } | null;
  perfectWeeks?: number;
}

export interface LeagueMember {
  studentId: string;
  name: string;
  avatarUrl?: string | null;
  verified?: boolean;
  xp: number;
  rank: number;
  me: boolean;
  outcome: 'UP' | 'DOWN' | 'STAY';
  reward: number;
}

export interface LeagueWeek {
  enabled: boolean;
  week: string;
  endsAt: string;
  tiers: string[];
  promote: number;
  demote: number;
  rewards: number[];
  groupSize: number;
  joined: boolean;
  tier: number;
  members: LeagueMember[];
}

export type LeaderboardScope = 'center' | 'branch' | 'level' | 'group';

export interface LeaderboardEntry {
  id: string;
  studentId: string;
  cachedCoinBalance: number;
  cachedXp: number;
  student: {
    id: string;
    studentNumber?: string | null;
    verified?: boolean;
    contact: {
      firstName: string;
      lastName?: string | null;
      avatarUrl?: string | null;
    } | null;
    streak: Streak | null;
  };
}

export interface ReviewCard {
  id: string;
  term: string;
  meaning: string;
  example?: string | null;
  pronunciation?: string | null;
  partOfSpeech?: string | null;
  exampleTranslation?: string | null;
  meaningRu?: string | null;
  image?: string | null;
  audio?: string | null;
  isNew?: boolean;
  intervalDays?: number;
  lesson?: { id: string; title: string };
  subject?: LmsSubject;
}

export interface DueWords {
  cards: ReviewCard[];
  counts: {
    due: number;
    new: number;
    newToday: number;
    total: number;
    learned: number;
  };
}

export interface Product {
  id: string;
  name: string;
  description?: string | null;
  priceCoins: number;
  stock?: number | null;
  category?: string | null;
  imageUrl?: string | null;
}

export interface ShopOrder {
  id: string;
  status: string;
  totalCoins: number;
  createdAt: string;
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  levelId?: string | null;
  groupId?: string | null;
  status: string;
  course?: { id: string; name: string; code?: string | null; category?: string | null } | null;
  level?: { id: string; name: string; code?: string | null } | null;
  group?: { id: string; name: string; code?: string | null } | null;
}
