import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "../config/firebase";
import type { Contact, User } from "../types";

export class ContactService {
  // Add a contact by email
  static async addContactByEmail(
    currentUserId: string,
    email: string
  ): Promise<Contact> {
    try {
      // Find user by email
      const usersRef = collection(db, "users");
      const q = query(
        usersRef,
        where("email", "==", email)
      );
      const userSnapshot = await getDocs(q);

      if (userSnapshot.empty) {
        throw new Error("User not found with this email");
      }

      const userDoc = userSnapshot.docs[0];
      const targetUser = {
        ...userDoc.data(),
        uid: userDoc.id,
      } as User;

      if (targetUser.uid === currentUserId) {
        throw new Error("Cannot add yourself as a contact");
      }

      // Check if contact already exists
      const contactRef = doc(
        db,
        "contacts",
        `${currentUserId}_${targetUser.uid}`
      );
      const existingContact = await getDoc(contactRef);

      if (existingContact.exists()) {
        throw new Error("Contact already exists");
      }

      // Create contact document
      const contact: Contact = {
        uid: targetUser.uid,
        email: targetUser.email,
        displayName: targetUser.displayName,
        photoURL: targetUser.photoURL,
        isOnline: targetUser.isOnline,
        lastSeen: targetUser.lastSeen,
        addedAt: serverTimestamp() as any,
      };

      // Save contact for current user
      await setDoc(contactRef, contact);

      // Also create reciprocal contact
      const reciprocalContactRef = doc(
        db,
        "contacts",
        `${targetUser.uid}_${currentUserId}`
      );
      const currentUserDoc = await getDoc(
        doc(db, "users", currentUserId)
      );

      if (currentUserDoc.exists()) {
        const currentUserData =
          currentUserDoc.data() as User;
        const reciprocalContact: Contact = {
          uid: currentUserId,
          email: currentUserData.email,
          displayName: currentUserData.displayName,
          photoURL: currentUserData.photoURL,
          isOnline: currentUserData.isOnline,
          lastSeen: currentUserData.lastSeen,
          addedAt: serverTimestamp() as any,
        };
        await setDoc(
          reciprocalContactRef,
          reciprocalContact
        );
      }

      return contact;
    } catch (error) {
      console.error("Error adding contact:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to add contact");
    }
  }

  // Add a contact by UID
  static async addContactByUid(
    currentUserId: string,
    targetUid: string
  ): Promise<Contact> {
    try {
      if (targetUid === currentUserId) {
        throw new Error("Cannot add yourself as a contact");
      }

      // Get target user
      const userRef = doc(db, "users", targetUid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        throw new Error("User not found");
      }

      const targetUser = userSnap.data() as User;

      // Check if contact already exists
      const contactRef = doc(
        db,
        "contacts",
        `${currentUserId}_${targetUid}`
      );
      const existingContact = await getDoc(contactRef);

      if (existingContact.exists()) {
        throw new Error("Contact already exists");
      }

      // Create contact
      const contact: Contact = {
        uid: targetUser.uid,
        email: targetUser.email,
        displayName: targetUser.displayName,
        photoURL: targetUser.photoURL,
        isOnline: targetUser.isOnline,
        lastSeen: targetUser.lastSeen,
        addedAt: serverTimestamp() as any,
      };

      await setDoc(contactRef, contact);

      // Create reciprocal contact
      const reciprocalContactRef = doc(
        db,
        "contacts",
        `${targetUid}_${currentUserId}`
      );
      const currentUserDoc = await getDoc(
        doc(db, "users", currentUserId)
      );

      if (currentUserDoc.exists()) {
        const currentUserData =
          currentUserDoc.data() as User;
        const reciprocalContact: Contact = {
          uid: currentUserId,
          email: currentUserData.email,
          displayName: currentUserData.displayName,
          photoURL: currentUserData.photoURL,
          isOnline: currentUserData.isOnline,
          lastSeen: currentUserData.lastSeen,
          addedAt: serverTimestamp() as any,
        };
        await setDoc(
          reciprocalContactRef,
          reciprocalContact
        );
      }

      return contact;
    } catch (error) {
      console.error("Error adding contact by UID:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to add contact");
    }
  }

