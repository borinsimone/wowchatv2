import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../store/useAppStore";
import { useContacts } from "../../hooks/useContacts";
import { useToastContext } from "../../contexts/ToastContext";
import { ChatService } from "../../services/chatService";
import styles from "./ContactList.module.css";

type AddContactMode = "email" | "uid";

export const ContactList: React.FC = () => {
  const { user } = useAppStore();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToastContext();
  const {
    contacts,
    addContactByEmail,
    addContactByUid,
    removeContact,
    searchUsers,
    searchResults,
    isSearching,
    clearSearchResults,
    error,
    isLoading,
  } = useContacts();

  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingContact, setIsAddingContact] =
    useState(false);
  const [newContactInput, setNewContactInput] =
    useState("");
  const [addMode, setAddMode] =
    useState<AddContactMode>("email");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSearchResults, setShowSearchResults] =
    useState(false);

  // Filter contacts based on search term
  const filteredContacts = contacts.filter(
    (contact) =>
      contact.displayName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      contact.email
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const startChat = async (contactUid: string) => {
    if (!user) return;

    try {
      const chatId = await ChatService.createOrGetChat(
        user.uid,
        contactUid
      );
      // Navigate to the chat
      navigate(`/chat/${chatId}`);
    } catch (error) {
      console.error("Error starting chat:", error);
    }
  };

  const handleAddContact = async () => {
    if (!newContactInput.trim() || !user || isProcessing)
      return;

    setIsProcessing(true);
    try {
      let contact;
      let contactName = "";

      if (addMode === "email") {
        contact = await addContactByEmail(
          newContactInput.trim()
        );
        contactName =
          contact?.displayName || newContactInput.trim();
      } else {
        contact = await addContactByUid(
          newContactInput.trim()
        );
        contactName = contact?.displayName || "contatto";
      }

      // Show success notification
      showSuccess(
        `${contactName} è stato aggiunto ai tuoi contatti!`
      );

      // Reset form on success
      setNewContactInput("");
      setIsAddingContact(false);
      clearSearchResults();
    } catch (error) {
      console.error("Error adding contact:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Errore durante l'aggiunta del contatto";
      showError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSearchInput = async (value: string) => {
    setNewContactInput(value);

    if (value.trim().length >= 2) {
      setShowSearchResults(true);
      await searchUsers(value.trim());
    } else {
      setShowSearchResults(false);
      clearSearchResults();
    }
  };

  const handleAddFromSearch = async (userUid: string) => {
    if (!user || isProcessing) return;

    // Find the user from search results to get their name
    const userToAdd = searchResults.find(
      (u) => u.uid === userUid
    );
    const userName = userToAdd?.displayName || "contatto";

    setIsProcessing(true);
    try {
      await addContactByUid(userUid);

      // Show success notification
      showSuccess(
        `${userName} è stato aggiunto ai tuoi contatti!`
      );

      // Reset form on success
      setNewContactInput("");
      setIsAddingContact(false);
      setShowSearchResults(false);
      clearSearchResults();
    } catch (error) {
      console.error(
        "Error adding contact from search:",
        error
      );
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Errore durante l'aggiunta del contatto";
      showError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveContact = async (
    contactUid: string
  ) => {
    if (!user || isProcessing) return;

    // Find the contact to get their name
    const contactToRemove = contacts.find(
      (c) => c.uid === contactUid
    );
    const contactName =
      contactToRemove?.displayName || "contatto";

    setIsProcessing(true);
    try {
      await removeContact(contactUid);

      // Show success notification
      showSuccess(
        `${contactName} è stato rimosso dai tuoi contatti.`
      );
    } catch (error) {
      console.error("Error removing contact:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Errore durante la rimozione del contatto";
      showError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setIsAddingContact(false);
    setNewContactInput("");
    setShowSearchResults(false);
    clearSearchResults();
  };

  return (
    <div className={styles.contactList}>
      <div className={styles.header}>
        <h2>Contatti</h2>
        <button
          className={styles.addButton}
          onClick={() =>
            setIsAddingContact(!isAddingContact)
          }
          title="Aggiungi contatto"
        >
          ➕
        </button>
      </div>

      {/* Add Contact Form */}
      <AnimatePresence>
        {isAddingContact && (
          <motion.div
            className={styles.addContactForm}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            {/* Mode Selection */}
            <div className={styles.modeSelector}>
              <button
                className={`${styles.modeButton} ${
                  addMode === "email" ? styles.active : ""
                }`}
                onClick={() => setAddMode("email")}
              >
                📧 Email
              </button>
              <button
                className={`${styles.modeButton} ${
                  addMode === "uid" ? styles.active : ""
                }`}
                onClick={() => setAddMode("uid")}
              >
                🔑 UID
              </button>
            </div>

            {/* Input Field */}
            <input
              type={addMode === "email" ? "email" : "text"}
              placeholder={
                addMode === "email"
                  ? "Email del contatto..."
                  : "UID del contatto..."
              }
              value={newContactInput}
              onChange={(e) =>
                handleSearchInput(e.target.value)
              }
              className={styles.contactInput}
              onKeyPress={(e) => {
                if (e.key === "Enter") handleAddContact();
              }}
            />

            {/* Error Display */}
            {error && (
              <div className={styles.errorMessage}>
                {error}
              </div>
            )}

            {/* Search Results */}
            {showSearchResults && searchResults.length > 0 && (
              <div className={styles.searchResults}>
                <div className={styles.searchResultsHeader}>
                  Utenti trovati:
                </div>
                {searchResults.map((user) => (
                  <div
                    key={user.uid}
                    className={styles.searchResultItem}
                  >
                    <div className={styles.searchUserInfo}>
                      <div
                        className={styles.avatarFallback}
                      >
                        {user.displayName
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                      <div>
                        <div
                          className={styles.searchUserName}
                        >
                          {user.displayName}
                        </div>
                        <div
                          className={styles.searchUserEmail}
                        >
                          {user.email}
                        </div>
                      </div>
                    </div>
                    <button
                      className={styles.addFromSearchButton}
                      onClick={() =>
                        handleAddFromSearch(user.uid)
                      }
                      disabled={isProcessing}
                    >
                      ➕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Loading indicator for search */}
            {isSearching && (
              <div className={styles.searchLoading}>
                🔍 Cercando...
              </div>
            )}

            {/* Action Buttons */}
            <div className={styles.addContactActions}>
              <button
                onClick={handleAddContact}
                className={styles.confirmButton}
                disabled={
                  !newContactInput.trim() || isProcessing
                }
              >
                {isProcessing
                  ? "Aggiungendo..."
                  : "Aggiungi"}
              </button>
              <button
                onClick={resetForm}
                className={styles.cancelButton}
                disabled={isProcessing}
              >
                Annulla
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Contacts */}
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Cerca contatti..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {/* Contacts List */}
      <div className={styles.contactItems}>
        {isLoading ? (
          <div className={styles.loading}>
            <div className={styles.loadingIcon}>⏳</div>
            <p>Caricando contatti...</p>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>👥</div>
            <h3>Nessun contatto</h3>
            <p>
              Aggiungi dei contatti per iniziare a chattare!
            </p>
          </div>
        ) : (
          filteredContacts.map((contact) => (
            <motion.div
              key={contact.uid}
              className={styles.contactItem}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{
                backgroundColor:
                  "var(--color-surface-hover)",
              }}
            >
              <div className={styles.contactAvatar}>
                <div className={styles.avatarFallback}>
                  {contact.displayName
                    .charAt(0)
                    .toUpperCase()}
                </div>
                {contact.isOnline && (
                  <div className={styles.onlineIndicator} />
                )}
              </div>

              <div className={styles.contactInfo}>
                <h4 className={styles.contactName}>
                  {contact.displayName}
                </h4>
                <p className={styles.contactEmail}>
                  {contact.email}
                </p>
              </div>

              <div className={styles.contactActions}>
                <button
                  className={styles.chatButton}
                  title="Inizia chat"
                  onClick={() => startChat(contact.uid)}
                >
                  💬
                </button>
                <button
                  className={styles.removeButton}
                  title="Rimuovi contatto"
                  onClick={() =>
                    handleRemoveContact(contact.uid)
                  }
                  disabled={isProcessing}
                >
                  �️
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
