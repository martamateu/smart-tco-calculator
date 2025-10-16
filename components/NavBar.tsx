
import React, { useState } from 'react';
import RoseIcon from './icons/RoseIcon';
import CataloniaFlag from './icons/CataloniaFlag';
import { useLanguage } from '../contexts/LanguageContext';
import { Language, languageNames } from '../locales';

type Page = 'home' | 'docs' | 'about' | 'citations' | 'dashboard-outlook' | 'dashboard-energy-comparison' | 'dashboard-energy-prices' | 'dashboard-ml-model' | 'dashboard-rag-system';

interface NavBarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const NavBar: React.FC<NavBarProps> = ({ currentPage, onNavigate }) => {
  const { language, setLanguage, t } = useLanguage();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showDashboardMenu, setShowDashboardMenu] = useState(false);

  // Function to render language flag
  const renderFlag = (lang: Language) => {
    if (lang === 'cat') {
      return <CataloniaFlag className="w-6 h-4" />;
    }
    const flags = {
      en: '🇬🇧',
      es: '🇪🇸',
    };
    return <span className="text-lg">{flags[lang]}</span>;
  };

  const isDashboardPage = currentPage.startsWith('dashboard-');

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center cursor-pointer" onClick={() => onNavigate('home')}>
            <RoseIcon className="h-8 w-8 text-roseRed" />
            <span className="ml-3 font-semibold text-xl text-gray-800">
              {t.nav.title}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-baseline space-x-4">
              <button 
                onClick={() => onNavigate('home')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === 'home' 
                    ? 'bg-roseRed text-white' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {t.nav.home}
              </button>
              
              {/* Dashboards Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setShowDashboardMenu(!showDashboardMenu)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                    isDashboardPage 
                      ? 'bg-roseRed text-white' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {t.nav.dashboards}
                  <svg 
                    className={`w-4 h-4 transition-transform ${showDashboardMenu ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showDashboardMenu && (
                  <div className="absolute left-0 mt-2 w-64 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <button
                      onClick={() => {
                        onNavigate('dashboard-outlook');
                        setShowDashboardMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm ${
                        currentPage === 'dashboard-outlook' 
                          ? 'bg-roseRed text-white' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      📈 {t.nav.dashboardOutlook}
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('dashboard-energy-comparison');
                        setShowDashboardMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm ${
                        currentPage === 'dashboard-energy-comparison' 
                          ? 'bg-roseRed text-white' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      💰 {t.nav.dashboardEnergyComparison}
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('dashboard-energy-prices');
                        setShowDashboardMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm ${
                        currentPage === 'dashboard-energy-prices' 
                          ? 'bg-roseRed text-white' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      ⚡ {t.nav.dashboardEnergyPrices}
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('dashboard-ml-model');
                        setShowDashboardMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm ${
                        currentPage === 'dashboard-ml-model' 
                          ? 'bg-roseRed text-white' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      🌳 {t.nav.dashboardMLModel}
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('dashboard-rag-system');
                        setShowDashboardMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm ${
                        currentPage === 'dashboard-rag-system' 
                          ? 'bg-roseRed text-white' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      🧠 {t.nav.dashboardRAGSystem}
                    </button>
                  </div>
                )}
              </div>
              
              <button 
                onClick={() => onNavigate('docs')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === 'docs' 
                    ? 'bg-roseRed text-white' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {t.nav.docs}
              </button>
              <button 
                onClick={() => onNavigate('citations')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === 'citations' 
                    ? 'bg-roseRed text-white' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {t.nav.citations}
              </button>
              <button 
                onClick={() => onNavigate('about')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === 'about' 
                    ? 'bg-roseRed text-white' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {t.nav.about}
              </button>
            </div>
            
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                {renderFlag(language)}
                <span>{languageNames[language]}</span>
                <svg 
                  className={`w-4 h-4 transition-transform ${showLangMenu ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                  {(['cat', 'en', 'es'] as Language[]).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setLanguage(lang);
                        setShowLangMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-2 ${
                        language === lang 
                          ? 'bg-roseRed text-white' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {renderFlag(lang)}
                      <span>{languageNames[lang]}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
