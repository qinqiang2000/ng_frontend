'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CountryOption {
  value: string;
  label: string;
  flag: string;
}

interface CountryContextType {
  selectedCountry: string;
  setSelectedCountry: (country: string) => void;
  countryOptions: CountryOption[];
  getSelectedCountryOption: () => CountryOption | undefined;
}

const countryOptions: CountryOption[] = [
  { value: 'CN', label: '中国 (CN)', flag: '🇨🇳' },
  { value: 'US', label: '美国 (US)', flag: '🇺🇸' },
  { value: 'DE', label: '德国 (DE)', flag: '🇩🇪' },
  { value: 'JP', label: '日本 (JP)', flag: '🇯🇵' },
  { value: 'GB', label: '英国 (GB)', flag: '🇬🇧' },
  { value: 'SG', label: '新加坡 (SG)', flag: '🇸🇬' },
  { value: 'FR', label: '法国 (FR)', flag: '🇫🇷' },
  { value: 'AU', label: '澳洲 (AU)', flag: '🇦🇺' },
  { value: 'NL', label: '荷兰 (NL)', flag: '🇳🇱' }
];

const CountryContext = createContext<CountryContextType | undefined>(undefined);

interface CountryProviderProps {
  children: ReactNode;
}

export function CountryProvider({ children }: CountryProviderProps) {
  const [selectedCountry, setSelectedCountry] = useState<string>('CN'); // Default to China

  const getSelectedCountryOption = () => {
    return countryOptions.find(option => option.value === selectedCountry);
  };

  return (
    <CountryContext.Provider
      value={{
        selectedCountry,
        setSelectedCountry,
        countryOptions,
        getSelectedCountryOption,
      }}
    >
      {children}
    </CountryContext.Provider>
  );
}

export function useCountry() {
  const context = useContext(CountryContext);
  if (context === undefined) {
    throw new Error('useCountry must be used within a CountryProvider');
  }
  return context;
}