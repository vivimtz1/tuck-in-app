import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { Card } from '@/components/Card';
import {
  type Alarm,
  type DayAbbrev,
  DAY_ABBREVS,
  SOUND_OPTIONS,
  time24ToPicker,
  pickerToTime24,
} from '@/types/alarm';

const ITEM_HEIGHT = 44;
const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);
const PERIODS: ('AM' | 'PM')[] = ['AM', 'PM'];

type AlarmEditModalProps = {
  alarm: Alarm;
  onSave: (alarm: Alarm) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  saveError?: string | null;
};

export function AlarmEditModal({ alarm, onSave, onDelete, onClose, saveError }: AlarmEditModalProps) {
  const [label, setLabel] = useState(alarm.label);
  const [hours, setHours] = useState(() => time24ToPicker(alarm.time).hours);
  const [minutes, setMinutes] = useState(() => {
    const m = time24ToPicker(alarm.time).minutes;
    return Math.round(m / 5) * 5;
  });
  const [period, setPeriod] = useState<'AM' | 'PM'>(() => time24ToPicker(alarm.time).period);
  const [days, setDays] = useState<DayAbbrev[]>([...alarm.days]);
  const [sound, setSound] = useState(alarm.sound);
  const [volume, setVolume] = useState(alarm.volume);
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [showSoundDropdown, setShowSoundDropdown] = useState(false);
  const hoursRef = useRef<ScrollView>(null);
  const minutesRef = useRef<ScrollView>(null);
  const periodRef = useRef<ScrollView>(null);

  useEffect(() => {
    setLabel(alarm.label);
    const p = time24ToPicker(alarm.time);
    setHours(p.hours);
    setMinutes(Math.round(p.minutes / 5) * 5);
    setPeriod(p.period);
    setDays([...alarm.days]);
    setSound(alarm.sound);
    setVolume(alarm.volume);
  }, [alarm]);

  useEffect(() => {
    if (showTimeDropdown) {
      const hi = HOURS.indexOf(hours);
      const mi = MINUTES.indexOf(minutes);
      const pi = PERIODS.indexOf(period);
      const centerOffset = ITEM_HEIGHT * 2 + ITEM_HEIGHT / 2;
      const scrollY = (index: number) =>
        Math.max(0, ITEM_HEIGHT * 2 + index * ITEM_HEIGHT - centerOffset);
      setTimeout(() => {
        hoursRef.current?.scrollTo({ y: scrollY(hi), animated: false });
        minutesRef.current?.scrollTo({ y: scrollY(mi), animated: false });
        periodRef.current?.scrollTo({ y: scrollY(pi), animated: false });
      }, 50);
    }
  }, [showTimeDropdown]);

  const toggleDay = (day: DayAbbrev) => {
    setDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort(
        (a, b) => DAY_ABBREVS.indexOf(a) - DAY_ABBREVS.indexOf(b)
      )
    );
  };

  const handleSave = () => {
    const time24 = pickerToTime24({ hours, minutes, period });
    onSave({
      ...alarm,
      label: label.trim() || 'Wake Up',
      time: time24,
      days,
      sound,
      volume: Math.round(volume),
    });
    onClose();
  };

  const handleDelete = () => {
    if (alarm.id !== 'new') {
      onDelete(alarm.id);
    }
    onClose();
  };

  const timeDisplay = `${hours}:${minutes.toString().padStart(2, '0')} ${period}`;

  const handleScrollEnd = (
    type: 'hours' | 'minutes' | 'period',
    e: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const y = e.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    if (type === 'hours') setHours(HOURS[Math.max(0, Math.min(index, HOURS.length - 1))]);
    if (type === 'minutes') setMinutes(MINUTES[Math.max(0, Math.min(index, MINUTES.length - 1))]);
    if (type === 'period') setPeriod(PERIODS[Math.max(0, Math.min(index, 1))]);
  };

  return (
    <Modal visible={true} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <TouchableOpacity style={styles.headerCancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalHeaderTitle}>
                {alarm.id === 'new' ? 'New Alarm' : 'Edit Alarm'}
              </Text>
              <TouchableOpacity style={styles.headerSaveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
              {saveError ? (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorText}>{saveError}</Text>
                </View>
              ) : null}

              <Text style={styles.fieldLabel}>Label</Text>
              <TextInput
                style={styles.input}
                value={label}
                onChangeText={setLabel}
                placeholder="Wake Up"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={styles.fieldLabel}>Time</Text>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => setShowTimeDropdown((v) => !v)}
              >
                <Text style={styles.timeButtonText}>{timeDisplay}</Text>
                {showTimeDropdown ? (
                  <ChevronUp color={colors.textMuted} size={20} />
                ) : (
                  <ChevronDown color={colors.textMuted} size={20} />
                )}
              </TouchableOpacity>
              {showTimeDropdown && (
                <View style={styles.timeDropdown}>
                  <View style={styles.timeWheelRow}>
                    <View style={styles.timeWheelHighlight} pointerEvents="none" />
                    <ScrollView
                      ref={hoursRef}
                      style={styles.timeWheel}
                      showsVerticalScrollIndicator={false}
                      snapToInterval={ITEM_HEIGHT}
                      snapToAlignment="center"
                      decelerationRate="fast"
                      onMomentumScrollEnd={(e) => handleScrollEnd('hours', e)}
                      contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 2 }}
                    >
                      {HOURS.map((h) => (
                        <View key={h} style={styles.timeWheelItem}>
                          <Text style={styles.timeWheelItemText}>{h}</Text>
                        </View>
                      ))}
                    </ScrollView>
                    <Text style={styles.timeWheelColon}>:</Text>
                    <ScrollView
                      ref={minutesRef}
                      style={styles.timeWheel}
                      showsVerticalScrollIndicator={false}
                      snapToInterval={ITEM_HEIGHT}
                      snapToAlignment="center"
                      decelerationRate="fast"
                      onMomentumScrollEnd={(e) => handleScrollEnd('minutes', e)}
                      contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 2 }}
                    >
                      {MINUTES.map((m) => (
                        <View key={m} style={styles.timeWheelItem}>
                          <Text style={styles.timeWheelItemText}>
                            {m.toString().padStart(2, '0')}
                          </Text>
                        </View>
                      ))}
                    </ScrollView>
                    <ScrollView
                      ref={periodRef}
                      style={styles.timeWheel}
                      showsVerticalScrollIndicator={false}
                      snapToInterval={ITEM_HEIGHT}
                      snapToAlignment="center"
                      decelerationRate="fast"
                      onMomentumScrollEnd={(e) => handleScrollEnd('period', e)}
                      contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 2 }}
                    >
                      {PERIODS.map((p) => (
                        <View key={p} style={styles.timeWheelItem}>
                          <Text style={styles.timeWheelItemText}>{p}</Text>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                </View>
              )}

              <Text style={styles.fieldLabel}>Days</Text>
              <View style={styles.daysRow}>
                {DAY_ABBREVS.map((day) => (
                  <TouchableOpacity
                    key={day}
                    style={[styles.dayChip, days.includes(day) && styles.dayChipActive]}
                    onPress={() => toggleDay(day)}
                  >
                    <Text
                      style={[
                        styles.dayChipText,
                        days.includes(day) && styles.dayChipTextActive,
                      ]}
                    >
                      {day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>Sound</Text>
              <TouchableOpacity
                style={styles.soundDropdownTrigger}
                onPress={() => setShowSoundDropdown((v) => !v)}
              >
                <Text style={styles.soundDropdownTriggerText}>{sound}</Text>
                {showSoundDropdown ? (
                  <ChevronUp color={colors.textMuted} size={20} />
                ) : (
                  <ChevronDown color={colors.textMuted} size={20} />
                )}
              </TouchableOpacity>
              {showSoundDropdown && (
                <View style={styles.soundDropdownList}>
                  <ScrollView
                    nestedScrollEnabled
                    showsVerticalScrollIndicator={true}
                    style={styles.soundScroll}
                  >
                    {SOUND_OPTIONS.map((option) => (
                      <TouchableOpacity
                        key={option}
                        style={[
                          styles.soundOption,
                          sound === option && styles.soundOptionActive,
                        ]}
                        onPress={() => {
                          setSound(option);
                          setShowSoundDropdown(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.soundOptionText,
                            sound === option && styles.soundOptionTextActive,
                          ]}
                        >
                          {option}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              <Text style={styles.fieldLabel}>Volume: {Math.round(volume)}%</Text>
              <View style={styles.sliderRow}>
                <Text style={styles.volumeMin}>0%</Text>
                <Slider
                  style={styles.slider}
                  value={volume}
                  onValueChange={(v) => setVolume(v)}
                  minimumValue={0}
                  maximumValue={100}
                  step={1}
                  minimumTrackTintColor={colors.blue}
                  maximumTrackTintColor={colors.border}
                  thumbTintColor={colors.cream}
                />
                <Text style={styles.volumeMax}>100%</Text>
              </View>

              {alarm.id !== 'new' && (
                <View style={styles.actions}>
                  <Text style={styles.deleteHint}>Tap below to remove this alarm.</Text>
                  <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
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
  modalCard: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '85%',
    padding: 0,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerCancelButton: {
    paddingVertical: spacing.sm,
    paddingRight: spacing.md,
    minWidth: 72,
  },
  headerSaveButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minWidth: 72,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cream,
    borderRadius: borderRadius.md,
  },
  modalHeaderTitle: {
    ...typography.h3,
    color: colors.cream,
  },
  scroll: {
    maxHeight: 500,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  errorBanner: {
    backgroundColor: colors.error + '20',
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    fontFamily: 'Fredoka-Medium',
  },
  fieldLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  input: {
    ...typography.body,
    color: colors.cream,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timeButtonText: {
    ...typography.h3,
    color: colors.cream,
  },
  timeDropdown: {
    marginTop: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  timeWheelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    position: 'relative',
  },
  timeWheelHighlight: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: ITEM_HEIGHT * 2 + spacing.sm,
    height: ITEM_HEIGHT,
    backgroundColor: colors.blue + '35',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.blue + '80',
  },
  timeWheel: {
    height: ITEM_HEIGHT * 5,
    width: 72,
  },
  timeWheelItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeWheelItemText: {
    ...typography.h3,
    color: colors.cream,
  },
  timeWheelColon: {
    ...typography.h2,
    color: colors.textMuted,
    marginHorizontal: spacing.xs,
  },
  daysRow: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: spacing.xs,
  },
  dayChip: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayChipActive: {
    backgroundColor: colors.blue + '30',
    borderColor: colors.blue,
  },
  dayChipText: {
    ...typography.small,
    color: colors.textMuted,
    fontFamily: 'Fredoka-Medium',
    fontSize: 11,
  },
  dayChipTextActive: {
    color: colors.cream,
    fontSize: 11,
  },
  soundList: {
    gap: spacing.xs,
  },
  soundDropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  soundDropdownTriggerText: {
    ...typography.body,
    color: colors.cream,
  },
  soundDropdownList: {
    maxHeight: 160,
    marginTop: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  soundScroll: {
    maxHeight: 158,
  },
  soundOption: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
  },
  soundOptionActive: {
    backgroundColor: colors.blue + '30',
    borderWidth: 1,
    borderColor: colors.blue,
  },
  soundOptionText: {
    ...typography.body,
    color: colors.textMuted,
  },
  soundOptionTextActive: {
    color: colors.cream,
    fontFamily: 'Fredoka-Medium',
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  volumeMin: {
    ...typography.small,
    color: colors.textMuted,
    width: 28,
  },
  volumeMax: {
    ...typography.small,
    color: colors.textMuted,
    width: 32,
  },
  actions: {
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  deleteHint: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  deleteButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  deleteButtonText: {
    ...typography.body,
    color: colors.error,
    fontFamily: 'Fredoka-Medium',
  },
  cancelButtonText: {
    ...typography.body,
    color: colors.textMuted,
    fontFamily: 'Fredoka-Medium',
  },
  saveButton: {
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
