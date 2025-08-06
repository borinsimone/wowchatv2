import { Timestamp } from "firebase/firestore";

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  isOnline: boolean;
  lastSeen: Timestamp;
  createdAt: Timestamp;
}

export interface Message {
  id: string;
  senderId: string;
  text?: string;
  imageUrl?: string;
  timestamp: Timestamp;
  readBy: string[];
  edited?: boolean;
  editedAt?: Timestamp;
}

export interface Chat {
  id: string;
  participants: string[];
  lastMessage: {
    text: string;
    senderId: string;
    timestamp: Timestamp;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UserChat {
  chatId: string;
  lastSeen: Timestamp;
  isArchived?: boolean;
  isMuted?: boolean;
}

export interface Contact {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  isOnline: boolean;
  lastSeen: Timestamp;
  addedAt: Timestamp;
}

export interface Theme {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  error: string;
  warning: string;
}

export interface AppState {
  user: User | null;
  contacts: Contact[];
  chats: Chat[];
  messages: Record<string, Message[]>;
  currentChatId: string | null;
  isLoading: boolean;
  error: string | null;
  theme: "light" | "dark" | "system";
  isOnline: boolean;
}
