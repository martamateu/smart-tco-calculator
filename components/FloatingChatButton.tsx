import React from 'react';

interface FloatingChatButtonProps {
  onClick: () => void;
  hasNewInsights?: boolean;
}

export const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({ onClick, hasNewInsights = false }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 right-8 z-50 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 group"
      aria-label="Open chat"
    >
      {/* Badge for new insights */}
      {hasNewInsights && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-5 w-5 bg-yellow-500 items-center justify-center text-xs font-bold">!</span>
        </span>
      )}
      
      {/* Chat Icon */}
      <svg 
        className="w-6 h-6 group-hover:rotate-12 transition-transform" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" 
        />
      </svg>
      
      {/* Tooltip */}
      <span className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        Ask questions
      </span>
    </button>
  );
};

export default FloatingChatButton;
