import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  auth,
  db,
  googleProvider,
} from "../config/firebase";
import type { User } from "../types";

export class AuthService {
  // Sign in with Google
  static async signInWithGoogle(): Promise<User> {
    try {
      const result = await signInWithPopup(
        auth,
        googleProvider
      );
      const firebaseUser = result.user;

      // Create/update user document in Firestore
      const user = await this.createOrUpdateUser(
        firebaseUser
      );

      // Set up presence system
      await this.setupPresence(user.uid);

      return user;
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw new Error("Failed to sign in with Google");
    }
  }

  // Sign out
  static async signOut(): Promise<void> {
    try {
      if (auth.currentUser) {
        // Update user status to offline before signing out
        await this.updateUserStatus(
          auth.currentUser.uid,
          false
        );
      }
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
      throw new Error("Failed to sign out");
    }
  }

  // Listen to auth state changes
  static onAuthStateChange(
    callback: (user: User | null) => void
  ) {
    console.log(
      "AuthService: Setting up auth state listener"
    );
    return onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        console.log("AuthService: Auth state changed", {
          uid: firebaseUser?.uid,
        });
        if (firebaseUser) {
          try {
            const user = await this.getUser(
              firebaseUser.uid
            );
            console.log(
              "AuthService: Retrieved user data",
              { user: user?.uid }
            );
            callback(user);
          } catch (error) {
            console.error(
              "Error getting user data:",
              error
            );
            callback(null);
          }
        } else {
          console.log(
            "AuthService: No firebase user, calling callback with null"
          );
          callback(null);
        }
      }
    );
  }

  // Create or update user in Firestore
  private static async createOrUpdateUser(
    firebaseUser: FirebaseUser
  ): Promise<User> {
    const userRef = doc(db, "users", firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    const userData: User = {
      uid: firebaseUser.uid,
      email: firebaseUser.email || "",
      displayName:
        firebaseUser.displayName ||
        firebaseUser.email?.split("@")[0] ||
        "",
      photoURL: firebaseUser.photoURL || "",
      isOnline: true,
      lastSeen: serverTimestamp() as any,
      createdAt: userSnap.exists()
        ? userSnap.data().createdAt
        : (serverTimestamp() as any),
    };

    await setDoc(userRef, userData, { merge: true });
    return userData;
  }

  // Get user data from Firestore
  private static async getUser(
    uid: string
  ): Promise<User | null> {
    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        return userSnap.data() as User;
      }
      return null;
    } catch (error) {
      console.error("Error getting user:", error);
      return null;
    }
  }

  // Setup presence system (online/offline status)
  private static async setupPresence(
    uid: string
  ): Promise<void> {
    try {
      const userRef = doc(db, "users", uid);

      // Set user as online
      await updateDoc(userRef, {
        isOnline: true,
        lastSeen: serverTimestamp(),
      });

      // Set up offline detection using window events
      this.setupOfflineDetection(uid);
    } catch (error) {
      console.error("Error setting up presence:", error);
    }
  }

  // Setup offline detection using window events
  private static setupOfflineDetection(uid: string): void {
    const updateOfflineStatus = async () => {
      try {
        await this.updateUserStatus(uid, false);
      } catch (error) {
        console.error(
          "Error updating offline status:",
          error
        );
      }
    };

    // Listen for page unload
    window.addEventListener(
      "beforeunload",
      updateOfflineStatus
    );
    window.addEventListener("unload", updateOfflineStatus);

    // Listen for visibility change
    document.addEventListener(
      "visibilitychange",
      async () => {
        if (document.visibilityState === "hidden") {
          await updateOfflineStatus();
        } else {
          try {
            await this.updateUserStatus(uid, true);
          } catch (error) {
            console.error(
              "Error updating online status:",
              error
            );
          }
        }
      }
    );
  }

  // Update user online status
  private static async updateUserStatus(
    uid: string,
    isOnline: boolean
  ): Promise<void> {
    try {
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {
        isOnline,
        lastSeen: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  }

  // Get current user
  static getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return !!auth.currentUser;
  }
}
