import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../theme/colors';
import { formatDate, toISODate } from '../lib/date';

type Props = {
  label: string;
  value: string | null;
  onChange: (isoDate: string | null) => void;
};

export default function DueDatePicker({ label, value, onChange }: Props) {
  const [showPicker, setShowPicker] = useState(false);
  const dateValue = value ? new Date(`${value}T00:00:00`) : new Date();

  const handleChange = (event: any, selected?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (event?.type === 'dismissed') return;
    if (selected) {
      onChange(toISODate(selected));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {value && (
          <Pressable onPress={() => onChange(null)} hitSlop={8}>
            <Text style={styles.clear}>Retirer</Text>
          </Pressable>
        )}
      </View>

      {Platform.OS === 'web' ? (
        <View style={styles.webField}>
          <Ionicons name="calendar-outline" size={18} color={colors.primary} />
          <DateTimePicker
            value={dateValue}
            mode="date"
            display="default"
            onChange={handleChange}
            style={styles.webInput}
          />
        </View>
      ) : (
        <>
          <Pressable style={styles.field} onPress={() => setShowPicker(true)}>
            <Ionicons name="calendar-outline" size={18} color={colors.primary} />
            <Text style={styles.fieldText}>
              {value ? formatDate(value) : 'Sélectionner une date'}
            </Text>
          </Pressable>
          {showPicker && (
            <DateTimePicker
              value={dateValue}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              onChange={handleChange}
            />
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  label: { ...typography.small, color: colors.textSecondary, fontWeight: '600' },
  clear: { ...typography.small, color: colors.error, fontWeight: '600' },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
  },
  fieldText: { ...typography.body, color: colors.text },
  webField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
  },
  webInput: { flex: 1 },
});