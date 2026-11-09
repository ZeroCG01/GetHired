import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ApplicationFilterTab, ApplicationSortBy, StatusItem } from '../types';
import { useAppTheme } from '../hooks/useAppTheme';
import { JOB_SOURCES } from '../constants/defaults';

interface FilterBarProps {
  currentTab: ApplicationFilterTab;
  onTabChange: (tab: ApplicationFilterTab) => void;
  selectedSource: string;
  onSourceChange: (source: string) => void;
  selectedStatusId: string;
  onStatusChange: (statusId: string) => void;
  selectedSort: ApplicationSortBy;
  onSortChange: (sort: ApplicationSortBy) => void;
  allStatuses: StatusItem[];
  counts: {
    total: number;
    active: number;
    completed: number;
  };
}

export function FilterBar({
  currentTab,
  onTabChange,
  selectedSource,
  onSourceChange,
  selectedStatusId,
  onStatusChange,
  selectedSort,
  onSortChange,
  allStatuses,
  counts,
}: FilterBarProps) {
  const { t, i18n } = useTranslation();
  const { colors } = useAppTheme();
  const lang = (i18n.language === 'en' ? 'en' : 'id') as 'id' | 'en';

  const [activeModal, setActiveModal] = useState<'source' | 'status' | 'sort' | null>(null);

  // Tabs definitions
  const tabs: { key: ApplicationFilterTab; label: string; count: number }[] = [
    { key: 'ALL', label: t('common.all'), count: counts.total },
    { key: 'ACTIVE', label: t('common.active'), count: counts.active },
    { key: 'COMPLETED', label: t('common.completed'), count: counts.completed },
  ];

  // Source label
  const selectedSourceObj = JOB_SOURCES.find((s) => s.key === selectedSource);
  const sourceLabel =
    selectedSource === 'ALL'
      ? t('home.filterSource')
      : selectedSourceObj
      ? lang === 'en'
        ? selectedSourceObj.labelEn
        : selectedSourceObj.labelId
      : selectedSource;

  // Status label
  const selectedStatusObj = allStatuses.find((s) => s.id === selectedStatusId);
  const statusLabel =
    selectedStatusId === 'ALL'
      ? t('home.filterStatus')
      : selectedStatusObj
      ? lang === 'en'
        ? selectedStatusObj.labelEn
        : selectedStatusObj.labelId
      : selectedStatusId;

  // Sort label
  const sortOptions: { key: ApplicationSortBy; label: string }[] = [
    { key: 'applied_desc', label: t('home.sortNewest') },
    { key: 'applied_asc', label: t('home.sortOldest') },
    { key: 'company_asc', label: t('home.sortCompanyAZ') },
    { key: 'company_desc', label: t('home.sortCompanyZA') },
    { key: 'updated_desc', label: t('home.sortRecentUpdated') },
  ];
  const sortLabel = sortOptions.find((s) => s.key === selectedSort)?.label || t('home.sortBy');

  return (
    <View style={styles.container}>
      {/* Segmented Tabs (Semua | Aktif | Selesai) */}
      <View style={[styles.tabContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {tabs.map((tab) => {
          const isActive = currentTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tabItem,
                isActive && {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => onTabChange(tab.key)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isActive ? colors.textPrimary : colors.textSecondary,
                    fontWeight: isActive ? '700' : '500',
                  },
                ]}
              >
                {tab.label}
              </Text>
              <View
                style={[
                  styles.countBadge,
                  {
                    backgroundColor: isActive ? colors.accentSoft : 'transparent',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.countText,
                    {
                      color: isActive ? colors.accent : colors.textMuted,
                    },
                  ]}
                >
                  {tab.count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Horizontal Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {/* Source Filter Chip */}
        <TouchableOpacity
          style={[
            styles.chip,
            {
              backgroundColor: selectedSource !== 'ALL' ? colors.accentSoft : colors.surface,
              borderColor: selectedSource !== 'ALL' ? colors.accent : colors.border,
            },
          ]}
          onPress={() => setActiveModal('source')}
          activeOpacity={0.7}
        >
          <Ionicons
            name="funnel-outline"
            size={12}
            color={selectedSource !== 'ALL' ? colors.accent : colors.textSecondary}
          />
          <Text
            style={[
              styles.chipText,
              { color: selectedSource !== 'ALL' ? colors.accent : colors.textSecondary },
            ]}
          >
            {sourceLabel}
          </Text>
          <Ionicons
            name="chevron-down"
            size={12}
            color={selectedSource !== 'ALL' ? colors.accent : colors.textSecondary}
          />
        </TouchableOpacity>

        {/* Status Filter Chip */}
        <TouchableOpacity
          style={[
            styles.chip,
            {
              backgroundColor: selectedStatusId !== 'ALL' ? colors.accentSoft : colors.surface,
              borderColor: selectedStatusId !== 'ALL' ? colors.accent : colors.border,
            },
          ]}
          onPress={() => setActiveModal('status')}
          activeOpacity={0.7}
        >
          <Ionicons
            name="radio-button-on-outline"
            size={12}
            color={selectedStatusId !== 'ALL' ? colors.accent : colors.textSecondary}
          />
          <Text
            style={[
              styles.chipText,
              { color: selectedStatusId !== 'ALL' ? colors.accent : colors.textSecondary },
            ]}
          >
            {statusLabel}
          </Text>
          <Ionicons
            name="chevron-down"
            size={12}
            color={selectedStatusId !== 'ALL' ? colors.accent : colors.textSecondary}
          />
        </TouchableOpacity>

        {/* Sort Chip */}
        <TouchableOpacity
          style={[
            styles.chip,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
          onPress={() => setActiveModal('sort')}
          activeOpacity={0.7}
        >
          <Ionicons name="swap-vertical-outline" size={12} color={colors.textSecondary} />
          <Text style={[styles.chipText, { color: colors.textSecondary }]}>
            {sortLabel}
          </Text>
          <Ionicons name="chevron-down" size={12} color={colors.textSecondary} />
        </TouchableOpacity>
      </ScrollView>

      {/* Filter Selector Modal (Generic for Source, Status, Sort) */}
      <Modal
        visible={activeModal !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveModal(null)}
      >
        <TouchableWithoutFeedback onPress={() => setActiveModal(null)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.modalContent,
                  {
                    backgroundColor: colors.surfaceElevated,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                    {activeModal === 'source'
                      ? t('home.filterSource')
                      : activeModal === 'status'
                      ? t('home.filterStatus')
                      : t('home.sortBy')}
                  </Text>
                  <TouchableOpacity onPress={() => setActiveModal(null)}>
                    <Ionicons name="close" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={{ maxHeight: 350 }}>
                  {activeModal === 'source' && (
                    <>
                      <TouchableOpacity
                        style={[
                          styles.optionRow,
                          selectedSource === 'ALL' && { backgroundColor: colors.surfaceHighlight },
                        ]}
                        onPress={() => {
                          onSourceChange('ALL');
                          setActiveModal(null);
                        }}
                      >
                        <Text style={[styles.optionText, { color: colors.textPrimary }]}>
                          {t('home.filterSource')}
                        </Text>
                        {selectedSource === 'ALL' && (
                          <Ionicons name="checkmark" size={18} color={colors.accent} />
                        )}
                      </TouchableOpacity>
                      {JOB_SOURCES.map((s) => {
                        const isSelected = selectedSource === s.key;
                        const label = lang === 'en' ? s.labelEn : s.labelId;
                        return (
                          <TouchableOpacity
                            key={s.key}
                            style={[
                              styles.optionRow,
                              isSelected && { backgroundColor: colors.surfaceHighlight },
                            ]}
                            onPress={() => {
                              onSourceChange(s.key);
                              setActiveModal(null);
                            }}
                          >
                            <Text style={[styles.optionText, { color: colors.textPrimary }]}>
                              {label}
                            </Text>
                            {isSelected && (
                              <Ionicons name="checkmark" size={18} color={colors.accent} />
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </>
                  )}

                  {activeModal === 'status' && (
                    <>
                      <TouchableOpacity
                        style={[
                          styles.optionRow,
                          selectedStatusId === 'ALL' && { backgroundColor: colors.surfaceHighlight },
                        ]}
                        onPress={() => {
                          onStatusChange('ALL');
                          setActiveModal(null);
                        }}
                      >
                        <Text style={[styles.optionText, { color: colors.textPrimary }]}>
                          {t('home.filterStatus')}
                        </Text>
                        {selectedStatusId === 'ALL' && (
                          <Ionicons name="checkmark" size={18} color={colors.accent} />
                        )}
                      </TouchableOpacity>
                      {allStatuses.map((st) => {
                        const isSelected = selectedStatusId === st.id;
                        const label = lang === 'en' ? st.labelEn : st.labelId;
                        return (
                          <TouchableOpacity
                            key={st.id}
                            style={[
                              styles.optionRow,
                              isSelected && { backgroundColor: colors.surfaceHighlight },
                            ]}
                            onPress={() => {
                              onStatusChange(st.id);
                              setActiveModal(null);
                            }}
                          >
                            <Text style={[styles.optionText, { color: colors.textPrimary }]}>
                              {label}
                            </Text>
                            {isSelected && (
                              <Ionicons name="checkmark" size={18} color={colors.accent} />
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </>
                  )}

                  {activeModal === 'sort' &&
                    sortOptions.map((opt) => {
                      const isSelected = selectedSort === opt.key;
                      return (
                        <TouchableOpacity
                          key={opt.key}
                          style={[
                            styles.optionRow,
                            isSelected && { backgroundColor: colors.surfaceHighlight },
                          ]}
                          onPress={() => {
                            onSortChange(opt.key);
                            setActiveModal(null);
                          }}
                        >
                          <Text style={[styles.optionText, { color: colors.textPrimary }]}>
                            {opt.label}
                          </Text>
                          {isSelected && (
                            <Ionicons name="checkmark" size={18} color={colors.accent} />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 3,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 9,
    gap: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabLabel: {
    fontSize: 13,
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 999,
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

