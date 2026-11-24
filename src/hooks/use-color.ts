import { THEME, type ThemeColors } from '@/lib/theme';
import { useUniwind } from 'uniwind';

export function useColor(): ThemeColors {
  const { theme } = useUniwind();
  return THEME[theme === 'dark' ? 'dark' : 'light'];
}
