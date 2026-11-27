import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, ShoppingBag, Sparkles } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Coin3D, ConfettiBurst, GameButton, Star3D } from '@/components/game';
import { LeoMascot } from '@/components/mascot/LeoMascot';
import { Badge, Card, SectionHeader } from '@/components/ui';
import { useAppTheme } from '@/constants/Theme';
import { api } from '@/lib/api';
import { useKidsApp } from '@/providers/KidsAppProvider';
import { playCorrectFeedback } from '@/utils/soundFeedback';

/**
 * Impulse Kids Coin Shop wired 100% to live /shop/products & /shop/orders.
 */
export default function KidsCoinShopScreen() {
  const router = useRouter();
  const { colors, typography } = useAppTheme();
  const { products, orders, gamification, today, soundEnabled, orderShopProduct } = useKidsApp();

  const [notice, setNotice] = useState<string | null>(null);
  const [confettiKey, setConfettiKey] = useState(0);

  const coins = gamification?.wallet?.cachedCoinBalance ?? today?.coins ?? 0;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ConfettiBurst triggerKey={confettiKey} intensity="grand" />

      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: colors.surfaceMuted }]}
        >
          <ArrowLeft size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={[typography.title2, { color: colors.textPrimary, flex: 1 }]}>
          Impulse Coin Shop
        </Text>
        <View style={[styles.coinPill, { backgroundColor: colors.coinMuted }]}>
          <Coin3D size={18} />
          <Text style={styles.coinText}>{coins}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card variant="gradient" gradientColors={['#1055F8', '#38BDF8']} style={styles.banner}>
          <View style={styles.bannerRow}>
            <LeoMascot pose="cheer" size={76} />
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={[typography.title2, { color: '#FFFFFF' }]}>
                Spend Your Hard-Earned Coins!
              </Text>
              <Text style={styles.bannerSub}>
                Finish Impulse Kids lessons to collect Coins and claim real prizes at your center.
              </Text>
            </View>
          </View>
        </Card>

        {notice ? (
          <Card variant="muted" style={styles.noticeRow}>
            <Sparkles size={16} color="#1055F8" />
            <Text style={[typography.callout, { color: colors.textPrimary, flex: 1 }]}>
              {notice}
            </Text>
          </Card>
        ) : null}

        {products.length > 0 ? (
          <View style={styles.grid}>
            {products.map((prod) => {
              const canAfford = coins >= prod.priceCoins;
              const imgUri = api.assetUrl(prod.imageUrl);
              return (
                <Card key={prod.id} style={styles.card}>
                  <View style={styles.iconBox}>
                    {imgUri ? (
                      <Image source={{ uri: imgUri }} style={styles.prodImg} resizeMode="cover" />
                    ) : (
                      <Star3D size={40} filled />
                    )}
                  </View>
                  <Text style={[typography.headline, { color: colors.textPrimary, textAlign: 'center' }]}>
                    {prod.name}
                  </Text>
                  {prod.description ? (
                    <Text
                      style={[typography.caption, { color: colors.textSecondary, textAlign: 'center' }]}
                      numberOfLines={2}
                    >
                      {prod.description}
                    </Text>
                  ) : null}
                  <View style={{ width: '100%', marginTop: 4 }}>
                    <GameButton
                      label={`${prod.priceCoins} Coins`}
                      size="md"
                      disabled={!canAfford}
                      color="#58CC02"
                      depthColor="#46A302"
                      icon={<Coin3D size={16} />}
                      onPress={async () => {
                        const res = await orderShopProduct(prod);
                        setNotice(res.message);
                        if (res.ok) {
                          setConfettiKey((k) => k + 1);
                          playCorrectFeedback(soundEnabled);
                        }
                      }}
                    />
                  </View>
                </Card>
              );
            })}
          </View>
        ) : (
          <Card style={styles.emptyCard}>
            <LeoMascot pose="idle" size={96} />
            <Text style={[typography.headline, { color: colors.textPrimary }]}>
              No Prizes Available Yet
            </Text>
            <Text style={[typography.caption, { color: colors.textSecondary, textAlign: 'center' }]}>
              Check back soon when your Impulse center adds new rewards!
            </Text>
          </Card>
        )}

        {orders.length > 0 ? (
          <>
            <SectionHeader title="My Orders" subtitle={`${orders.length} order(s)`} />
            <View style={{ gap: 10 }}>
              {orders.slice(0, 6).map((ord) => (
                <Card key={ord.id} style={styles.orderRow}>
                  <ShoppingBag size={18} color="#1055F8" />
                  <View style={{ flex: 1 }}>
                    <Text style={[typography.headline, { color: colors.textPrimary }]}>
                      {ord.totalCoins} Coins
                    </Text>
                    <Text style={[typography.caption, { color: colors.textSecondary }]}>
                      {new Date(ord.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <Badge
                    label={ord.status}
                    tone={ord.status === 'DELIVERED' ? 'success' : 'accent'}
                  />
                </Card>
              ))}
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
  },
  coinText: {
    color: '#B45309',
    fontSize: 13.5,
    fontWeight: '900',
  },
  scroll: {
    padding: 16,
    gap: 14,
  },
  banner: {
    paddingVertical: 14,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bannerSub: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  noticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  card: {
    width: '48.2%',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  iconBox: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  prodImg: {
    width: 58,
    height: 58,
  },
  emptyCard: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 24,
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});
