import { useState } from 'react';
import { getInitials } from '../utils/helpers';

export default function Avatar({ name, size = 'md', color }) {
  const [showTooltip, setShowTooltip] = useState(false);

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const customStyle = color
    ? { backgroundColor: color }
    : { background: 'linear-gradient(135deg, #A855F7, #7C3AED)' };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center text-white font-semibold shrink-0`}
        style={customStyle}
      >
        {getInitials(name)}
      </div>
      {showTooltip && name && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap pointer-events-none z-50">
          {name}
        </div>
      )}
    </div>
  );
}
