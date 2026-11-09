import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

import { useAppTheme } from '../../hooks/useAppTheme';
import { useAppStore } from '../../store/useAppStore';
import { getApplicationStats } from '../../db/applications';
import { StatusColorPresets } from '../../constants/theme';
import { JOB_SOURCES } from '../../constants/defaults';
import { StatusItem } from '../../types';

interface StatsData {
  total: number;
  active: number;
  interviewOrTest: number;
  responseRate: number;
  statusCounts: { status: StatusItem; count: number }[];
  sourceCounts: { source: string; total: number; active: number }[];
}

export default function StatsScreen() {
  const { t, i18n } = useTranslation();
  const { colors, isDark } = useAppTheme();
  const dataVersion = useAppStore((state) => state.dataVersion);
  const lang = (i18n.language === 'en' ? 'en' : 'id') as 'id' | 'en';

  const [stats, setStats] = useState<StatsData>({
    total: 0,
    active: 0,
    interviewOrTest: 0,
    responseRate: 0,
    statusCounts: [],
    sourceCounts: [],
  });
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadStats = useCallback(() => {
    try {
      const data = getApplicationStats();
      setStats(data);
    } catch (e) {
      console.warn('Error loading stats:', e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats, dataVersion])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadStats();
    setRefreshing(false);
  };

  const getSourceLabel = (key: string) => {
    const found = JOB_SOURCES.find((s) => s.key === key);
    return found ? (lang === 'en' ? found.labelEn : found.labelId) : key;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Top Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.brandRow}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            {t('stats.title')}
          </Text>
          <View style={[styles.accentDot, { backgroundColor: colors.accent }]} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.accent} />
        }
      >
        {/* 2x2 Grid: Key Metrics */}
        <View style={styles.metricsGrid}>
          {/* 1. Total Applications */}
          <View
            style={[
              styles.metricCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.metricCardTop}>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                {t('stats.totalApplications')}
              </Text>
              <Ionicons name="folder-outline" size={16} color={colors.textSecondary} />
            </View>
            <Text style={[styles.metricNumber, { color: colors.textPrimary }]}>
              {stats.total}
            </Text>
          </View>

          {/* 2. Active Processes */}
          <View
            style={[
              styles.metricCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.metricCardTop}>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                {t('stats.activeProcess')}
              </Text>
              <Ionicons name="time-outline" size={16} color={colors.accent} />
            </View>
            <Text style={[styles.metricNumber, { color: colors.accent }]}>
              {stats.active}
            </Text>
          </View>

          {/* 3. Interview or Test */}
          <View
            style={[
              styles.metricCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.metricCardTop}>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                {t('stats.interviewOrTest')}
              </Text>
              <Ionicons name="people-outline" size={16} color="#FBBF24" />
            </View>
            <Text style={[styles.metricNumber, { color: '#FBBF24' }]}>
              {stats.interviewOrTest}
            </Text>
          </View>

          {/* 4. Response Rate */}
          <View
            style={[
              styles.metricCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.metricCardTop}>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                {t('stats.responseRate')}
              </Text>
              <Ionicons name="trending-up-outline" size={16} color="#34D399" />
            </View>
            <Text style={[styles.metricNumber, { color: '#34D399' }]}>
              {stats.responseRate}%
            </Text>
          </View>
        </View>

        {/* Section: Status Distribution */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            {t('stats.statusDistribution')}
          </Text>

          {stats.total === 0 ? (
            <Text style={[styles.emptyHint, { color: colors.textMuted }]}>
              {t('stats.emptyStats')}
            </Text>
          ) : (
            <View style={styles.statusList}>
              {stats.statusCounts.map((item) => {
                const percentage = stats.total > 0 ? Math.round((item.count / stats.total) * 100) : 0;
                const preset = StatusColorPresets[item.status.colorKey] || StatusColorPresets.slate;
                const token = isDark ? preset.dark : preset.light;
                const label = lang === 'en' ? item.status.labelEn : item.status.labelId;

                return (
                  <View key={item.status.id} style={styles.statusRow}>
                    <View style={styles.statusRowHeader}>
                      <View style={styles.statusLabelRow}>
                        <View style={[styles.statusDot, { backgroundColor: token.text }]} />
                        <Text style={[styles.statusName, { color: colors.textPrimary }]}>
                          {label}
                        </Text>
                      </View>
                      <Text style={[styles.statusCountText, { color: colors.textSecondary }]}>
                        {item.count} ({percentage}%)
                      </Text>
                    </View>

                    {/* Progress Bar */}
                    <View style={[styles.progressTrack, { backgroundColor: colors.surfaceHighlight }]}>
                      <View
                        style={[
                          styles.progressBar,
                          {
                            width: `${Math.max(percentage, item.count > 0 ? 3 : 0)}%`,
                            backgroundColor: token.text,
                          },
                        ]}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Section: Source Breakdown */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            {t('stats.sourceBreakdown')}
          </Text>

          {stats.sourceCounts.length === 0 ? (
            <Text style={[styles.emptyHint, { color: colors.textMuted }]}>
              {t('stats.emptyStats')}
            </Text>
          ) : (
            <View style={styles.sourceList}>
              {stats.sourceCounts.map((s) => {
                const percentage = stats.total > 0 ? Math.round((s.total / stats.total) * 100) : 0;
                return (
                  <View key={s.source} style={styles.sourceRow}>
                    <View style={styles.sourceRowTop}>
                      <Text style={[styles.sourceName, { color: colors.textPrimary }]}>
                        {getSourceLabel(s.source)}
                      </Text>
                      <Text style={[styles.sourceCount, { color: colors.accent }]}>
                        {s.total} lamaran ({s.active} aktif)
                      </Text>
                    </View>

                    <View style={[styles.progressTrack, { backgroundColor: colors.surfaceHighlight }]}>
                      <View
                        style={[
                          styles.progressBar,
                          {
                            width: `${percentage}%`,
                            backgroundColor: colors.accent,
                          },
                        ]}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  accentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    width: '48%',
    flexGrow: 1,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  metricCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  metricNumber: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'],
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  emptyHint: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  statusList: {
    gap: 12,
  },
  statusRow: {
    gap: 6,
  },
  statusRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusName: {
    fontSize: 13,
    fontWeight: '600',
  },
  statusCountText: {
    fontSize: 12,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  sourceList: {
    gap: 12,
  },
  sourceRow: {
    gap: 6,
  },
  sourceRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sourceName: {
    fontSize: 13,
    fontWeight: '600',
  },
  sourceCount: {
    fontSize: 12,
    fontWeight: '600',
  },
});
