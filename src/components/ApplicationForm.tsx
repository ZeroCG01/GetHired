import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

import {
  EmploymentType,
  JobApplication,
  JobSourceKey,
  SalaryPeriod,
  SalaryType,
  StatusItem,
  WorkType,
} from '../types';
import { JOB_SOURCES } from '../constants/defaults';
import { getAllStatuses } from '../db/statuses';
import { checkDuplicateApplication } from '../db/applications';
import { StatusBadge } from './StatusBadge';
import { useAppTheme } from '../hooks/useAppTheme';
import { formatNumberWithDots, parseNumberFromDots } from '../utils/format';

interface ApplicationFormProps {
  initialData?: JobApplication;
  onSubmit: (data: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => void;
  onCancel: () => void;
  isEdit?: boolean;
}

export function ApplicationForm({
  initialData,
  onSubmit,
  onCancel,
  isEdit = false,
}: ApplicationFormProps) {
  const { t, i18n } = useTranslation();
  const { colors, isDark } = useAppTheme();
  const lang = (i18n.language === 'en' ? 'en' : 'id') as 'id' | 'en';

  const [statuses, setStatuses] = useState<StatusItem[]>([]);

  // Core Form Fields
  const [companyName, setCompanyName] = useState<string>(initialData?.companyName || '');
  const [position, setPosition] = useState<string>(initialData?.position || '');
  const [source, setSource] = useState<string>(initialData?.source || 'LINKEDIN');
  const [sourceOther, setSourceOther] = useState<string>(initialData?.sourceOther || '');
  const [statusId, setStatusId] = useState<string>(initialData?.statusId || 'APPLIED');
  const [appliedDate, setAppliedDate] = useState<string>(
    initialData?.appliedDate || new Date().toISOString().split('T')[0]
  );

  // Optional Section Accordion
  const [showDetails, setShowDetails] = useState<boolean>(
    isEdit || Boolean(initialData?.salaryMin || initialData?.notes || initialData?.jobUrl)
  );

  // Additional Details Fields
  const [salaryType, setSalaryType] = useState<SalaryType>(initialData?.salaryType || 'EXPECTED');
  const [salaryPeriod, setSalaryPeriod] = useState<SalaryPeriod>(initialData?.salaryPeriod || 'MONTHLY');
  const [salaryMinStr, setSalaryMinStr] = useState<string>(
    initialData?.salaryMin ? formatNumberWithDots(initialData.salaryMin) : ''
  );
  const [salaryMaxStr, setSalaryMaxStr] = useState<string>(
    initialData?.salaryMax ? formatNumberWithDots(initialData.salaryMax) : ''
  );
  const [workType, setWorkType] = useState<WorkType | null>(initialData?.workType || null);
  const [employmentType, setEmploymentType] = useState<EmploymentType | null>(
    initialData?.employmentType || null
  );
  const [location, setLocation] = useState<string>(initialData?.location || '');
  const [jobUrl, setJobUrl] = useState<string>(initialData?.jobUrl || '');
  const [contactName, setContactName] = useState<string>(initialData?.contactName || '');
  const [contactInfo, setContactInfo] = useState<string>(initialData?.contactInfo || '');
  const [followUpDate, setFollowUpDate] = useState<string | null>(initialData?.followUpDate || null);
  const [notes, setNotes] = useState<string>(initialData?.notes || '');

  // Date picker states
  const [showAppliedPicker, setShowAppliedPicker] = useState<boolean>(false);
  const [showFollowUpPicker, setShowFollowUpPicker] = useState<boolean>(false);

  // Duplicate warning
  const [duplicateWarning, setDuplicateWarning] = useState<boolean>(false);

  useEffect(() => {
    const list = getAllStatuses();
    setStatuses(list);
    if (!initialData && list.length > 0) {
      const defaultStatus = list.find((s) => s.id === 'APPLIED') || list[0];
      setStatusId(defaultStatus.id);
    }
  }, [initialData]);

  // Check duplicate while typing
  useEffect(() => {
    if (companyName.trim().length >= 2 && position.trim().length >= 2) {
      const isDupe = checkDuplicateApplication(companyName, position, initialData?.id);
      setDuplicateWarning(isDupe);
    } else {
      setDuplicateWarning(false);
    }
  }, [companyName, position, initialData?.id]);

  const handleSubmit = () => {
    if (!companyName.trim()) {
      Alert.alert(t('common.required'), t('form.validationCompanyRequired'));
      return;
    }
    if (!position.trim()) {
      Alert.alert(t('common.required'), t('form.validationPositionRequired'));
      return;
    }

    const salaryMin = parseNumberFromDots(salaryMinStr);
    const salaryMax = parseNumberFromDots(salaryMaxStr);

    onSubmit({
      companyName: companyName.trim(),
      position: position.trim(),
      source,
      sourceOther: source === 'OTHER' ? sourceOther.trim() : null,
      statusId,
      appliedDate,
      salaryMin,
      salaryMax,
      salaryCurrency: initialData?.salaryCurrency || 'IDR',
      salaryPeriod: salaryMin || salaryMax ? salaryPeriod : null,
      salaryType: salaryMin || salaryMax ? salaryType : null,
      workType,
      employmentType,
      location: location.trim() || null,
      jobUrl: jobUrl.trim() || null,
      contactName: contactName.trim() || null,
      contactInfo: contactInfo.trim() || null,
      followUpDate,
      notes: notes.trim() || null,
    });
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      {/* Duplicate Warning Banner */}
      {duplicateWarning && (
        <View
          style={[
            styles.warningBanner,
            {
              backgroundColor: 'rgba(251, 191, 36, 0.12)',
              borderColor: 'rgba(251, 191, 36, 0.35)',
            },
          ]}
        >
          <Ionicons name="alert-circle-outline" size={18} color="#FBBF24" />
          <Text style={[styles.warningText, { color: '#FBBF24' }]}>
            {t('form.duplicateWarning')}
          </Text>
        </View>
      )}

      {/* SECTION 1: CORE FIELDS (FAST) */}
      <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            {t('form.basicSection')}
          </Text>
        </View>

        {/* Company Name */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
            {t('form.companyName')} <Text style={{ color: colors.danger }}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
                color: colors.textPrimary,
              },
            ]}
            placeholder={t('form.companyPlaceholder')}
            placeholderTextColor={colors.textMuted}
            value={companyName}
            onChangeText={setCompanyName}
            autoCapitalize="words"
          />
        </View>

