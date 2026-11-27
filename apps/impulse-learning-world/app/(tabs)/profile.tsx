import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  Award,
  Check,
  CheckCircle2,
  ChevronRight,
  Coins,
  Flame,
  Globe,
  GraduationCap,
  LogOut,
  RefreshCw,
  Snowflake,
  Users,
  Volume2,
  VolumeX,
} from 'lucide-react-native';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetItem,
  ActionsheetItemText,
} from '@/components/gluestack/actionsheet';
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
} from '@/components/gluestack/alert-dialog';
import {
  Avatar,
  AvatarBadge,
  AvatarFallbackText,
  AvatarImage,
} from '@/components/gluestack/avatar';
import { Badge, BadgeText } from '@/components/gluestack/badge';
import { Box } from '@/components/gluestack/box';
import { Button, ButtonIcon, ButtonText } from '@/components/gluestack/button';
import { Card } from '@/components/gluestack/card';
import { Center } from '@/components/gluestack/center';
import { Divider } from '@/components/gluestack/divider';
import { Heading } from '@/components/gluestack/heading';
import { HStack } from '@/components/gluestack/hstack';
import { Pressable } from '@/components/gluestack/pressable';
import { Progress, ProgressFilledTrack } from '@/components/gluestack/progress';
import { Switch } from '@/components/gluestack/switch';
import { Text } from '@/components/gluestack/text';
import {
  Toast,
  ToastDescription,
  ToastTitle,
  useToast,
} from '@/components/gluestack/toast';
import { VStack } from '@/components/gluestack/vstack';
import { LEO_ART } from '@/components/mascot/LeoMascot';
import { Screen } from '@/components/ui';
import { api } from '@/lib/api';
import type { AppLocale } from '@/lib/api/types';
import { AppConfig } from '@/lib/config';
import { useKidsApp } from '@/providers/KidsAppProvider';

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const LOCALE_LABELS: Record<AppLocale, string> = {
  en: 'English',
  uz: 'O‘zbekcha',
  ru: 'Русский',
};

