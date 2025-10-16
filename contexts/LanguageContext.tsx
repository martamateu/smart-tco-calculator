import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, translations } from '../locales';
import { Translations } from '../locales/en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  // Detect language from URL path: /en, /es, /cat
  const getInitialLanguage = (): Language => {
    const path = window.location.pathname;
    if (path.startsWith('/en')) return 'en';
    if (path.startsWith('/es')) return 'es';
    if (path.startsWith('/cat')) return 'cat';
    
    // Always default to Catalan when no language is specified in URL
    return 'cat';
  };

  const [language, setLanguageState] = useState<Language>(getInitialLanguage());

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    
    // Update URL without page reload
    const currentPath = window.location.pathname;
    const pathWithoutLang = currentPath.replace(/^\/(en|es|cat)/, '');
    const newPath = `/${lang}${pathWithoutLang}`;
    window.history.pushState({}, '', newPath);
  };

  // Update language when URL changes (browser back/forward)
  useEffect(() => {
    const handlePopState = () => {
      setLanguageState(getInitialLanguage());
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
