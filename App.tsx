
import React, { useState, useCallback, useRef } from 'react';
import NavBar from './components/NavBar';
import InputForm from './components/InputForm';
import ChatSection from './components/ChatSection';
import ResultsCard from './components/ResultsCard';
import ExplanationPanel from './components/ExplanationPanel';
import FloatingChatButton from './components/FloatingChatButton';
import { useToast } from './components/Toast';
import ScenarioChart from './components/ScenarioChart';
import EnhancedScenarioChart from './components/EnhancedScenarioChart';
import RegionalPriceComparison from './components/RegionalPriceComparison';
import MaterialComparison from './components/MaterialComparison';
import SensitivityAnalysis from './components/SensitivityAnalysis';
import RandomForestVisualization from './components/RandomForestVisualization';
import RAGVisualization from './components/RAGVisualization';
import DocsPage from './components/DocsPage';
import AboutPage from './components/AboutPage';
import CitationsPage from './components/CitationsPage';
import { TcoInput, TcoResult, Explanation } from './types';
import { useLanguage } from './contexts/LanguageContext';
import api from './services/api';

type Page = 'home' | 'docs' | 'about' | 'citations' | 'dashboard-outlook' | 'dashboard-energy-comparison' | 'dashboard-energy-prices' | 'dashboard-material-comparison' | 'dashboard-sensitivity' | 'dashboard-ml-model' | 'dashboard-rag-system';

function App() {
  const { language, t } = useLanguage();
  const toast = useToast();
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [tcoResult, setTcoResult] = useState<TcoResult | null>(null);
  const [explanation, setExplanation] = useState<Explanation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastInputs, setLastInputs] = useState<TcoInput | null>(null);
  const [showChatButton, setShowChatButton] = useState<boolean>(false);
  const chatSectionRef = useRef<HTMLDivElement>(null);
  const insightsRef = useRef<HTMLDivElement>(null);

  // Listen for navigation events from ExplanationPanel
  React.useEffect(() => {
    const handleNavigateEvent = (event: Event) => {
      const customEvent = event as CustomEvent;
      const page = customEvent.detail as Page;
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('navigate', handleNavigateEvent);
    return () => window.removeEventListener('navigate', handleNavigateEvent);
  }, []);

  // Scroll to chat section
  const scrollToChat = useCallback(() => {
    chatSectionRef.current?.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    });
  }, []);

  // Show/hide floating chat button based on scroll position
  React.useEffect(() => {
    const handleScroll = () => {
      if (chatSectionRef.current) {
        const chatPosition = chatSectionRef.current.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        // Show button if chat is not visible (below viewport)
        setShowChatButton(chatPosition > windowHeight);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, [tcoResult]);

  const handleCalculate = useCallback(async (inputs: TcoInput) => {
    setIsLoading(true);
    setError(null);
    setTcoResult(null);
    setExplanation(null);
    setLastInputs(inputs);

    try {
      // 1. Get TCO prediction from backend API
      const prediction = await api.predictTco(inputs);
      setTcoResult(prediction);

      // 2. Automatically get AI explanation from backend (Gemini + RAG)
      setIsGeneratingInsights(true);
      toast.info(t.home.generatingInsights);
      
      // Scroll to insights section
      setTimeout(() => {
        insightsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);

      const aiExplanation = await api.explainTco(inputs, prediction, language);
      setExplanation(aiExplanation);
      setIsGeneratingInsights(false);

      // 3. Auto-scroll to results after a brief delay
      setTimeout(() => {
        window.scrollTo({ top: 300, behavior: 'smooth' });
      }, 500);

    } catch (err) {
      const errorMessage = "An error occurred while calculating the TCO. Please try again.";
      setError(errorMessage);
      toast.error(`❌ ${errorMessage}`);
      console.error(err);
      setIsGeneratingInsights(false);
    } finally {
      setIsLoading(false);
    }
  }, [language, toast]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <toast.ToastContainer />
      <NavBar currentPage={currentPage} onNavigate={setCurrentPage} />
      
      {currentPage === 'docs' && <DocsPage />}
      
      {currentPage === 'citations' && <CitationsPage />}
      
      {currentPage === 'about' && <AboutPage />}
      
      {/* Dashboard Pages */}
      {currentPage === 'dashboard-outlook' && (
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <ScenarioChart onNavigate={setCurrentPage} />
        </main>
      )}
      
      {currentPage === 'dashboard-energy-comparison' && (
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <EnhancedScenarioChart onNavigate={setCurrentPage} />
        </main>
      )}
      
      {currentPage === 'dashboard-energy-prices' && (
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <RegionalPriceComparison onNavigate={setCurrentPage} />
        </main>
      )}
      
      {currentPage === 'dashboard-material-comparison' && (
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <MaterialComparison onNavigate={setCurrentPage} />
        </main>
      )}
      
      {currentPage === 'dashboard-sensitivity' && (
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <SensitivityAnalysis onNavigate={setCurrentPage} />
        </main>
      )}
      
      {currentPage === 'dashboard-ml-model' && (
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <RandomForestVisualization onNavigate={setCurrentPage} />
        </main>
      )}
      
      {currentPage === 'dashboard-rag-system' && (
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <RAGVisualization onNavigate={setCurrentPage} />
        </main>
      )}
      
      {currentPage === 'home' && (
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <header className="text-center mb-12">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                  {t.home.pageTitle}
              </h1>
              <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
                  {t.home.pageSubtitle}
              </p>
          </header>

          {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
                  <strong className="font-bold">Error: </strong>
                  <span className="block sm:inline">{error}</span>
              </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
              <InputForm onSubmit={handleCalculate} isLoading={isLoading} />
              <div ref={chatSectionRef}>
                <ChatSection 
                  tcoResult={tcoResult}
                  tcoInput={lastInputs}
                />
              </div>
            </div>
            <div className="lg:col-span-3">
              <ResultsCard result={tcoResult} isLoading={isLoading && !tcoResult} />
              <div className="relative">
                {/* Loading Overlay for AI Insights */}
                {isGeneratingInsights && (
                  <div 
                    ref={insightsRef}
                    className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center z-40 rounded-2xl"
                  >
                    <div className="text-center p-8">
                      <div className="relative w-24 h-24 mx-auto mb-6">
                        {/* Animated circles */}
                        <div className="absolute inset-0 border-4 border-purple-200 rounded-full animate-ping"></div>
                        <div className="absolute inset-2 border-4 border-blue-300 rounded-full animate-pulse"></div>
                        <div className="absolute inset-4 border-4 border-roseRed rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <svg className="w-10 h-10 text-roseRed" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-800 mb-3">{t.home.aiLoadingTitle}</h3>
                      <p className="text-gray-600 mb-2">{t.home.aiLoadingSubtitle}</p>
                      <p className="text-sm text-gray-500">{t.home.aiLoadingNote}</p>
                      
                      {/* Progress dots */}
                      <div className="flex items-center justify-center gap-2 mt-6">
                        <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-3 h-3 bg-roseRed rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <ExplanationPanel 
                  explanation={explanation} 
                  isLoading={isLoading && tcoResult != null}
                  tcoResult={tcoResult}
                  tcoInput={lastInputs}
                />
              </div>
            </div>
          </div>

          {/* Floating Chat Button - Only show when chat is below viewport */}
          {showChatButton && tcoResult && (
            <FloatingChatButton 
              onClick={scrollToChat} 
              hasNewInsights={!!explanation}
            />
          )}
        </main>
      )}
    </div>
  );
}

export default App;
