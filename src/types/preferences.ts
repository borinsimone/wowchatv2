export interface UserPreferences {
  // Tema
  theme: "light" | "dark" | "system";

  // Notifiche
  notifications: {
    sound: boolean;
    desktop: boolean;
    email: boolean;
  };

  // Privacy
  privacy: {
    lastSeen: "everyone" | "contacts" | "nobody";
    onlineStatus: "everyone" | "contacts" | "nobody";
  };

  // Chat
  chat: {
    enterToSend: boolean;
    showTimestamps: boolean;
    fontSize: "small" | "medium" | "large";
  };

  // Interfaccia
  ui: {
    sidebarWidth: number;
    compactMode: boolean;
    showAvatars: boolean;
  };
}

export const defaultPreferences: UserPreferences = {
  theme: "system",
  notifications: {
    sound: true,
    desktop: true,
    email: false,
  },
  privacy: {
    lastSeen: "everyone",
    onlineStatus: "everyone",
  },
  chat: {
    enterToSend: true,
    showTimestamps: true,
    fontSize: "medium",
  },
  ui: {
    sidebarWidth: 320,
    compactMode: false,
    showAvatars: true,
  },
};
