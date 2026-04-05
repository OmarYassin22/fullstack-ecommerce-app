import React from 'react';
import { Brain, Sparkles } from 'lucide-react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'medium', showText = true, className = '' }) => {
  const sizeClasses = {
    small: 'h-8 w-8',
    medium: 'h-10 w-10',
    large: 'h-16 w-16'
  };

  const textSizeClasses = {
    small: 'text-lg',
    medium: 'text-2xl',
    large: 'text-4xl'
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Logo Icon */}
      <div className="relative">
        <div className="bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 p-2 rounded-2xl shadow-lg">
          <Brain className={`${sizeClasses[size]} text-white`} />
        </div>
        {/* Sparkle effect */}
        <div className="absolute -top-1 -right-1">
          <Sparkles className="h-4 w-4 text-yellow-400 animate-pulse" />
        </div>
      </div>
        {/* Logo Text */}
      {showText && (
        <div className="flex flex-col">
          <span className={`${textSizeClasses[size]} font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight font-heading`}>
            Bright
          </span>
          <span className={`${textSizeClasses[size]} font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent leading-tight -mt-1 font-heading`}>
            Minds
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
