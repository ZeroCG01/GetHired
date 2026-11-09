import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { useAppTheme } from '../../hooks/useAppTheme';
import { useAppStore } from '../../store/useAppStore';
import { AppLanguage, ThemeMode } from '../../types';
import { exportApplicationsToCsv } from '../../utils/export';
import { clearAllData } from '../../db/applications';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { colors, themeMode } = useAppTheme();
  const language = useAppStore((state) => state.language);
  const setThemeMode = useAppStore((state) => state.setThemeMode);
  const setLanguage = useAppStore((state) => state.setLanguage);
  const triggerDataRefresh = useAppStore((state) => state.triggerDataRefresh);

  const [exporting, setExporting] = useState<boolean>(false);

  const handleExportCsv = async () => {
    setExporting(true);
    const result = await exportApplicationsToCsv();
    setExporting(false);
    if (!result.success && result.error) {
      Alert.alert('Export Gagal', result.error);
    }
  };

  const handleClearAllData = () => {
    Alert.alert(
      t('settings.clearDataConfirmTitle'),
      t('settings.clearDataConfirmDesc'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            clearAllData();
            triggerDataRefresh();
            Alert.alert('Sukses', 'Seluruh data lamaran berhasil dibersihkan.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.brandRow}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            {t('settings.title')}
          </Text>
          <View style={[styles.accentDot, { backgroundColor: colors.accent }]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Section: Language */}
        <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
          {t('settings.language')}
        </Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.row, { borderBottomColor: colors.border, borderBottomWidth: 1 }]}
            onPress={() => setLanguage('id')}
            activeOpacity={0.7}
          >
            <View style={styles.rowLeft}>
              <Text style={{ fontSize: 20 }}>🇮🇩</Text>
              <Text style={[styles.rowText, { color: colors.textPrimary }]}>
                Bahasa Indonesia
              </Text>
            </View>
            {language === 'id' && (
              <Ionicons name="checkmark-circle" size={22} color={colors.accent} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.row}
            onPress={() => setLanguage('en')}
            activeOpacity={0.7}
          >
            <View style={styles.rowLeft}>
              <Text style={{ fontSize: 20 }}>🇬🇧</Text>
              <Text style={[styles.rowText, { color: colors.textPrimary }]}>
                English
              </Text>
            </View>
            {language === 'en' && (
              <Ionicons name="checkmark-circle" size={22} color={colors.accent} />
            )}
          </TouchableOpacity>
        </View>

        {/* Section: Theme */}
        <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
          {t('settings.theme')}
        </Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {(['dark', 'light', 'system'] as ThemeMode[]).map((mode, index, arr) => {
            const isSelected = themeMode === mode;
            const isLast = index === arr.length - 1;
            const iconName =
              mode === 'dark' ? 'moon-outline' : mode === 'light' ? 'sunny-outline' : 'phone-portrait-outline';
            const label =
              mode === 'dark'
                ? t('settings.themeDark')
                : mode === 'light'
                ? t('settings.themeLight')
                : t('settings.themeSystem');

            return (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.row,
                  !isLast && { borderBottomColor: colors.border, borderBottomWidth: 1 },
                ]}
                onPress={() => setThemeMode(mode)}
                activeOpacity={0.7}
              >
                <View style={styles.rowLeft}>
                  <Ionicons name={iconName} size={20} color={isSelected ? colors.accent : colors.textSecondary} />
                  <Text style={[styles.rowText, { color: colors.textPrimary }]}>
                    {label}
                  </Text>
                </View>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={22} color={colors.accent} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Section: Pipeline & Custom Statuses */}
        <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
          {t('settings.general')}
        </Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity
            style={styles.row}
            onPress={() => router.push('/statuses')}
            activeOpacity={0.7}
          >
            <View style={styles.rowLeft}>
              <Ionicons name="color-palette-outline" size={20} color={colors.accent} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowText, { color: colors.textPrimary }]}>
                  {t('settings.customStatuses')}
                </Text>
                <Text style={[styles.rowSubtext, { color: colors.textMuted }]}>
                  {t('settings.customStatusesDesc')}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Section: Data & Backup */}
        <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
          {t('settings.dataAndBackup')}
        </Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Export to CSV */}
          <TouchableOpacity
            style={[styles.row, { borderBottomColor: colors.border, borderBottomWidth: 1 }]}
            onPress={handleExportCsv}
            disabled={exporting}
            activeOpacity={0.7}
          >
            <View style={styles.rowLeft}>
              <Ionicons name="document-text-outline" size={20} color={colors.accent} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowText, { color: colors.textPrimary }]}>
                  {t('settings.exportCsv')}
                </Text>
                <Text style={[styles.rowSubtext, { color: colors.textMuted }]}>
                  {t('settings.exportCsvDesc')}
                </Text>
              </View>
            </View>
            {exporting ? (
              <ActivityIndicator size="small" color={colors.accent} />
            ) : (
              <Ionicons name="share-outline" size={18} color={colors.accent} />
            )}
          </TouchableOpacity>

          {/* Clear All Data */}
          <TouchableOpacity
            style={styles.row}
            onPress={handleClearAllData}
            activeOpacity={0.7}
          >
            <View style={styles.rowLeft}>
              <Ionicons name="trash-outline" size={20} color={colors.danger} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowText, { color: colors.danger }]}>
                  {t('settings.clearData')}
                </Text>
                <Text style={[styles.rowSubtext, { color: colors.textMuted }]}>
                  {t('settings.clearDataDesc')}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Section: About */}
        <View style={styles.aboutContainer}>
          <Text style={[styles.aboutText, { color: colors.textMuted }]}>
            {t('settings.version', { version: '1.0.0' })}
          </Text>
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
    gap: 12,
    paddingBottom: 40,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 10,
    marginBottom: 4,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  rowText: {
    fontSize: 15,
    fontWeight: '600',
  },
  rowSubtext: {
    fontSize: 12,
    marginTop: 2,
  },
  aboutContainer: {
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 10,
  },
  aboutText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
