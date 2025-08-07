import { useEffect, useCallback, useState } from "react";
import { ContactService } from "../services/contactService";
import { useAppStore } from "../store/useAppStore";
import type { User } from "../types";

export const useContacts = () => {
  const { user, contacts, setContacts, addContact } =
    useAppStore();

  const [searchResults, setSearchResults] = useState<
    User[]
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log(
      "useContacts effect triggered, user:",
      user?.uid
    );

    if (!user) {
      console.log("No user, setting loading false");
      setIsLoading(false);
      return;
    }

    console.log(
      "Setting loading true and starting listener"
    );
    setIsLoading(true);
    setError(null);

    const unsubscribe = ContactService.listenToUserContacts(
      user.uid,
      (newContacts) => {
        console.log(
          "Contacts received:",
          newContacts.length
        );
        setContacts(newContacts);
        setIsLoading(false);
      },
      (error) => {
        console.error("Contact listener error:", error);
        setError("Failed to load contacts");
        setIsLoading(false);
      }
    );

    // Set a timeout as fallback to prevent infinite loading
    const fallbackTimeout = setTimeout(() => {
      console.log("Fallback timeout triggered");
      setIsLoading(false);
    }, 3000); // 3 seconds timeout

    return () => {
      console.log("Cleaning up contacts listener");
      unsubscribe();
      clearTimeout(fallbackTimeout);
    };
  }, [user, setContacts, setError]);

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
    isLoading,
    error,
  };
};
