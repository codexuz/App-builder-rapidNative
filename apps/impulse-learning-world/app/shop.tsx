import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowLeft, Coins, Gift, ShoppingBag, Sparkles } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ConfettiBurst, GameButton } from '@/components/game';
import { LeoMascot } from '@/components/mascot/LeoMascot';
import { DS } from '@/constants/DesignSystem';
import { api } from '@/lib/api';
import { useKidsApp } from '@/providers/KidsAppProvider';
import { playCorrectFeedback } from '@/utils/soundFeedback';

export default function KidsCoinShopScreen() {
  const router = useRouter();
  const { products, orders, gamification, today, soundEnabled, orderShopProduct } = useKidsApp();

  const [notice, setNotice] = useState<string | null>(null);
  const [confettiKey, setConfettiKey] = useState(0);

  const coins = gamification?.wallet?.cachedCoinBalance ?? today?.coins ?? 0;

  return (
    <SafeAreaView style={styles.safe}>
      <ConfettiBurst triggerKey={confettiKey} intensity="grand" />

      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backBtn}>
          <ArrowLeft size={20} color={DS.colors.ink} />
        </Pressable>
        <Text style={[DS.type.cardTitle, { flex: 1 }]}>Coin Shop</Text>
        <View style={styles.balanceChip}>
          <Coins size={15} color={DS.colors.amberDeep} />
          <Text style={styles.balanceText}>{coins}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#2563EB', '#1055F8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.banner}
        >
          <LeoMascot pose="cheer" size={68} />
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={styles.bannerTitle}>Spend Your Coins</Text>
            <Text style={styles.bannerSub}>
              Order real Impulse rewards and pick them up at your center.
            </Text>
          </View>
        </LinearGradient>

        {notice ? (
          <View style={[DS.card, styles.noticeRow]}>
            <Sparkles size={16} color={DS.colors.brand} />
            <Text style={[DS.type.body, { flex: 1 }]}>{notice}</Text>
          </View>
        ) : null}

        {products.length > 0 ? (
          <View style={styles.grid}>
            {products.map((prod) => {
              const canAfford = coins >= prod.priceCoins;
              const imgUri = api.assetUrl(prod.imageUrl);
              return (
                <View key={prod.id} style={[DS.card, styles.card]}>
                  <View style={styles.thumb}>
                    {imgUri ? (
                      <Image source={{ uri: imgUri }} style={styles.prodImg} resizeMode="cover" />
                    ) : (
                      <Gift size={28} color={DS.colors.brand} />
                    )}
                  </View>
                  <Text style={styles.prodName} numberOfLines={2}>
                    {prod.name}
                  </Text>
                  {prod.description ? (
                    <Text style={styles.prodDesc} numberOfLines={2}>
                      {prod.description}
                    </Text>
                  ) : null}
                  <View style={{ width: '100%', marginTop: 'auto' }}>
                    <GameButton
                      label={`${prod.priceCoins}`}
                      size="md"
                      disabled={!canAfford}
                      color={DS.colors.green}
                      depthColor={DS.colors.greenDeep}
                      icon={<Coins size={14} color="#FFFFFF" />}
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
                </View>
              );
            })}
          </View>
        ) : (
          <View style={[DS.card, styles.emptyCard]}>
            <LeoMascot pose="idle" size={84} />
            <Text style={DS.type.cardTitle}>No prizes available yet</Text>
            <Text style={[DS.type.caption, { textAlign: 'center' }]}>
              Check back soon when your center adds new items.
            </Text>
          </View>
        )}

        {orders.length > 0 ? (
          <View style={styles.section}>
            <Text style={DS.type.sectionTitle}>My Orders</Text>
            <View style={[DS.card, styles.groupedCard]}>
              {orders.slice(0, 6).map((ord, idx) => (
                <View key={ord.id} style={[styles.orderRow, idx > 0 ? styles.rowDivider : null]}>
                  <View style={styles.orderIcon}>
                    <ShoppingBag size={17} color={DS.colors.brand} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={DS.type.cardTitle}>{ord.totalCoins} Coins</Text>
                    <Text style={DS.type.caption}>
                      {new Date(ord.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.statusPill}>
                    <Text style={styles.statusText}>{ord.status}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: DS.colors.canvas,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
    backgroundColor: DS.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: DS.colors.border,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: DS.colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: DS.colors.amberSoft,
  },
  balanceText: {
    color: DS.colors.amberInk,
    fontSize: 13.5,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  scroll: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  banner: {
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  bannerSub: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  noticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  card: {
    width: '48.4%',
    padding: 14,
    alignItems: 'center',
    gap: 8,
    minHeight: 198,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: DS.colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  prodImg: {
    width: 56,
    height: 56,
  },
  prodName: {
    fontSize: 14.5,
    lineHeight: 19,
    fontWeight: '700',
    color: DS.colors.ink,
    textAlign: 'center',
  },
  prodDesc: {
    fontSize: 12,
    lineHeight: 16,
    color: DS.colors.inkMuted,
    textAlign: 'center',
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  section: {
    gap: 10,
  },
  groupedCard: {
    overflow: 'hidden',
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  rowDivider: {
    borderTopWidth: 1,
    borderTopColor: DS.colors.border,
  },
  orderIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: DS.colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusPill: {
    backgroundColor: DS.colors.brandSoft,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    color: DS.colors.brand,
  },
});
