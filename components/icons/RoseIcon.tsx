
import React from 'react';

const RoseIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
      opacity="0.3"
    />
    <path d="M12 5c-3.86 0-7 3.14-7 7s3.14 7 7 7c.58 0 1.15-.07 1.7-.21-1.35-1.1-2.2-2.73-2.2-4.54 0-3.31 2.69-6 6-6 .34 0 .67.03 1 .08-.6-3.3-3.53-5.73-6.5-5.33z" />
  </svg>
);

export default RoseIcon;
