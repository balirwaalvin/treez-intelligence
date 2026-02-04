// Auth Context Provider for Treez Intelligence
import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, userService } from '../services/firebase';

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<any>;
  signInWithEmail: (email: string, password: string) => Promise<any>;
  signUpWithEmail: (email: string, password: string) => Promise<any>;
  updateProfile: (displayName: string, photoURL?: string) => Promise<any>;
  signOut: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  updateProfile: async () => {},
  signOut: async () => {}
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = authService.onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL
        };
        setUser(userData);
        
        // Sync user to Firestore
        await userService.saveUserProfile(firebaseUser.uid, userData);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    return await authService.signInWithGoogle();
  };

  const signInWithEmail = async (email: string, password: string) => {
    return await authService.signInWithEmail(email, password);
  };

  const signUpWithEmail = async (email: string, password: string) => {
    return await authService.signUpWithEmail(email, password);
  };

  const updateProfile = async (displayName: string, photoURL?: string) => {
    const result = await authService.updateUserProfile(displayName, photoURL);
    if (result.success && user) {
        setUser(prev => prev ? ({ ...prev, displayName, photoURL: photoURL || prev.photoURL }) : null);
        // Sync update to Firestore
        if (user.uid) {
             await userService.saveUserProfile(user.uid, { displayName, photoURL });
        }
    }
    return result;
  };

  const signOut = async () => {
    const result = await authService.signOut();
    if (result.success) {
      setUser(null);
    }
    return result;
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    updateProfile,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
