import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { type Alarm, type DayAbbrev, formatTimeDisplay } from '@/types/alarm';

const LOCAL_ALARMS_KEY = '@tuck_in_local_alarms';
const CHECK_INTERVAL_MS = 5_000; // check every 5 seconds
const RELOAD_ALARMS_MS = 30_000; // reload alarm list every 30s so new alarms are picked up

const DAY_ABBREVS_BY_WEEKDAY: DayAbbrev[] = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function getCurrentTime24(): string {
  const d = new Date();
  const h = d.getHours();
  const m = d.getMinutes();
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/** Normalize "H:mm" or "HH:mm" to "HH:mm" for comparison */
function normalizeTime24(time: string): string {
  const parts = (time || '').trim().split(':');
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) || 0;
  if (Number.isNaN(h)) return '';
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

function getCurrentDayAbbrev(): DayAbbrev {
  const dayIndex = new Date().getDay();
  return DAY_ABBREVS_BY_WEEKDAY[dayIndex];
}

function getOccurrenceKey(alarm: Alarm): string {
  const d = new Date();
  const dateStr = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
  return `${alarm.id}-${dateStr}-${alarm.time}`;
}

type AlarmRingerContextValue = {
  firingAlarm: Alarm | null;
  dismissAlarm: () => void;
};

const AlarmRingerContext = createContext<AlarmRingerContextValue | null>(null);

export function useAlarmRinger() {
  const ctx = useContext(AlarmRingerContext);
  return ctx;
}

export function AlarmRingerProvider({ children }: { children: React.ReactNode }) {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [firingAlarm, setFiringAlarm] = useState<Alarm | null>(null);
  const dismissedRef = useRef<Set<string>>(new Set());

  const loadAlarms = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('alarms')
        .select('*')
        .eq('user_id', user.id)
        .eq('enabled', true);
      if (!error && data) {
        setAlarms(
          (data as { days: string[] }[]).map((row) => ({
            ...row,
            days: row.days as DayAbbrev[],
          })) as Alarm[]
        );
        return;
      }
    }
    try {
      const raw = await AsyncStorage.getItem(LOCAL_ALARMS_KEY);
      if (raw) {
        const data = JSON.parse(raw) as Alarm[];
        const enabled = data
          .filter((a) => a.enabled)
          .map((row) => ({ ...row, days: (row.days || []) as DayAbbrev[] }));
        setAlarms(enabled);
      } else {
        setAlarms([]);
      }
    } catch {
      setAlarms([]);
    }
  }, []);

  useEffect(() => {
    loadAlarms();
    const reloadId = setInterval(loadAlarms, RELOAD_ALARMS_MS);
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') loadAlarms();
    });
    return () => {
      clearInterval(reloadId);
      sub.remove();
    };
  }, [loadAlarms]);

  useEffect(() => {
    if (alarms.length === 0) return;
    const tick = () => {
      const now = getCurrentTime24();
      const today = getCurrentDayAbbrev();
      for (const alarm of alarms) {
        if (!alarm.enabled) continue;
        if (normalizeTime24(alarm.time) !== now) continue;
        if (!alarm.days || !alarm.days.includes(today)) continue;
        const key = getOccurrenceKey(alarm);
        if (dismissedRef.current.has(key)) continue;
        setFiringAlarm(alarm);
        return;
      }
    };
    tick();
    const id = setInterval(tick, CHECK_INTERVAL_MS);
    return () => clearInterval(id);
  }, [alarms]);

  const dismissAlarm = useCallback(() => {
    if (firingAlarm) {
      dismissedRef.current.add(getOccurrenceKey(firingAlarm));
      setFiringAlarm(null);
    }
  }, [firingAlarm]);

  return (
    <AlarmRingerContext.Provider value={{ firingAlarm, dismissAlarm }}>
      {children}
      {firingAlarm && (
        <Modal visible={true} transparent animationType="fade">
          <View style={styles.overlay}>
            <View style={styles.content}>
              <Text style={styles.title}>{firingAlarm.label}</Text>
              <Text style={styles.time}>{formatTimeDisplay(firingAlarm.time)}</Text>
              <TouchableOpacity style={styles.closeButton} onPress={dismissAlarm} activeOpacity={0.8}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </AlarmRingerContext.Provider>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  title: {
    ...typography.h2,
    color: colors.cream,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  time: {
    ...typography.h1,
    color: colors.gold,
    marginBottom: spacing.xl,
  },
  closeButton: {
    backgroundColor: colors.cream,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    minWidth: 160,
    alignItems: 'center',
  },
  closeButtonText: {
    ...typography.body,
    fontFamily: 'Fredoka-Medium',
    color: colors.dark,
  },
});