  // Get user contacts
  static async getUserContacts(
    userId: string
  ): Promise<Contact[]> {
    try {
      const contactsRef = collection(db, "contacts");
      const q = query(
        contactsRef,
        where("__name__", ">=", `${userId}_`),
        where("__name__", "<", `${userId}_\uf8ff`),
        orderBy("__name__")
      );

      const snapshot = await getDocs(q);
      const contacts: Contact[] = [];

      snapshot.forEach((doc) => {
        contacts.push(doc.data() as Contact);
      });

      return contacts;
    } catch (error) {
      console.error("Error getting contacts:", error);
      return [];
    }
  }

  // Listen to user contacts
  static listenToUserContacts(
    userId: string,
    callback: (contacts: Contact[]) => void
  ) {
    const contactsRef = collection(db, "contacts");
    const q = query(
      contactsRef,
      where("__name__", ">=", `${userId}_`),
      where("__name__", "<", `${userId}_\uf8ff`),
      orderBy("__name__")
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const contacts: Contact[] = [];
        snapshot.forEach((doc) => {
          contacts.push(doc.data() as Contact);
        });
        callback(contacts);
      },
      (error) => {
        console.error(
          "Error listening to contacts:",
          error
        );
      }
    );
  }

  // Remove a contact
  static async removeContact(
    currentUserId: string,
    contactUid: string
  ): Promise<void> {
    try {
      // Remove contact for current user
      const contactRef = doc(
        db,
        "contacts",
        `${currentUserId}_${contactUid}`
      );
      await deleteDoc(contactRef);

      // Remove reciprocal contact
      const reciprocalContactRef = doc(
        db,
        "contacts",
        `${contactUid}_${currentUserId}`
      );
      await deleteDoc(reciprocalContactRef);
    } catch (error) {
      console.error("Error removing contact:", error);
      throw new Error("Failed to remove contact");
    }
  }

  // Search users by email or display name
  static async searchUsers(
    searchTerm: string,
    currentUserId: string
  ): Promise<User[]> {
    try {
      const usersRef = collection(db, "users");

      // Search by email
      const emailQuery = query(
        usersRef,
        where("email", ">=", searchTerm.toLowerCase()),
        where(
          "email",
          "<=",
          searchTerm.toLowerCase() + "\uf8ff"
        )
      );

      const emailSnapshot = await getDocs(emailQuery);
      const users: User[] = [];

      emailSnapshot.forEach((doc) => {
        const userData = doc.data() as User;
        if (userData.uid !== currentUserId) {
          users.push(userData);
        }
      });

      // Search by display name (if different from email search)
      if (!searchTerm.includes("@")) {
        const nameQuery = query(
          usersRef,
          where("displayName", ">=", searchTerm),
          where("displayName", "<=", searchTerm + "\uf8ff")
        );

        const nameSnapshot = await getDocs(nameQuery);
        const existingUids = users.map((u) => u.uid);

        nameSnapshot.forEach((doc) => {
          const userData = doc.data() as User;
          if (
            userData.uid !== currentUserId &&
            !existingUids.includes(userData.uid)
          ) {
            users.push(userData);
          }
        });
      }

      return users;
    } catch (error) {
      console.error("Error searching users:", error);
      return [];
    }
  }

  // Check if user is a contact
  static async isContact(
    currentUserId: string,
    targetUserId: string
  ): Promise<boolean> {
    try {
      const contactRef = doc(
        db,
        "contacts",
        `${currentUserId}_${targetUserId}`
      );
      const contactSnap = await getDoc(contactRef);
      return contactSnap.exists();
    } catch (error) {
      console.error(
        "Error checking if user is contact:",
        error
      );
      return false;
    }
  }

  // Update contact status (called when user status changes)
  static async updateContactStatus(
    contactUid: string,
    isOnline: boolean,
    lastSeen: any
  ): Promise<void> {
    try {
      // This would typically be called by a cloud function
      // For now, we'll update it when we detect status changes
      const contactsRef = collection(db, "contacts");
      const q = query(
        contactsRef,
        where("uid", "==", contactUid)
      );

      const snapshot = await getDocs(q);
      const batch = writeBatch(db);

      snapshot.forEach((doc) => {
        batch.update(doc.ref, { isOnline, lastSeen });
      });

      await batch.commit();
    } catch (error) {
      console.error(
        "Error updating contact status:",
        error
      );
    }
  }
}
