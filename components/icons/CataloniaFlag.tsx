import React from 'react';

interface CataloniaFlagProps {
  className?: string;
}

const CataloniaFlag: React.FC<CataloniaFlagProps> = ({ className = "w-6 h-4" }) => {
  return (
    <svg 
      className={className} 
      viewBox="0 0 9 6" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Senyera - Bandera de Cataluña */}
      <rect fill="#FCDD09" x="0" y="0" width="9" height="6"/>
      <rect fill="#DA121A" x="0" y="0.666" width="9" height="0.666"/>
      <rect fill="#DA121A" x="0" y="2" width="9" height="0.666"/>
      <rect fill="#DA121A" x="0" y="3.333" width="9" height="0.666"/>
      <rect fill="#DA121A" x="0" y="4.666" width="9" height="0.666"/>
    </svg>
  );
};

export default CataloniaFlag;
