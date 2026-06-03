import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LanguageContext = createContext({ lang: 'tr', setLang: () => {} });

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState('tr');

  useEffect(() => {
    AsyncStorage.getItem('healthcare_lang').then(v => { if (v) setLangState(v); });
  }, []);

  const setLang = (l) => {
    setLangState(l);
    AsyncStorage.setItem('healthcare_lang', l);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => useContext(LanguageContext);
