import { useEffect } from 'react';
import { getLocalStorageValue } from '../../hooks/useLocalStorage';
import { defaultPreferences } from '../../types/preferences';
import type { UserPreferences } from '../../types/preferences';

/**
 * Componente che applica le preferenze del tema all'avvio dell'app
 */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // Leggi le preferenze dal localStorage all'avvio
    const preferences = getLocalStorageValue<UserPreferences>(
      'wowchat-preferences',
      defaultPreferences
    );

    // Applica il tema in base alle preferenze
    const applyTheme = (theme: UserPreferences['theme']) => {
      if (theme === 'system') {
        // Se il tema è 'system', usa le preferenze del sistema
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const systemTheme = mediaQuery.matches ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', systemTheme);

        // Listener per i cambiamenti delle preferenze del sistema
        const handleSystemThemeChange = (e: MediaQueryListEvent) => {
          document.documentElement.setAttribute(
            'data-theme',
            e.matches ? 'dark' : 'light'
          );
        };

        mediaQuery.addEventListener('change', handleSystemThemeChange);
        
        // Cleanup function per rimuovere il listener
        return () => {
          mediaQuery.removeEventListener('change', handleSystemThemeChange);
        };
      } else {
        // Applica il tema manualmente selezionato
        document.documentElement.setAttribute('data-theme', theme);
      }
    };

    // Applica il tema dalle preferenze salvate
    const cleanup = applyTheme(preferences.theme);

    // Log per debug
    console.log('🎨 Theme initialized:', preferences.theme);

    // Cleanup se necessario
    return cleanup;
  }, []);

  return <>{children}</>;
};
