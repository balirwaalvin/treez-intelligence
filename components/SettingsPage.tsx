import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext'; // Updated import path
import { User, LogOut, Moon, Sun, Monitor, Bell, Shield, Database, ChevronRight, Download, Trash2, Globe, Volume2, Zap, HelpCircle } from 'lucide-react';
import { usageService } from '../services/usageService'; // Updated import path

interface SettingsPageProps {
  onBack: () => void;
}

const SettingsSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="mb-6 animate-fade-in-up">
    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 px-2">{title}</h3>
    <div className="bg-[#0a0a16] border border-white/[0.06] rounded-2xl overflow-hidden divide-y divide-white/[0.04]">
      {children}
    </div>
  </div>
);

const SettingsItem = ({ 
  icon: Icon, 
  label, 
  desc, 
  action, 
  danger = false 
}: { 
  icon: any, 
  label: string, 
  desc?: string, 
  action?: React.ReactNode, 
  danger?: boolean 
}) => (
  <div className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors group">
    <div className="flex items-center gap-4">
      <div className={`p-2.5 rounded-xl ${danger ? 'bg-red-500/10 text-red-500' : 'bg-treez-indigo/10 text-treez-indigo'} group-hover:scale-105 transition-transform duration-300`}>
        <Icon size={18} />
      </div>
      <div>
        <div className={`font-medium text-sm ${danger ? 'text-red-400' : 'text-gray-200'}`}>{label}</div>
        {desc && <div className="text-[11px] text-gray-500 mt-0.5 max-w-[200px] leading-tight">{desc}</div>}
      </div>
    </div>
    <div className="flex items-center gap-3 shrink-0">
      {action}
    </div>
  </div>
);

const Toggle = ({ checked, onChange }: { checked: boolean, onChange: (v: boolean) => void }) => (
  <button 
    onClick={() => onChange(!checked)}
    className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none focus:ring-2 focus:ring-treez-indigo/50 ${checked ? 'bg-treez-indigo' : 'bg-gray-700'}`}
  >
    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
  </button>
);

export const SettingsPage: React.FC<SettingsPageProps> = ({ onBack }) => {
  const { user, signOut } = useAuth();
  const [streamResponses, setStreamResponses] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark');

  const handleSignOut = async () => {
    try {
      await signOut();
      onBack(); 
    } catch (error) {
      console.error("Failed to sign out", error);
    }
  };

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to clear all local chat history? This cannot be undone.")) {
       alert("History cleared locally.");
    }
  };

  // Render content starts here...
  return (
    <div className="flex flex-col h-full bg-[#050511] overflow-y-auto w-full custom-scrollbar">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#050511]/90 backdrop-blur-xl border-b border-white/[0.06] px-6 py-4 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <button 
              onClick={onBack}
              className="p-2 -ml-2 hover:bg-white/[0.06] rounded-lg text-gray-400 hover:text-white transition-colors"
              title="Go Back"
            >
              <ChevronRight className="rotate-180" size={20} />
            </button>
            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Settings</h2>
         </div>
      </div>

      <div className="max-w-3xl mx-auto w-full p-6 pb-24 space-y-6">
        
        {/* Profile Card */}
        <div className="mb-8 bg-gradient-to-br from-treez-indigo/10 to-treez-purple/10 border border-treez-indigo/20 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 animate-fade-in relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
            
            <div className="w-20 h-20 rounded-full border-2 border-white/10 p-1 bg-[#0a0a16] shrink-0">
                {user?.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-full h-full rounded-full object-cover" />
                ) : (
                    <div className="w-full h-full rounded-full bg-treez-indigo/20 flex items-center justify-center">
                        <User size={32} className="text-treez-indigo" />
                    </div>
                )}
            </div>
            
            <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold text-white mb-1">{user?.displayName || 'Guest User'}</h3>
                <p className="text-gray-400 text-sm mb-3">{user?.email || 'Sign in to sync your history'}</p>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-treez-indigo/20 border border-treez-indigo/30 text-xs font-medium text-treez-accent">
                    <Zap size={12} className="fill-current" />
                    {user ? 'Pro Plan Active' : 'Free Tier'}
                </div>
            </div>

            {!user && (
                <button 
                  onClick={() => {/* Trigger auth modal from app level? Need callback */}}
                  className="px-5 py-2.5 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-colors shadow-lg hover-lift"
                >
                    Sign In
                </button>
            )}
        </div>

        <SettingsSection title="General">
            <SettingsItem 
                icon={Monitor} 
                label="Theme" 
                desc="Detailed appearance settings coming soon"
                action={
                    <div className="flex bg-[#13132b] p-1 rounded-lg border border-white/[0.06]">
                        {(['dark', 'light', 'system'] as const).map((t) => (
                            <button
                                key={t}
                                onClick={() => setTheme(t)}
                                className={`p-1.5 rounded-md transition-all ${theme === t ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                                title={t.charAt(0).toUpperCase() + t.slice(1)}
                            >
                                {t === 'dark' && <Moon size={14} />}
                                {t === 'light' && <Sun size={14} />}
                                {t === 'system' && <Monitor size={14} />}
                            </button>
                        ))}
                    </div>
                }
            />
             <SettingsItem 
                icon={Volume2} 
                label="Stream Responses" 
                desc="Show text as it's being generated"
                action={<Toggle checked={streamResponses} onChange={setStreamResponses} />}
            />
            <SettingsItem 
                icon={Globe} 
                label="Language" 
                desc="English (US)"
                action={<span className="text-sm text-gray-500">Auto</span>}
            />
        </SettingsSection>

        <SettingsSection title="Notifications">
             <SettingsItem 
                icon={Bell} 
                label="Push Notifications" 
                desc="Get notified about new features"
                action={<Toggle checked={notifications} onChange={setNotifications} />}
            />
        </SettingsSection>

        <SettingsSection title="Data & Privacy">
             <SettingsItem 
                icon={Download} 
                label="Export Data" 
                desc="Download all your chat history"
                action={<button className="text-xs font-medium text-treez-indigo hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/[0.05]">Export JSON</button>}
            />
             <SettingsItem 
                icon={Trash2} 
                label="Clear History" 
                desc="Delete all local conversation data"
                danger
                action={<button onClick={handleClearHistory} className="text-xs font-medium text-red-400 hover:text-red-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-500/10">Clear</button>}
            />
        </SettingsSection>
        
        <SettingsSection title="About">
             <SettingsItem 
                icon={HelpCircle} 
                label="Help & Support" 
                action={<ChevronRight size={16} className="text-gray-600" />}
            />
             <SettingsItem 
                icon={Shield} 
                label="Privacy Policy" 
                action={<ChevronRight size={16} className="text-gray-600" />}
            />
             <div className="p-4 flex justify-between items-center text-xs text-gray-600">
                <span>Version 2.4.0 (Beta)</span>
                <span>© 2026 TREEZ Intelligence</span>
             </div>
        </SettingsSection>

        {user && (
            <div className="flex justify-center mt-8 animate-fade-in">
                <button 
                    onClick={handleSignOut}
                    className="flex items-center gap-2 px-6 py-3 text-red-400 hover:text-white hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/20"
                >
                    <LogOut size={18} />
                    <span>Sign Out</span>
                </button>
            </div>
        )}

      </div>
    </div>
  );
};
