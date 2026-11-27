import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Eye, EyeOff, IdCard, Phone } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GameButton } from '@/components/game';
import { LeoMascot } from '@/components/mascot/LeoMascot';
import { DS } from '@/constants/DesignSystem';
import { AppConfig } from '@/lib/config';
import {
  UZ_COUNTRY_CODE,
  digitsOnly,
  formatNationalNumber,
  isCompleteNationalNumber,
  toE164,
} from '@/lib/phone';
import { useKidsApp } from '@/providers/KidsAppProvider';

export default function ImpulseKidsAuthScreen() {
  const router = useRouter();
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
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <View style={styles.leoHalo}>
              <LeoMascot pose={error ? 'oops' : step === 'otp' ? 'think' : 'wave'} size={126} />
            </View>
            <Text style={styles.title}>
              {step === 'otp' ? 'Enter Verification Code' : 'Impulse Kids'}
            </Text>
            <Text style={styles.subtitle}>
              {step === 'otp'
                ? `We sent a 6-digit code to ${pendingChallenge?.destination ?? 'your phone'}.`
                : `Sign in to ${center?.name ?? 'Impulse'} with your Student ID or phone number.`}
            </Text>
          </View>

          <View style={[DS.card, styles.formCard]}>
            {step === 'credentials' ? (
              <>
                <View style={styles.segmentTrack}>
                  <Pressable
                    onPress={() => {
                      setLoginMethod('id');
                      setError(null);
                    }}
                    style={[styles.segmentBtn, loginMethod === 'id' ? styles.segmentActive : null]}
                  >
                    <IdCard
                      size={16}
                      color={loginMethod === 'id' ? DS.colors.brand : DS.colors.inkMuted}
                    />
                    <Text
                      style={[
                        styles.segmentLabel,
                        loginMethod === 'id' ? styles.segmentLabelActive : null,
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
                    style={[styles.segmentBtn, loginMethod === 'phone' ? styles.segmentActive : null]}
                  >
                    <Phone
                      size={16}
                      color={loginMethod === 'phone' ? DS.colors.brand : DS.colors.inkMuted}
                    />
                    <Text
                      style={[
                        styles.segmentLabel,
                        loginMethod === 'phone' ? styles.segmentLabelActive : null,
                      ]}
                    >
                      Phone
                    </Text>
                  </Pressable>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>
                    {loginMethod === 'id' ? 'Student ID' : `Phone Number (${UZ_COUNTRY_CODE})`}
                  </Text>
                  {loginMethod === 'id' ? (
                    <TextInput
                      placeholder="STU-000123"
                      placeholderTextColor={DS.colors.inkSubtle}
                      value={studentCode}
                      onChangeText={setStudentCode}
                      autoCapitalize="characters"
                      autoCorrect={false}
                      style={styles.input}
                    />
                  ) : (
                    <View style={styles.phoneWrap}>
                      <Text style={styles.phonePrefix}>{UZ_COUNTRY_CODE}</Text>
                      <TextInput
                        placeholder="90 123 45 67"
                        placeholderTextColor={DS.colors.inkSubtle}
                        value={formatNationalNumber(phoneDigits)}
                        onChangeText={(txt) => setPhoneDigits(digitsOnly(txt))}
                        keyboardType="phone-pad"
                        maxLength={12}
                        style={styles.phoneInput}
                      />
                    </View>
                  )}
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Password</Text>
                  <View style={styles.passwordRow}>
                    <TextInput
                      placeholder="Enter your password"
                      placeholderTextColor={DS.colors.inkSubtle}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      style={styles.passwordInput}
                    />
                    <Pressable
                      onPress={() => setShowPassword((v) => !v)}
                      hitSlop={10}
                      style={styles.eyeBtn}
                    >
                      {showPassword ? (
                        <EyeOff size={18} color={DS.colors.inkMuted} />
                      ) : (
                        <Eye size={18} color={DS.colors.inkMuted} />
                      )}
                    </Pressable>
                  </View>
                </View>
              </>
            ) : (
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>6-Digit Code</Text>
                <TextInput
                  placeholder="123456"
                  placeholderTextColor={DS.colors.inkSubtle}
                  value={otpCode}
                  onChangeText={setOtpCode}
                  keyboardType="number-pad"
                  maxLength={6}
                  style={[styles.input, styles.otpInput]}
                />
              </View>
            )}

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={{ marginTop: 4 }}>
              <GameButton
                label={
                  busy
                    ? 'Signing in...'
                    : step === 'otp'
                      ? 'Verify Code'
                      : 'Sign In'
                }
                disabled={busy}
                color={DS.colors.brand}
                depthColor={DS.colors.brandDeep}
                onPress={step === 'otp' ? handleVerifyOtp : handleSignIn}
              />
            </View>

            {step === 'otp' ? (
              <Pressable
                onPress={() => {
                  setStep('credentials');
                  setOtpCode('');
                  setError(null);
                }}
                style={styles.switchLink}
              >
                <Text style={styles.switchLinkText}>Use a different account</Text>
              </Pressable>
            ) : null}
          </View>

          <Text style={styles.footerText}>{AppConfig.applicationId}</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: DS.colors.canvas,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 28,
    gap: 24,
  },
  hero: {
    alignItems: 'center',
    gap: 8,
  },
  leoHalo: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: DS.colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    ...DS.type.pageTitle,
    fontSize: 28,
    lineHeight: 34,
    textAlign: 'center',
  },
  subtitle: {
    ...DS.type.body,
    color: DS.colors.inkSecondary,
    textAlign: 'center',
    maxWidth: 300,
  },
  formCard: {
    padding: 20,
    gap: 16,
  },
  segmentTrack: {
    flexDirection: 'row',
    backgroundColor: DS.colors.surfaceSubtle,
    padding: 4,
    borderRadius: 12,
    gap: 4,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 38,
    borderRadius: 9,
  },
  segmentActive: {
    backgroundColor: DS.colors.surface,
    borderWidth: 1,
    borderColor: DS.colors.border,
  },
  segmentLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: DS.colors.inkMuted,
  },
  segmentLabelActive: {
    color: DS.colors.brand,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: DS.colors.ink,
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: DS.colors.border,
    backgroundColor: DS.colors.canvas,
    paddingHorizontal: 14,
    fontSize: 15,
    fontWeight: '600',
    color: DS.colors.ink,
  },
  phoneWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: DS.colors.border,
    backgroundColor: DS.colors.canvas,
    paddingHorizontal: 14,
    gap: 8,
  },
  phonePrefix: {
    fontSize: 15,
    fontWeight: '700',
    color: DS.colors.inkSecondary,
  },
  phoneInput: {
    flex: 1,
    height: 46,
    fontSize: 15,
    fontWeight: '600',
    color: DS.colors.ink,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: DS.colors.border,
    backgroundColor: DS.colors.canvas,
    paddingLeft: 14,
    paddingRight: 8,
  },
  passwordInput: {
    flex: 1,
    height: 46,
    fontSize: 15,
    fontWeight: '600',
    color: DS.colors.ink,
  },
  eyeBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpInput: {
    textAlign: 'center',
    fontSize: 22,
    letterSpacing: 6,
    fontWeight: '800',
  },
  errorBox: {
    backgroundColor: DS.colors.redSoft,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  errorText: {
    color: DS.colors.redInk,
    fontSize: 13,
    fontWeight: '700',
  },
  switchLink: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  switchLinkText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: DS.colors.brand,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '600',
    color: DS.colors.inkSubtle,
    textAlign: 'center',
  },
});
