import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useRef } from 'react';
import { Plus, AlarmClock } from 'lucide-react-native';
import { colors, spacing, typography } from '@/constants/theme';
import { Card } from '@/components/Card';
import { AlarmCard } from '@/components/AlarmCard';
import { AlarmEditModal } from '@/components/AlarmEditModal';
import { supabase } from '@/lib/supabase';
import { type Alarm, type DayAbbrev, DEFAULT_ALARM } from '@/types/alarm';

const LOCAL_ALARMS_KEY = '@tuck_in_local_alarms';

function isLocalId(id: string) {
  return id.startsWith('local-');
}

export default function AlarmsScreen() {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAlarm, setEditingAlarm] = useState<Alarm | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const swipeableRefs = useRef<Record<string, Swipeable | null>>({});

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        await loadAlarms(user.id);
      } else {
        await loadLocalAlarms();
      }
    })();
  }, []);

  const loadLocalAlarms = async () => {
    try {
      const raw = await AsyncStorage.getItem(LOCAL_ALARMS_KEY);
      if (raw) {
        const data = JSON.parse(raw) as Alarm[];
        setAlarms(data.map((row) => ({ ...row, days: (row.days || []) as DayAbbrev[] })));
      }
    } catch (e) {
      console.error('Error loading local alarms:', e);
    }
    setLoading(false);
  };

  const persistLocalAlarms = async (list: Alarm[]) => {
    try {
      await AsyncStorage.setItem(LOCAL_ALARMS_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Error saving local alarms:', e);
    }
  };

  const loadAlarms = async (uid: string) => {
    const { data, error } = await supabase
      .from('alarms')
      .select('*')
      .eq('user_id', uid)
      .order('time', { ascending: true });

    if (error) {
      console.error('Error loading alarms:', error);
    } else if (data) {
      setAlarms(
        (data as { days: string[] }[]).map((row) => ({
          ...row,
          days: row.days as DayAbbrev[],
        })) as Alarm[]
      );
    }
    setLoading(false);
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    if (isLocalId(id)) {
      const next = alarms.map((a) => (a.id === id ? { ...a, enabled } : a));
      setAlarms(next);
      await persistLocalAlarms(next);
      return;
    }
    const { error } = await supabase
      .from('alarms')
      .update({ enabled, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) {
      setAlarms((prev) =>
        prev.map((a) => (a.id === id ? { ...a, enabled } : a))
      );
    }
  };

  const handleSave = async (updatedAlarm: Alarm) => {
    setSaveError(null);

    if (!userId) {
      const id =
        updatedAlarm.id === 'new' ? `local-${Date.now()}` : updatedAlarm.id;
      const savedAlarm: Alarm = { ...updatedAlarm, id };
      const next =
        updatedAlarm.id === 'new'
          ? [...alarms, savedAlarm].sort((a, b) => a.time.localeCompare(b.time))
          : alarms
              .map((a) => (a.id === id ? savedAlarm : a))
              .sort((a, b) => a.time.localeCompare(b.time));
      setAlarms(next);
      await persistLocalAlarms(next);
      setEditingAlarm(null);
      return;
    }

    let savedAlarm: Alarm = updatedAlarm;

    if (updatedAlarm.id === 'new') {
      const { data, error } = await supabase
        .from('alarms')
        .insert({
          user_id: userId,
          label: updatedAlarm.label,
          time: updatedAlarm.time,
          days: updatedAlarm.days,
          alarm_type: updatedAlarm.alarm_type,
          sound: updatedAlarm.sound,
          volume: updatedAlarm.volume,
          enabled: updatedAlarm.enabled,
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving alarm:', error);
        setSaveError(error.message || 'Failed to save alarm');
        return;
      }
      if (data) {
        savedAlarm = {
          ...(data as Record<string, unknown>),
          days: (data as { days: string[] }).days as DayAbbrev[],
        } as Alarm;
        setAlarms((prev) =>
          [...prev, savedAlarm].sort((a, b) => a.time.localeCompare(b.time))
        );
        await loadAlarms(userId);
      }
    } else {
      const { error } = await supabase
        .from('alarms')
        .update({
          label: updatedAlarm.label,
          time: updatedAlarm.time,
          days: updatedAlarm.days,
          alarm_type: updatedAlarm.alarm_type,
          sound: updatedAlarm.sound,
          volume: updatedAlarm.volume,
          enabled: updatedAlarm.enabled,
          updated_at: new Date().toISOString(),
        })
        .eq('id', updatedAlarm.id);

      if (error) {
        console.error('Error updating alarm:', error);
        setSaveError(error.message || 'Failed to update alarm');
        return;
      }
      setAlarms((prev) =>
        prev
          .map((a) => (a.id === updatedAlarm.id ? updatedAlarm : a))
          .sort((a, b) => a.time.localeCompare(b.time))
      );
      await loadAlarms(userId);
    }

    setEditingAlarm(null);
  };

  const handleDelete = async (id: string) => {
    if (isLocalId(id)) {
      const next = alarms.filter((a) => a.id !== id);
      setAlarms(next);
      await persistLocalAlarms(next);
      setEditingAlarm(null);
      return;
    }
    const { error } = await supabase.from('alarms').delete().eq('id', id);

    if (!error) {
      setAlarms((prev) => prev.filter((a) => a.id !== id));
    }
    setEditingAlarm(null);
  };

  const handleAddAlarm = () => {
    const newAlarm: Alarm = {
      ...DEFAULT_ALARM,
      id: 'new',
      days: [...DEFAULT_ALARM.days],
    };
    setEditingAlarm(newAlarm);
  };

  const wakeAlarms = alarms.filter((a) => a.alarm_type === 'wake');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Alarms</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddAlarm}>
            <Plus color={colors.dark} size={18} />
            <Text style={styles.addButtonText}>Add Alarm</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Loading alarms...</Text>
          </View>
        ) : alarms.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <AlarmClock color={colors.textMuted} size={64} strokeWidth={1.5} />
            </View>
            <Text style={styles.emptyTitle}>No alarms set</Text>
            <Text style={styles.emptySubtitle}>
              Tap "Add Alarm" to get started
            </Text>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Wake Up</Text>
            <View style={styles.alarmList}>
              {wakeAlarms.map((alarm) => (
                <Swipeable
                  key={alarm.id}
                  renderRightActions={() => (
                    <View style={styles.swipeActions}>
                      <TouchableOpacity
                        style={[styles.swipeAction, styles.swipeActionEdit]}
                        onPress={() => {
                          setEditingAlarm(alarm);
                          swipeableRefs.current[alarm.id]?.close();
                        }}
                      >
                        <Text style={styles.swipeActionEditText}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.swipeAction, styles.swipeActionDelete]}
                        onPress={() => {
                          handleDelete(alarm.id);
                          swipeableRefs.current[alarm.id]?.close();
                        }}
                      >
                        <Text style={styles.swipeActionDeleteText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  overshootRight={false}
                  ref={(r) => {
                    swipeableRefs.current[alarm.id] = r;
                  }}
                >
                  <AlarmCard alarm={alarm} onToggle={handleToggle} />
                </Swipeable>
              ))}
            </View>
          </View>
        )}

        {!userId && alarms.length > 0 && (
          <Card style={styles.signInCard}>
            <Text style={styles.signInText}>
              Sign in to sync your alarms across devices
            </Text>
          </Card>
        )}

        <View style={{ height: spacing.xl }} />
      </ScrollView>

      {editingAlarm && (
        <AlarmEditModal
          alarm={editingAlarm}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => {
            setEditingAlarm(null);
            setSaveError(null);
          }}
          saveError={saveError}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.cream,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.cream,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 24,
  },
  addButtonText: {
    ...typography.body,
    fontFamily: 'Fredoka-Medium',
    color: colors.dark,
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: spacing.xl,
  },
  emptyIconWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    opacity: 0.8,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
  },
  section: {
    marginTop: spacing.sm,
  },
  sectionTitle: {
    ...typography.small,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    paddingLeft: spacing.xs,
  },
  alarmList: {
    gap: 0,
  },
  signInCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.surface,
  },
  signInText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  swipeActions: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
    alignSelf: 'stretch',
  },
  swipeAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    paddingHorizontal: spacing.md,
    alignSelf: 'stretch',
  },
  swipeActionEdit: {
    backgroundColor: colors.blue,
  },
  swipeActionEditText: {
    ...typography.body,
    fontFamily: 'Fredoka-Medium',
    color: colors.cream,
  },
  swipeActionDelete: {
    backgroundColor: colors.error,
  },
  swipeActionDeleteText: {
    ...typography.body,
    fontFamily: 'Fredoka-Medium',
    color: colors.cream,
  },
});
