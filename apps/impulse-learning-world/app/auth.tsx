import React, { useState } from 'react';
import { Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import {
  AlertCircle,
  Eye,
  EyeOff,
  IdCard,
  KeyRound,
  Phone,
  ShieldCheck,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert, AlertIcon, AlertText } from '@/components/gluestack/alert';
import { Box } from '@/components/gluestack/box';
import { Button, ButtonSpinner, ButtonText } from '@/components/gluestack/button';
import { Card } from '@/components/gluestack/card';
import { Center } from '@/components/gluestack/center';
import {
  FormControl,
  FormControlHelper,
  FormControlHelperText,
  FormControlLabel,
  FormControlLabelText,
} from '@/components/gluestack/form-control';
import { Heading } from '@/components/gluestack/heading';
import { KeyboardAvoidingView } from '@/components/gluestack/keyboard-avoiding-view';
import { Input, InputField, InputIcon, InputSlot } from '@/components/gluestack/input';
import { Tabs, TabsList, TabsTrigger, TabsTriggerText } from '@/components/gluestack/tabs';
import { Text } from '@/components/gluestack/text';
import { VStack } from '@/components/gluestack/vstack';
import { LeoMascot } from '@/components/mascot/LeoMascot';
import { AppConfig } from '@/lib/config';
import {
  UZ_COUNTRY_CODE,
  digitsOnly,
  formatNationalNumber,
  isCompleteNationalNumber,
  toE164,
} from '@/lib/phone';
import { useKidsApp } from '@/providers/KidsAppProvider';

// Duolingo-style segmented control: raised 3D key cap for the active method.
const TAB_ON = 'bg-card border-border border-b-lip';
const TAB_OFF = 'bg-transparent border-transparent';

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
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingHorizontal: 20,
            paddingVertical: 28,
            gap: 24,
          }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          automaticallyAdjustKeyboardInsets
          showsVerticalScrollIndicator={false}
        >
          <VStack space="sm" className="items-center">
            <Center className="w-32 h-32 rounded-full bg-accent border-2 border-primary/15 border-b-4 border-b-primary/25 mb-1">
              <LeoMascot
                pose={error ? 'oops' : step === 'otp' ? 'think' : 'wave'}
                size={112}
              />
            </Center>
            <Heading size="2xl" className="text-foreground text-center tracking-tight">
              {step === 'otp' ? 'Verification Code' : 'Impulse Kids'}
            </Heading>
            <Text
              size="sm"
              className="text-muted-foreground text-center max-w-[300px] leading-5"
            >
              {step === 'otp'
                ? `We sent a 6-digit code to ${pendingChallenge?.destination ?? 'your phone'}.`
                : `Sign in to ${center?.name ?? 'Impulse'} with your Student ID or phone number.`}
            </Text>
          </VStack>

          <Card className="p-5">
            <VStack space="lg">
              {step === 'credentials' ? (
                <>
                  <Tabs
                    value={loginMethod}
                    onValueChange={(val: string) => {
                      setLoginMethod(val === 'phone' ? 'phone' : 'id');
                      setError(null);
                    }}
                  >
                    <TabsList className="w-full">
                      <TabsTrigger
                        value="id"
                        className={`flex-1 rounded-xl py-2 flex-row items-center justify-center gap-1.5 border-2 border-b-4 ${
                          loginMethod === 'id' ? TAB_ON : TAB_OFF
                        }`}
                      >
                        <IdCard
                          size={15}
                          color={loginMethod === 'id' ? '#1055F8' : '#64748B'}
                        />
                        <TabsTriggerText
                          className={`text-sm font-extrabold ${
                            loginMethod === 'id' ? 'text-primary' : 'text-muted-foreground'
                          }`}
                        >
                          Student ID
                        </TabsTriggerText>
                      </TabsTrigger>

                      <TabsTrigger
                        value="phone"
                        className={`flex-1 rounded-xl py-2 flex-row items-center justify-center gap-1.5 border-2 border-b-4 ${
                          loginMethod === 'phone' ? TAB_ON : TAB_OFF
                        }`}
                      >
                        <Phone
                          size={15}
                          color={loginMethod === 'phone' ? '#1055F8' : '#64748B'}
                        />
                        <TabsTriggerText
                          className={`text-sm font-extrabold ${
                            loginMethod === 'phone' ? 'text-primary' : 'text-muted-foreground'
                          }`}
                        >
                          Phone
                        </TabsTriggerText>
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <FormControl isInvalid={Boolean(error)}>
                    <FormControlLabel className="mb-1.5">
                      <FormControlLabelText className="text-foreground font-bold text-sm">
                        {loginMethod === 'id'
                          ? 'Student ID'
                          : `Phone Number (${UZ_COUNTRY_CODE})`}
                      </FormControlLabelText>
                    </FormControlLabel>

                    {loginMethod === 'id' ? (
                      <Input>
                        <InputSlot className="pr-2">
                          <InputIcon as={IdCard} className="text-muted-foreground" />
                        </InputSlot>
                        <InputField
                          placeholder="STU-000123"
                          value={studentCode}
                          onChangeText={setStudentCode}
                          autoCapitalize="characters"
                          autoCorrect={false}
                        />
                      </Input>
                    ) : (
                      <Input>
                        <InputSlot className="pr-2">
                          <Text size="sm" bold className="text-muted-foreground">
                            {UZ_COUNTRY_CODE}
                          </Text>
                        </InputSlot>
                        <InputField
                          placeholder="90 123 45 67"
                          value={formatNationalNumber(phoneDigits)}
                          onChangeText={(txt) => setPhoneDigits(digitsOnly(txt))}
                          keyboardType="phone-pad"
                          maxLength={12}
                        />
                      </Input>
                    )}

                    <FormControlHelper className="mt-1">
                      <FormControlHelperText className="text-xs text-muted-foreground">
                        {loginMethod === 'id'
                          ? 'Ask your Impulse teacher if you forgot your Student ID.'
                          : 'Enter the phone number linked to your student account.'}
                      </FormControlHelperText>
                    </FormControlHelper>
                  </FormControl>

                  <FormControl isInvalid={Boolean(error)}>
                    <FormControlLabel className="mb-1.5">
                      <FormControlLabelText className="text-foreground font-bold text-sm">
                        Password
                      </FormControlLabelText>
                    </FormControlLabel>

                    <Input>
                      <InputSlot className="pr-2">
                        <InputIcon as={KeyRound} className="text-muted-foreground" />
                      </InputSlot>
                      <InputField
                        placeholder="Enter your password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                      />
                      <InputSlot
                        className="pl-2"
                        onPress={() => setShowPassword((v) => !v)}
                      >
                        <InputIcon
                          as={showPassword ? EyeOff : Eye}
                          className="text-muted-foreground"
                        />
                      </InputSlot>
                    </Input>
                  </FormControl>
                </>
              ) : (
                <FormControl isInvalid={Boolean(error)}>
                  <FormControlLabel className="mb-1.5">
                    <FormControlLabelText className="text-foreground font-bold text-sm">
                      6-Digit Verification Code
                    </FormControlLabelText>
                  </FormControlLabel>
                  <Input className="min-h-16">
                    <InputSlot className="pr-2">
                      <InputIcon as={ShieldCheck} className="text-primary" />
                    </InputSlot>
                    <InputField
                      placeholder="123456"
                      value={otpCode}
                      onChangeText={setOtpCode}
                      keyboardType="number-pad"
                      maxLength={6}
                      className="text-foreground text-xl font-bold tracking-widest text-center"
                    />
                  </Input>
                </FormControl>
              )}

              {error ? (
                <Alert
                  variant="destructive"
                  className="rounded-2xl bg-red-50 border-2 border-red-200 border-b-4 border-b-red-300 px-3.5 py-2.5"
                >
                  <AlertIcon as={AlertCircle} className="text-destructive" />
                  <AlertText className="text-destructive text-xs font-semibold">
                    {error}
                  </AlertText>
                </Alert>
              ) : null}

              <Button
                size="lg"
                variant="success"
                isDisabled={busy}
                className="w-full"
                onPress={step === 'otp' ? handleVerifyOtp : handleSignIn}
              >
                {busy ? <ButtonSpinner color="#FFFFFF" /> : null}
                <ButtonText>
                  {busy
                    ? 'Signing in...'
                    : step === 'otp'
                      ? 'Verify Code'
                      : 'Sign In'}
                </ButtonText>
              </Button>

              {step === 'otp' ? (
                <Button
                  variant="link"
                  size="sm"
                  onPress={() => {
                    setStep('credentials');
                    setOtpCode('');
                    setError(null);
                  }}
                >
                  <ButtonText className="text-primary font-semibold">
                    Use a different account
                  </ButtonText>
                </Button>
              ) : null}
            </VStack>
          </Card>

          <Box className="items-center">
            <Text size="xs" className="text-muted-foreground font-medium">
              {AppConfig.applicationId}
            </Text>
          </Box>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
