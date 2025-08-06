import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "../../store/useAppStore";
import { ChatService } from "../../services/chatService";
import styles from "./ContactList.module.css";

interface Contact {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isOnline?: boolean;
}

export const ContactList: React.FC = () => {
  const { user } = useAppStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingContact, setIsAddingContact] =
    useState(false);
  const [newContactEmail, setNewContactEmail] =
    useState("");

  // Mock contacts per ora
  const [contacts] = useState<Contact[]>([
    // {
    //   id: "contact_1",
    //   name: "Mario Rossi",
    //   email: "mario.rossi@example.com",
    //   isOnline: true,
    // },
    // {
    //   id: "contact_2",
    //   name: "Anna Verdi",
    //   email: "anna.verdi@example.com",
    //   isOnline: false,
    // },
    // {
    //   id: "contact_3",
    //   name: "Luca Bianchi",
    //   email: "luca.bianchi@example.com",
    //   isOnline: true,
    // },
  ]);

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      contact.email
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const startChat = async (contactId: string) => {
    if (!user) return;

    try {
      const chatId = await ChatService.createOrGetChat(
        user.uid,
        contactId
      );
      // Naviga alla chat
      window.location.href = `/chat/${chatId}`;
    } catch (error) {
      console.error("Error starting chat:", error);
    }
  };

  const addContact = async () => {
    if (!newContactEmail.trim() || !user) return;

    setIsAddingContact(true);
    try {
      // TODO: Implementare aggiunta contatto reale
      console.log("Adding contact:", newContactEmail);
      setNewContactEmail("");
      setIsAddingContact(false);
    } catch (error) {
      console.error("Error adding contact:", error);
      setIsAddingContact(false);
    }
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

      {isAddingContact && (
        <motion.div
          className={styles.addContactForm}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <input
            type="email"
            placeholder="Email del contatto..."
            value={newContactEmail}
            onChange={(e) =>
              setNewContactEmail(e.target.value)
            }
            className={styles.contactInput}
            onKeyPress={(e) => {
              if (e.key === "Enter") addContact();
            }}
          />
          <div className={styles.addContactActions}>
            <button
              onClick={addContact}
              className={styles.confirmButton}
              disabled={!newContactEmail.trim()}
            >
              Aggiungi
            </button>
            <button
              onClick={() => {
                setIsAddingContact(false);
                setNewContactEmail("");
              }}
              className={styles.cancelButton}
            >
              Annulla
            </button>
          </div>
        </motion.div>
      )}

      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Cerca contatti..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.contactItems}>
        {filteredContacts.length === 0 ? (
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
              key={contact.id}
              className={styles.contactItem}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{
                backgroundColor:
                  "var(--color-surface-hover)",
              }}
              onClick={() => startChat(contact.id)}
            >
              <div className={styles.contactAvatar}>
                <div className={styles.avatarFallback}>
                  {contact.name.charAt(0).toUpperCase()}
                </div>
                {contact.isOnline && (
                  <div className={styles.onlineIndicator} />
                )}
              </div>

              <div className={styles.contactInfo}>
                <h4 className={styles.contactName}>
                  {contact.name}
                </h4>
                <p className={styles.contactEmail}>
                  {contact.email}
                </p>
              </div>

              <div className={styles.contactActions}>
                <button
                  className={styles.chatButton}
                  title="Inizia chat"
                  onClick={(e) => {
                    e.stopPropagation();
                    startChat(contact.id);
                  }}
                >
                  💬
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
