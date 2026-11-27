import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors } from '../../constants/colors';
import { farmingTips as defaultTips, fetchFarmingTips, FarmingTip } from '../../constants/mockData';
import { Lightbulb, ChevronRight } from 'lucide-react-native';

export const FarmingTips: React.FC = () => {
  const [tips, setTips] = useState<FarmingTip[]>(defaultTips);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    fetchFarmingTips().then(setTips);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Lightbulb size={18} color="#D97706" />
          <Text style={styles.title}>Agronomy & Farming Insights</Text>
        </View>
        <Text style={styles.counterText}>
          {activeIdx + 1} of {tips.length}
        </Text>
      </View>

      <View style={styles.tipCard}>
        <View style={styles.categoryPill}>
          <Text style={styles.categoryText}>{tips[activeIdx].category}</Text>
        </View>
        <Text style={styles.tipTitle}>{tips[activeIdx].title}</Text>
        <Text style={styles.tipText}>{tips[activeIdx].text}</Text>

        <View style={styles.paginationRow}>
          <View style={styles.dots}>
            {tips.map((_, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setActiveIdx(i)}
                style={[
                  styles.dot,
                  i === activeIdx && styles.activeDot,
                ]}
              />
            ))}
          </View>

          <TouchableOpacity
            onPress={() => setActiveIdx((activeIdx + 1) % tips.length)}
            style={styles.nextBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.nextText}>Next Insight</Text>
            <ChevronRight size={14} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  counterText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  tipCard: {
    backgroundColor: '#FEFDF8',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    shadowColor: '#B45309',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  categoryPill: {
    backgroundColor: '#FEF3C7',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  tipText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
    marginBottom: 14,
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
  },
  activeDot: {
    width: 18,
    backgroundColor: colors.primary,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  nextText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
});
