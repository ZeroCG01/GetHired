import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { JobApplication, StatusHistoryItem } from '../../../types';
import {
  getApplicationById,
  deleteApplication,
  updateApplicationStatus,
} from '../../../db/applications';
import { getStatusHistoryByApplicationId } from '../../../db/statuses';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { useAppStore } from '../../../store/useAppStore';
import { StatusBadge } from '../../../components/StatusBadge';
import { StatusPickerModal } from '../../../components/StatusPickerModal';
import { formatDate, formatRelativeDate, formatSalaryRange } from '../../../utils/format';
import { JOB_SOURCES } from '../../../constants/defaults';

export default function ApplicationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const { colors, isDark } = useAppTheme();
  const lang = (i18n.language === 'en' ? 'en' : 'id') as 'id' | 'en';

  const dataVersion = useAppStore((state) => state.dataVersion);
  const triggerDataRefresh = useAppStore((state) => state.triggerDataRefresh);

  const [application, setApplication] = useState<JobApplication | null>(null);
  const [history, setHistory] = useState<StatusHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showStatusModal, setShowStatusModal] = useState<boolean>(false);

  const loadDetail = useCallback(() => {
    if (!id) return;
    const data = getApplicationById(id);
    if (!data) {
      router.back();
      return;
    }
    const historyList = getStatusHistoryByApplicationId(id);
    setApplication(data);
    setHistory(historyList);
    setLoading(false);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadDetail();
    }, [loadDetail, dataVersion])
  );

  const handleDelete = () => {
    if (!application) return;
    Alert.alert(
      t('detail.deleteConfirmationTitle'),
      t('detail.deleteConfirmationMessage', { company: application.companyName }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            deleteApplication(application.id);
            triggerDataRefresh();
            router.back();
          },
        },
      ]
    );
  };

  const handleStatusChange = (newStatusId: string, note?: string) => {
    if (!application) return;
    updateApplicationStatus(application.id, newStatusId, note);
    triggerDataRefresh();
    setShowStatusModal(false);
  };

  const handleOpenJobUrl = async (url?: string | null) => {
    if (!url) return;
    try {
      const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
      const canOpen = await Linking.canOpenURL(formattedUrl);
      if (canOpen) {
        await Linking.openURL(formattedUrl);
      }
    } catch (e) {
      console.warn('Cannot open url:', e);
    }
  };

  if (loading || !application) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}
      >
        <ActivityIndicator size="large" color={colors.accent} />
      </SafeAreaView>
    );
  }

  const sourceDef = JOB_SOURCES.find((s) => s.key === application.source);
  const sourceLabel =
    application.source === 'OTHER' && application.sourceOther
      ? application.sourceOther
      : sourceDef
      ? lang === 'en'
        ? sourceDef.labelEn
        : sourceDef.labelId
      : application.source;

  const salaryDisplay = formatSalaryRange(
    application.salaryMin,
    application.salaryMax,
    application.salaryCurrency,
    false
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Top Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          {t('detail.title')}
        </Text>

        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => router.push(`/application/${application.id}/edit`)}
            style={styles.headerBtn}
          >
            <Ionicons name="pencil-outline" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.headerBtn}>
            <Ionicons name="trash-outline" size={20} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Hero Card: Company, Position, Status */}
        <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.heroTopRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.companyTitle, { color: colors.textPrimary }]}>
                {application.companyName}
              </Text>
              <Text style={[styles.positionTitle, { color: colors.textSecondary }]}>
                {application.position}
              </Text>
            </View>

            {application.status && (
              <StatusBadge
                status={application.status}
                showChevron
                size="md"
                onPress={() => setShowStatusModal(true)}
              />
            )}
          </View>

          <View style={[styles.heroDivider, { backgroundColor: colors.border }]} />

          <View style={styles.heroBottomRow}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
              <Text style={[styles.metaText, { color: colors.textMuted }]}>
                {t('detail.appliedOn', { date: formatDate(application.appliedDate, lang) })} (
                {formatRelativeDate(application.appliedDate, lang)})
              </Text>
            </View>
          </View>
        </View>

        {/* Details Card */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardSectionTitle, { color: colors.textPrimary }]}>
            {t('detail.overview')}
          </Text>

          {/* Source */}
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              {t('form.source')}
            </Text>
            <View style={styles.infoValueRow}>
              <Ionicons
                name={(sourceDef?.iconName as any) || 'briefcase-outline'}
                size={14}
                color={colors.accent}
              />
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                {sourceLabel}
              </Text>
            </View>
          </View>

          {/* Salary Info */}
          {salaryDisplay && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                {t('detail.salaryRange')}
              </Text>
              <View>
                <Text style={[styles.infoValue, { color: colors.accent, fontWeight: '700' }]}>
                  {salaryDisplay}
                </Text>
                {application.salaryType && (
                  <Text style={[styles.infoSubValue, { color: colors.textMuted }]}>
                    {application.salaryType === 'POSTED'
                      ? t('form.salaryTypePosted')
                      : application.salaryType === 'EXPECTED'
                      ? t('form.salaryTypeExpected')
                      : t('form.salaryTypeOffered')}{' '}
                    • {application.salaryPeriod === 'YEARLY' ? t('form.yearly') : t('form.monthly')}
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* Work Type & Contract */}
          {(application.workType || application.employmentType) && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                {t('form.workType')}
              </Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                {[
                  application.workType === 'ONSITE'
                    ? t('form.onsite')
                    : application.workType === 'HYBRID'
                    ? t('form.hybrid')
                    : application.workType === 'REMOTE'
                    ? t('form.remote')
                    : null,
                  application.employmentType === 'FULL_TIME'
                    ? t('form.fullTime')
                    : application.employmentType === 'CONTRACT'
                    ? t('form.contract')
                    : application.employmentType === 'INTERNSHIP'
                    ? t('form.internship')
                    : null,
                ]
                  .filter(Boolean)
                  .join(' • ')}
              </Text>
            </View>
          )}

          {/* Location */}
          {application.location && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                {t('form.location')}
              </Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                {application.location}
              </Text>
            </View>
          )}

          {/* Recruiter Contact */}
          {(application.contactName || application.contactInfo) && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Recruiter
              </Text>
              <View>
                {application.contactName && (
                  <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                    {application.contactName}
                  </Text>
                )}
                {application.contactInfo && (
                  <Text style={[styles.infoSubValue, { color: colors.accent }]}>
                    {application.contactInfo}
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* Follow-up Reminder */}
          {application.followUpDate && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                {t('form.followUpDate')}
              </Text>
              <View style={styles.infoValueRow}>
                <Ionicons name="notifications-outline" size={14} color="#FBBF24" />
                <Text style={[styles.infoValue, { color: '#FBBF24' }]}>
                  {formatDate(application.followUpDate, lang)}
                </Text>
              </View>
            </View>
          )}

          {/* Job URL Button */}
          {application.jobUrl && (
            <TouchableOpacity
              style={[styles.linkBtn, { backgroundColor: colors.accentSoft, borderColor: colors.accent }]}
              onPress={() => handleOpenJobUrl(application.jobUrl)}
              activeOpacity={0.7}
            >
              <Ionicons name="open-outline" size={16} color={colors.accent} />
              <Text style={[styles.linkBtnText, { color: colors.accent }]}>
                {t('detail.openLink')}
              </Text>
            </TouchableOpacity>
          )}

          {/* Notes */}
          {application.notes && (
            <View style={styles.notesContainer}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary, marginBottom: 4 }]}>
                {t('form.notes')}
              </Text>
              <View style={[styles.notesBox, { backgroundColor: colors.surfaceElevated }]}>
                <Text style={[styles.notesText, { color: colors.textPrimary }]}>
                  {application.notes}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Timeline Riwayat Status */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.timelineHeader}>
            <Text style={[styles.cardSectionTitle, { color: colors.textPrimary }]}>
              {t('detail.timeline')}
            </Text>
            <TouchableOpacity
              style={[styles.smallUpdateBtn, { backgroundColor: colors.surfaceHighlight }]}
              onPress={() => setShowStatusModal(true)}
            >
              <Ionicons name="add" size={14} color={colors.accent} />
              <Text style={[styles.smallUpdateText, { color: colors.accent }]}>
                {t('detail.addStatusUpdate')}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.timelineContainer}>
            {history.map((item, index) => {
              const isFirst = index === 0;
              const isLast = index === history.length - 1;
              return (
                <View key={item.id} style={styles.timelineRow}>
                  {/* Left Column: Timeline Line & Node */}
                  <View style={styles.timelineIndicator}>
                    <View
                      style={[
                        styles.timelineDot,
                        {
                          backgroundColor: isFirst ? colors.accent : colors.textMuted,
                          borderColor: colors.surface,
                        },
                      ]}
                    />
                    {!isLast && (
                      <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />
                    )}
                  </View>

                  {/* Right Column: Status Details */}
                  <View style={styles.timelineBody}>
                    <View style={styles.timelineTop}>
                      {item.toStatus && <StatusBadge status={item.toStatus} size="sm" />}
                      <Text style={[styles.timelineDate, { color: colors.textMuted }]}>
                        {formatDate(item.changedAt.split('T')[0], lang)}
                      </Text>
                    </View>

                    {item.note && (
                      <Text style={[styles.timelineNote, { color: colors.textSecondary }]}>
                        "{item.note}"
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Status Picker Modal */}
      <StatusPickerModal
        visible={showStatusModal}
        currentStatusId={application.statusId}
        companyName={application.companyName}
        onClose={() => setShowStatusModal(false)}
        onSelectStatus={handleStatusChange}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  heroCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    gap: 12,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  companyTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  positionTitle: {
    fontSize: 15,
    fontWeight: '500',
    marginTop: 2,
  },
  heroDivider: {
    height: 1,
    opacity: 0.6,
  },
  heroBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '500',
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },
  cardSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '500',
    width: 100,
  },
  infoValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    justifyContent: 'flex-end',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
  },
  infoSubValue: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'right',
    marginTop: 2,
  },
  linkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 4,
  },
  linkBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  notesContainer: {
    marginTop: 4,
  },
  notesBox: {
    padding: 12,
    borderRadius: 10,
    marginTop: 4,
  },
  notesText: {
    fontSize: 13,
    lineHeight: 18,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  smallUpdateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  smallUpdateText: {
    fontSize: 11,
    fontWeight: '700',
  },
  timelineContainer: {
    marginTop: 8,
  },
  timelineRow: {
    flexDirection: 'row',
    minHeight: 52,
  },
  timelineIndicator: {
    width: 20,
    alignItems: 'center',
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    marginTop: 5,
    zIndex: 1,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: -2,
    marginBottom: -2,
  },
  timelineBody: {
    flex: 1,
    paddingLeft: 10,
    paddingBottom: 16,
    gap: 4,
  },
  timelineTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timelineDate: {
    fontSize: 11,
    fontWeight: '500',
  },
  timelineNote: {
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 16,
  },
});
