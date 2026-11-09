import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';

import {
  ApplicationFilterTab,
  ApplicationSortBy,
  JobApplication,
  StatusItem,
} from '../../types';
import {
  getApplications,
  getApplicationStats,
  updateApplicationStatus,
} from '../../db/applications';
import { getAllStatuses } from '../../db/statuses';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useAppStore } from '../../store/useAppStore';
import { ApplicationCard } from '../../components/ApplicationCard';
import { FilterBar } from '../../components/FilterBar';
import { EmptyState } from '../../components/EmptyState';
import { StatusPickerModal } from '../../components/StatusPickerModal';

export default function ApplicationsScreen() {
  const { t } = useTranslation();
  const { colors, isDark } = useAppTheme();
  const dataVersion = useAppStore((state) => state.dataVersion);
  const triggerDataRefresh = useAppStore((state) => state.triggerDataRefresh);

  // Filter & Search states
  const [search, setSearch] = useState<string>('');
  const [currentTab, setCurrentTab] = useState<ApplicationFilterTab>('ALL');
  const [selectedSource, setSelectedSource] = useState<string>('ALL');
  const [selectedStatusId, setSelectedStatusId] = useState<string>('ALL');
  const [selectedSort, setSelectedSort] = useState<ApplicationSortBy>('applied_desc');

  // Data states
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [allStatuses, setAllStatuses] = useState<StatusItem[]>([]);
  const [counts, setCounts] = useState({ total: 0, active: 0, completed: 0 });
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Status Picker modal state
  const [statusModalApp, setStatusModalApp] = useState<JobApplication | null>(null);

  const loadData = useCallback(() => {
    try {
      const stats = getApplicationStats();
      const allAppList = getApplications({
        tab: currentTab,
        search,
        source: selectedSource,
        statusId: selectedStatusId,
        sortBy: selectedSort,
      });
      const statuses = getAllStatuses();

      setApplications(allAppList);
      setAllStatuses(statuses);
      setCounts({
        total: stats.total,
        active: stats.active,
        completed: Math.max(0, stats.total - stats.active),
      });
    } catch (e) {
      console.warn('Error loading applications list:', e);
    }
  }, [currentTab, search, selectedSource, selectedStatusId, selectedSort]);

  // Reload data on focus or dataVersion changes
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData, dataVersion])
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
    setIsRefreshing(false);
  };

  const handleStatusChange = (newStatusId: string, note?: string) => {
    if (!statusModalApp) return;
    updateApplicationStatus(statusModalApp.id, newStatusId, note);
    triggerDataRefresh();
    setStatusModalApp(null);
  };

  const isFiltered = search.trim().length > 0 || selectedSource !== 'ALL' || selectedStatusId !== 'ALL';

  const handleResetFilter = () => {
    setSearch('');
    setSelectedSource('ALL');
    setSelectedStatusId('ALL');
    setCurrentTab('ALL');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Top Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View>
          <View style={styles.brandRow}>
            <Text style={[styles.brandTitle, { color: colors.textPrimary }]}>
              {t('common.appName')}
            </Text>
            <View style={[styles.accentDot, { backgroundColor: colors.accent }]} />
          </View>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {t('home.summary', { total: counts.total, active: counts.active })}
          </Text>
        </View>

        {/* Header CTA Button */}
        <TouchableOpacity
          style={[styles.headerAddBtn, { backgroundColor: colors.primaryButtonBg }]}
          onPress={() => router.push('/application/new')}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={18} color={colors.primaryButtonText} />
          <Text style={[styles.headerAddText, { color: colors.primaryButtonText }]}>
            {t('common.addApplication')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder={t('common.search')}
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Bar (Tabs & Chips) */}
      <FilterBar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        selectedSource={selectedSource}
        onSourceChange={setSelectedSource}
        selectedStatusId={selectedStatusId}
        onStatusChange={setSelectedStatusId}
        selectedSort={selectedSort}
        onSortChange={setSelectedSort}
        allStatuses={allStatuses}
        counts={counts}
      />

      {/* Applications List */}
      <FlatList
        data={applications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ApplicationCard
            application={item}
            onPressStatus={(app) => setStatusModalApp(app)}
          />
        )}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.accent}
          />
        }
        ListEmptyComponent={
          <EmptyState
            isFiltered={isFiltered || counts.total > 0}
            onResetFilter={handleResetFilter}
          />
        }
      />

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity
        style={[
          styles.fab,
          {
            backgroundColor: colors.primaryButtonBg,
            shadowColor: isDark ? colors.accent : '#000000',
          },
        ]}
        onPress={() => router.push('/application/new')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={24} color={colors.primaryButtonText} />
        <Text style={[styles.fabText, { color: colors.primaryButtonText }]}>
          {t('common.addApplication')}
        </Text>
      </TouchableOpacity>

      {/* Quick Status Picker Modal */}
      {statusModalApp && (
        <StatusPickerModal
          visible={statusModalApp !== null}
          currentStatusId={statusModalApp.statusId}
          companyName={statusModalApp.companyName}
          onClose={() => setStatusModalApp(null)}
          onSelectStatus={handleStatusChange}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  accentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  headerAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  headerAddText: {
    fontSize: 12,
    fontWeight: '700',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    padding: 0,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 90, // extra padding for FAB & Bottom Tab
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999, // Kapsul
    elevation: 6,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  fabText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
