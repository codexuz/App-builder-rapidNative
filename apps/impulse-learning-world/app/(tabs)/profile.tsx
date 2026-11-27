import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Award,
  CheckCircle2,
  Coins,
  Flame,
  Globe,
  GraduationCap,
  LogOut,
  RefreshCw,
  Snowflake,
  Volume2,
  VolumeX,
} from 'lucide-react-native';
import { GameButton } from '@/components/game';
import { LEO_ART } from '@/components/mascot/LeoMascot';
import { Screen } from '@/components/ui';
import { DS } from '@/constants/DesignSystem';
import { api } from '@/lib/api';
import type { AppLocale } from '@/lib/api/types';
import { AppConfig } from '@/lib/config';
import { useKidsApp } from '@/providers/KidsAppProvider';

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function KidsProfileScreen() {
  const router = useRouter();
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
  const levelPct = Math.min(100, Math.round((levelInto / levelSpan) * 100));
  const achievements = gamification?.achievements ?? [];
  const transactions = (gamification?.transactions ?? []).slice(0, 5);

  const handleBuyFreeze = async () => {
    const res = await buyStreakFreeze();
    setNotice(res.message);
  };

  return (
    <Screen hasTabBar refreshing={loading} onRefresh={() => void refreshAll()}>
      <View style={styles.pageHeader}>
        <Text style={DS.type.pageTitle}>Profile</Text>
        <Pressable
          onPress={() => void refreshAll()}
          hitSlop={8}
          style={styles.refreshBtn}
          accessibilityLabel="Refresh live data"
        >
          <RefreshCw size={17} color={DS.colors.inkSecondary} />
        </Pressable>
      </View>

      {/* Unified Student Summary Card */}
      <View style={[DS.card, styles.heroCard]}>
        <View style={styles.identityRow}>
          <View style={styles.avatarRing}>
            <Image
              source={avatarUri ? { uri: avatarUri } : LEO_ART.wave}
              style={styles.avatarImg}
            />
          </View>
          <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
            <View style={styles.nameLine}>
              <Text style={styles.studentName} numberOfLines={1}>
                {fullName}
              </Text>
              {gamification?.verified ? (
                <CheckCircle2 size={17} color={DS.colors.brand} />
              ) : null}
            </View>
            <Text style={DS.type.caption} numberOfLines={1}>
              {me?.phone ?? center?.name ?? AppConfig.appName}
            </Text>
          </View>
        </View>

        <View style={styles.levelBlock}>
          <View style={styles.levelTop}>
            <Text style={styles.levelTitle}>Level {levelNum}</Text>
            <Text style={styles.levelNumbers}>
              {levelInto} / {levelSpan} XP
            </Text>
          </View>
          <View style={styles.levelTrack}>
            <View style={[styles.levelFill, { width: `${levelPct}%` }]} />
          </View>
        </View>

        <View style={styles.metricsStrip}>
          <View style={styles.metricCell}>
            <Text style={DS.type.metric}>{xp.toLocaleString()}</Text>
            <Text style={DS.type.caption}>Total XP</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricCell}>
            <Text style={DS.type.metric}>{coins.toLocaleString()}</Text>
            <Text style={DS.type.caption}>Coins</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricCell}>
            <Text style={DS.type.metric}>{freezes}</Text>
            <Text style={DS.type.caption}>Freezes</Text>
          </View>
        </View>
      </View>

      {notice ? (
        <View style={[DS.card, styles.noticeCard]}>
          <Text style={DS.type.body}>{notice}</Text>
        </View>
      ) : null}

      {/* Multi-Child Parent Switcher */}
      {studentIds.length > 1 ? (
        <View style={styles.section}>
          <Text style={DS.type.sectionTitle}>Switch Student</Text>
          <View style={styles.chipRow}>
            {studentIds.map((sid, idx) => {
              const active = sid === studentId;
              return (
                <Pressable
                  key={sid}
                  onPress={() => void switchStudent(sid)}
                  style={[styles.choicePill, active ? styles.choicePillActive : null]}
                >
                  <Text style={[styles.choiceText, active ? styles.choiceTextActive : null]}>
                    Child {idx + 1}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      {/* Streak Card */}
      <View style={styles.section}>
        <Text style={DS.type.sectionTitle}>Daily Streak</Text>
        <View style={[DS.card, styles.streakCard]}>
          <View style={styles.streakHead}>
            <View style={styles.flameIconBox}>
              <Flame size={20} color={DS.colors.orange} fill={DS.colors.orange} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={DS.type.cardTitle}>{streak}-day streak</Text>
              <Text style={DS.type.caption}>
                {longestStreak > 0 ? `Longest streak: ${longestStreak} days` : 'Start learning today'}
              </Text>
            </View>
          </View>

          <View style={styles.weekRow}>
            {WEEKDAYS.map((day, idx) => {
              const done = idx < Math.min(7, streak);
              return (
                <View key={`${day}-${idx}`} style={styles.dayItem}>
                  <View style={[styles.dayCircle, done ? styles.dayCircleDone : null]}>
                    {done ? (
                      <Flame size={15} color="#FFFFFF" fill="#FFFFFF" />
                    ) : (
                      <View style={styles.dayDot} />
                    )}
                  </View>
                  <Text style={styles.dayLabel}>{day}</Text>
                </View>
              );
            })}
          </View>

          {today?.freeze.enabled !== false ? (
            <Pressable onPress={handleBuyFreeze} style={styles.freezeRow}>
              <Snowflake size={17} color={DS.colors.brand} />
              <Text style={styles.freezeText}>Buy Streak Freeze</Text>
              <View style={styles.freezePrice}>
                <Coins size={13} color={DS.colors.amberDeep} />
                <Text style={styles.freezePriceText}>{today?.freeze.price ?? 100}</Text>
              </View>
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* Active Enrollments */}
      {enrollments.length > 0 ? (
        <View style={styles.section}>
          <Text style={DS.type.sectionTitle}>My Classes</Text>
          <View style={[DS.card, styles.groupedCard]}>
            {enrollments.map((enr, idx) => (
              <View
                key={enr.id}
                style={[styles.listRow, idx > 0 ? styles.rowDivider : null]}
              >
                <View style={[styles.rowIcon, { backgroundColor: DS.colors.brandSoft }]}>
                  <GraduationCap size={18} color={DS.colors.brand} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={DS.type.cardTitle} numberOfLines={1}>
                    {enr.course?.name ?? enr.level?.name ?? 'Impulse Class'}
                  </Text>
                  <Text style={DS.type.caption} numberOfLines={1}>
                    {[enr.level?.name, enr.group?.name].filter(Boolean).join(' · ') || enr.status}
                  </Text>
                </View>
                <View style={styles.statusPill}>
                  <Text style={styles.statusText}>{enr.status}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {/* Achievements */}
      {achievements.length > 0 ? (
        <View style={styles.section}>
          <Text style={DS.type.sectionTitle}>Badges</Text>
          <View style={[DS.card, styles.groupedCard]}>
            {achievements.map((item, idx) => (
              <View
                key={item.id}
                style={[styles.listRow, idx > 0 ? styles.rowDivider : null]}
              >
                <View style={[styles.rowIcon, { backgroundColor: DS.colors.amberSoft }]}>
                  <Award size={18} color={DS.colors.amberDeep} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={DS.type.cardTitle} numberOfLines={1}>
                    {item.achievement.name}
                  </Text>
                  {item.achievement.description ? (
                    <Text style={DS.type.caption} numberOfLines={2}>
                      {item.achievement.description}
                    </Text>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {/* Recent Coin Activity */}
      {transactions.length > 0 ? (
        <View style={styles.section}>
          <Text style={DS.type.sectionTitle}>Recent Coins</Text>
          <View style={[DS.card, styles.groupedCard]}>
            {transactions.map((tx, idx) => (
              <View
                key={tx.id}
                style={[styles.listRow, idx > 0 ? styles.rowDivider : null]}
              >
                <View style={[styles.rowIcon, { backgroundColor: DS.colors.amberSoft }]}>
                  <Coins size={17} color={DS.colors.amberDeep} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={DS.type.cardTitle} numberOfLines={1}>
                    {tx.description || tx.type}
                  </Text>
                  <Text style={DS.type.caption}>
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.txAmount,
                    { color: tx.amount >= 0 ? DS.colors.greenInk : DS.colors.redInk },
                  ]}
                >
                  {tx.amount >= 0 ? `+${tx.amount}` : tx.amount}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {/* Preferences */}
      <View style={styles.section}>
        <Text style={DS.type.sectionTitle}>Settings</Text>
        <View style={[DS.card, styles.groupedCard]}>
          <View style={styles.prefBlock}>
            <View style={styles.prefTitleRow}>
              <Globe size={17} color={DS.colors.inkSecondary} />
              <Text style={DS.type.cardTitle}>Language</Text>
            </View>
            <View style={styles.chipRow}>
              {(['en', 'uz', 'ru'] as AppLocale[]).map((code) => {
                const active = locale === code;
                return (
                  <Pressable
                    key={code}
                    onPress={() => void setLocale(code)}
                    style={[styles.choicePill, active ? styles.choicePillActive : null]}
                  >
                    <Text style={[styles.choiceText, active ? styles.choiceTextActive : null]}>
                      {code === 'en' ? 'English' : code === 'uz' ? 'O‘zbekcha' : 'Русский'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Pressable
            onPress={() => setSoundEnabled(!soundEnabled)}
            style={[styles.listRow, styles.rowDivider]}
          >
            {soundEnabled ? (
              <Volume2 size={18} color={DS.colors.brand} />
            ) : (
              <VolumeX size={18} color={DS.colors.inkMuted} />
            )}
            <Text style={[DS.type.cardTitle, { flex: 1 }]}>Voice & Sound Effects</Text>
            <Text style={[styles.soundState, { color: soundEnabled ? DS.colors.greenInk : DS.colors.inkMuted }]}>
              {soundEnabled ? 'On' : 'Off'}
            </Text>
          </Pressable>
        </View>
      </View>

      <GameButton
        label="Sign Out"
        color={DS.colors.red}
        depthColor={DS.colors.redDeep}
        icon={<LogOut size={16} color="#FFFFFF" />}
        onPress={async () => {
          await signOut();
          router.replace('/auth');
        }}
      />

      <Text style={styles.versionFoot}>
        {AppConfig.appName} · {AppConfig.applicationId}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: DS.colors.surface,
    borderWidth: 1,
    borderColor: DS.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    padding: 18,
    gap: 16,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: DS.colors.brandSoft,
    borderWidth: 2,
    borderColor: DS.colors.brandBorder,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImg: {
    width: 58,
    height: 58,
  },
  nameLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  studentName: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '800',
    color: DS.colors.ink,
    letterSpacing: -0.3,
  },
  levelBlock: {
    gap: 6,
  },
  levelTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: DS.colors.ink,
  },
  levelNumbers: {
    fontSize: 12.5,
    fontWeight: '700',
    color: DS.colors.brand,
    fontVariant: ['tabular-nums'],
  },
  levelTrack: {
    height: 7,
    borderRadius: 4,
    backgroundColor: DS.colors.surfaceSubtle,
    overflow: 'hidden',
  },
  levelFill: {
    height: 7,
    borderRadius: 4,
    backgroundColor: DS.colors.brand,
  },
  metricsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: DS.colors.border,
  },
  metricCell: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  metricDivider: {
    width: 1,
    height: 28,
    backgroundColor: DS.colors.border,
  },
  noticeCard: {
    padding: 12,
  },
  section: {
    gap: 10,
  },
  streakCard: {
    padding: 16,
    gap: 16,
  },
  streakHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flameIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: DS.colors.orangeSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayItem: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  dayCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: DS.colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleDone: {
    backgroundColor: DS.colors.orange,
  },
  dayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: DS.colors.borderStrong,
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: DS.colors.inkMuted,
  },
  freezeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: DS.colors.border,
  },
  freezeText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: DS.colors.ink,
  },
  freezePrice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: DS.colors.amberSoft,
  },
  freezePriceText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: DS.colors.amberInk,
    fontVariant: ['tabular-nums'],
  },
  groupedCard: {
    overflow: 'hidden',
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  rowDivider: {
    borderTopWidth: 1,
    borderTopColor: DS.colors.border,
  },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusPill: {
    backgroundColor: DS.colors.greenSoft,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    color: DS.colors.greenInk,
  },
  txAmount: {
    fontSize: 14.5,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  prefBlock: {
    padding: 14,
    gap: 10,
  },
  prefTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  choicePill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: DS.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  choicePillActive: {
    backgroundColor: DS.colors.brandSoft,
    borderColor: DS.colors.brandBorder,
  },
  choiceText: {
    fontSize: 13,
    fontWeight: '700',
    color: DS.colors.inkSecondary,
  },
  choiceTextActive: {
    color: DS.colors.brand,
  },
  soundState: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  versionFoot: {
    fontSize: 12,
    fontWeight: '600',
    color: DS.colors.inkSubtle,
    textAlign: 'center',
    marginBottom: 4,
  },
});
