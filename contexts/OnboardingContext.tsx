import React, { createContext, useContext, useState, ReactNode } from 'react';

type TimeValue = {
  hour: number;
  minute: string;
  period: string;
};

type OnboardingContextType = {
  currentBedtime: TimeValue;
  setCurrentBedtime: (time: TimeValue) => void;
  currentWakeTime: TimeValue;
  setCurrentWakeTime: (time: TimeValue) => void;
  getFirstNightBedtime: () => string;
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [currentBedtime, setCurrentBedtime] = useState<TimeValue>({ 
    hour: 11, 
    minute: '00', 
    period: 'PM' 
  });
  const [currentWakeTime, setCurrentWakeTime] = useState<TimeValue>({ 
    hour: 7, 
    minute: '30', 
    period: 'AM' 
  });

  // Calculate bedtime 5 minutes earlier than current
  const getFirstNightBedtime = (): string => {
    let hour = currentBedtime.hour;
    let minute = parseInt(currentBedtime.minute);
    let period = currentBedtime.period;

    // Subtract 5 minutes
    minute -= 5;
    
    if (minute < 0) {
      minute = 60 + minute; // e.g., -5 becomes 55
      hour -= 1;
      
      if (hour < 1) {
        hour = 12;
        // Toggle period when going from 12:xx to 11:xx
        period = period === 'PM' ? 'AM' : 'PM';
      } else if (hour === 11 && currentBedtime.hour === 12) {
        // Going from 12:xx to 11:xx toggles period
        period = period === 'PM' ? 'AM' : 'PM';
      }
    }

    const minuteStr = minute.toString().padStart(2, '0');
    return `${hour}:${minuteStr} ${period}`;
  };

  return (
    <OnboardingContext.Provider 
      value={{ 
        currentBedtime, 
        setCurrentBedtime, 
        currentWakeTime, 
        setCurrentWakeTime,
        getFirstNightBedtime 
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
