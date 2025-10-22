import React, { useState } from 'react';
import { Explanation } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import ReactMarkdown from 'react-markdown';

interface ExplanationPanelProps {
  explanation: Explanation | null;
  isLoading: boolean;
  tcoResult?: any;
  tcoInput?: any;
}

const ExplanationPanel: React.FC<ExplanationPanelProps> = ({ 
  explanation, 
  isLoading
}) => {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    if (explanation) {
      navigator.clipboard.writeText(explanation.explanation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-8 rounded-2xl shadow-lg mt-8 border border-purple-200">
        <div className="flex flex-col items-center justify-center py-12">
          {/* Loading spinner */}
          <svg className="animate-spin h-12 w-12 text-purple-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>

          {/* Loading text */}
          <p className="text-gray-600 font-medium text-center mb-8">{t.explanation.title}</p>

          {/* Skeleton loaders */}
          <div className="w-full space-y-3">
            <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse w-5/6"></div>
            <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse w-4/6"></div>
            <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse mt-6"></div>
            <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse w-5/6"></div>
          </div>

          {/* Loading message */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">Generating insights with AI...</p>
            <p className="text-xs text-gray-400 mt-2">This may take a few seconds</p>
          </div>
        </div>
      </div>
    );
  }

  if (!explanation) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-8 rounded-2xl shadow-lg mt-8 border border-purple-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-800">{t.explanation.title}</h2>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 bg-white/70 hover:bg-white border border-purple-300 rounded-lg transition-colors text-sm font-medium text-gray-700"
        >
          {copied ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {t.explanation.copied}
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {t.explanation.copy}
            </>
          )}
        </button>
      </div>

      <div className="prose prose-sm max-w-none">
        {/* Collapsible Accordion Sections */}
        <div className="space-y-3">
          
          {/* Executive Summary - Open by default - Contains all AI insights */}
          <details className="group" open>
            <summary className="cursor-pointer p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors list-none">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-blue-900 flex items-center gap-2 m-0">
                  {t.explanation.accordionSummary}
                </h3>
                <svg className="w-5 h-5 text-blue-600 group-open:rotate-180 transition-transform flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </summary>
            <div className="mt-3 px-4 pb-2">
              <ReactMarkdown
                components={{
                  h2: ({ children }) => (
                    <h2 className="text-xl font-bold text-gray-800 mt-4 mb-2 m-0">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-lg font-semibold text-gray-800 mt-3 mb-2 m-0">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-gray-700 mb-2 leading-relaxed">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside space-y-1 mb-2 text-gray-700">
                      {children}
                    </ul>
                  ),
                  li: ({ children }) => (
                    <li className="ml-4 text-gray-700 text-sm">{children}</li>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-gray-900">
                      {children}
                    </strong>
                  ),
                }}
              >
                {(() => {
                  const fullText = explanation.explanation;
                  // Show all content except the sources section
                  const contentWithoutSources = fullText.split(/\*Analysis based on|\*Análisis basado en|\*Anàlisi basada en|📚/)[0];
                  return contentWithoutSources.trim();
                })()}
              </ReactMarkdown>
            </div>
          </details>

        </div>
      </div>

      {/* Methodology Section - Collapsible for less clutter */}
      <details className="mt-6 group">
        <summary className="cursor-pointer p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200 hover:bg-indigo-100 transition-colors list-none">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-indigo-900 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              {t.explanation.methodology}
            </h3>
            <svg className="w-5 h-5 text-indigo-600 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </summary>
        <div className="mt-3 px-4 pb-4 text-sm text-gray-700 prose prose-sm max-w-none">
          <ReactMarkdown>{t.explanation.methodologyExplanation}</ReactMarkdown>
        </div>
      </details>

      {/* Interactive Charts Navigation Section */}
      <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          {t.explanation.interactiveTitle}
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          {t.explanation.interactiveSubtitle}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Regional Comparison */}
          <button
            onClick={() => {
              const event = new CustomEvent('navigate', { detail: 'dashboard-energy-prices' });
              window.dispatchEvent(event);
            }}
            className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all border border-blue-200 hover:border-blue-400 text-left group"
          >
            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <span className="text-xl">🌍</span>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800 text-sm">{t.explanation.regionalCard.title}</h4>
              <p className="text-xs text-gray-600">{t.explanation.regionalCard.description}</p>
            </div>
            <svg className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Material Comparison */}
          <button
            onClick={() => {
              const event = new CustomEvent('navigate', { detail: 'dashboard-material-comparison' });
              window.dispatchEvent(event);
            }}
            className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all border border-purple-200 hover:border-purple-400 text-left group"
          >
            <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <span className="text-xl">💎</span>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800 text-sm">{t.explanation.materialCard.title}</h4>
              <p className="text-xs text-gray-600">{t.explanation.materialCard.description}</p>
            </div>
            <svg className="w-5 h-5 text-purple-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Sensitivity Analysis */}
          <button
            onClick={() => {
              const event = new CustomEvent('navigate', { detail: 'dashboard-sensitivity' });
              window.dispatchEvent(event);
            }}
            className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all border border-green-200 hover:border-green-400 text-left group"
          >
            <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <span className="text-xl">📈</span>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800 text-sm">{t.explanation.sensitivityCard.title}</h4>
              <p className="text-xs text-gray-600">{t.explanation.sensitivityCard.description}</p>
            </div>
            <svg className="w-5 h-5 text-green-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* 5-Year Outlook */}
          <button
            onClick={() => {
              const event = new CustomEvent('navigate', { detail: 'dashboard-outlook' });
              window.dispatchEvent(event);
            }}
            className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all border border-yellow-200 hover:border-yellow-400 text-left group"
          >
            <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
              <span className="text-xl">🔮</span>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800 text-sm">{t.explanation.outlookCard.title}</h4>
              <p className="text-xs text-gray-600">{t.explanation.outlookCard.description}</p>
            </div>
            <svg className="w-5 h-5 text-yellow-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Data Sources Disclaimer - Collapsible */}
      <details className="mt-6 group">
        <summary className="cursor-pointer p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg hover:bg-blue-100 transition-colors list-none">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-blue-900 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              📚 {t.explanation.citations}
            </h3>
            <svg className="w-5 h-5 text-blue-600 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </summary>
        <div className="mt-3 px-4 pb-4 prose prose-sm max-w-none">
          <ReactMarkdown
            components={{
              p: ({ children }) => (
                <p className="text-sm text-gray-700 mb-3 leading-relaxed">{children}</p>
              ),
              ul: ({ children }) => (
                <ul className="text-xs text-gray-600 mt-2 space-y-1.5 list-none pl-0">
                  {children}
                </ul>
              ),
              li: ({ children }) => (
                <li className="leading-relaxed flex items-start gap-2">
                  {children}
                </li>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-gray-900">{children}</strong>
              ),
            }}
          >
            {/* Extract just the sources note from explanation (everything after markers) */}
            {(() => {
              const parts = explanation.explanation.split(/(\*Analysis based on|\*Análisis basado en|\*Anàlisi basada en|📚)/);
              // Find the part that starts with the marker and return from there
              const markerIndex = parts.findIndex(p => 
                p.includes('Analysis based on') || 
                p.includes('Análisis basado en') || 
                p.includes('Anàlisi basada en') ||
                p.startsWith('📚')
              );
              if (markerIndex >= 0) {
                return parts.slice(markerIndex).join('');
              }
              return '';
            })()}
          </ReactMarkdown>
        </div>
      </details>
    </div>
  );
};

export default ExplanationPanel;
