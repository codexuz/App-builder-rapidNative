import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { ArrowLeft, Check, RotateCcw, RotateCw, Volume2 } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge, BadgeText } from '@/components/gluestack/badge';
import { Box } from '@/components/gluestack/box';
import { Button, ButtonIcon, ButtonText } from '@/components/gluestack/button';
import { Card } from '@/components/gluestack/card';
import { Center } from '@/components/gluestack/center';
import { Divider } from '@/components/gluestack/divider';
import { Heading } from '@/components/gluestack/heading';
import { HStack } from '@/components/gluestack/hstack';
import { Image } from '@/components/gluestack/image';
import { Pressable } from '@/components/gluestack/pressable';
import { Progress, ProgressFilledTrack } from '@/components/gluestack/progress';
import { Text } from '@/components/gluestack/text';
import { VStack } from '@/components/gluestack/vstack';
import { ConfettiBurst, speakEnglishText } from '@/components/game';
import { LeoMascot } from '@/components/mascot/LeoMascot';
import { GeneratedAssets } from '@/constants/GeneratedAssets';
import { useKidsApp } from '@/providers/KidsAppProvider';
import { playCorrectFeedback, playTileTapSound } from '@/utils/soundFeedback';

export default function WordsReviewScreen() {
  const router = useRouter();
  const { dueWords, soundEnabled, gradeVocabWord } = useKidsApp();

  const [flipped, setFlipped] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);

  const cards = dueWords?.cards ?? [];
  const current = cards[0] ?? null;
  const totalCount = Math.max(
    1,
    (dueWords?.counts.due ?? cards.length) + (dueWords?.counts.learned ?? 0)
  );
  const doneRatio = Math.min(
    100,
    Math.round(((dueWords?.counts.learned ?? 0) / totalCount) * 100)
  );

  const handleGrade = async (grade: 'AGAIN' | 'GOOD') => {
    if (!current) return;
    if (grade === 'GOOD') {
      playCorrectFeedback(soundEnabled);
      setConfettiKey((k) => k + 1);
    } else {
      playTileTapSound(undefined, soundEnabled);
    }
    setFlipped(false);
    await gradeVocabWord(current.id, grade);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ConfettiBurst triggerKey={confettiKey} intensity="small" />

      <HStack className="items-center px-4 py-2.5 bg-card" space="sm">
        <Button
          size="icon"
          variant="secondary"
          className="h-9 w-9 rounded-full"
          onPress={() => router.back()}
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={18} color="#0F172A" />
        </Button>
        <VStack className="flex-1 min-w-0">
          <Heading size="sm" className="text-foreground">
            Word Cards
          </Heading>
          <Text size="xs" className="text-muted-foreground">
            {cards.length > 0 ? `${cards.length} left to review` : 'All caught up'}
          </Text>
        </VStack>
        <Badge variant="secondary" className="rounded-full px-2.5">
          <BadgeText className="text-muted-foreground font-bold normal-case">
            {doneRatio}%
          </BadgeText>
        </Badge>
      </HStack>

      <Progress value={doneRatio} className="h-2.5 bg-slate-200 rounded-none">
        <ProgressFilledTrack className="bg-success rounded-r-full" />
      </Progress>

      <Center className="flex-1 px-5 py-5">
        {current ? (
          <VStack className="w-full max-w-[380px]">
            <Center className="-mb-3 z-10">
              <LeoMascot pose={flipped ? 'cheer' : 'think'} size={102} />
            </Center>

            <Pressable
              onPress={() => {
                playTileTapSound(current.term, soundEnabled);
                setFlipped((f) => !f);
              }}
            >
              <Card
                variant={flipped ? 'success' : 'default'}
                className="rounded-3xl p-5 min-h-[300px] border-b-[6px]"
              >
                <HStack className="items-center justify-between">
                  <Badge className="rounded-full bg-accent border-0 px-3 py-1">
                    <BadgeText className="text-primary font-bold normal-case">
                      {current.partOfSpeech ?? 'word'}
                    </BadgeText>
                  </Badge>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-10 w-10 rounded-xl bg-accent"
                    onPress={() => speakEnglishText(current.term)}
                    accessibilityLabel="Listen to word"
                  >
                    <Volume2 size={18} color="#1055F8" />
                  </Button>
                </HStack>

                <Center className="flex-1 py-4">
                  <VStack space="sm" className="items-center w-full">
                    <Heading size="2xl" className="text-foreground text-center">
                      {current.term}
                    </Heading>
                    {current.pronunciation ? (
                      <Text size="sm" className="text-muted-foreground font-medium">
                        {current.pronunciation}
                      </Text>
                    ) : null}

                    {flipped ? (
                      <VStack space="sm" className="items-center w-full mt-2">
                        <Divider className="w-14 bg-border my-1" />
                        <Text size="lg" bold className="text-emerald-700 text-center">
                          {current.meaning}
                        </Text>
                        {current.example ? (
                          <Text
                            size="sm"
                            italic
                            className="text-muted-foreground text-center leading-5"
                          >
                            &ldquo;{current.example}&rdquo;
                          </Text>
                        ) : null}
                      </VStack>
                    ) : (
                      <HStack className="items-center mt-5" space="xs">
                        <RotateCw size={14} color="#64748B" />
                        <Text size="xs" className="text-muted-foreground font-semibold">
                          Tap card to reveal meaning
                        </Text>
                      </HStack>
                    )}
                  </VStack>
                </Center>
              </Card>
            </Pressable>
          </VStack>
        ) : (
          <Card className="rounded-3xl p-6 w-full max-w-[360px]">
            <VStack space="md" className="items-center">
              <Image
                source={GeneratedAssets.wordCards}
                alt="Word cards mastered"
                size="none"
                resizeMode="contain"
                style={{ width: 92, height: 92 }}
              />
              <Heading size="xl" className="text-foreground text-center">
                All words reviewed!
              </Heading>
              <Text size="sm" className="text-muted-foreground text-center">
                Complete more lessons to unlock fresh vocabulary cards.
              </Text>
              <Button
                size="lg"
                variant="success"
                className="w-full mt-1"
                onPress={() => router.back()}
              >
                <ButtonText>Back to Learn</ButtonText>
              </Button>
            </VStack>
          </Card>
        )}
      </Center>

      {current ? (
        <Box className="px-4 py-3.5 bg-card border-t-2 border-border">
          <HStack space="sm">
            <Button
              variant="destructive"
              size="lg"
              className="flex-1 px-3"
              onPress={() => void handleGrade('AGAIN')}
            >
              <ButtonIcon as={RotateCcw} className="text-white" />
              <ButtonText className="text-sm" numberOfLines={1}>
                Again
              </ButtonText>
            </Button>
            <Button
              variant="success"
              size="lg"
              className="flex-1 px-3"
              onPress={() => void handleGrade('GOOD')}
            >
              <ButtonIcon as={Check} className="text-white" />
              <ButtonText className="text-sm" numberOfLines={1}>
                I Know It
              </ButtonText>
            </Button>
          </HStack>
        </Box>
      ) : null}
    </SafeAreaView>
  );
}
