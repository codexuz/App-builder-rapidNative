import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ArrowUpRight, Layers, Sparkles, Zap } from 'lucide-react-native';
import {
  Badge,
  BottomSheet,
  Button,
  Card,
  Chip,
  Input,
  Screen,
  SectionHeader,
  StatTile,
} from '@/components/ui';
import { useAppTheme } from '@/constants/Theme';

const CATEGORIES = ['Overview', 'Design System', 'Assets', 'Motion'] as const;

export default function HomeScreen() {
  const { colors, typography } = useAppTheme();
  const [selected, setSelected] = useState<(typeof CATEGORIES)[number]>('Overview');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [note, setNote] = useState('');

  return (
    <Screen hasTabBar>
      <View style={styles.header}>
        <Badge label="Expo + Kie.ai Ready" tone="accent" dot />
        <Text style={[typography.display, { color: colors.textPrimary }]}>
          Starter Studio
        </Text>
        <Text style={[typography.body, { color: colors.textSecondary }]}>
          Cross-platform mobile template with tactile UI primitives, tokenized themes, and Kie.ai asset support.
        </Text>
      </View>

      <Card variant="gradient" style={styles.heroCard}>
        <View style={styles.heroTop}>
          <Badge label="Design System" tone="neutral" />
          <Sparkles size={20} color="#FFFFFF" />
        </View>
        <Text style={[typography.title1, { color: '#FFFFFF' }]}>
          Crafted for iOS, Android & Web
        </Text>
        <Text style={[typography.callout, { color: 'rgba(255,255,255,0.82)' }]}>
          Replace this starter screen with your app domain, theme preset, and Kie.ai generated artwork.
        </Text>
        <Button
          label="Open Quick Sheet"
          variant="secondary"
          rightIcon={<ArrowUpRight size={16} color={colors.textPrimary} />}
          onPress={() => setSheetOpen(true)}
        />
      </Card>

      <View style={styles.chipRow}>
        {CATEGORIES.map((category) => (
          <Chip
            key={category}
            label={category}
            selected={selected === category}
            onPress={() => setSelected(category)}
          />
        ))}
      </View>

      <SectionHeader
        title="Reusable Primitives"
        subtitle={`Showing: ${selected}`}
      />

      <View style={styles.statsRow}>
        <StatTile
          label="Components"
          value="12"
          trend="Ready"
          trendTone="success"
          icon={<Layers size={16} color={colors.accent} />}
        />
        <StatTile
          label="Platforms"
          value="3"
          trend="iOS · Android · Web"
          trendTone="accent"
          icon={<Zap size={16} color={colors.accent} />}
        />
      </View>

      <BottomSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Quick Action"
        subtitle="Example reusable BottomSheet & Input primitive"
      >
        <Input
          label="Project Note"
          placeholder="Describe your next screen..."
          value={note}
          onChangeText={setNote}
        />
        <Button
          label="Done"
          fullWidth
          onPress={() => setSheetOpen(false)}
        />
      </BottomSheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 8,
    paddingTop: 8,
  },
  heroCard: {
    gap: 12,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
});
