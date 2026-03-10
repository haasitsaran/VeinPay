import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  size?: 'sm' | 'md';
}

export default function ThemeToggle({ size = 'md' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const baseClasses =
    'inline-flex items-center justify-center rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  const sizeClasses =
    size === 'sm'
      ? 'w-8 h-8 text-xs border-gray-300 bg-white/80 hover:bg-gray-100 dark:bg-slate-800 dark:border-slate-600 dark:hover:bg-slate-700'
      : 'w-9 h-9 text-sm border-gray-300 bg-white/80 hover:bg-gray-100 dark:bg-slate-800 dark:border-slate-600 dark:hover:bg-slate-700';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`${baseClasses} ${sizeClasses}`}
    >
      {isDark ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
    </button>
  );
}

