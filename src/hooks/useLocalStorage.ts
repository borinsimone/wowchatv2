import { useState } from "react";

/**
 * Hook personalizzato per gestire il localStorage con TypeScript
 * @param key - La chiave del localStorage
 * @param initialValue - Il valore iniziale se non esiste nel localStorage
 * @returns [value, setValue] - Il valore corrente e la funzione per aggiornarlo
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // Stato per memorizzare il valore
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      // Ottieni dal localStorage usando la chiave
      const item = window.localStorage.getItem(key);
      // Parsing del JSON o ritorna il valore iniziale
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // Se errore, ritorna il valore iniziale
      console.warn(
        `Error reading localStorage key "${key}":`,
        error
      );
      return initialValue;
    }
  });

  // Ritorna una versione wrapped di useState per persistere il nuovo valore nel localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Permette al valore di essere una funzione per lo stesso API di useState
      const valueToStore =
        value instanceof Function
          ? value(storedValue)
          : value;

      // Salva lo stato
      setStoredValue(valueToStore);

      // Salva nel localStorage
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          key,
          JSON.stringify(valueToStore)
        );
      }
    } catch (error) {
      // Un caso edge più avanzato sarebbe gestire l'errore del localStorage
      console.error(
        `Error setting localStorage key "${key}":`,
        error
      );
    }
  };

  return [storedValue, setValue];
}

/**
 * Hook per rimuovere un valore dal localStorage
 * @param key - La chiave del localStorage da rimuovere
 */
export function useRemoveLocalStorage(
  key: string
): () => void {
  const removeValue = () => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(
        `Error removing localStorage key "${key}":`,
        error
      );
    }
  };

  return removeValue;
}

/**
 * Hook per pulire tutto il localStorage (usa con cautela)
 */
export function useClearLocalStorage(): () => void {
  const clearStorage = () => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.clear();
      }
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  };

  return clearStorage;
}

/**
 * Utility function per leggere dal localStorage senza React hook
 * Utile per leggere valori fuori dai componenti
 */
export function getLocalStorageValue<T>(
  key: string,
  defaultValue: T
): T {
  if (typeof window === "undefined") {
    return defaultValue;
  }

  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(
      `Error reading localStorage key "${key}":`,
      error
    );
    return defaultValue;
  }
}

/**
 * Utility function per scrivere nel localStorage senza React hook
 * Utile per salvare valori fuori dai componenti
 */
export function setLocalStorageValue<T>(
  key: string,
  value: T
): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(
      `Error setting localStorage key "${key}":`,
      error
    );
  }
}
