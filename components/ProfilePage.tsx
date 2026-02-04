import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { storageService } from '../services/firebase';
import { User, Camera, Save, Loader2, ArrowLeft, Mail, Shield } from 'lucide-react';

interface ProfilePageProps {
  onBack: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onBack }) => {
  const { user, updateProfile } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const result = await updateProfile(displayName);
      if (result.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully' });
      } else {
        setMessage({ type: 'error', text: result.error });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (e.g., 2MB)
    if (file.size > 2 * 1024 * 1024) {
        setMessage({ type: 'error', text: "Image size must be less than 2MB" });
        return;
    }

    setLoading(true);
    setMessage(null);

    try {
       // Path: profile-pictures/{uid}/{timestamp_filename}
       const path = `profile-pictures/${user.uid}/${Date.now()}_${file.name}`;
       const uploadResult = await storageService.uploadFile(path, file);
       
       if (uploadResult.success && uploadResult.url) {
           const updateResult = await updateProfile(displayName, uploadResult.url);
           if (updateResult.success) {
               setMessage({ type: 'success', text: 'Profile picture updated!' });
           } else {
               setMessage({ type: 'error', text: 'Failed to update profile with new image' });
           }
       } else {
           setMessage({ type: 'error', text: uploadResult.error || 'Upload failed' });
       }
    } catch (err: any) {
        setMessage({ type: 'error', text: err.message });
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#0a0a16] text-white p-4 md:p-8 animate-fade-in">
        <div className="max-w-2xl mx-auto space-y-8">
            
            {/* Header */}
            <div className="flex items-center gap-4">
                <button 
                  onClick={onBack}
                  className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                   <h1 className="text-3xl font-bold">Your Profile</h1>
                   <p className="text-gray-400">Manage your Treez Account settings</p>
                </div>
            </div>

            <div className="bg-[#13132b] rounded-2xl p-6 md:p-8 border border-white/5 space-y-8 shadow-xl">
                
                {/* Profile Picture */}
                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-treez-accent/30 shadow-lg bg-black">
                            {user.photoURL ? (
                                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-treez-900">
                                    <User size={48} className="text-treez-accent" />
                                </div>
                            )}
                        </div>
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer"
                        >
                            <Camera size={32} className="text-white" />
                        </button>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            className="hidden" 
                            accept="image/png, image/jpeg, image/webp" 
                        />
                    </div>
                    <p className="text-sm text-gray-400">Click to change avatar</p>
                </div>

                {/* Form */}
                <form onSubmit={handleUpdate} className="space-y-6">
                    {message && (
                        <div className={`p-4 rounded-xl border flex items-center gap-3 ${
                            message.type === 'success' 
                            ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                            : 'bg-red-500/10 border-red-500/20 text-red-400'
                        }`}>
                            <Shield size={20} />
                            <span>{message.text}</span>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Email Address</label>
                            <div className="flex items-center gap-3 px-4 py-3 bg-black/20 border border-white/5 rounded-xl text-gray-400 cursor-not-allowed">
                                <Mail size={18} />
                                <span>{user.email}</span>
                                <span className="ml-auto text-xs bg-white/10 px-2 py-0.5 rounded text-gray-500">Verified</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Display Name</label>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-treez-accent/50 focus:ring-1 focus:ring-treez-accent/50 transition-all font-medium"
                                placeholder="Your name"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2.5 bg-treez-accent hover:bg-treez-accent-light text-black font-semibold rounded-xl transition-all shadow-lg hover:shadow-treez-accent/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            <span>Save Changes</span>
                        </button>
                    </div>
                </form>

            </div>
        </div>
    </div>
  );
};
