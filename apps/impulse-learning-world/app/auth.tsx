import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Eye, EyeOff, IdCard, KeyRound, Phone, ShieldCheck } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GameButton } from '@/components/game';
import { LeoMascot } from '@/components/mascot/LeoMascot';
import { Badge, Card, Input } from '@/components/ui';
import { useAppTheme } from '@/constants/Theme';
import { AppConfig } from '@/lib/config';
import {
  UZ_COUNTRY_CODE,
  digitsOnly,
  formatNationalNumber,
  isCompleteNationalNumber,
  toE164,
} from '@/lib/phone';
import { useKidsApp } from '@/providers/KidsAppProvider';

/**
 * Production Impulse Kids Sign-In screen (100% live backend API — no mock/demo mode):
 * - Connects directly to https://api.neezam.uz/api/v1 with x-erp-tenant: impulse
 * - Mirrors erp-lms/apps/student: toggle between Student ID (STU-000123 for kids without phones)
 *   and Uzbekistan mobile Phone (+998 XX XXX XX XX)
 * - Supports 6-digit OTP verification when required by backend
 */
export default function ImpulseKidsAuthScreen() {
  const router = useRouter();
  const { colors, typography, radii } = useAppTheme();
  const { center, signIn, verifyOtp, pendingChallenge } = useKidsApp();

  const [loginMethod, setLoginMethod] = useState<'id' | 'phone'>('id');
  const [studentCode, setStudentCode] = useState('');
  const [phoneDigits, setPhoneDigits] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    const login =
      loginMethod === 'id'
        ? studentCode.trim()
        : isCompleteNationalNumber(phoneDigits)
          ? toE164(phoneDigits)
          : '';

    if (!login) {
      setError(
        loginMethod === 'id'
          ? 'Enter your Student ID (for example, STU-000123).'
          : 'Enter a valid 9-digit Uzbekistan phone number.'
      );
      return;
    }
    if (!password) {
      setError('Enter your password.');
      return;
    }

    setError(null);
    setBusy(true);
    const res = await signIn(login, password);
    setBusy(false);

    if (!res.ok) {
      setError(res.error ?? 'Could not sign in.');
      return;
    }
    if (res.otpRequired) {
      setStep('otp');
      return;
    }
    router.replace('/(tabs)');
  };

  const handleVerifyOtp = async () => {
    if (otpCode.trim().length < 4) {
      setError('Enter the 6-digit verification code.');
      return;
    }
    setError(null);
    setBusy(true);
    const res = await verifyOtp(otpCode.trim());
    setBusy(false);

    if (!res.ok) {
      setError(res.error ?? 'Invalid verification code.');
      return;
    }
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.brandRow}>
            <Badge
              label={`${center?.name ?? AppConfig.appName} · Ages ${AppConfig.ageRange}`}
              tone="accent"
              dot
            />
          </View>

          <View style={styles.heroCenter}>
            <LeoMascot pose={error ? 'oops' : step === 'otp' ? 'think' : 'wave'} size={142} />
            <Text style={[typography.display, { color: colors.textPrimary, textAlign: 'center' }]}>
              {step === 'otp' ? 'Check Your Code!' : 'Impulse Kids'}
            </Text>
            <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center' }]}>
              {step === 'otp'
                ? `Enter the verification code sent to ${pendingChallenge?.destination ?? 'your phone'}.`
                : 'Sign in with your Impulse Student ID or parent phone number to open your enrolled courses.'}
            </Text>
          </View>

          <Card style={styles.formCard}>
            {step === 'credentials' ? (
              <>
                {/* Toggle: Student ID (kids without phones) vs Phone (+998) */}
                <View style={[styles.methodTabs, { backgroundColor: colors.surfaceMuted }]}>
                  <Pressable
                    onPress={() => {
                      setLoginMethod('id');
                      setError(null);
                    }}
                    style={[
                      styles.methodTab,
                      loginMethod === 'id'
                        ? [styles.methodTabActive, { backgroundColor: colors.surface, borderColor: colors.border }]
                        : null,
                    ]}
                  >
                    <IdCard
                      size={16}
                      color={loginMethod === 'id' ? '#1055F8' : colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.methodTabText,
                        { color: loginMethod === 'id' ? '#1055F8' : colors.textSecondary },
                      ]}
                    >
                      Student ID
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      setLoginMethod('phone');
                      setError(null);
                    }}
                    style={[
                      styles.methodTab,
                      loginMethod === 'phone'
                        ? [styles.methodTabActive, { backgroundColor: colors.surface, borderColor: colors.border }]
                        : null,
                    ]}
                  >
                    <Phone
                      size={16}
                      color={loginMethod === 'phone' ? '#1055F8' : colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.methodTabText,
                        { color: loginMethod === 'phone' ? '#1055F8' : colors.textSecondary },
                      ]}
                    >
                      Phone
                    </Text>
                  </Pressable>
                </View>

                {loginMethod === 'id' ? (
                  <Input
                    label="Student ID"
                    placeholder="STU-000123"
                    value={studentCode}
                    onChangeText={setStudentCode}
                    autoCapitalize="characters"
                    autoCorrect={false}
                  />
                ) : (
                  <Input
                    label={`Phone Number (${UZ_COUNTRY_CODE})`}
                    placeholder="90 123 45 67"
                    value={formatNationalNumber(phoneDigits)}
                    onChangeText={(txt) => setPhoneDigits(digitsOnly(txt))}
                    keyboardType="phone-pad"
                    maxLength={12}
                  />
                )}

                <View style={styles.passwordWrap}>
                  <Input
                    label="Password"
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <Pressable
                    onPress={() => setShowPassword((v) => !v)}
                    hitSlop={10}
                    style={styles.eyeBtn}
                  >
                    {showPassword ? (
                      <EyeOff size={18} color={colors.textSecondary} />
                    ) : (
                      <Eye size={18} color={colors.textSecondary} />
                    )}
                  </Pressable>
                </View>
              </>
            ) : (
              <Input
                label="6-Digit Verification Code"
                placeholder="123456"
                value={otpCode}
                onChangeText={setOtpCode}
                keyboardType="number-pad"
                maxLength={6}
              />
            )}

            {error ? (
              <View style={[styles.errorBox, { backgroundColor: '#FFDFE0', borderRadius: radii.md }]}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <GameButton
              label={
                busy
                  ? 'Connecting to Impulse...'
                  : step === 'otp'
                    ? 'Verify & Enter'
                    : 'Sign In to Impulse Kids'
              }
              disabled={busy}
              color="#1055F8"
              depthColor="#0A3BB3"
              icon={
                step === 'otp' ? (
                  <ShieldCheck size={18} color="#FFFFFF" />
                ) : (
                  <KeyRound size={18} color="#FFFFFF" />
                )
              }
              onPress={step === 'otp' ? handleVerifyOtp : handleSignIn}
            />

            {step === 'otp' ? (
              <Pressable
                onPress={() => {
                  setStep('credentials');
                  setOtpCode('');
                  setError(null);
                }}
                style={styles.linkBtn}
              >
                <Text style={[typography.callout, { color: '#1055F8' }]}>
                  Use a different account
                </Text>
              </Pressable>
            ) : null}
          </Card>

          <Text style={[typography.caption, { color: colors.textTertiary, textAlign: 'center' }]}>
            {AppConfig.applicationId} · Live Impulse Learning Center API
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scroll: {
    padding: 18,
    gap: 18,
    justifyContent: 'center',
    flexGrow: 1,
  },
  brandRow: {
    alignItems: 'center',
  },
  heroCenter: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  formCard: {
    gap: 14,
  },
  methodTabs: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 14,
    gap: 4,
  },
  methodTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
  },
  methodTabActive: {
    borderWidth: 1,
  },
  methodTabText: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  passwordWrap: {
    position: 'relative',
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    bottom: 13,
    padding: 4,
  },
  errorBox: {
    padding: 11,
    borderWidth: 1.5,
    borderColor: '#FF4B4B',
  },
  errorText: {
    color: '#CC1D1D',
    fontSize: 13.5,
    fontWeight: '700',
  },
  linkBtn: {
    alignItems: 'center',
    paddingVertical: 4,
  },
});
