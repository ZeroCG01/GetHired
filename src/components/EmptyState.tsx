import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';

import { useAppTheme } from '../hooks/useAppTheme';

interface EmptyStateProps {
  isFiltered?: boolean;
  onResetFilter?: () => void;
}

export function EmptyState({ isFiltered = false, onResetFilter }: EmptyStateProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.iconCircle, { backgroundColor: colors.accentSoft }]}>
        <Ionicons
          name={isFiltered ? 'search-outline' : 'briefcase-outline'}
          size={36}
          color={colors.accent}
        />
      </View>

      <Text style={[styles.title, { color: colors.textPrimary }]}>
        {isFiltered ? 'Tidak ada hasil yang cocok' : t('common.emptyTitle')}
      </Text>

      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        {isFiltered
          ? 'Coba ubah kata kunci pencarian atau reset filter kamu.'
          : t('common.emptySubtitle')}
      </Text>

      {isFiltered && onResetFilter ? (
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}
          onPress={onResetFilter}
          activeOpacity={0.8}
        >
          <Text style={[styles.btnText, { color: colors.textPrimary }]}>
            Reset Filter
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: colors.primaryButtonBg }]}
          onPress={() => router.push('/application/new')}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={18} color={colors.primaryButtonText} />
          <Text style={[styles.btnText, { color: colors.primaryButtonText }]}>
            {t('common.addApplication')}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 60,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
    marginBottom: 20,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  btnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});

