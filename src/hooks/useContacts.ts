import { useEffect, useCallback, useState } from "react";
import { ContactService } from "../services/contactService";
import { useAppStore } from "../store/useAppStore";
import type { User } from "../types";

export const useContacts = () => {
  const {
    user,
    contacts,
    setContacts,
    addContact,
    setLoading,
    setError,
  } = useAppStore();

  const [searchResults, setSearchResults] = useState<
    User[]
  >([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!user) return;

    setLoading(true);

    const unsubscribe = ContactService.listenToUserContacts(
      user.uid,
      (newContacts) => {
        setContacts(newContacts);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user, setContacts, setLoading]);

  const addContactByEmail = useCallback(
    async (email: string) => {
      if (!user) return;

      setError(null);
      try {
        const contact =
          await ContactService.addContactByEmail(
            user.uid,
            email
          );
        addContact(contact);
        return contact;
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to add contact"
        );
        throw error;
      }
    },
    [user, addContact, setError]
  );

  const addContactByUid = useCallback(
    async (targetUid: string) => {
      if (!user) return;

      setError(null);
      try {
        const contact =
          await ContactService.addContactByUid(
            user.uid,
            targetUid
          );
        addContact(contact);
        return contact;
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to add contact"
        );
        throw error;
      }
    },
    [user, addContact, setError]
  );

  const removeContact = useCallback(
    async (contactUid: string) => {
      if (!user) return;

      setError(null);
      try {
        await ContactService.removeContact(
          user.uid,
          contactUid
        );
        // The contact will be automatically removed from the store via the listener
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to remove contact"
        );
      }
    },
    [user, setError]
  );

  const searchUsers = useCallback(
    async (searchTerm: string) => {
      if (!user || searchTerm.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      setError(null);

      try {
        const results = await ContactService.searchUsers(
          searchTerm.trim(),
          user.uid
        );
        setSearchResults(results);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Search failed"
        );
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [user, setError]
  );

  const isContact = useCallback(
    async (targetUserId: string) => {
      if (!user) return false;

      try {
        return await ContactService.isContact(
          user.uid,
          targetUserId
        );
      } catch (error) {
        console.error(
          "Error checking if user is contact:",
          error
        );
        return false;
      }
    },
    [user]
  );

  const clearSearchResults = useCallback(() => {
    setSearchResults([]);
  }, []);

  return {
    contacts,
    searchResults,
    isSearching,
    addContactByEmail,
    addContactByUid,
    removeContact,
    searchUsers,
    isContact,
    clearSearchResults,
    isLoading: useAppStore((state) => state.isLoading),
    error: useAppStore((state) => state.error),
  };
};
