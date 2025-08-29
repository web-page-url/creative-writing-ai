import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ToolbarButtonProps {
  icon: LucideIcon;
  onClick?: (e: React.MouseEvent) => void;
  onMouseDown?: (e: React.MouseEvent) => void;
  title: string;
  active?: boolean;
  isDarkMode?: boolean;
}

export const ToolbarButton: React.FC<ToolbarButtonProps> = ({ 
  icon: Icon, 
  onClick, 
  onMouseDown, 
  title, 
  active = false,
  isDarkMode = false
}) => (
  <button
    onClick={onClick}
    onMouseDown={onMouseDown}
    title={title}
    className={`p-2 rounded transition-colors ${
      active 
        ? isDarkMode ? 'bg-purple-600 text-white' : 'bg-purple-500 text-white'
        : isDarkMode 
          ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
          : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'
    }`}
  >
    <Icon className="w-4 h-4" />
  </button>
);

interface ToolbarSeparatorProps {
  isDarkMode?: boolean;
}

export const ToolbarSeparator: React.FC<ToolbarSeparatorProps> = ({ isDarkMode = false }) => (
  <div className={`w-px h-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
);

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div
      className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]} ${className}`}
    />
  );
};

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  isDarkMode?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'md',
  className = '',
  isDarkMode = false
}) => {
  const baseClasses = 'rounded-lg font-medium transition-all transform hover:scale-105 flex items-center justify-center gap-2';
  
  const variantClasses = {
    primary: disabled 
      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
      : 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 shadow-lg',
    secondary: isDarkMode
      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    success: 'bg-green-500 text-white hover:bg-green-600',
    danger: 'bg-red-500 text-white hover:bg-red-600'
  };

  const sizeClasses = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </button>
  );
};

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  isDarkMode?: boolean;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  isDarkMode = false
}) => {
  const [isVisible, setIsVisible] = React.useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={`absolute z-50 px-2 py-1 text-xs rounded whitespace-nowrap ${positionClasses[position]} ${
            isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-900 text-white'
          }`}
        >
          {content}
        </div>
      )}
    </div>
  );
};