export default function KidsProfileScreen() {
  const router = useRouter();
  const toast = useToast();
  const {
    center,
    me,
    studentId,
    studentIds,
    enrollments,
    locale,
    soundEnabled,
    gamification,
    today,
    loading,
    setLocale,
    setSoundEnabled,
    switchStudent,
    buyStreakFreeze,
    refreshAll,
    signOut,
  } = useKidsApp();

  const [langSheetOpen, setLangSheetOpen] = useState(false);
  const [childSheetOpen, setChildSheetOpen] = useState(false);
  const [signOutDialogOpen, setSignOutDialogOpen] = useState(false);

  const fullName = me ? `${me.firstName} ${me.lastName ?? ''}`.trim() : 'Student';
  const avatarUri = api.assetUrl(me?.avatarUrl);
  const xp = gamification?.wallet?.cachedXp ?? today?.level.xp ?? 0;
  const coins = gamification?.wallet?.cachedCoinBalance ?? today?.coins ?? 0;
  const streak = gamification?.streak?.currentStreak ?? 0;
  const longestStreak = gamification?.streak?.longestStreak ?? 0;
  const freezes = gamification?.streak?.freezes ?? today?.freeze.held ?? 0;
  const levelNum = today?.level.level ?? 1;
  const levelInto = today?.level.into ?? 0;
  const levelSpan = Math.max(1, today?.level.span ?? 100);
  const levelPct = Math.min(100, Math.round((levelInto / levelSpan) * 100));
  const achievements = gamification?.achievements ?? [];
  const transactions = (gamification?.transactions ?? []).slice(0, 5);

  const showToast = (title: string, description: string, action: 'success' | 'error' = 'success') => {
    toast.show({
      placement: 'top',
      duration: 2800,
      render: ({ id }) => (
        <Toast nativeID={`profile-toast-${id}`} action={action} variant="solid" className="rounded-xl px-4 py-3">
          <ToastTitle className="font-bold">{title}</ToastTitle>
          <ToastDescription>{description}</ToastDescription>
        </Toast>
      ),
    });
  };

  const handleBuyFreeze = async () => {
    const res = await buyStreakFreeze();
    showToast(res.ok ? 'Streak Freeze Added' : 'Streak Freeze', res.message, res.ok ? 'success' : 'error');
  };

  return (
    <Screen hasTabBar refreshing={loading} onRefresh={() => void refreshAll()}>
      {/* Header */}
      <HStack className="items-center justify-between">
        <Heading size="xl" className="text-foreground">
          Profile
        </Heading>
        <Button
          size="icon"
          variant="outline"
          className="h-9 w-9 rounded-full bg-card border-border"
          onPress={() => void refreshAll()}
          accessibilityLabel="Refresh live data"
        >
          <RefreshCw size={16} color="#475569" />
        </Button>
      </HStack>

      {/* Unified Student Summary Card */}
      <Card className="bg-card border border-border rounded-2xl p-4">
        <VStack space="md">
          <HStack className="items-center" space="md">
            <Avatar className="h-16 w-16 bg-accent border-2 border-primary/25">
              {avatarUri ? (
                <AvatarFallbackText className="text-primary font-bold text-lg">
                  {fullName}
                </AvatarFallbackText>
              ) : null}
              <AvatarImage
                source={avatarUri ? { uri: avatarUri } : LEO_ART.wave}
                alt={fullName}
              />
              <AvatarBadge className="bg-emerald-500 border-white" />
            </Avatar>

            <VStack className="flex-1 min-w-0" space="xs">
              <HStack className="items-center" space="xs">
                <Heading size="md" className="text-foreground flex-shrink" numberOfLines={1}>
                  {fullName}
                </Heading>
                {gamification?.verified ? (
                  <CheckCircle2 size={16} color="#1055F8" />
                ) : null}
              </HStack>
              <Text size="xs" className="text-muted-foreground" numberOfLines={1}>
                {me?.phone ?? center?.name ?? AppConfig.appName}
              </Text>
            </VStack>
          </HStack>

          <VStack space="xs">
            <HStack className="items-center justify-between">
              <Text size="xs" bold className="text-foreground">
                Level {levelNum}
              </Text>
              <Text size="xs" bold className="text-primary">
                {levelInto} / {levelSpan} XP
              </Text>
            </HStack>
            <Progress value={levelPct} className="h-2 bg-secondary rounded-full">
              <ProgressFilledTrack className="bg-primary rounded-full" />
            </Progress>
          </VStack>

          <Divider className="bg-border" />

          <HStack className="items-center">
            <VStack className="flex-1 items-center">
              <Text size="lg" bold className="text-foreground">
                {xp.toLocaleString()}
              </Text>
              <Text size="xs" className="text-muted-foreground">
                Total XP
              </Text>
            </VStack>
            <Divider orientation="vertical" className="h-7 bg-border" />
            <VStack className="flex-1 items-center">
              <Text size="lg" bold className="text-foreground">
                {coins.toLocaleString()}
              </Text>
              <Text size="xs" className="text-muted-foreground">
                Coins
              </Text>
            </VStack>
            <Divider orientation="vertical" className="h-7 bg-border" />
            <VStack className="flex-1 items-center">
              <Text size="lg" bold className="text-foreground">
                {freezes}
              </Text>
              <Text size="xs" className="text-muted-foreground">
                Freezes
              </Text>
            </VStack>
          </HStack>
        </VStack>
      </Card>

      {/* Streak Card */}
      <VStack space="sm">
        <Heading size="md" className="text-foreground">
          Daily Streak
        </Heading>
        <Card className="bg-card border border-border rounded-2xl p-4">
          <VStack space="md">
            <HStack className="items-center" space="md">
              <Center className="w-10 h-10 rounded-xl bg-orange-50">
                <Flame size={20} color="#EA580C" fill="#EA580C" />
              </Center>
              <VStack className="flex-1">
                <Text size="sm" bold className="text-foreground">
                  {streak}-day streak
                </Text>
                <Text size="xs" className="text-muted-foreground">
                  {longestStreak > 0
                    ? `Longest streak: ${longestStreak} days`
                    : 'Start learning today'}
                </Text>
              </VStack>
            </HStack>

            <HStack className="justify-between">
              {WEEKDAYS.map((day, idx) => {
                const done = idx < Math.min(7, streak);
                return (
                  <VStack key={`${day}-${idx}`} className="flex-1 items-center" space="xs">
                    <Center
                      className={`w-8 h-8 rounded-full ${
                        done ? 'bg-orange-500' : 'bg-secondary'
                      }`}
                    >
                      {done ? (
                        <Flame size={14} color="#FFFFFF" fill="#FFFFFF" />
                      ) : (
                        <Box className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                      )}
                    </Center>
                    <Text size="2xs" bold className="text-muted-foreground">
                      {day}
                    </Text>
                  </VStack>
                );
              })}
            </HStack>

            {today?.freeze.enabled !== false ? (
              <>
                <Divider className="bg-border" />
                <Pressable onPress={() => void handleBuyFreeze()}>
                  <HStack className="items-center justify-between">
                    <HStack className="items-center" space="sm">
                      <Snowflake size={17} color="#1055F8" />
                      <Text size="sm" bold className="text-foreground">
                        Buy Streak Freeze
                      </Text>
                    </HStack>
                    <Badge
                      variant="outline"
                      className="rounded-full bg-amber-50 border-amber-200 px-2.5 py-0.5 gap-1"
                    >
                      <Coins size={12} color="#D97706" />
                      <BadgeText className="text-amber-700 font-extrabold normal-case">
                        {today?.freeze.price ?? 100}
                      </BadgeText>
                    </Badge>
                  </HStack>
                </Pressable>
              </>
            ) : null}
          </VStack>
        </Card>
      </VStack>

      {/* Active Enrollments */}
      {enrollments.length > 0 ? (
        <VStack space="sm">
          <Heading size="md" className="text-foreground">
            My Classes
          </Heading>
          <Card className="bg-card border border-border rounded-2xl p-0 overflow-hidden">
            {enrollments.map((enr, idx) => (
              <Box key={enr.id}>
                {idx > 0 ? <Divider className="bg-border" /> : null}
                <HStack className="items-center p-3.5" space="md">
                  <Center className="w-10 h-10 rounded-xl bg-accent">
                    <GraduationCap size={18} color="#1055F8" />
                  </Center>
                  <VStack className="flex-1 min-w-0">
                    <Text size="sm" bold className="text-foreground" numberOfLines={1}>
                      {enr.course?.name ?? enr.level?.name ?? 'Impulse Class'}
                    </Text>
                    <Text size="xs" className="text-muted-foreground" numberOfLines={1}>
                      {[enr.level?.name, enr.group?.name].filter(Boolean).join(' · ') ||
                        enr.status}
                    </Text>
                  </VStack>
                  <Badge className="rounded-full bg-emerald-50 border-0 px-2.5 py-0.5">
                    <BadgeText className="text-emerald-700 text-[11px] font-bold">
                      {enr.status}
                    </BadgeText>
                  </Badge>
                </HStack>
              </Box>
            ))}
          </Card>
        </VStack>
      ) : null}

      {/* Achievements */}
      {achievements.length > 0 ? (
        <VStack space="sm">
          <Heading size="md" className="text-foreground">
            Badges
          </Heading>
          <Card className="bg-card border border-border rounded-2xl p-0 overflow-hidden">
            {achievements.map((item, idx) => (
              <Box key={item.id}>
                {idx > 0 ? <Divider className="bg-border" /> : null}
                <HStack className="items-center p-3.5" space="md">
                  <Center className="w-10 h-10 rounded-xl bg-amber-50">
                    <Award size={18} color="#D97706" />
                  </Center>
                  <VStack className="flex-1 min-w-0">
                    <Text size="sm" bold className="text-foreground" numberOfLines={1}>
                      {item.achievement.name}
                    </Text>
                    {item.achievement.description ? (
                      <Text size="xs" className="text-muted-foreground" numberOfLines={2}>
                        {item.achievement.description}
                      </Text>
                    ) : null}
                  </VStack>
                </HStack>
              </Box>
            ))}
          </Card>
        </VStack>
      ) : null}

      {/* Recent Coin Activity */}
      {transactions.length > 0 ? (
        <VStack space="sm">
          <Heading size="md" className="text-foreground">
            Recent Coins
          </Heading>
          <Card className="bg-card border border-border rounded-2xl p-0 overflow-hidden">
            {transactions.map((tx, idx) => (
              <Box key={tx.id}>
                {idx > 0 ? <Divider className="bg-border" /> : null}
                <HStack className="items-center p-3.5" space="md">
                  <Center className="w-9 h-9 rounded-xl bg-amber-50">
                    <Coins size={16} color="#D97706" />
                  </Center>
                  <VStack className="flex-1 min-w-0">
                    <Text size="sm" bold className="text-foreground" numberOfLines={1}>
                      {tx.description || tx.type}
                    </Text>
                    <Text size="xs" className="text-muted-foreground">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </Text>
                  </VStack>
                  <Text
                    size="sm"
                    bold
                    className={tx.amount >= 0 ? 'text-emerald-700' : 'text-destructive'}
                  >
                    {tx.amount >= 0 ? `+${tx.amount}` : tx.amount}
                  </Text>
                </HStack>
              </Box>
            ))}
          </Card>
        </VStack>
      ) : null}

      {/* Settings Card with Gluestack Switch & Bottom Sheet triggers */}
      <VStack space="sm">
        <Heading size="md" className="text-foreground">
          Settings
        </Heading>
        <Card className="bg-card border border-border rounded-2xl p-0 overflow-hidden">
          <Pressable
            onPress={() => setLangSheetOpen(true)}
            className="p-3.5 active:bg-accent/50"
          >
            <HStack className="items-center justify-between" space="md">
              <HStack className="items-center" space="sm">
                <Globe size={18} color="#475569" />
                <Text size="sm" bold className="text-foreground">
                  Language
                </Text>
              </HStack>
              <HStack className="items-center" space="xs">
                <Text size="sm" className="text-muted-foreground font-medium">
                  {LOCALE_LABELS[locale]}
                </Text>
                <ChevronRight size={16} color="#94A3B8" />
              </HStack>
            </HStack>
          </Pressable>

          {studentIds.length > 1 ? (
            <>
              <Divider className="bg-border" />
              <Pressable
                onPress={() => setChildSheetOpen(true)}
                className="p-3.5 active:bg-accent/50"
              >
                <HStack className="items-center justify-between" space="md">
                  <HStack className="items-center" space="sm">
                    <Users size={18} color="#475569" />
                    <Text size="sm" bold className="text-foreground">
                      Switch Student
                    </Text>
                  </HStack>
                  <HStack className="items-center" space="xs">
                    <Text size="sm" className="text-muted-foreground font-medium">
                      Child {Math.max(1, studentIds.indexOf(studentId ?? '') + 1)}
                    </Text>
                    <ChevronRight size={16} color="#94A3B8" />
                  </HStack>
                </HStack>
              </Pressable>
            </>
          ) : null}

          <Divider className="bg-border" />

          <HStack className="items-center justify-between px-3.5 py-2.5" space="md">
            <HStack className="items-center" space="sm">
              {soundEnabled ? (
                <Volume2 size={18} color="#1055F8" />
              ) : (
                <VolumeX size={18} color="#64748B" />
              )}
              <Text size="sm" bold className="text-foreground">
                Voice & Sound Effects
              </Text>
            </HStack>
            <Switch
              value={soundEnabled}
              onValueChange={(val) => setSoundEnabled(val)}
            />
          </HStack>
        </Card>
      </VStack>

      <Button
        variant="outline"
        size="lg"
        className="h-12 rounded-xl border-red-200 bg-card w-full"
        onPress={() => setSignOutDialogOpen(true)}
      >
        <ButtonIcon as={LogOut} className="text-destructive" />
        <ButtonText className="text-destructive font-bold">Sign Out</ButtonText>
      </Button>

      <Text size="xs" className="text-muted-foreground text-center mb-1">
        {AppConfig.appName} · {AppConfig.applicationId}
      </Text>

      {/* Language Picker Actionsheet (Bottom Sheet) */}
      <Actionsheet isOpen={langSheetOpen} onClose={() => setLangSheetOpen(false)}>
        <ActionsheetBackdrop />
        <ActionsheetContent className="bg-card px-4 pb-6 pt-2 rounded-t-3xl">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator className="bg-border w-12" />
          </ActionsheetDragIndicatorWrapper>
          <Heading size="md" className="text-foreground self-start px-2 py-2">
            Choose Language
          </Heading>
          {(['en', 'uz', 'ru'] as AppLocale[]).map((code) => {
            const active = locale === code;
            return (
              <ActionsheetItem
                key={code}
                className="justify-between rounded-xl px-3 py-3"
                onPress={() => {
                  void setLocale(code);
                  setLangSheetOpen(false);
                }}
              >
                <ActionsheetItemText
                  className={`text-base ${
                    active ? 'text-primary font-bold' : 'text-foreground font-medium'
                  }`}
                >
                  {LOCALE_LABELS[code]}
                </ActionsheetItemText>
                {active ? <Check size={18} color="#1055F8" /> : null}
              </ActionsheetItem>
            );
          })}
        </ActionsheetContent>
      </Actionsheet>

      {/* Multi-Child Switcher Actionsheet (Bottom Sheet) */}
      <Actionsheet isOpen={childSheetOpen} onClose={() => setChildSheetOpen(false)}>
        <ActionsheetBackdrop />
        <ActionsheetContent className="bg-card px-4 pb-6 pt-2 rounded-t-3xl">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator className="bg-border w-12" />
          </ActionsheetDragIndicatorWrapper>
          <Heading size="md" className="text-foreground self-start px-2 py-2">
            Switch Student
          </Heading>
          {studentIds.map((sid, idx) => {
            const active = sid === studentId;
            return (
              <ActionsheetItem
                key={sid}
                className="justify-between rounded-xl px-3 py-3"
                onPress={() => {
                  void switchStudent(sid);
                  setChildSheetOpen(false);
                }}
              >
                <ActionsheetItemText
                  className={`text-base ${
                    active ? 'text-primary font-bold' : 'text-foreground font-medium'
                  }`}
                >
                  Child {idx + 1}
                </ActionsheetItemText>
                {active ? <Check size={18} color="#1055F8" /> : null}
              </ActionsheetItem>
            );
          })}
        </ActionsheetContent>
      </Actionsheet>

      {/* Sign Out Confirmation AlertDialog */}
      <AlertDialog
        isOpen={signOutDialogOpen}
        onClose={() => setSignOutDialogOpen(false)}
      >
        <AlertDialogBackdrop />
        <AlertDialogContent className="bg-card rounded-2xl p-5 border border-border">
          <AlertDialogHeader>
            <Heading size="md" className="text-foreground">
              Sign out of Impulse Kids?
            </Heading>
          </AlertDialogHeader>
          <AlertDialogBody className="mt-2 mb-4">
            <Text size="sm" className="text-muted-foreground">
              Your progress is saved safely on Impulse servers. You can sign back in anytime with your Student ID or phone.
            </Text>
          </AlertDialogBody>
          <AlertDialogFooter className="gap-2.5">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-border flex-1 h-10"
              onPress={() => setSignOutDialogOpen(false)}
            >
              <ButtonText className="text-foreground font-semibold">Cancel</ButtonText>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="rounded-xl flex-1 h-10"
              onPress={async () => {
                setSignOutDialogOpen(false);
                await signOut();
                router.replace('/auth');
              }}
            >
              <ButtonText className="text-white font-bold">Sign Out</ButtonText>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Screen>
  );
}
