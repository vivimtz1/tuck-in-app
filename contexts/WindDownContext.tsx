import React, { createContext, useContext, useState, ReactNode } from 'react';
import { WindDownItem } from '@/app/winddown-routine';

type WindDownContextType = {
  routineItems: WindDownItem[];
  setRoutineItems: (items: WindDownItem[]) => void;
  getEnabledItems: () => WindDownItem[];
};

const WindDownContext = createContext<WindDownContextType | undefined>(undefined);

const DEFAULT_ROUTINE: WindDownItem[] = [
  {
    id: 'breathing',
    type: 'breathing',
    title: 'Breathing Exercises',
    icon: '🧘',
    enabled: true,
    minutesBeforeBedtime: 30,
    order: 0,
  },
  {
    id: 'phone',
    type: 'phone',
    title: 'Put Phone Away',
    icon: '📱',
    enabled: true,
    minutesBeforeBedtime: 15,
    order: 1,
  },
  {
    id: 'lights',
    type: 'lights',
    title: 'Dim the Lights',
    icon: '💡',
    enabled: true,
    minutesBeforeBedtime: 10,
    order: 2,
  },
  {
    id: 'audio',
    type: 'audio',
    title: 'Sleep Sounds',
    icon: '🔊',
    enabled: true,
    minutesBeforeBedtime: 5,
    order: 3,
  },
];

export function WindDownProvider({ children }: { children: ReactNode }) {
  const [routineItems, setRoutineItems] = useState<WindDownItem[]>(DEFAULT_ROUTINE);

  const getEnabledItems = () => {
    return routineItems.filter(item => item.enabled);
  };

  return (
    <WindDownContext.Provider value={{ routineItems, setRoutineItems, getEnabledItems }}>
      {children}
    </WindDownContext.Provider>
  );
}

export function useWindDown() {
  const context = useContext(WindDownContext);
  if (context === undefined) {
    throw new Error('useWindDown must be used within a WindDownProvider');
  }
  return context;
}
