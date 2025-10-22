import React, { useState, useEffect } from 'react';
import { ChatMessage, TcoResult } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import ReactMarkdown from 'react-markdown';
import api from '../services/api';

interface ChatSectionProps {
  tcoResult?: TcoResult | null;
  tcoInput?: any;
}

const ChatSection: React.FC<ChatSectionProps> = ({ 
  tcoResult,
  tcoInput
}) => {
  const { t, language } = useLanguage();
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userMessage, setUserMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  
  // Clear chat history when language changes
  useEffect(() => {
    setChatHistory([]);
  }, [language]);

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
        language
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

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        {t.explanation.chatTitle}
      </h3>

      {/* Chat History */}
      {chatHistory.length > 0 && (
        <div className="mb-4 max-h-96 overflow-y-auto space-y-3 bg-gray-50 rounded-lg p-4">
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
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !chatLoading && tcoResult && handleSendMessage()}
            placeholder={tcoResult ? t.explanation.chatPlaceholder : t.explanation.chatPlaceholder + " (Calcula TCO primero)"}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            disabled={chatLoading || !tcoResult}
          />
          <button
            onClick={handleSendMessage}
            disabled={chatLoading || !userMessage.trim() || !tcoResult}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
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
          <div className="space-y-2">
            <p className="text-sm text-gray-600 font-medium">{t.explanation.tryAsking}</p>
            <div className="flex flex-wrap gap-2">
              {t.explanation.suggestedQuestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setUserMessage(suggestion);
                  }}
                  disabled={!tcoResult}
                  className="px-3 py-1 text-sm bg-purple-50 text-purple-700 rounded-full hover:bg-purple-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Helper message when no TCO calculated yet */}
      {!tcoResult && (
        <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
          <p className="text-sm text-blue-800">
            💡 {language === 'es' ? 'Calcula primero el TCO para poder hacer preguntas' : 
                language === 'cat' ? 'Calcula primer el TCO per poder fer preguntes' :
                'Calculate TCO first to ask questions'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ChatSection;
