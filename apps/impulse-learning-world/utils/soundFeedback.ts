import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

const CORRECT_PHRASES = [
  'Awesome!',
  'Great job!',
  'Spot on!',
  'You nailed it!',
  'Brilliant!',
];

const WRONG_PHRASES = [
  'Nice try! Check the tip below.',
  'Almost there! Look at the right answer.',
  'Good effort! Let us try the next one.',
];

let audioCtx: AudioContext | null = null;

function getWebAudioContext(): AudioContext | null {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  try {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    if (!audioCtx) audioCtx = new Ctor();
    if (audioCtx.state === 'suspended') {
      void audioCtx.resume();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

function playWebNote(
  ctx: AudioContext,
  freq: number,
  startOffsetSec: number,
  durationSec: number,
  peakGain: number,
  type: OscillatorType = 'triangle'
) {
  const now = ctx.currentTime + startOffsetSec;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(peakGain, now + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + durationSec + 0.02);
}

/**
 * Speak short kid-friendly voice feedback aloud using SpeechSynthesis on Web.
 */
export function speakFeedbackPhrase(text: string, rate = 1.0, pitch = 1.08) {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = rate;
    u.pitch = pitch;
    window.speechSynthesis.speak(u);
  } catch {
    // Gracefully ignore in headless / restricted environments
  }
}

/**
 * Soft tactile click/pop when tapping a 3D word tile (optionally speaks the word).
 */
export function playTileTapSound(word?: string, soundEnabled = true) {
  if (Platform.OS !== 'web') {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
  if (!soundEnabled) return;

  const ctx = getWebAudioContext();
  if (ctx) {
    playWebNote(ctx, 540, 0, 0.065, 0.14, 'sine');
  }
  if (word) {
    speakFeedbackPhrase(word, 0.96, 1.04);
  }
}

/**
 * Cheerful Duolingo-style ascending chime + voice praise for correct answers.
 */
export function playCorrectFeedback(soundEnabled = true) {
  if (Platform.OS !== 'web') {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }
  if (!soundEnabled) return;

  const ctx = getWebAudioContext();
  if (ctx) {
    playWebNote(ctx, 587.33, 0.0, 0.22, 0.2, 'triangle'); // D5
    playWebNote(ctx, 880.0, 0.09, 0.36, 0.24, 'triangle'); // A5
    playWebNote(ctx, 1174.66, 0.16, 0.3, 0.12, 'sine'); // D6 sparkle
  }

  const phrase = CORRECT_PHRASES[Math.floor(Math.random() * CORRECT_PHRASES.length)];
  setTimeout(() => speakFeedbackPhrase(phrase, 1.02, 1.12), 180);
}

/**
 * Gentle kid-friendly descending double-tone + encouraging voice cue for wrong answers.
 */
export function playWrongFeedback(soundEnabled = true) {
  if (Platform.OS !== 'web') {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }
  if (!soundEnabled) return;

  const ctx = getWebAudioContext();
  if (ctx) {
    playWebNote(ctx, 261.63, 0.0, 0.18, 0.18, 'sine'); // C4
    playWebNote(ctx, 207.65, 0.11, 0.28, 0.2, 'sine'); // Ab3
  }

  const phrase = WRONG_PHRASES[Math.floor(Math.random() * WRONG_PHRASES.length)];
  setTimeout(() => speakFeedbackPhrase(phrase, 0.96, 1.0), 220);
}

/**
 * Joyful ascending arpeggio fanfare + voice celebration when clearing a lesson.
 */
export function playVictoryFeedback(soundEnabled = true) {
  if (Platform.OS !== 'web') {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }
  if (!soundEnabled) return;

  const ctx = getWebAudioContext();
  if (ctx) {
    playWebNote(ctx, 523.25, 0.0, 0.22, 0.18, 'triangle');
    playWebNote(ctx, 659.25, 0.09, 0.24, 0.2, 'triangle');
    playWebNote(ctx, 783.99, 0.18, 0.28, 0.22, 'triangle');
    playWebNote(ctx, 1046.5, 0.28, 0.55, 0.26, 'triangle');
  }

  setTimeout(() => speakFeedbackPhrase('Woohoo! Lesson complete!', 1.0, 1.14), 320);
}
