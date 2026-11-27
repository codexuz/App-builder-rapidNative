import React from 'react';
import { useRouter } from 'expo-router';
import {
  BookOpen,
  Coins,
  EllipsisVertical,
  Flame,
  LogOut,
  RefreshCw,
  Store,
  User,
  Zap,
} from 'lucide-react-native';
import {
  Avatar,
  AvatarBadge,
  AvatarFallbackText,
  AvatarImage,
} from '@/components/gluestack/avatar';
import { Badge, BadgeText } from '@/components/gluestack/badge';
import { HStack } from '@/components/gluestack/hstack';
import {
  Menu,
  MenuItem,
  MenuItemLabel,
  MenuSeparator,
} from '@/components/gluestack/menu';
import { Pressable } from '@/components/gluestack/pressable';
import { Text } from '@/components/gluestack/text';
import { VStack } from '@/components/gluestack/vstack';
import { LEO_ART } from '@/components/mascot/LeoMascot';
import { api } from '@/lib/api';
import { useKidsApp } from '@/providers/KidsAppProvider';

export interface GameHudProps {
  onAvatarPress?: () => void;
}

/**
 * Gluestack-powered top header bar:
 * - Left: Gluestack Avatar (with fallback text, image, & active badge) + Name & Level
 * - Right: Compact Gluestack Badges for Streak / Coins / XP + Gluestack Menu dropdown
 */
export function GameHud({ onAvatarPress }: GameHudProps) {
  const router = useRouter();
  const { me, gamification, today, refreshAll, signOut } = useKidsApp();

  const firstName = me?.firstName || 'Student';
  const fullName = me ? `${me.firstName} ${me.lastName ?? ''}`.trim() : 'Student';
  const levelNum = today?.level.level ?? 1;
  const streak = gamification?.streak?.currentStreak ?? 0;
  const activeToday = gamification?.streak?.activeToday ?? false;
  const coins = gamification?.wallet?.cachedCoinBalance ?? today?.coins ?? 0;
  const xp = gamification?.wallet?.cachedXp ?? today?.level.xp ?? 0;
  const avatarUri = api.assetUrl(me?.avatarUrl);

  return (
    <HStack className="items-center justify-between py-1" space="sm">
      <Pressable
        onPress={onAvatarPress ?? (() => router.push('/(tabs)/profile'))}
        accessibilityRole="button"
        accessibilityLabel="Open profile"
        className="flex-row items-center gap-2.5 flex-shrink min-w-0"
      >
        <Avatar className="h-10 w-10 bg-accent border border-primary/25">
          {avatarUri ? (
            <AvatarFallbackText className="text-primary font-bold">
              {fullName}
            </AvatarFallbackText>
          ) : null}
          <AvatarImage
            source={avatarUri ? { uri: avatarUri } : LEO_ART.wave}
            alt={fullName}
          />
          {activeToday ? (
            <AvatarBadge className="bg-emerald-500 border-white" />
          ) : null}
        </Avatar>

        <VStack className="flex-shrink min-w-0">
          <Text
            size="md"
            bold
            className="text-foreground leading-tight"
            numberOfLines={1}
          >
            {firstName}
          </Text>
          <Text size="xs" className="text-muted-foreground font-semibold">
            Level {levelNum}
          </Text>
        </VStack>
      </Pressable>

      <HStack className="items-center" space="xs">
        <Badge
          variant="outline"
          className="h-8 px-2.5 rounded-full bg-card border-border gap-1"
        >
          <Flame size={14} color="#EA580C" fill="#EA580C" />
          <BadgeText className="text-orange-700 font-extrabold normal-case">
            {streak}
          </BadgeText>
        </Badge>

        <Badge
          variant="outline"
          className="h-8 px-2.5 rounded-full bg-card border-border gap-1"
        >
          <Coins size={14} color="#D97706" />
          <BadgeText className="text-amber-700 font-extrabold normal-case">
            {coins}
          </BadgeText>
        </Badge>

        <Badge
          variant="outline"
          className="h-8 px-2.5 rounded-full bg-card border-border gap-1"
        >
          <Zap size={14} color="#1055F8" fill="#1055F8" />
          <BadgeText className="text-primary font-extrabold normal-case">
            {xp}
          </BadgeText>
        </Badge>

        <Menu
          placement="bottom right"
          offset={6}
          trigger={({ ...triggerProps }) => (
            <Pressable
              {...triggerProps}
              accessibilityRole="button"
              accessibilityLabel="Open quick menu"
              className="h-8 w-8 rounded-full bg-card border border-border items-center justify-center active:bg-accent"
            >
              <EllipsisVertical size={16} color="#475569" />
            </Pressable>
          )}
        >
          <MenuItem
            key="words"
            textValue="Word Cards"
            onPress={() => router.push('/words' as never)}
            className="gap-2.5 py-2.5"
          >
            <BookOpen size={15} color="#1055F8" />
            <MenuItemLabel className="text-sm font-semibold text-foreground">
              Word Cards
            </MenuItemLabel>
          </MenuItem>

          <MenuItem
            key="shop"
            textValue="Coin Shop"
            onPress={() => router.push('/shop' as never)}
            className="gap-2.5 py-2.5"
          >
            <Store size={15} color="#D97706" />
            <MenuItemLabel className="text-sm font-semibold text-foreground">
              Coin Shop
            </MenuItemLabel>
          </MenuItem>

          <MenuItem
            key="profile"
            textValue="My Profile"
            onPress={() => router.push('/(tabs)/profile')}
            className="gap-2.5 py-2.5"
          >
            <User size={15} color="#475569" />
            <MenuItemLabel className="text-sm font-semibold text-foreground">
              My Profile
            </MenuItemLabel>
          </MenuItem>

          <MenuItem
            key="refresh"
            textValue="Refresh Data"
            onPress={() => void refreshAll()}
            className="gap-2.5 py-2.5"
          >
            <RefreshCw size={15} color="#475569" />
            <MenuItemLabel className="text-sm font-semibold text-foreground">
              Refresh Data
            </MenuItemLabel>
          </MenuItem>

          <MenuSeparator />

          <MenuItem
            key="signout"
            textValue="Sign Out"
            onPress={async () => {
              await signOut();
              router.replace('/auth');
            }}
            className="gap-2.5 py-2.5"
          >
            <LogOut size={15} color="#DC2626" />
            <MenuItemLabel className="text-sm font-semibold text-destructive">
              Sign Out
            </MenuItemLabel>
          </MenuItem>
        </Menu>
      </HStack>
    </HStack>
  );
}
