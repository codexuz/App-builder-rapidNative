import type { GeneratedAssetKey } from '@/constants/GeneratedAssets';

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2';

export type LessonStageType =
  | 'vocabulary'
  | 'grammar'
  | 'listening'
  | 'reading'
  | 'speaking'
  | 'interactive';

export interface VocabItem {
  word: string;
  phonetic: string;
  partOfSpeech: string;
  definition: string;
  example: string;
}

export interface VocabularyStage {
  type: 'vocabulary';
  title: string;
  words: VocabItem[];
  checkPrompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface GrammarStage {
  type: 'grammar';
  title: string;
  ruleHeadline: string;
  ruleSummary: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ListeningStage {
  type: 'listening';
  title: string;
  speakerName: string;
  speakerRole: string;
  audioScript: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ReadingStage {
  type: 'reading';
  title: string;
  passageTitle: string;
  passage: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface SpeakingStage {
  type: 'speaking';
  title: string;
  context: string;
  targetPhrase: string;
  phoneticGuide: string;
  tips: string[];
}

export interface InteractiveBuilderStage {
  type: 'interactive';
  title: string;
  instruction: string;
  promptHint: string;
  tiles: string[];
  correctSentence: string;
  explanation: string;
}

export type LessonStage =
  | VocabularyStage
  | GrammarStage
  | ListeningStage
  | ReadingStage
  | SpeakingStage
  | InteractiveBuilderStage;

export interface LessonNode {
  id: string;
  cityId: string;
  level: CEFRLevel;
  order: number;
  title: string;
  subtitle: string;
  durationMin: number;
  xpReward: number;
  coinReward: number;
  gemReward: number;
  stages: [
    VocabularyStage,
    GrammarStage,
    ListeningStage,
    ReadingStage,
    SpeakingStage,
    InteractiveBuilderStage,
  ];
}

export interface WorldCity {
  id: string;
  level: CEFRLevel;
  name: string;
  regionTag: string;
  tagline: string;
  description: string;
  imageKey: GeneratedAssetKey;
  landmarkLabel: string;
  unlockRequirementText: string;
  lessons: LessonNode[];
}

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  kind: 'lessons' | 'xp' | 'speaking' | 'perfect';
  progress: number;
  target: number;
  coinReward: number;
  gemReward: number;
  xpReward: number;
  claimed: boolean;
}

export interface ExplorerAvatar {
  id: string;
  name: string;
  title: string;
  specialty: string;
  imageKey: GeneratedAssetKey;
  costCoins: number;
  costGems: number;
  accentColor: string;
}

export interface CollectibleRelic {
  id: string;
  name: string;
  cityName: string;
  level: CEFRLevel;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  description: string;
  costCoins: number;
  costGems: number;
  iconName: 'compass' | 'lighthouse' | 'train' | 'lantern' | 'telescope' | 'crown';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  target: number;
  progress: number;
  rewardGems: number;
  unlocked: boolean;
  iconName: 'flame' | 'map' | 'mic' | 'sparkles' | 'trophy' | 'book';
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  avatarKey: GeneratedAssetKey;
  level: CEFRLevel;
  weeklyXp: number;
  streak: number;
  isCurrentUser?: boolean;
}

export interface SkillMastery {
  vocabulary: number;
  grammar: number;
  listening: number;
  reading: number;
  speaking: number;
}

export interface PlayerState {
  id: string;
  displayName: string;
  explorerTitle: string;
  currentLevel: CEFRLevel;
  xp: number;
  weeklyXp: number;
  coins: number;
  gems: number;
  streakDays: number;
  weekActivity: boolean[];
  activeAvatarId: string;
  unlockedAvatarIds: string[];
  ownedRelicIds: string[];
  completedLessonIds: string[];
  lessonScores: Record<string, number>;
  skillMastery: SkillMastery;
  dailyQuests: DailyQuest[];
  achievements: Achievement[];
}
