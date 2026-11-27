import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Flame,
  Globe,
  GraduationCap,
  LogOut,
  RefreshCw,
  Shield,
  Snowflake,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react-native';
import { Coin3D, GameButton, ProgressBar, Star3D, XpBolt3D } from '@/components/game';
import { LEO_ART } from '@/components/mascot/LeoMascot';
import {
  AnimatedCounter,
  Badge,
  Card,
  Chip,
  Screen,
  SectionHeader,
} from '@/components/ui';
import { GeneratedAssets } from '@/constants/GeneratedAssets';
import { useAppTheme } from '@/constants/Theme';
import { api } from '@/lib/api';
import type { AppLocale } from '@/lib/api/types';
import { AppConfig } from '@/lib/config';
import { useKidsApp } from '@/providers/KidsAppProvider';

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function KidsProfileScreen() {
  const router = useRouter();
  const { colors, typography, radii } = useAppTheme();
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

  const [notice, setNotice] = useState<string | null>(null);

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
  const achievements = gamification?.achievements ?? [];
  const transactions = (gamification?.transactions ?? []).slice(0, 6);

  const handleBuyFreeze = async () => {
    const res = await buyStreakFreeze();
    setNotice(res.message);
  };

  return (
    <Screen hasTabBar>
      {/* Kid Explorer Hero Card */}
      <Card style={styles.heroCard}>
        <View style={styles.heroRow}>
          <View style={[styles.avatarFrame, { borderColor: '#1055F8' }]}>
            <Image
              source={avatarUri ? { uri: avatarUri } : LEO_ART.wave}
              style={styles.heroAvatar}
            />
          </View>
          <View style={styles.heroText}>
            <Text style={[typography.title1, { color: colors.textPrimary }]}>{fullName}</Text>
            <Text style={[typography.callout, { color: colors.textSecondary }]}>
              {me?.phone ?? center?.name ?? AppConfig.appName}
            </Text>
            <View style={styles.heroBadges}>
              <Badge label={`Level ${levelNum}`} tone="accent" dot />
              {gamification?.verified ? <Badge label="Verified" tone="success" /> : null}
            </View>
          </View>
        </View>

        <View style={styles.levelTrack}>
          <View style={styles.levelMetaRow}>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>
              Level {levelNum} Progress
            </Text>
            <Text style={[typography.caption, { color: '#1055F8', fontWeight: '800' }]}>
              {levelInto} / {levelSpan} XP
            </Text>
          </View>
          <ProgressBar progress={Math.min(1, levelInto / levelSpan)} color="#1055F8" height={10} />
        </View>

        <View style={styles.counterRow}>
          <View style={[styles.counterBox, { backgroundColor: colors.xpMuted, borderRadius: radii.md }]}>
            <XpBolt3D size={22} />
            <AnimatedCounter value={xp} style={[styles.counterVal, { color: colors.textPrimary }]} />
            <Text style={[typography.caption, { color: colors.textSecondary }]}>Total XP</Text>
          </View>
          <View style={[styles.counterBox, { backgroundColor: colors.coinMuted, borderRadius: radii.md }]}>
            <Coin3D size={22} />
            <AnimatedCounter value={coins} style={[styles.counterVal, { color: colors.textPrimary }]} />
            <Text style={[typography.caption, { color: colors.textSecondary }]}>Coins</Text>
          </View>
          <View style={[styles.counterBox, { backgroundColor: '#E0F2FE', borderRadius: radii.md }]}>
            <Snowflake size={20} color="#0284C7" />
            <AnimatedCounter value={freezes} style={[styles.counterVal, { color: colors.textPrimary }]} />
            <Text style={[typography.caption, { color: colors.textSecondary }]}>Freezes</Text>
          </View>
        </View>
      </Card>

      {notice ? (
        <Card variant="muted" style={styles.noticeRow}>
          <Sparkles size={16} color="#1055F8" />
          <Text style={[typography.callout, { color: colors.textPrimary, flex: 1 }]}>{notice}</Text>
        </Card>
      ) : null}

      {/* Active Center Enrollments from /academic/enrollments */}
      {enrollments.length > 0 ? (
        <Card style={styles.accountCard}>
          <SectionHeader
            title="My Impulse Classes"
            subtitle="Active enrollments synced from Impulse"
          />
          {enrollments.map((enr) => (
            <View key={enr.id} style={[styles.enrollRow, { borderColor: colors.border, borderRadius: radii.md }]}>
              <View style={[styles.enrollIcon, { backgroundColor: '#DBEAFE' }]}>
                <GraduationCap size={18} color="#1055F8" />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[typography.headline, { color: colors.textPrimary }]}>
                  {enr.course?.name ?? enr.level?.name ?? 'Impulse Class'}
                </Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                  {[enr.level?.name, enr.group?.name].filter(Boolean).join(' · ') || enr.status}
                </Text>
              </View>
              <Badge label={enr.status} tone={enr.status === 'ACTIVE' ? 'success' : 'neutral'} />
            </View>
          ))}
        </Card>
      ) : null}

      {/* Multi-Child Parent Switcher & Account Sync */}
      <Card style={styles.accountCard}>
        <SectionHeader
          title="Impulse Kids Account"
          subtitle={`Signed in to ${center?.name ?? AppConfig.centerSlug}`}
          actionLabel={loading ? 'Syncing...' : 'Sync'}
          onActionPress={() => void refreshAll()}
        />

        {studentIds.length > 1 ? (
          <View style={styles.childRow}>
            {studentIds.map((sid, i) => (
              <Chip
                key={sid}
                label={`Child ${i + 1}`}
                selected={sid === studentId}
                onPress={() => void switchStudent(sid)}
              />
            ))}
          </View>
        ) : null}

        <View style={styles.accountBtns}>
          <Pressable
            onPress={() => void refreshAll()}
            style={[styles.syncBtn, { backgroundColor: '#EFF6FF', borderRadius: radii.md }]}
          >
            <RefreshCw size={15} color="#1055F8" />
            <Text style={[typography.callout, { color: '#1055F8' }]}>Refresh Live Data</Text>
          </Pressable>
          <GameButton
            label="Sign Out"
            color="#FF4B4B"
            depthColor="#EA2B2B"
            icon={<LogOut size={16} color="#FFFFFF" />}
            onPress={async () => {
              await signOut();
              router.replace('/auth');
            }}
          />
        </View>
      </Card>

      {/* Streak Flame + Freeze (100% live from gamification.streak & today.freeze) */}
      <Card style={styles.streakCard}>
        <View style={styles.streakHeaderRow}>
          <Image
            source={GeneratedAssets.streakFlame}
            style={styles.streakFlameImg}
            resizeMode="contain"
          />
          <View style={{ flex: 1 }}>
            <SectionHeader
              title={`${streak}-Day Streak Flame`}
              subtitle={
                longestStreak > 0
                  ? `Best streak: ${longestStreak} days`
                  : 'Complete a lesson today to start your streak!'
              }
            />
          </View>
        </View>

        <View style={styles.weekRow}>
          {WEEKDAYS.map((day, idx) => {
            const done = idx < Math.min(7, streak);
            return (
              <View key={`${day}-${idx}`} style={styles.dayCol}>
                <View
                  style={[
                    styles.dayBubble,
                    { backgroundColor: done ? colors.streak : colors.surfaceMuted },
                  ]}
                >
                  {done ? (
                    <Flame size={16} color="#FFFFFF" fill="#FFFFFF" />
                  ) : (
                    <View style={[styles.emptyDot, { backgroundColor: colors.borderStrong }]} />
                  )}
                </View>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>{day}</Text>
              </View>
            );
          })}
        </View>

        {today?.freeze.enabled !== false ? (
          <Pressable
            onPress={handleBuyFreeze}
            style={[styles.freezeBtn, { backgroundColor: '#EFF6FF', borderRadius: radii.md }]}
          >
            <Snowflake size={16} color="#0284C7" />
            <Text style={[typography.callout, { color: '#0369A1', flex: 1 }]}>
              Buy Streak Freeze ({today?.freeze.price ?? 0} Coins)
            </Text>
            <Badge label={`${freezes} held`} tone="accent" />
          </Pressable>
        ) : null}
      </Card>

      {/* Recent Coin Activity from gamification.transactions */}
      {transactions.length > 0 ? (
        <Card style={styles.achCard}>
          <SectionHeader
            title="Recent Coin Activity"
            subtitle="Live wallet history"
          />
          {transactions.map((tx) => (
            <View key={tx.id} style={styles.txRow}>
              <Coin3D size={20} />
              <View style={{ flex: 1 }}>
                <Text style={[typography.callout, { color: colors.textPrimary }]} numberOfLines={1}>
                  {tx.description || tx.type}
                </Text>
                <Text style={[typography.caption, { color: colors.textTertiary }]}>
                  {new Date(tx.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <Text
                style={[
                  typography.headline,
                  { color: tx.amount >= 0 ? '#3B8700' : '#DC2626' },
                ]}
              >
                {tx.amount >= 0 ? `+${tx.amount}` : tx.amount}
              </Text>
            </View>
          ))}
        </Card>
      ) : null}

      {/* Earned Achievements */}
      {achievements.length > 0 ? (
        <Card style={styles.achCard}>
          <SectionHeader
            title="Leo Trophy Badges"
            subtitle={`${achievements.length} earned`}
          />
          {achievements.map((item) => (
            <View key={item.id} style={styles.achRow}>
              <Star3D size={28} filled />
              <View style={{ flex: 1 }}>
                <Text style={[typography.headline, { color: colors.textPrimary }]}>
                  {item.achievement.name}
                </Text>
                {item.achievement.description ? (
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>
                    {item.achievement.description}
                  </Text>
                ) : null}
              </View>
            </View>
          ))}
        </Card>
      ) : null}

      {/* Kid Preferences: Language (EN/UZ/RU) & Sound */}
      <Card style={styles.prefsCard}>
        <View style={styles.prefRow}>
          <Globe size={18} color="#1055F8" />
          <Text style={[typography.headline, { color: colors.textPrimary, flex: 1 }]}>
            App Language
          </Text>
        </View>
        <View style={styles.langRow}>
          {(['en', 'uz', 'ru'] as AppLocale[]).map((code) => (
            <Chip
              key={code}
              label={code === 'en' ? 'English' : code === 'uz' ? 'O‘zbekcha' : 'Русский'}
              selected={locale === code}
              onPress={() => void setLocale(code)}
            />
          ))}
        </View>

        <Pressable
          onPress={() => setSoundEnabled(!soundEnabled)}
          style={[styles.soundRow, { borderTopColor: colors.border }]}
        >
          {soundEnabled ? (
            <Volume2 size={18} color="#1055F8" />
          ) : (
            <VolumeX size={18} color={colors.textTertiary} />
          )}
          <Text style={[typography.callout, { color: colors.textPrimary, flex: 1 }]}>
            Leo Voice & Sound Effects
          </Text>
          <Badge label={soundEnabled ? 'On' : 'Muted'} tone={soundEnabled ? 'success' : 'neutral'} />
        </Pressable>

        <View style={[styles.footerNote, { borderTopColor: colors.border }]}>
          <Shield size={14} color={colors.textTertiary} />
          <Text style={[typography.caption, { color: colors.textTertiary }]}>
            {AppConfig.appName} · {AppConfig.applicationId} · Ages {AppConfig.ageRange}
          </Text>
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    gap: 14,
    paddingVertical: 18,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarFrame: {
    borderWidth: 3,
    borderRadius: 42,
    padding: 3,
    backgroundColor: '#DBEAFE',
  },
  heroAvatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
  },
  heroText: {
    flex: 1,
    gap: 3,
  },
  heroBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  levelTrack: {
    gap: 6,
  },
  levelMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  counterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  counterBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    gap: 3,
  },
  counterVal: {
    fontSize: 18,
    fontWeight: '900',
  },
  noticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  accountCard: {
    gap: 12,
  },
  enrollRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderWidth: 1,
  },
  enrollIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  childRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  accountBtns: {
    gap: 10,
  },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  streakCard: {
    gap: 14,
  },
  streakHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  streakFlameImg: {
    width: 44,
    height: 44,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  dayCol: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  dayBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  freezeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 11,
  },
  achCard: {
    gap: 12,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  achRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  prefsCard: {
    gap: 12,
  },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  langRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  soundRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
