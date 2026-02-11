// Firebase Service Layer for Treez Intelligence
import {
  auth,
  db,
  storage,
  googleProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from '../firebase';

// ==================== Authentication Services ====================

export const authService = {
  // Sign in with Google
  signInWithGoogle: async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return { success: true, user: result.user };
    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
      return { success: false, error: error.message };
    }
  },

  // Sign up with Email/Password
  signUpWithEmail: async (email: string, password: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      return { success: true, user: result.user };
    } catch (error: any) {
      console.error("Sign-Up Error:", error);
      return { success: false, error: error.message };
    }
  },

  // Sign in with Email/Password
  signInWithEmail: async (email: string, password: string) => {
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: result.user };
    } catch (error: any) {
        console.error("Sign-In Error:", error);
        return { success: false, error: error.message };
    }
  },

  // Update Profile
  updateUserProfile: async (displayName: string, photoURL?: string) => {
    try {
        if (auth.currentUser) {
            await updateProfile(auth.currentUser, {
                displayName: displayName,
                photoURL: photoURL
            });
            return { success: true };
        }
        return { success: false, error: "No user logged in" };
    } catch (error: any) {
        console.error("Update Profile Error:", error);
        return { success: false, error: error.message };
    }
  },

  // Sign out
  signOut: async () => {
    try {
      await firebaseSignOut(auth);
      return { success: true };
    } catch (error: any) {
      console.error("Sign-Out Error:", error);
      return { success: false, error: error.message };
    }
  },

  // Get current user
  getCurrentUser: () => {
    return auth.currentUser;
  },

  // Listen to auth state changes
  onAuthStateChange: (callback: (user: any) => void) => {
    return onAuthStateChanged(auth, callback);
  }
};

// ==================== Chat History Services ====================

export const chatService = {
  // Save chat session
  saveChatSession: async (userId: string, sessionData: any) => {
    try {
      const docRef = await addDoc(collection(db, 'chatSessions'), {
        userId,
        ...sessionData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return { success: true, id: docRef.id };
    } catch (error: any) {
      console.error("Save Chat Session Error:", error);
      return { success: false, error: error.message };
    }
  },

  // Get user's chat sessions
  getUserChatSessions: async (userId: string) => {
    try {
      const q = query(
        collection(db, 'chatSessions'),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc'),
        limit(50)
      );
      const querySnapshot = await getDocs(q);
      const sessions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return { success: true, sessions };
    } catch (error: any) {
      console.error("Get Chat Sessions Error:", error);
      return { success: false, error: error.message };
    }
  },

  // Get single chat session
  getChatSession: async (sessionId: string) => {
    try {
      const docRef = doc(db, 'chatSessions', sessionId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { success: true, session: { id: docSnap.id, ...docSnap.data() } };
      } else {
        return { success: false, error: "Session not found" };
      }
    } catch (error: any) {
      console.error("Get Chat Session Error:", error);
      return { success: false, error: error.message };
    }
  },

  // Update chat session
  updateChatSession: async (sessionId: string, updates: any) => {
    try {
      const sessionRef = doc(db, 'chatSessions', sessionId);
      await updateDoc(sessionRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      return { success: true };
    } catch (error: any) {
      console.error("Update Chat Session Error:", error);
      return { success: false, error: error.message };
    }
  },

  // Delete chat session
  deleteChatSession: async (sessionId: string) => {
    try {
      await deleteDoc(doc(db, 'chatSessions', sessionId));
      return { success: true };
    } catch (error: any) {
      console.error("Delete Chat Session Error:", error);
      return { success: false, error: error.message };
    }
  }
};

// ==================== User Profile Services ====================

export const userService = {
  // Create or update user profile
  saveUserProfile: async (userId: string, profileData: any) => {
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        ...profileData,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      return { success: true };
    } catch (error: any) {
      console.error("Save User Profile Error:", error);
      return { success: false, error: error.message };
    }
  },

  // Get user profile
  getUserProfile: async (userId: string) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        return { success: true, profile: userSnap.data() };
      } else {
        return { success: false, error: 'User profile not found' };
      }
    } catch (error: any) {
      console.error("Get User Profile Error:", error);
      return { success: false, error: error.message };
    }
  }
};

// ==================== Storage Services ====================

export const storageService = {
  // Upload file
  uploadFile: async (path: string, file: File) => {
    try {
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      return { success: true, url: downloadURL };
    } catch (error: any) {
      console.error("Upload File Error:", error);
      return { success: false, error: error.message };
    }
  },

  // Get file URL
  getFileURL: async (path: string) => {
    try {
      const storageRef = ref(storage, path);
      const url = await getDownloadURL(storageRef);
      return { success: true, url };
    } catch (error: any) {
      console.error("Get File URL Error:", error);
      return { success: false, error: error.message };
    }
  },

  // Delete file
  deleteFile: async (path: string) => {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
      return { success: true };
    } catch (error: any) {
      console.error("Delete File Error:", error);
      return { success: false, error: error.message };
    }
  }
};

// ==================== Generated Content Services ====================

export const contentService = {
  // Save generated image
  saveGeneratedImage: async (userId: string, imageData: any) => {
    try {
      const docRef = await addDoc(collection(db, 'generatedImages'), {
        userId,
        ...imageData,
        createdAt: new Date().toISOString()
      });
      return { success: true, id: docRef.id };
    } catch (error: any) {
      console.error("Save Generated Image Error:", error);
      return { success: false, error: error.message };
    }
  },

  // Save generated video
  saveGeneratedVideo: async (userId: string, videoData: any) => {
    try {
      const docRef = await addDoc(collection(db, 'generatedVideos'), {
        userId,
        ...videoData,
        createdAt: new Date().toISOString()
      });
      return { success: true, id: docRef.id };
    } catch (error: any) {
      console.error("Save Generated Video Error:", error);
      return { success: false, error: error.message };
    }
  },

  // Get user's generated content
  getUserGeneratedContent: async (userId: string, contentType: 'images' | 'videos') => {
    try {
      const collectionName = contentType === 'images' ? 'generatedImages' : 'generatedVideos';
      const q = query(
        collection(db, collectionName),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      const querySnapshot = await getDocs(q);
      const content = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return { success: true, content };
    } catch (error: any) {
      console.error("Get Generated Content Error:", error);
      return { success: false, error: error.message };
    }
  }
};
