import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { flushSync } from 'react-dom';

type ThemeContextType = {
  isDark: boolean;
  toggleTheme: (e?: React.MouseEvent | any) => void;
};

const ThemeContext = createContext<ThemeContextType>({ isDark: false, toggleTheme: () => {} });

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = useCallback(async (e?: React.MouseEvent | any) => {
    const isDarkCurrent = document.documentElement.classList.contains('dark');
    const newDark = !isDarkCurrent;
    
    if (!(document as any).startViewTransition) {
       setIsDark(newDark);
       document.documentElement.classList.toggle('dark', newDark);
       localStorage.setItem('theme', newDark ? 'dark' : 'light');
       return;
    }

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;

    if (e && 'clientX' in e) {
       x = e.clientX;
       y = e.clientY;
    } else if (e?.touches?.[0]) {
       x = e.touches[0].clientX;
       y = e.touches[0].clientY;
    }

    const transition = (document as any).startViewTransition(() => {
       flushSync(() => {
         setIsDark(newDark);
         document.documentElement.classList.toggle('dark', newDark);
         localStorage.setItem('theme', newDark ? 'dark' : 'light');
       });
    });

    await transition.ready;

    const maxDistance = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
    );
    
    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${maxDistance}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 700,
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)",
      }
    );
  }, []);

  return <ThemeContext.Provider value={{ isDark, toggleTheme }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
