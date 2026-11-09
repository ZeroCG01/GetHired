import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { useAppTheme } from '../../../hooks/useAppTheme';
import { useAppStore } from '../../../store/useAppStore';
import { getApplicationById, updateApplication } from '../../../db/applications';
import { ApplicationForm } from '../../../components/ApplicationForm';
import { JobApplication } from '../../../types';

export default function EditApplicationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const triggerDataRefresh = useAppStore((state) => state.triggerDataRefresh);

  const [application, setApplication] = useState<JobApplication | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (id) {
      const data = getApplicationById(id);
      setApplication(data);
      setLoading(false);
    }
  }, [id]);

  const handleUpdate = (data: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    if (!id) return;
    try {
      updateApplication(id, data);
      triggerDataRefresh();
      router.back();
    } catch (e) {
      console.warn('Failed to update application:', e);
    }
  };

  if (loading || !application) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          {t('form.editTitle')}
        </Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Form */}
      <ApplicationForm
        initialData={application}
        onSubmit={handleUpdate}
        onCancel={() => router.back()}
        isEdit
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
  closeBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
});
