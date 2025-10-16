
import React, { useState, useCallback } from 'react';
import NavBar from './components/NavBar';
import InputForm from './components/InputForm';
import ResultsCard from './components/ResultsCard';
import ExplanationPanel from './components/ExplanationPanel';
import ScenarioChart from './components/ScenarioChart';
import EnhancedScenarioChart from './components/EnhancedScenarioChart';
import RegionalPriceComparison from './components/RegionalPriceComparison';
import RandomForestVisualization from './components/RandomForestVisualization';
import RAGVisualization from './components/RAGVisualization';
import DocsPage from './components/DocsPage';
import AboutPage from './components/AboutPage';
import CitationsPage from './components/CitationsPage';
import { TcoInput, TcoResult, Explanation } from './types';
import { useLanguage } from './contexts/LanguageContext';
import api from './services/api';

type Page = 'home' | 'docs' | 'about' | 'citations' | 'dashboard-outlook' | 'dashboard-energy-comparison' | 'dashboard-energy-prices' | 'dashboard-ml-model' | 'dashboard-rag-system';

function App() {
  const { language, t } = useLanguage();
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [tcoResult, setTcoResult] = useState<TcoResult | null>(null);
  const [explanation, setExplanation] = useState<Explanation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastInputs, setLastInputs] = useState<TcoInput | null>(null);

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
      const aiExplanation = await api.explainTco(inputs, prediction, language);
      setExplanation(aiExplanation);

    } catch (err) {
      setError("An error occurred while calculating the TCO. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
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
            </div>
            <div className="lg:col-span-3">
              <ResultsCard result={tcoResult} isLoading={isLoading && !tcoResult} />
              <ExplanationPanel 
                explanation={explanation} 
                isLoading={isLoading && tcoResult != null}
                tcoResult={tcoResult}
                tcoInput={lastInputs}
              />
            </div>
          </div>
        </main>
      )}
    </div>
  );
}

export default App;
