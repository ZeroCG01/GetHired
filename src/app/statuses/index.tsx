import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { StatusColorKey, StatusGroup, StatusItem } from '../../types';
import {
  getAllStatuses,
  createCustomStatus,
  deleteCustomStatus,
} from '../../db/statuses';
import { StatusBadge } from '../../components/StatusBadge';
import { StatusColorPresets } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useAppStore } from '../../store/useAppStore';

const PRESET_COLORS: StatusColorKey[] = [
  'cyan',
  'blue',
  'purple',
  'indigo',
  'emerald',
  'amber',
  'orange',
  'rose',
  'slate',
];

export default function StatusesScreen() {
  const { t } = useTranslation();
  const { colors, isDark } = useAppTheme();
  const triggerDataRefresh = useAppStore((state) => state.triggerDataRefresh);

  const [statuses, setStatuses] = useState<StatusItem[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  // Form states for new custom status
  const [nameId, setNameId] = useState<string>('');
  const [nameEn, setNameEn] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<StatusColorKey>('cyan');
  const [selectedGroup, setSelectedGroup] = useState<StatusGroup>('ACTIVE');

  const loadStatuses = useCallback(() => {
    setStatuses(getAllStatuses());
  }, []);

  useEffect(() => {
    loadStatuses();
  }, [loadStatuses]);

  const handleCreateStatus = () => {
    if (!nameId.trim()) {
      Alert.alert(t('common.required'), 'Nama status wajib diisi');
      return;
    }

    try {
      createCustomStatus({
        labelId: nameId.trim(),
        labelEn: nameEn.trim() || nameId.trim(),
        colorKey: selectedColor,
        group: selectedGroup,
      });

      triggerDataRefresh();
      loadStatuses();
      setModalVisible(false);
      setNameId('');
      setNameEn('');
      setSelectedColor('cyan');
      setSelectedGroup('ACTIVE');
    } catch (e) {
      console.warn('Failed to create status:', e);
    }
  };

  const handleDelete = (status: StatusItem) => {
    if (status.isDefault) return;

    Alert.alert(
      'Hapus Status Kustom?',
      `Apakah kamu yakin ingin menghapus status "${status.labelId}"?`,
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            const result = deleteCustomStatus(status.id);
            if (!result.success) {
              if (result.errorReason === 'IN_USE') {
                Alert.alert(
                  'Tidak Dapat Dihapus',
                  t('statuses.cannotDeleteUsed', { count: result.usedCount || 0 })
                );
              }
              return;
            }
            triggerDataRefresh();
            loadStatuses();
          },
        },
      ]
    );
  };

  const activeStatuses = statuses.filter((s) => s.group === 'ACTIVE');
  const completedStatuses = statuses.filter((s) => s.group === 'COMPLETED');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Top Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          {t('statuses.title')}
        </Text>

        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={[styles.addBtn, { backgroundColor: colors.primaryButtonBg }]}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={16} color={colors.primaryButtonText} />
          <Text style={[styles.addBtnText, { color: colors.primaryButtonText }]}>
            {t('statuses.addCustom')}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Active Stages Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            {t('statuses.activeGroup')} ({activeStatuses.length})
          </Text>
          <View style={[styles.listCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {activeStatuses.map((st, index) => {
              const isLast = index === activeStatuses.length - 1;
              return (
                <View
                  key={st.id}
                  style={[
                    styles.statusItemRow,
                    !isLast && { borderBottomColor: colors.border, borderBottomWidth: 1 },
                  ]}
                >
                  <View style={styles.statusLeft}>
                    <StatusBadge status={st} size="md" />
                  </View>

                  {st.isDefault ? (
                    <View style={[styles.defaultTag, { backgroundColor: colors.surfaceHighlight }]}>
                      <Text style={[styles.defaultTagText, { color: colors.textMuted }]}>
                        {t('statuses.defaultBadge')}
                      </Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={() => handleDelete(st)}
                      style={styles.deleteBtn}
                    >
                      <Ionicons name="trash-outline" size={18} color={colors.danger} />
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Completed Stages Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            {t('statuses.completedGroup')} ({completedStatuses.length})
          </Text>
          <View style={[styles.listCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {completedStatuses.map((st, index) => {
              const isLast = index === completedStatuses.length - 1;
              return (
                <View
                  key={st.id}
                  style={[
                    styles.statusItemRow,
                    !isLast && { borderBottomColor: colors.border, borderBottomWidth: 1 },
                  ]}
                >
                  <View style={styles.statusLeft}>
                    <StatusBadge status={st} size="md" />
                  </View>

                  {st.isDefault ? (
                    <View style={[styles.defaultTag, { backgroundColor: colors.surfaceHighlight }]}>
                      <Text style={[styles.defaultTagText, { color: colors.textMuted }]}>
                        {t('statuses.defaultBadge')}
                      </Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={() => handleDelete(st)}
                      style={styles.deleteBtn}
                    >
                      <Ionicons name="trash-outline" size={18} color={colors.danger} />
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Modal: Tambah Status Kustom Baru */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                {t('statuses.addCustom')}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody}>
              {/* Nama ID */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                  {t('statuses.nameId')} <Text style={{ color: colors.danger }}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.textPrimary,
                    },
                  ]}
                  placeholder="misal: Medical Check Up (MCU)"
                  placeholderTextColor={colors.textMuted}
                  value={nameId}
                  onChangeText={setNameId}
                />
              </View>

              {/* Nama EN */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                  {t('statuses.nameEn')} ({t('common.optional')})
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.textPrimary,
                    },
                  ]}
                  placeholder="e.g. Medical Check Up"
                  placeholderTextColor={colors.textMuted}
                  value={nameEn}
                  onChangeText={setNameEn}
                />
              </View>

              {/* Kelompok Tahapan (Aktif / Selesai) */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                  {t('statuses.group')}
                </Text>
                <View style={styles.segmentedRow}>
                  <TouchableOpacity
                    style={[
                      styles.segmentedBtn,
                      {
                        backgroundColor: selectedGroup === 'ACTIVE' ? colors.surfaceHighlight : colors.surface,
                        borderColor: selectedGroup === 'ACTIVE' ? colors.accent : colors.border,
                      },
                    ]}
                    onPress={() => setSelectedGroup('ACTIVE')}
                  >
                    <Text
                      style={[
                        styles.segmentedText,
                        { color: selectedGroup === 'ACTIVE' ? colors.accent : colors.textSecondary },
                      ]}
                    >
                      {t('common.active')} (Dalam Proses)
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.segmentedBtn,
                      {
                        backgroundColor: selectedGroup === 'COMPLETED' ? colors.surfaceHighlight : colors.surface,
                        borderColor: selectedGroup === 'COMPLETED' ? colors.accent : colors.border,
                      },
                    ]}
                    onPress={() => setSelectedGroup('COMPLETED')}
                  >
                    <Text
                      style={[
                        styles.segmentedText,
                        { color: selectedGroup === 'COMPLETED' ? colors.accent : colors.textSecondary },
                      ]}
                    >
                      {t('common.completed')} (Hasil Akhir)
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Warna Preset */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                  {t('statuses.color')}
                </Text>
                <View style={styles.colorPaletteGrid}>
                  {PRESET_COLORS.map((colorKey) => {
                    const preset = StatusColorPresets[colorKey];
                    const token = isDark ? preset.dark : preset.light;
                    const isSelected = selectedColor === colorKey;

                    return (
                      <TouchableOpacity
                        key={colorKey}
                        style={[
                          styles.colorCircle,
                          {
                            backgroundColor: token.bg,
                            borderColor: isSelected ? token.text : token.border,
                            borderWidth: isSelected ? 2.5 : 1,
                          },
                        ]}
                        onPress={() => setSelectedColor(colorKey)}
                        activeOpacity={0.8}
                      >
                        <View style={[styles.colorDot, { backgroundColor: token.text }]} />
                        {isSelected && (
                          <Ionicons name="checkmark" size={14} color={token.text} style={{ position: 'absolute' }} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, { borderColor: colors.border }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.modalCancelText, { color: colors.textSecondary }]}>
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalSubmitBtn, { backgroundColor: colors.primaryButtonBg }]}
                onPress={handleCreateStatus}
              >
                <Text style={[styles.modalSubmitText, { color: colors.primaryButtonText }]}>
                  {t('common.save')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  content: {
    padding: 16,
    gap: 20,
    paddingBottom: 40,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  statusItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  statusLeft: {
    flex: 1,
  },
  defaultTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  defaultTagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  deleteBtn: {
    padding: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    borderRadius: 18,
    borderWidth: 1,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalBody: {
    padding: 16,
    gap: 14,
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
  segmentedRow: {
    flexDirection: 'row',
    gap: 8,
  },
  segmentedBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1,
  },
  segmentedText: {
    fontSize: 11,
    fontWeight: '600',
  },
  colorPaletteGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1,
  },
  modalCancelText: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalSubmitBtn: {
    flex: 1.5,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  modalSubmitText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
