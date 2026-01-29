import React from 'react';

type Theme = 'glass' | 'neumorphic' | 'webtoon';

interface ThemeToggleProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, setTheme }) => {
  
  const toggleTheme = () => {
    if (theme === 'webtoon') {
        setTheme('neumorphic');
    } else if (theme === 'neumorphic') {
        setTheme('glass');
    } else {
        setTheme('webtoon');
    }
  };

  const isGlass = theme === 'glass';
  const isNeumorphic = theme === 'neumorphic';

  const buttonClasses = isGlass
    ? 'p-2 rounded-full bg-slate-700/50 hover:bg-slate-600/50 transition-colors border border-slate-600/50'
    : isNeumorphic
    ? 'p-2 rounded-full shadow-[5px_5px_10px_#a3b1c6,-5px_-5px_10px_#ffffff] active:shadow-[inset_5px_5px_10px_#a3b1c6,inset_-5px_-5px_10px_#ffffff] transition-shadow'
    : 'p-2 rounded-md bg-white border-2 border-black shadow-[3px_3px_0_#000] active:shadow-none active:translate-y-0.5 active:translate-x-0.5 transition-all';
  
  const emojiClasses = 'text-xl leading-none w-5 h-5 flex items-center justify-center';

  const themeData = {
    webtoon: {
      label: "뉴로모픽 테마로 변경",
      icon: (
        <span className={emojiClasses} role="img" aria-label="모던 웹툰 테마">🖌️</span>
      )
    },
    neumorphic: {
      label: "글래스모피즘 테마로 변경",
      icon: (
        <span className={emojiClasses} role="img" aria-label="뉴로모픽 테마">⚙️</span>
      )
    },
    glass: {
      label: "모던 웹툰 테마로 변경",
      icon: (
        <span className={emojiClasses} role="img" aria-label="글래스모피즘 테마">✨</span>
      )
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className={buttonClasses}
      aria-label={themeData[theme].label}
      title={themeData[theme].label}
    >
      {themeData[theme].icon}
    </button>
  );
};

export default ThemeToggle;