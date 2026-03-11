import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { ChevronUp, ChevronDown } from 'lucide-react-native';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { Card } from '@/components/Card';

export type TimePickerValue = {
  hours: number;
  minutes: number;
  period: 'AM' | 'PM';
};

type TimePickerProps = {
  visible: boolean;
  time: TimePickerValue;
  onClose: () => void;
  onSave: (time: TimePickerValue) => void;
  title: string;
};

export function TimePicker({ visible, time, onClose, onSave, title }: TimePickerProps) {
  const [selectedTime, setSelectedTime] = React.useState(time);

  React.useEffect(() => {
    if (visible) setSelectedTime(time);
  }, [visible, time]);

  const adjustHours = (increment: boolean) => {
    setSelectedTime(prev => ({
      ...prev,
      hours: increment
        ? prev.hours === 12 ? 1 : prev.hours + 1
        : prev.hours === 1 ? 12 : prev.hours - 1,
    }));
  };

  const adjustMinutes = (increment: boolean) => {
    setSelectedTime(prev => ({
      ...prev,
      minutes: increment
        ? prev.minutes === 45 ? 0 : prev.minutes + 15
        : prev.minutes === 0 ? 45 : prev.minutes - 15,
    }));
  };

  const togglePeriod = () => {
    setSelectedTime(prev => ({
      ...prev,
      period: prev.period === 'AM' ? 'PM' : 'AM',
    }));
  };

  const handleSave = () => {
    onSave(selectedTime);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <Card style={styles.timePickerModal}>
          <Text style={styles.timePickerTitle}>{title}</Text>

          <View style={styles.timePickerContent}>
            <View style={styles.timeColumn}>
              <TouchableOpacity onPress={() => adjustHours(true)} style={styles.timeAdjustButton}>
                <ChevronUp color={colors.cream} size={24} />
              </TouchableOpacity>
              <Text style={styles.timeDisplay}>{selectedTime.hours.toString().padStart(2, '0')}</Text>
              <TouchableOpacity onPress={() => adjustHours(false)} style={styles.timeAdjustButton}>
                <ChevronDown color={colors.cream} size={24} />
              </TouchableOpacity>
            </View>

            <Text style={styles.timeSeparator}>:</Text>

            <View style={styles.timeColumn}>
              <TouchableOpacity onPress={() => adjustMinutes(true)} style={styles.timeAdjustButton}>
                <ChevronUp color={colors.cream} size={24} />
              </TouchableOpacity>
              <Text style={styles.timeDisplay}>{selectedTime.minutes.toString().padStart(2, '0')}</Text>
              <TouchableOpacity onPress={() => adjustMinutes(false)} style={styles.timeAdjustButton}>
                <ChevronDown color={colors.cream} size={24} />
              </TouchableOpacity>
            </View>

            <View style={styles.timeColumn}>
              <TouchableOpacity onPress={togglePeriod} style={styles.periodButton}>
                <Text style={styles.periodText}>{selectedTime.period}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.timePickerActions}>
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </Card>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  timePickerModal: {
    width: '100%',
    maxWidth: 400,
    padding: spacing.xl,
  },
  timePickerTitle: {
    ...typography.h2,
    color: colors.cream,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  timePickerContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  timeColumn: {
    alignItems: 'center',
    gap: spacing.md,
  },
  timeAdjustButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeDisplay: {
    ...typography.h1,
    color: colors.cream,
    fontSize: 40,
    minWidth: 80,
    textAlign: 'center',
  },
  timeSeparator: {
    ...typography.h1,
    color: colors.textMuted,
    fontSize: 40,
    marginTop: spacing.xl,
  },
  periodButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.blue,
    marginTop: spacing.xl,
  },
  periodText: {
    ...typography.h3,
    color: colors.dark,
    fontFamily: 'Fredoka-Medium',
  },
  timePickerActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  cancelButtonText: {
    ...typography.body,
    color: colors.textMuted,
    fontFamily: 'Fredoka-Medium',
  },
  saveButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.cream,
    alignItems: 'center',
  },
  saveButtonText: {
    ...typography.body,
    color: colors.dark,
    fontFamily: 'Fredoka-Medium',
  },
});
