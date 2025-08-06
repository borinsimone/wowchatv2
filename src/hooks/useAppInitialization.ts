import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { getLocalStorageValue } from './useLocalStorage';
import { defaultPreferences } from '../types/preferences';
import type { UserPreferences } from '../types/preferences';

/**
 * Hook per inizializzare le preferenze dell'app all'avvio
 * Sincronizza lo store globale con il localStorage
 */
export const useAppInitialization = () => {
  const { setTheme } = useAppStore();

  useEffect(() => {
    // Leggi le preferenze dal localStorage
    const preferences = getLocalStorageValue<UserPreferences>(
      'wowchat-preferences',
      defaultPreferences
    );

    // Sincronizza il tema con lo store globale
    setTheme(preferences.theme);

    // Applica altre inizializzazioni se necessario
    console.log('🚀 App initialized with preferences:', preferences);

    // Applica il tema CSS
    const applyTheme = (theme: UserPreferences['theme']) => {
      if (theme === 'system') {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const systemTheme = mediaQuery.matches ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', systemTheme);

        const handleSystemThemeChange = (e: MediaQueryListEvent) => {
          document.documentElement.setAttribute(
            'data-theme',
            e.matches ? 'dark' : 'light'
          );
        };

        mediaQuery.addEventListener('change', handleSystemThemeChange);
        return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
      } else {
        document.documentElement.setAttribute('data-theme', theme);
      }
    };

    const cleanup = applyTheme(preferences.theme);
    return cleanup;
  }, [setTheme]);
};
