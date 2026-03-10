export type DayAbbrev = 'Mo' | 'Tu' | 'We' | 'Th' | 'Fr' | 'Sa' | 'Su';

export type Alarm = {
  id: string;
  user_id?: string;
  label: string;
  time: string;
  days: DayAbbrev[];
  alarm_type: 'wake' | 'bedtime';
  sound: string;
  volume: number;
  enabled: boolean;
  created_at?: string;
  updated_at?: string;
};

export const DAY_ABBREVS: DayAbbrev[] = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export const SOUND_OPTIONS = [
  'Gentle Rise',
  'Morning Birds',
  'Soft Chimes',
  'Ocean Waves',
  'Piano',
  'Forest Dawn',
  'Singing Bowl',
] as const;

export const DEFAULT_ALARM: Omit<Alarm, 'id'> = {
  label: 'Wake Up',
  time: '07:00',
  days: ['Mo', 'Tu', 'We', 'Th', 'Fr'],
  alarm_type: 'wake',
  sound: 'Gentle Rise',
  volume: 70,
  enabled: true,
};

/** Convert 24h "HH:mm" to 12h picker state */
export function time24ToPicker(time24: string): {
  hours: number;
  minutes: number;
  period: 'AM' | 'PM';
} {
  const [h, m] = time24.split(':').map(Number);
  const hours12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return {
    hours: hours12,
    minutes: m ?? 0,
    period: h >= 12 ? 'PM' : 'AM',
  };
}

/** Convert 12h picker state to 24h "HH:mm" */
export function pickerToTime24(picker: {
  hours: number;
  minutes: number;
  period: 'AM' | 'PM';
}): string {
  let h = picker.hours;
  if (picker.period === 'PM' && h !== 12) h += 12;
  if (picker.period === 'AM' && h === 12) h = 0;
  const hours = h.toString().padStart(2, '0');
  const minutes = picker.minutes.toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/** Format 24h "HH:mm" for display (e.g. "7:00 AM") */
export function formatTimeDisplay(time24: string): string {
  const { hours, minutes, period } = time24ToPicker(time24);
  return `${hours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/** Format days array for display (e.g. "Mon–Fri" or "Mo, Tu, We...") */
export function formatDaysDisplay(days: DayAbbrev[]): string {
  if (days.length === 0) return 'Never';
  if (days.length === 7) return 'Every day';
  const fullOrder: DayAbbrev[] = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  const set = new Set(days);
  const ordered = fullOrder.filter(d => set.has(d));
  if (ordered.length <= 3) {
    return ordered.join(', ');
  }
  return ordered.join(', ');
}
