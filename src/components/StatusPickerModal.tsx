import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { StatusItem } from '../types';
import { getAllStatuses } from '../db/statuses';
import { StatusBadge } from './StatusBadge';
import { useAppTheme } from '../hooks/useAppTheme';

interface StatusPickerModalProps {
  visible: boolean;
  currentStatusId: string;
  onClose: () => void;
  onSelectStatus: (statusId: string, note?: string) => void;
  companyName?: string;
}

export function StatusPickerModal({
  visible,
  currentStatusId,
  onClose,
  onSelectStatus,
  companyName,
}: StatusPickerModalProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  const [statuses, setStatuses] = useState<StatusItem[]>([]);
  const [selectedId, setSelectedId] = useState<string>(currentStatusId);
  const [note, setNote] = useState<string>('');

  useEffect(() => {
    if (visible) {
      setStatuses(getAllStatuses());
      setSelectedId(currentStatusId);
      setNote('');
    }
  }, [visible, currentStatusId]);

  const handleConfirm = () => {
    onSelectStatus(selectedId, note.trim() || undefined);
    onClose();
  };

  const handleManageStatuses = () => {
    onClose();
    router.push('/statuses');
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={[
                styles.sheet,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.border,
                },
              ]}
            >
              {/* Drag Handle */}
              <View style={[styles.handle, { backgroundColor: colors.border }]} />

              {/* Header */}
              <View style={styles.header}>
                <View>
                  <Text style={[styles.title, { color: colors.textPrimary }]}>
                    {t('home.quickStatusChange')}
                  </Text>
                  {companyName && (
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                      {companyName}
                    </Text>
                  )}
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Ionicons name="close" size={22} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Status List */}
              <ScrollView
                style={styles.scrollList}
                contentContainerStyle={styles.statusGrid}
                keyboardShouldPersistTaps="handled"
              >
                {statuses.map((status) => {
                  const isSelected = selectedId === status.id;
                  return (
                    <TouchableOpacity
                      key={status.id}
                      style={[
                        styles.statusRow,
                        {
                          borderColor: isSelected ? colors.accent : colors.border,
                          backgroundColor: isSelected ? colors.surfaceHighlight : colors.surface,
                        },
                      ]}
                      onPress={() => setSelectedId(status.id)}
                      activeOpacity={0.7}
                    >
                      <StatusBadge status={status} size="md" />
                      {isSelected ? (
                        <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
                      ) : (
                        <View style={[styles.radioCircle, { borderColor: colors.textMuted }]} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Optional Note Field */}
              <View style={styles.noteContainer}>
                <Text style={[styles.noteLabel, { color: colors.textSecondary }]}>
                  {t('detail.statusChangeNote')} ({t('common.optional')})
                </Text>
                <TextInput
                  style={[
                    styles.noteInput,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.textPrimary,
                    },
                  ]}
                  placeholder={t('detail.statusChangePlaceholder')}
                  placeholderTextColor={colors.textMuted}
                  value={note}
                  onChangeText={setNote}
                />
              </View>

              {/* Actions */}
              <View style={styles.footer}>
                <TouchableOpacity
                  style={[styles.manageBtn, { borderColor: colors.border }]}
                  onPress={handleManageStatuses}
                >
                  <Ionicons name="settings-outline" size={16} color={colors.textSecondary} />
                  <Text style={[styles.manageBtnText, { color: colors.textSecondary }]}>
                    {t('settings.customStatuses')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.confirmBtn,
                    {
                      backgroundColor: colors.primaryButtonBg,
                    },
                  ]}
                  onPress={handleConfirm}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.confirmBtnText,
                      { color: colors.primaryButtonText },
                    ]}
                  >
                    {t('common.save')}
                  </Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    maxHeight: '85%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: '500',
  },
  closeBtn: {
    padding: 6,
  },
  scrollList: {
    maxHeight: 280,
    paddingHorizontal: 20,
  },
  statusGrid: {
    gap: 8,
    paddingVertical: 6,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
  },
  noteContainer: {
    paddingHorizontal: 20,
    marginTop: 12,
  },
  noteLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  noteInput: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 16,
    gap: 12,
  },
  manageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  manageBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  confirmBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});

