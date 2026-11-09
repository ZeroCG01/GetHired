import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { StatusItem } from '../types';
import { StatusColorPresets } from '../constants/theme';
import { useAppTheme } from '../hooks/useAppTheme';

interface StatusBadgeProps {
  status: StatusItem;
  onPress?: () => void;
  showChevron?: boolean;
  size?: 'sm' | 'md';
}

export function StatusBadge({
  status,
  onPress,
  showChevron = false,
  size = 'md',
}: StatusBadgeProps) {
  const { i18n } = useTranslation();
  const { isDark } = useAppTheme();

  const colorPreset = StatusColorPresets[status.colorKey] || StatusColorPresets.slate;
  const styleTokens = isDark ? colorPreset.dark : colorPreset.light;
  const label = i18n.language === 'en' ? status.labelEn : status.labelId;

  const isSmall = size === 'sm';

  const badgeContent = (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: styleTokens.bg,
          borderColor: styleTokens.border,
          paddingHorizontal: isSmall ? 8 : 11,
          paddingVertical: isSmall ? 3 : 5,
        },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: styleTokens.text }]} />
      <Text
        style={[
          styles.text,
          {
            color: styleTokens.text,
            fontSize: isSmall ? 11 : 12,
          },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
      {showChevron && (
        <Ionicons
          name="chevron-down"
          size={isSmall ? 12 : 14}
          color={styleTokens.text}
          style={{ marginLeft: 2 }}
        />
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        {badgeContent}
      </TouchableOpacity>
    );
  }

  return badgeContent;
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999, // full pill shape
    borderWidth: 1,
    alignSelf: 'flex-start',
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontWeight: '600',
    letterSpacing: -0.2,
  },
});

