import { useEffect, useCallback } from "react";
import { ConversationService } from "../services/conversationService";
import { useAppStore } from "../store/useAppStore";

export const useConversations = () => {
  const {
    user,
    conversations,
    setConversations,
    setCurrentConversationId,
    currentConversationId,
    setLoading,
    setError,
  } = useAppStore();

  useEffect(() => {
    if (!user) return;

    setLoading(true);

    const unsubscribe =
      ConversationService.listenToUserConversations(
        user.uid,
        (newConversations) => {
          setConversations(newConversations);
          setLoading(false);
        }
      );

    return () => {
      unsubscribe();
    };
  }, [user, setConversations, setLoading]);

  const createOrGetConversation = useCallback(
    async (otherUserId: string) => {
      if (!user) return null;

      setError(null);
      try {
        const conversationId =
          await ConversationService.createOrGetConversation(
            user.uid,
            otherUserId
          );
        setCurrentConversationId(conversationId);
        return conversationId;
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to create conversation"
        );
        return null;
      }
    },
    [user, setCurrentConversationId, setError]
  );

  const selectConversation = useCallback(
    (conversationId: string | null) => {
      setCurrentConversationId(conversationId);
    },
    [setCurrentConversationId]
  );

  const getOtherParticipant = useCallback(
    (conversationId: string) => {
      if (!user) return null;

      const conversation = conversations.find(
        (c) => c.id === conversationId
      );
      if (!conversation) return null;

      return ConversationService.getOtherParticipantId(
        conversation,
        user.uid
      );
    },
    [user, conversations]
  );

  const currentConversation = conversations.find(
    (c) => c.id === currentConversationId
  );

  return {
    conversations,
    currentConversation,
    currentConversationId,
    createOrGetConversation,
    selectConversation,
    getOtherParticipant,
    isLoading: useAppStore((state) => state.isLoading),
    error: useAppStore((state) => state.error),
  };
};
