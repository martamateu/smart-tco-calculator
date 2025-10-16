import React, { useState, useEffect } from 'react';
import { Explanation, ChatMessage, TcoResult } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import ReactMarkdown from 'react-markdown';
import api from '../services/api';

interface ExplanationPanelProps {
  explanation: Explanation | null;
  isLoading: boolean;
  tcoResult?: TcoResult | null;
  tcoInput?: any;
}

const ExplanationPanel: React.FC<ExplanationPanelProps> = ({ 
  explanation, 
  isLoading,
  tcoResult,
  tcoInput
}) => {
  const { t, language } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userMessage, setUserMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  
  // Clear chat history when language changes
  useEffect(() => {
    setChatHistory([]);
  }, [language]);
  
  const handleCopy = () => {
    if (explanation) {
      navigator.clipboard.writeText(explanation.explanation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSendMessage = async () => {
    if (!userMessage.trim() || chatLoading) return;

    const messageToSend = userMessage.trim();

    const newUserMessage: ChatMessage = {
      role: 'user',
      content: messageToSend,
      timestamp: new Date().toISOString()
    };

    setChatHistory(prev => [...prev, newUserMessage]);
    setUserMessage('');
    setChatLoading(true);

    try {
      const response = await api.chat({
        message: messageToSend,
        tco_context: tcoResult || undefined,
        chat_history: chatHistory,
        language: language
      });

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.message,
        timestamp: new Date().toISOString()
      };

      setChatHistory(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setChatLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-lg mt-8 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
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
        <ReactMarkdown
          components={{
            h2: ({ children }) => (
              <h2 className="text-xl font-bold text-gray-900 mt-6 mb-3 first:mt-0">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-lg font-semibold text-gray-800 mt-5 mb-2">
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="text-gray-700 mb-3 leading-relaxed">{children}</p>
            ),
            ul: ({ children }) => (
              <ul className="list-disc list-inside space-y-1 mb-3 text-gray-700">
                {children}
              </ul>
            ),
            li: ({ children }) => (
              <li className="ml-4 text-gray-700">{children}</li>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold text-gray-900">
                {children}
              </strong>
            ),
          }}
        >
          {/* Show only the explanation WITHOUT the sources note */}
          {explanation.explanation.split(/\*Analysis based on|\*Análisis basado en|\*Anàlisi basada en|📚/)[0]}
        </ReactMarkdown>
      </div>

      {/* Data Sources Disclaimer - rendered with custom styling from backend content */}
<div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
        <div className="prose prose-sm max-w-none">
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
      </div>

      {/* Chat Section */}
      <div className="mt-8 pt-6 border-t border-purple-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          {t.explanation.chatTitle}
        </h3>

        {/* Chat History */}
        {chatHistory.length > 0 && (
          <div className="mb-4 max-h-96 overflow-y-auto space-y-3">
            {chatHistory.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    msg.role === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-800'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm">{msg.content}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Chat Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={t.explanation.chatPlaceholder}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={chatLoading}
          />
                    <button
            onClick={handleSendMessage}
            disabled={chatLoading || !userMessage.trim()}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {chatLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t.explanation.thinking}
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
                {t.explanation.send}
              </>
            )}
          </button>
        </div>

        {/* Suggested Questions */}
        {chatHistory.length === 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-sm text-gray-600">{t.explanation.tryAsking}</p>
            <div className="flex flex-wrap gap-2">
              {t.explanation.suggestedQuestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setUserMessage(suggestion);
                  }}
                  className="px-3 py-1 text-sm bg-purple-50 text-purple-700 rounded-full hover:bg-purple-100 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplanationPanel;
