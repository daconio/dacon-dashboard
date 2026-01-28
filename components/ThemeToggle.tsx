
import React from 'react';
import type { Theme } from '../types';

interface ThemeToggleProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, setTheme }) => {
  
  const toggleTheme = () => {
    if (theme === 'light') {
        setTheme('dark');
    } else if (theme === 'dark') {
        setTheme('brutal');
    } else {
        setTheme('light');
    }
  };

  const getIcon = () => {
      switch(theme) {
          case 'light': return '☀️';
          case 'dark': return '🌙';
          case 'brutal': return '🎨';
          default: return '☀️';
      }
  }

  const getLabel = () => {
      switch(theme) {
          case 'light': return '라이트 모드 (클릭시 다크모드)';
          case 'dark': return '다크 모드 (클릭시 브루탈모드)';
          case 'brutal': return '브루탈 모드 (클릭시 라이트모드)';
      }
  }

  return (
    <button
      onClick={toggleTheme}
      className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:bg-gray-200 dark:hover:bg-gray-700 border border-transparent dark:border-gray-600 theme-brutal:border-black theme-brutal:border-2"
      aria-label={getLabel()}
      title={getLabel()}
    >
      <span className="text-lg">{getIcon()}</span>
    </button>
  );
};

export default ThemeToggle;
