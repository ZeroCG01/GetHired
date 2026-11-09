import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { JobApplication } from '../types';
import { StatusBadge } from './StatusBadge';
import { useAppTheme } from '../hooks/useAppTheme';
import { formatDate, formatRelativeDate, formatSalaryRange } from '../utils/format';
import { JOB_SOURCES } from '../constants/defaults';

interface ApplicationCardProps {
  application: JobApplication;
  onPressStatus: (application: JobApplication) => void;
}

export function ApplicationCard({ application, onPressStatus }: ApplicationCardProps) {
  const { i18n } = useTranslation();
  const { colors, isDark } = useAppTheme();
  const lang = (i18n.language === 'en' ? 'en' : 'id') as 'id' | 'en';

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
    true
  );

  const workTypeLabel = application.workType
    ? application.workType === 'ONSITE'
      ? 'WFO'
      : application.workType === 'HYBRID'
      ? 'Hybrid'
      : 'Remote'
    : null;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
      onPress={() => router.push(`/application/${application.id}`)}
      activeOpacity={0.75}
    >
      {/* Top Row: Company Name & Status Badge */}
      <View style={styles.topRow}>
        <Text
          style={[styles.companyName, { color: colors.textPrimary }]}
          numberOfLines={1}
        >
          {application.companyName}
        </Text>

        {application.status && (
          <StatusBadge
            status={application.status}
            showChevron
            size="sm"
            onPress={() => onPressStatus(application)}
          />
        )}
      </View>

      {/* Middle Row: Position */}
      <Text
        style={[styles.position, { color: colors.textSecondary }]}
        numberOfLines={1}
      >
        {application.position}
      </Text>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      {/* Bottom Metadata */}
      <View style={styles.bottomRow}>
        {/* Left: Source & Location/WorkType */}
        <View style={styles.leftMeta}>
          <View style={styles.sourceTag}>
            <Ionicons
              name={(sourceDef?.iconName as any) || 'briefcase-outline'}
              size={12}
              color={colors.accent}
            />
            <Text
              style={[styles.sourceText, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              {sourceLabel}
            </Text>
          </View>

          {(application.location || workTypeLabel) && (
            <>
              <Text style={[styles.dotSeparator, { color: colors.textMuted }]}>•</Text>
              <Text
                style={[styles.locationText, { color: colors.textMuted }]}
                numberOfLines={1}
              >
                {[application.location, workTypeLabel].filter(Boolean).join(' • ')}
              </Text>
            </>
          )}
        </View>

        {/* Right: Salary or Applied Date */}
        <View style={styles.rightMeta}>
          {salaryDisplay ? (
            <Text style={[styles.salaryText, { color: colors.accent }]}>
              {salaryDisplay}
            </Text>
          ) : (
            <Text style={[styles.dateText, { color: colors.textMuted }]}>
              {formatRelativeDate(application.appliedDate, lang)}
            </Text>
          )}
        </View>
      </View>

      {/* If salary was shown, show applied date in compact sub-row */}
      {salaryDisplay && (
        <View style={styles.dateSubRow}>
          <Ionicons name="time-outline" size={11} color={colors.textMuted} />
          <Text style={[styles.dateSubText, { color: colors.textMuted }]}>
            {formatDate(application.appliedDate, lang)} ({formatRelativeDate(application.appliedDate, lang)})
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 6,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  companyName: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    letterSpacing: -0.3,
  },
  position: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  divider: {
    height: 1,
    marginVertical: 4,
    opacity: 0.6,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  leftMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  sourceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sourceText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dotSeparator: {
    fontSize: 12,
  },
  locationText: {
    fontSize: 12,
    fontWeight: '500',
    flexShrink: 1,
  },
  rightMeta: {
    alignItems: 'flex-end',
  },
  salaryText: {
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  dateText: {
    fontSize: 11,
    fontWeight: '500',
  },
  dateSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  dateSubText: {
    fontSize: 11,
    fontWeight: '500',
  },
});

