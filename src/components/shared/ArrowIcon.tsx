import React from 'react';

interface ArrowIconProps {
  size?: 'small' | 'medium' | 'large';
  direction?: 'right' | 'left' | 'up' | 'down';
  className?: string;
}

const ArrowIcon: React.FC<ArrowIconProps> = ({ 
  size = 'medium', 
  direction = 'right', 
  className = '' 
}) => {
  const sizeMap = {
    small: { width: 12, height: 12 },
    medium: { width: 16, height: 16 },
    large: { width: 20, height: 20 }
  };

  const rotationMap = {
    right: 0,
    down: 90,
    left: 180,
    up: 270
  };

  const { width, height } = sizeMap[size];
  const rotation = rotationMap[direction];

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
};

export default ArrowIcon;
