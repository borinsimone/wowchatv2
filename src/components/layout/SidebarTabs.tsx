import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatList } from "./ChatList";
import { ContactList } from "../contacts/ContactList";
import { Settings } from "../settings/Settings";
import styles from "./SidebarTabs.module.css";

type TabType = "chats" | "contacts" | "settings";

export const SidebarTabs: React.FC = () => {
  const [activeTab, setActiveTab] =
    useState<TabType>("chats");

  const tabs = [
    { id: "chats" as TabType, label: "Chat", icon: "💬" },
    {
      id: "contacts" as TabType,
      label: "Contatti",
      icon: "👥",
    },
    {
      id: "settings" as TabType,
      label: "Impostazioni",
      icon: "⚙️",
    },
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case "chats":
        return <ChatList />;
      case "contacts":
        return <ContactList />;
      case "settings":
        return <Settings />;
      default:
        return <ChatList />;
    }
  };

  return (
    <div className={styles.sidebarTabs}>
      <div className={styles.tabHeader}>
        <div className={styles.tabButtons}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`${styles.tabButton} ${
                activeTab === tab.id ? styles.active : ""
              }`}
              onClick={() => setActiveTab(tab.id)}
              title={tab.label}
            >
              <span className={styles.tabIcon}>
                {tab.icon}
              </span>
              <span className={styles.tabLabel}>
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.tabContent}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className={styles.tabPane}
          >
            {renderActiveTab()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
