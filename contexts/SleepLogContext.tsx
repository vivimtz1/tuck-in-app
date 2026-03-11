import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';

const GOAL_MINUTES = 7 * 60; // 7 hours recommended sleep

export type SleepEntry = {
  date: string;            // YYYY-MM-DD (night the sleep started)
  bedtime: Date;
  wakeTime: Date;
  durationMinutes: number;
  goalMet: boolean;
};

export type ActiveSession = {
  date: string;
  bedtime: Date;
};

type SleepLogContextType = {
  entries: SleepEntry[];
  activeSession: ActiveSession | null;
  celebration: boolean;
  dismissCelebration: () => void;
  logBedtime: () => void;
  logWakeTime: () => void;
  cancelBedtime: () => void;
  stats: {
    streak: number;
    goalsThisWeek: number;
    totalThisWeek: number;
    avgSleepHours: number;
    consistency: number;
  };
  weekData: { day: string; hours: number; goalMet: boolean; hasData: boolean }[];
  lastEntry: SleepEntry | null;
};

const SleepLogContext = createContext<SleepLogContextType | undefined>(undefined);

const dateKey = (d: Date) => d.toISOString().split('T')[0];
const todayKey = () => dateKey(new Date());

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function getLast7DayKeys(): string[] {
  const keys: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    keys.push(dateKey(d));
  }
  return keys;
}

export function SleepLogProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<SleepEntry[]>([]);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [celebration, setCelebration] = useState(false);

  const logBedtime = () => {
    setActiveSession({ date: todayKey(), bedtime: new Date() });
  };

  const logWakeTime = () => {
    const wakeTime = new Date();

    if (activeSession) {
      const durationMinutes = Math.round(
        (wakeTime.getTime() - activeSession.bedtime.getTime()) / (1000 * 60),
      );
      const newEntry: SleepEntry = {
        date: activeSession.date,
        bedtime: activeSession.bedtime,
        wakeTime,
        durationMinutes,
        goalMet: true, // always celebrate for demo
      };
      setEntries(prev => {
        const without = prev.filter(e => e.date !== activeSession.date);
        return [...without, newEntry];
      });
      setActiveSession(null);
    }
    // Always show celebration when user wakes up
    setCelebration(true);
  };

  const cancelBedtime = () => setActiveSession(null);

  const dismissCelebration = () => setCelebration(false);

  const lastEntry = useMemo(() => {
    if (entries.length === 0) return null;
    return [...entries].sort((a, b) => b.date.localeCompare(a.date))[0];
  }, [entries]);

  const stats = useMemo(() => {
    const last7 = getLast7DayKeys();
    const weekEntries = entries.filter(e => last7.includes(e.date) && e.durationMinutes > 0);

    // Streak: consecutive goal-met days going backwards from yesterday
    const sortedAll = [...entries].sort((a, b) => b.date.localeCompare(a.date));
    let streak = 0;
    for (const entry of sortedAll) {
      if (entry.goalMet) streak++;
      else break;
    }

    const goalsThisWeek = weekEntries.filter(e => e.goalMet).length;
    const totalThisWeek = weekEntries.length;

    const avgSleepHours =
      weekEntries.length > 0
        ? Math.round((weekEntries.reduce((s, e) => s + e.durationMinutes, 0) / weekEntries.length / 60) * 10) / 10
        : 0;

    const consistency = last7.length > 0 ? Math.round((totalThisWeek / last7.length) * 100) : 0;

    return { streak, goalsThisWeek, totalThisWeek, avgSleepHours, consistency };
  }, [entries]);

  const weekData = useMemo(() => {
    return getLast7DayKeys().map(key => {
      const entry = entries.find(e => e.date === key);
      const d = new Date(key + 'T12:00:00');
      return {
        day: DAY_LABELS[d.getDay()],
        hours: entry && entry.durationMinutes > 0 ? entry.durationMinutes / 60 : 0,
        goalMet: entry?.goalMet ?? false,
        hasData: !!entry && entry.durationMinutes > 0,
      };
    });
  }, [entries]);

  return (
    <SleepLogContext.Provider
      value={{
        entries,
        activeSession,
        celebration,
        dismissCelebration,
        logBedtime,
        logWakeTime,
        cancelBedtime,
        stats,
        weekData,
        lastEntry,
      }}
    >
      {children}
    </SleepLogContext.Provider>
  );
}

export function useSleepLog() {
  const ctx = useContext(SleepLogContext);
  if (!ctx) throw new Error('useSleepLog must be used within SleepLogProvider');
  return ctx;
}