        {/* Position */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
            {t('form.position')} <Text style={{ color: colors.danger }}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
                color: colors.textPrimary,
              },
            ]}
            placeholder={t('form.positionPlaceholder')}
            placeholderTextColor={colors.textMuted}
            value={position}
            onChangeText={setPosition}
            autoCapitalize="words"
          />
        </View>

        {/* Job Source Chips */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
            {t('form.source')} <Text style={{ color: colors.danger }}>*</Text>
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
            {JOB_SOURCES.map((s) => {
              const isSelected = source === s.key;
              const label = lang === 'en' ? s.labelEn : s.labelId;
              return (
                <TouchableOpacity
                  key={s.key}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isSelected ? colors.accentSoft : colors.surfaceElevated,
                      borderColor: isSelected ? colors.accent : colors.border,
                    },
                  ]}
                  onPress={() => setSource(s.key)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={s.iconName as any}
                    size={14}
                    color={isSelected ? colors.accent : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.chipText,
                      { color: isSelected ? colors.accent : colors.textSecondary },
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {source === 'OTHER' && (
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                  marginTop: 8,
                },
              ]}
              placeholder={t('form.sourceOtherPlaceholder')}
              placeholderTextColor={colors.textMuted}
              value={sourceOther}
              onChangeText={setSourceOther}
            />
          )}
        </View>

        {/* Initial Status Selector */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
            {t('form.status')} <Text style={{ color: colors.danger }}>*</Text>
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
            {statuses.map((st) => {
              const isSelected = statusId === st.id;
              return (
                <TouchableOpacity
                  key={st.id}
                  onPress={() => setStatusId(st.id)}
                  activeOpacity={0.7}
                  style={[
                    styles.statusPillWrapper,
                    isSelected && { borderColor: colors.accent, borderWidth: 1.5 },
                  ]}
                >
                  <StatusBadge status={st} size="sm" />
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Applied Date */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
            {t('form.appliedDate')} <Text style={{ color: colors.danger }}>*</Text>
          </Text>
          <TouchableOpacity
            style={[
              styles.datePickerBtn,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
              },
            ]}
            onPress={() => setShowAppliedPicker(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="calendar-outline" size={16} color={colors.accent} />
            <Text style={[styles.dateText, { color: colors.textPrimary }]}>
              {appliedDate}
            </Text>
          </TouchableOpacity>

          {showAppliedPicker && (
            <DateTimePicker
              value={new Date(appliedDate)}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, date) => {
                setShowAppliedPicker(false);
                if (date) {
                  setAppliedDate(date.toISOString().split('T')[0]);
                }
              }}
            />
          )}
        </View>
      </View>

      {/* SECTION 2: ACCORDION FOR SALARY & ADDITIONAL DETAILS */}
      <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <TouchableOpacity
          style={styles.accordionHeader}
          onPress={() => setShowDetails(!showDetails)}
          activeOpacity={0.8}
        >
          <View style={styles.accordionTitleRow}>
            <Ionicons
              name="cash-outline"
              size={18}
              color={colors.accent}
            />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              {t('form.detailsSection')}
            </Text>
          </View>
          <Ionicons
            name={showDetails ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={colors.textSecondary}
          />
        </TouchableOpacity>

        {showDetails && (
          <View style={styles.accordionBody}>
            {/* Salary Type Selector */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                {t('form.salaryType')}
              </Text>
              <View style={styles.segmentedRow}>
                {(['POSTED', 'EXPECTED', 'OFFERED'] as SalaryType[]).map((st) => {
                  const isSelected = salaryType === st;
                  const label =
                    st === 'POSTED'
                      ? t('form.salaryTypePosted')
                      : st === 'EXPECTED'
                      ? t('form.salaryTypeExpected')
                      : t('form.salaryTypeOffered');
                  return (
                    <TouchableOpacity
                      key={st}
                      style={[
                        styles.segmentedBtn,
                        {
                          backgroundColor: isSelected ? colors.surfaceHighlight : colors.surfaceElevated,
                          borderColor: isSelected ? colors.accent : colors.border,
                        },
                      ]}
                      onPress={() => setSalaryType(st)}
                    >
                      <Text
                        style={[
                          styles.segmentedText,
                          {
                            color: isSelected ? colors.accent : colors.textSecondary,
                            fontWeight: isSelected ? '700' : '500',
                          },
                        ]}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Salary Min & Max */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                {t('form.salaryInfo')} (Rp)
              </Text>
              <View style={styles.twoColumnRow}>
                <View style={{ flex: 1 }}>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.surfaceElevated,
                        borderColor: colors.border,
                        color: colors.textPrimary,
                      },
                    ]}
                    placeholder={t('form.salaryMin')}
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                    value={salaryMinStr}
                    onChangeText={(val) => setSalaryMinStr(formatNumberWithDots(val))}
                  />
                </View>
                <Text style={[styles.separator, { color: colors.textMuted }]}>-</Text>
                <View style={{ flex: 1 }}>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.surfaceElevated,
                        borderColor: colors.border,
                        color: colors.textPrimary,
                      },
                    ]}
                    placeholder={t('form.salaryMax')}
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                    value={salaryMaxStr}
                    onChangeText={(val) => setSalaryMaxStr(formatNumberWithDots(val))}
                  />
                </View>
              </View>
            </View>

            {/* Salary Period (Monthly / Yearly) */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                {t('form.salaryPeriod')}
              </Text>
              <View style={styles.segmentedRow}>
                <TouchableOpacity
                  style={[
                    styles.segmentedBtn,
                    {
                      backgroundColor: salaryPeriod === 'MONTHLY' ? colors.surfaceHighlight : colors.surfaceElevated,
                      borderColor: salaryPeriod === 'MONTHLY' ? colors.accent : colors.border,
                    },
                  ]}
                  onPress={() => setSalaryPeriod('MONTHLY')}
                >
                  <Text
                    style={[
                      styles.segmentedText,
                      { color: salaryPeriod === 'MONTHLY' ? colors.accent : colors.textSecondary },
                    ]}
                  >
                    {t('form.monthly')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.segmentedBtn,
                    {
                      backgroundColor: salaryPeriod === 'YEARLY' ? colors.surfaceHighlight : colors.surfaceElevated,
                      borderColor: salaryPeriod === 'YEARLY' ? colors.accent : colors.border,
                    },
                  ]}
                  onPress={() => setSalaryPeriod('YEARLY')}
                >
                  <Text
                    style={[
                      styles.segmentedText,
                      { color: salaryPeriod === 'YEARLY' ? colors.accent : colors.textSecondary },
                    ]}
                  >
                    {t('form.yearly')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Work Type (WFO/Hybrid/Remote) */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                {t('form.workType')}
              </Text>
              <View style={styles.chipsRow}>
                {(['ONSITE', 'HYBRID', 'REMOTE'] as WorkType[]).map((wt) => {
                  const isSelected = workType === wt;
                  const label =
                    wt === 'ONSITE'
                      ? t('form.onsite')
                      : wt === 'HYBRID'
                      ? t('form.hybrid')
                      : t('form.remote');
                  return (
                    <TouchableOpacity
                      key={wt}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: isSelected ? colors.accentSoft : colors.surfaceElevated,
                          borderColor: isSelected ? colors.accent : colors.border,
                        },
                      ]}
                      onPress={() => setWorkType(isSelected ? null : wt)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          { color: isSelected ? colors.accent : colors.textSecondary },
                        ]}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Employment Type (Fulltime/Contract/Intern) */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                {t('form.employmentType')}
              </Text>
              <View style={styles.chipsRow}>
                {(['FULL_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE'] as EmploymentType[]).map(
                  (et) => {
                    const isSelected = employmentType === et;
                    const label =
                      et === 'FULL_TIME'
                        ? t('form.fullTime')
                        : et === 'CONTRACT'
                        ? t('form.contract')
                        : et === 'INTERNSHIP'
                        ? t('form.internship')
                        : t('form.freelance');
                    return (
                      <TouchableOpacity
                        key={et}
                        style={[
                          styles.chip,
                          {
                            backgroundColor: isSelected ? colors.accentSoft : colors.surfaceElevated,
                            borderColor: isSelected ? colors.accent : colors.border,
                          },
                        ]}
                        onPress={() => setEmploymentType(isSelected ? null : et)}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            { color: isSelected ? colors.accent : colors.textSecondary },
                          ]}
                        >
                          {label}
                        </Text>
                      </TouchableOpacity>
                    );
                  }
                )}
              </View>
            </View>

            {/* Location */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                {t('form.location')}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surfaceElevated,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  },
                ]}
                placeholder={t('form.locationPlaceholder')}
                placeholderTextColor={colors.textMuted}
                value={location}
                onChangeText={setLocation}
              />
            </View>

            {/* Job URL */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                {t('form.jobUrl')}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surfaceElevated,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  },
                ]}
                placeholder={t('form.jobUrlPlaceholder')}
                placeholderTextColor={colors.textMuted}
                value={jobUrl}
                onChangeText={setJobUrl}
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>

            {/* Recruiter Contact */}
            <View style={styles.twoColumnRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                  {t('form.contactName')}
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.surfaceElevated,
                      borderColor: colors.border,
                      color: colors.textPrimary,
                    },
                  ]}
                  placeholder={t('form.contactNamePlaceholder')}
                  placeholderTextColor={colors.textMuted}
                  value={contactName}
                  onChangeText={setContactName}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                  {t('form.contactInfo')}
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.surfaceElevated,
                      borderColor: colors.border,
                      color: colors.textPrimary,
                    },
                  ]}
                  placeholder={t('form.contactInfoPlaceholder')}
                  placeholderTextColor={colors.textMuted}
                  value={contactInfo}
                  onChangeText={setContactInfo}
                />
              </View>
            </View>

            {/* Follow-up Reminder Date */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                {t('form.followUpDate')}
              </Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  style={[
                    styles.datePickerBtn,
                    {
                      flex: 1,
                      backgroundColor: colors.surfaceElevated,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => setShowFollowUpPicker(true)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="notifications-outline" size={16} color={colors.accent} />
                  <Text
                    style={[
                      styles.dateText,
                      { color: followUpDate ? colors.textPrimary : colors.textMuted },
                    ]}
                  >
                    {followUpDate || 'Pilih tanggal pengingat'}
                  </Text>
                </TouchableOpacity>
                {followUpDate && (
                  <TouchableOpacity
                    style={[
                      styles.clearDateBtn,
                      { backgroundColor: colors.surfaceHighlight, borderColor: colors.border },
                    ]}
                    onPress={() => setFollowUpDate(null)}
                  >
                    <Ionicons name="close" size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>

              {showFollowUpPicker && (
                <DateTimePicker
                  value={followUpDate ? new Date(followUpDate) : new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, date) => {
                    setShowFollowUpPicker(false);
                    if (date) {
                      setFollowUpDate(date.toISOString().split('T')[0]);
                    }
                  }}
                />
              )}
            </View>

            {/* Notes */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                {t('form.notes')}
              </Text>
              <TextInput
                style={[
                  styles.textArea,
                  {
                    backgroundColor: colors.surfaceElevated,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  },
                ]}
                placeholder={t('form.notesPlaceholder')}
                placeholderTextColor={colors.textMuted}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.cancelBtn, { borderColor: colors.border }]}
          onPress={onCancel}
          activeOpacity={0.7}
        >
          <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>
            {t('common.cancel')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: colors.primaryButtonBg }]}
          onPress={handleSubmit}
          activeOpacity={0.85}
        >
          <Text style={[styles.submitBtnText, { color: colors.primaryButtonText }]}>
            {t('common.save')}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  warningText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  sectionCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  sectionHeader: {
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  accordionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accordionBody: {
    gap: 14,
    marginTop: 10,
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
  },
  textArea: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusPillWrapper: {
    borderRadius: 999,
  },
  datePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  clearDateBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '600',
  },
  segmentedRow: {
    flexDirection: 'row',
    gap: 8,
  },
  segmentedBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    borderWidth: 1,
  },
  segmentedText: {
    fontSize: 11,
  },
  twoColumnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  separator: {
    fontSize: 16,
    fontWeight: '700',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  submitBtn: {
    flex: 2,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});

