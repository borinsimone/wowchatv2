import { useEffect, useCallback } from "react";
import { MessageService } from "../services/messageService";
import { useAppStore } from "../store/useAppStore";

export const useMessages = (
  conversationId: string | null
) => {
  const {
    messages,
    setMessages,
    setLoading,
    setError,
    user,
  } = useAppStore();

  const conversationMessages = conversationId
    ? messages[conversationId] || []
    : [];

  useEffect(() => {
    if (!conversationId) return;

    setLoading(true);

    const unsubscribe = MessageService.listenToMessages(
      conversationId,
      (newMessages) => {
        setMessages(conversationId, newMessages);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [conversationId, setMessages, setLoading]);

  const sendMessage = useCallback(
    async (receiverId: string, text: string) => {
      if (!user || !conversationId) return;

      setError(null);
      try {
        await MessageService.sendMessage(
          conversationId,
          user.uid,
          receiverId,
          text
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to send message"
        );
      }
    },
    [user, conversationId, setError]
  );

  const sendImageMessage = useCallback(
    async (receiverId: string, imageUrl: string) => {
      if (!user || !conversationId) return;

      setError(null);
      try {
        await MessageService.sendImageMessage(
          conversationId,
          user.uid,
          receiverId,
          imageUrl
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to send image"
        );
      }
    },
    [user, conversationId, setError]
  );

  const markMessageAsRead = useCallback(
    async (messageId: string) => {
      if (!user) return;

      try {
        await MessageService.markMessageAsRead(
          messageId,
          user.uid
        );
      } catch (error) {
        console.error(
          "Failed to mark message as read:",
          error
        );
      }
    },
    [user]
  );

  const markAllMessagesAsRead = useCallback(async () => {
    if (!user || !conversationId) return;

    try {
      await MessageService.markAllMessagesAsRead(
        conversationId,
        user.uid
      );
    } catch (error) {
      console.error(
        "Failed to mark all messages as read:",
        error
      );
    }
  }, [user, conversationId]);

  const editMessage = useCallback(
    async (messageId: string, newText: string) => {
      setError(null);
      try {
        await MessageService.editMessage(
          messageId,
          newText
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to edit message"
        );
      }
    },
    [setError]
  );

  const deleteMessage = useCallback(
    async (messageId: string) => {
      setError(null);
      try {
        await MessageService.deleteMessage(messageId);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to delete message"
        );
      }
    },
    [setError]
  );

  return {
    messages: conversationMessages,
    sendMessage,
    sendImageMessage,
    markMessageAsRead,
    markAllMessagesAsRead,
    editMessage,
    deleteMessage,
    isLoading: useAppStore((state) => state.isLoading),
    error: useAppStore((state) => state.error),
  };
};
