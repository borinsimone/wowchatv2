import { useLocalStorage } from './useLocalStorage';
import type { UserPreferences } from '../types/preferences';
import { defaultPreferences } from '../types/preferences';
import { useAppStore } from '../store/useAppStore';
import { useEffect } from 'react';

/**
 * Hook per gestire le preferenze utente con localStorage
 */
export function useUserPreferences() {
  const [preferences, setPreferences] = useLocalStorage<UserPreferences>(
    'wowchat-preferences',
    defaultPreferences
  );
  
  const { setTheme } = useAppStore();

  // Sincronizza il tema con lo store globale quando cambia
  useEffect(() => {
    setTheme(preferences.theme);
  }, [preferences.theme, setTheme]);

  // Applica il tema quando cambia
  useEffect(() => {
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
  }, [preferences.theme]);

  // Funzioni helper per aggiornare specifiche sezioni delle preferenze
  const updateTheme = (theme: UserPreferences['theme']) => {
    setPreferences(prev => ({ ...prev, theme }));
  };

  const updateNotifications = (notifications: Partial<UserPreferences['notifications']>) => {
    setPreferences(prev => ({
      ...prev,
      notifications: { ...prev.notifications, ...notifications }
    }));
  };

  const updatePrivacy = (privacy: Partial<UserPreferences['privacy']>) => {
    setPreferences(prev => ({
      ...prev,
      privacy: { ...prev.privacy, ...privacy }
    }));
  };

  const updateChat = (chat: Partial<UserPreferences['chat']>) => {
    setPreferences(prev => ({
      ...prev,
      chat: { ...prev.chat, ...chat }
    }));
  };

  const updateUI = (ui: Partial<UserPreferences['ui']>) => {
    setPreferences(prev => ({
      ...prev,
      ui: { ...prev.ui, ...ui }
    }));
  };

  // Funzione per resettare alle impostazioni predefinite
  const resetToDefaults = () => {
    setPreferences(defaultPreferences);
  };

  // Funzione per esportare le impostazioni (per backup)
  const exportPreferences = () => {
    const dataStr = JSON.stringify(preferences, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'wowchat-preferences.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Funzione per importare le impostazioni (da backup)
  const importPreferences = (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedPreferences = JSON.parse(e.target?.result as string);
          // Valida che abbia la struttura corretta (basic validation)
          if (importedPreferences && typeof importedPreferences === 'object') {
            setPreferences({ ...defaultPreferences, ...importedPreferences });
            resolve();
          } else {
            reject(new Error('Formato file non valido'));
          }
        } catch (error) {
          reject(new Error('Errore nel parsing del file'));
        }
      };
      reader.onerror = () => reject(new Error('Errore nella lettura del file'));
      reader.readAsText(file);
    });
  };

  return {
    preferences,
    setPreferences,
    updateTheme,
    updateNotifications,
    updatePrivacy,
    updateChat,
    updateUI,
    resetToDefaults,
    exportPreferences,
    importPreferences,
  };
}
