// Authentication Component for Treez Intelligence
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, LogOut, User } from 'lucide-react';

export const AuthButton: React.FC = () => {
  const { user, signInWithGoogle, signOut } = useAuth();

  const handleSignIn = async () => {
    const result = await signInWithGoogle();
    if (result.success) {
      console.log('Successfully signed in!');
    } else {
      console.error('Sign in failed:', result.error);
    }
  };

  const handleSignOut = async () => {
    const result = await signOut();
    if (result.success) {
      console.log('Successfully signed out!');
    } else {
      console.error('Sign out failed:', result.error);
    }
  };

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'User'}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-treez-accent/20 flex items-center justify-center">
              <User size={16} className="text-treez-accent" />
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white">
              {user.displayName || 'User'}
            </span>
            <span className="text-xs text-gray-400">{user.email}</span>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors border border-red-500/20"
          title="Sign Out"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleSignIn}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-gray-100 text-gray-900 transition-colors font-medium shadow-lg"
      title="Sign In with Google"
    >
      <LogIn size={18} />
      <span className="text-sm">Sign In with Google</span>
    </button>
  );
};

// User Profile Display Component
export const UserProfile: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="p-4 rounded-lg bg-white/5 border border-white/10">
      <div className="flex items-center gap-3">
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || 'User'}
            className="w-12 h-12 rounded-full"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-treez-accent/20 flex items-center justify-center">
            <User size={24} className="text-treez-accent" />
          </div>
        )}
        <div className="flex flex-col">
          <h3 className="text-lg font-semibold text-white">
            {user.displayName || 'Treez User'}
          </h3>
          <p className="text-sm text-gray-400">{user.email}</p>
          <p className="text-xs text-gray-500 mt-1">User ID: {user.uid.substring(0, 8)}...</p>
        </div>
      </div>
    </div>
  );
};
