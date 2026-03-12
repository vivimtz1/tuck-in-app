import React, { createContext, useContext, useState, ReactNode } from 'react';
import { WindDownItem } from '@/app/winddown-routine';

type WindDownContextType = {
  routineItems: WindDownItem[];
  setRoutineItems: React.Dispatch<React.SetStateAction<WindDownItem[]>>;
  getEnabledItems: () => WindDownItem[];
  checkedItems: Set<string>;
  toggleCheckedItem: (id: string) => void;
  resetCheckedItems: () => void;
  isRoutineComplete: boolean;
};

const WindDownContext = createContext<WindDownContextType | undefined>(undefined);

export function WindDownProvider({ children }: { children: ReactNode }) {
  const [routineItems, setRoutineItems] = useState<WindDownItem[]>([]);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const getEnabledItems = () => routineItems.filter(item => item.enabled);

  const toggleCheckedItem = (id: string) => {
    setCheckedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const resetCheckedItems = () => setCheckedItems(new Set());

  const enabledItems = routineItems.filter(item => item.enabled);
  const isRoutineComplete =
    enabledItems.length > 0 && enabledItems.every(item => checkedItems.has(item.id));

  return (
    <WindDownContext.Provider
      value={{
        routineItems,
        setRoutineItems,
        getEnabledItems,
        checkedItems,
        toggleCheckedItem,
        resetCheckedItems,
        isRoutineComplete,
      }}
    >
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
