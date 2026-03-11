import React, { createContext, useContext, useState, ReactNode } from 'react';

export type TimeValue = { hour: number; minute: string; period: string };

export type OnboardingData = {
  barriers: string[];
  otherBarrierText: string;
  bedtime: TimeValue;
  wakeTime: TimeValue;
  notificationPrefs: { id: string; enabled: boolean }[];
  teddyName: string;
};

type OnboardingContextType = {
  data: OnboardingData;
  setOnboardingData: (partial: Partial<OnboardingData>) => void;
  formatTime: (t: TimeValue) => string;
};

const defaultData: OnboardingData = {
  barriers: [],
  otherBarrierText: '',
  bedtime: { hour: 11, minute: '00', period: 'PM' },
  wakeTime: { hour: 7, minute: '30', period: 'AM' },
  notificationPrefs: [],
  teddyName: 'Teddy',
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<OnboardingData>(defaultData);

  const setOnboardingData = (partial: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...partial }));
  };

  const formatTime = (t: TimeValue) => `${t.hour}:${t.minute} ${t.period}`;

  return (
    <OnboardingContext.Provider value={{ data, setOnboardingData, formatTime }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider');
  return ctx;
}
