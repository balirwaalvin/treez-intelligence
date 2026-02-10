// Auth Context Provider for Treez Intelligence
import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, userService } from '../services/firebase';

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  plan: 'standard' | 'pro';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<any>;
  signInWithEmail: (email: string, password: string) => Promise<any>;
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<any>;
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
        // Fetch existing profile to get plan
        const profileResult = await userService.getUserProfile(firebaseUser.uid);
        let userPlan: 'standard' | 'pro' = 'standard';

        if (profileResult.success && profileResult.profile?.plan) {
            userPlan = profileResult.profile.plan;
        }

        const userData: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          plan: userPlan
        };
        setUser(userData);
        
        // Sync user to Firestore (merge) with plan
        await userService.saveUserProfile(firebaseUser.uid, { 
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            plan: userPlan 
        });
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

  const signUpWithEmail = async (email: string, password: string, displayName?: string) => {
    const result = await authService.signUpWithEmail(email, password);
    if (result.success && displayName && result.user) {
        // Update display name immediately
        await authService.updateUserProfile(displayName);
        // Note: setUser will be handled by onAuthStateChange, but we can't easily push 'plan' there 
        // without the refetch. Ideally onAuthStateChange handles it.
        // Sync to Firestore with default standard plan
        await userService.saveUserProfile(result.user.uid, { displayName, email, plan: 'standard' });
    }
    return result;
  };

  const updateProfile = async (displayName: string, photoURL?: string) => {
    const result = await authService.updateUserProfile(displayName, photoURL);
    if (result.success && user) {
        // Update local state
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
