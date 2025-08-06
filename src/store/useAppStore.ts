import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type {
  User,
  Contact,
  Chat,
  Message,
  AppState,
} from "../types";

interface AppStore extends AppState {
  // Auth actions
  setUser: (user: User | null) => void;

  // Contact actions
  setContacts: (contacts: Contact[]) => void;
  addContact: (contact: Contact) => void;
  updateContactStatus: (
    uid: string,
    isOnline: boolean
  ) => void;

  // Chat actions
  setChats: (chats: Chat[]) => void;
  addChat: (chat: Chat) => void;
  updateChat: (id: string, updates: Partial<Chat>) => void;
  setCurrentChatId: (id: string | null) => void;

  // Message actions
  setMessages: (
    chatId: string,
    messages: Message[]
  ) => void;
  addMessage: (message: Message) => void;
  updateMessage: (
    id: string,
    updates: Partial<Message>
  ) => void;
  markMessageAsRead: (
    messageId: string,
    userId: string
  ) => void;

  // UI actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
  toggleTheme: () => void;
  setOnlineStatus: (isOnline: boolean) => void;

  // Utility actions
  clearAll: () => void;
}

const initialState: AppState = {
  user: null,
  contacts: [],
  chats: [],
  messages: {},
  currentChatId: null,
  isLoading: true, // Start with loading true
  error: null,
  theme: "light",
  isOnline: navigator.onLine,
};

export const useAppStore = create<AppStore>()(
  devtools(
    (set) => ({
      ...initialState,

      // Auth actions
      setUser: (user) => set({ user }, false, "setUser"),

      // Contact actions
      setContacts: (contacts) =>
        set({ contacts }, false, "setContacts"),

      addContact: (contact) =>
        set(
          (state) => ({
            contacts: [...state.contacts, contact],
          }),
          false,
          "addContact"
        ),

      updateContactStatus: (uid, isOnline) =>
        set(
          (state) => ({
            contacts: state.contacts.map((contact) =>
              contact.uid === uid
                ? { ...contact, isOnline }
                : contact
            ),
          }),
          false,
          "updateContactStatus"
        ),

      // Chat actions
      setChats: (chats: Chat[]) =>
        set({ chats }, false, "setChats"),

      addChat: (chat: Chat) =>
        set(
          (state) => ({
            chats: [...state.chats, chat],
          }),
          false,
          "addChat"
        ),

      updateChat: (id: string, updates: Partial<Chat>) =>
        set(
          (state) => ({
            chats: state.chats.map((chat) =>
              chat.id === id
                ? { ...chat, ...updates }
                : chat
            ),
          }),
          false,
          "updateChat"
        ),

      setCurrentChatId: (id: string | null) =>
        set(
          { currentChatId: id },
          false,
          "setCurrentChatId"
        ),

      // Message actions
      setMessages: (chatId: string, messages: Message[]) =>
        set(
          (state) => ({
            messages: {
              ...state.messages,
              [chatId]: messages,
            },
          }),
          false,
          "setMessages"
        ),

      addMessage: (message) =>
        set(
          (state) => {
            const conversationMessages =
              state.messages[message.conversationId] || [];
            return {
              messages: {
                ...state.messages,
                [message.conversationId]: [
                  ...conversationMessages,
                  message,
                ],
              },
            };
          },
          false,
          "addMessage"
        ),

      updateMessage: (id, updates) =>
        set(
          (state) => {
            const newMessages = { ...state.messages };
            Object.keys(newMessages).forEach(
              (conversationId) => {
                newMessages[conversationId] = newMessages[
                  conversationId
                ].map((msg) =>
                  msg.id === id
                    ? { ...msg, ...updates }
                    : msg
                );
              }
            );
            return { messages: newMessages };
          },
          false,
          "updateMessage"
        ),

      markMessageAsRead: (messageId, userId) =>
        set(
          (state) => {
            const newMessages = { ...state.messages };
            Object.keys(newMessages).forEach(
              (conversationId) => {
                newMessages[conversationId] = newMessages[
                  conversationId
                ].map((msg) =>
                  msg.id === messageId &&
                  !msg.readBy.includes(userId)
                    ? {
                        ...msg,
                        readBy: [...msg.readBy, userId],
                      }
                    : msg
                );
              }
            );
            return { messages: newMessages };
          },
          false,
          "markMessageAsRead"
        ),

      // UI actions
      setLoading: (isLoading) =>
        set({ isLoading }, false, "setLoading"),

      setError: (error) =>
        set({ error }, false, "setError"),

      setTheme: (theme) =>
        set({ theme }, false, "setTheme"),

      toggleTheme: () =>
        set(
          (state) => ({
            theme:
              state.theme === "light" ? "dark" : "light",
          }),
          false,
          "toggleTheme"
        ),

      setOnlineStatus: (isOnline) =>
        set({ isOnline }, false, "setOnlineStatus"),

      // Utility actions
      clearAll: () => set(initialState, false, "clearAll"),
    }),
    { name: "wowchat-store" }
  )
);
