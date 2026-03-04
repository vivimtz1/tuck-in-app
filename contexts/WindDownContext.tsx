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
    duration: 10,
    description: '4-7-8 breathing pattern to calm your mind and prepare for sleep. Teddy will guide you through each breath.',
  },
  {
    id: 'phone',
    type: 'phone',
    title: 'Put Phone Away',
    icon: '📱',
    enabled: true,
    minutesBeforeBedtime: 20,
    order: 1,
    duration: 1,
    description: 'Time to disconnect from screens. Place your phone in another room or face down to avoid distractions.',
  },
  {
    id: 'lights',
    type: 'lights',
    title: 'Dim the Lights',
    icon: '💡',
    enabled: true,
    minutesBeforeBedtime: 19,
    order: 2,
    duration: 2,
    description: 'Create a sleep-friendly environment by dimming lights. This helps signal to your body that it\'s time to wind down.',
  },
  {
    id: 'audio',
    type: 'audio',
    title: 'Sleep Sounds',
    icon: '🔊',
    enabled: true,
    minutesBeforeBedtime: 17,
    order: 3,
    duration: 30,
    description: 'Calming nature sounds like rain, ocean waves, or white noise to help you drift off. Teddy can play these throughout the night.',
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
