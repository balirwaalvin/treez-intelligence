import React, { useState } from 'react';
import { AppMode } from './types';
import { Logo } from './components/Logo';
import { ChatInterface } from './components/ChatInterface';
import { LiveInterface } from './components/LiveInterface';
import { VideoInterface } from './components/VideoInterface';
import { AuthModal } from './components/AuthModal';
import { ProfilePage } from './components/ProfilePage';
import { useAuth } from './contexts/AuthContext';
import { MessageSquare, Mic, Video, LayoutGrid, Settings, Menu, X, Sparkles, HelpCircle, PanelLeftClose, PanelLeft, Lock, UserCircle, User } from 'lucide-react';

const App: React.FC = () => {
  const [activeMode, setActiveMode] = useState<AppMode>(AppMode.CHAT);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  const { user } = useAuth(); // Assuming useAuth is imported

  const renderContent = () => {
    switch (activeMode) {
      case AppMode.CHAT:
        return <ChatInterface onOpenAuth={() => setIsAuthModalOpen(true)} />; // Pass prop
      case AppMode.LIVE:
        return <LiveInterface />;
      case AppMode.VIDEO:
        return <VideoInterface />;
      case AppMode.PROFILE:
        return <ProfilePage onBack={() => setActiveMode(AppMode.CHAT)} />;
      default:
        return <ChatInterface onOpenAuth={() => setIsAuthModalOpen(true)} />;
    }
  };
  
  const handleModeSwitch = (mode: AppMode) => {
      // Feature Gating
      if ((mode === AppMode.LIVE || mode === AppMode.VIDEO) && !user) {
          setIsAuthModalOpen(true);
          return;
      }
      setActiveMode(mode);
      setIsSidebarOpen(false);
  };

  const NavItem = ({ mode, icon: Icon, label }: { mode: AppMode; icon: any; label: string }) => {
     // Check lock status
     const isLocked = (mode === AppMode.LIVE || mode === AppMode.VIDEO) && !user;
     
     return (
        <button
          onClick={() => handleModeSwitch(mode)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${
            activeMode === mode 
              ? 'bg-treez-800/50 text-white border border-white/5 shadow-inner' 
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          } ${isCollapsed ? 'justify-center' : ''}`}
          title={isCollapsed ? label : undefined}
        >
          <Icon size={18} className={`transition-colors shrink-0 ${activeMode === mode ? 'text-treez-accent' : 'group-hover:text-gray-200'} ${isLocked ? 'opacity-50' : ''}`} />
          <span className={`font-medium text-sm whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
            {label}
          </span>
          {isLocked && !isCollapsed && (
              <div className="absolute right-2 text-gray-600">
                  <Lock size={12} />
              </div>
          )}
        </button>
    );
  };

  return (
    <div className="flex h-screen bg-[#050511] text-white font-sans overflow-hidden">
      
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-16 glass-panel flex items-center justify-between px-4 border-b border-white/10">
         <Logo size={28} />
         <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? <X /> : <Menu />}
         </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed md:relative z-40 h-full bg-[#050511] border-r border-white/5 flex flex-col transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1)
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${isCollapsed ? 'md:w-20' : 'md:w-64'}
        w-64
      `}>
        {/* Sidebar Header */}
        <div className={`h-16 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-5'} transition-all duration-300`}>
            {!isCollapsed && (
              <div className="scale-90 origin-left animate-fade-in">
                  <Logo />
              </div>
            )}
            
            {/* Desktop Toggle */}
            <button 
                onClick={() => setIsCollapsed(!isCollapsed)} 
                className="hidden md:flex text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
                title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
                {isCollapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
            </button>

            {/* Mobile Close */}
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400"><X size={20} /></button>
        </div>

        <div className="px-3 py-2 flex-1 overflow-y-auto overflow-x-hidden">
          <button 
             onClick={() => setActiveMode(AppMode.CHAT)}
             className={`w-full flex items-center bg-[#13132b] hover:bg-[#1f1f3a] border border-white/10 rounded-xl text-sm font-medium transition-all mb-6 group ${isCollapsed ? 'justify-center p-3 h-10 w-10 mx-auto' : 'justify-between px-4 py-3'}`}
             title="New Chat"
          >
             <div className="flex items-center gap-2 text-gray-200">
                <Sparkles size={isCollapsed ? 18 : 16} className="text-treez-accent" />
                <span className={`transition-all duration-200 ${isCollapsed ? 'hidden' : 'block'}`}>New Chat</span>
             </div>
             {!isCollapsed && <div className="bg-white/10 rounded p-0.5 text-xs text-gray-500 group-hover:text-white transition-colors">+</div>}
          </button>
          
          <div className="space-y-1">
            {!isCollapsed && <p className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 mt-4 animate-fade-in">Platform</p>}
            <NavItem mode={AppMode.CHAT} icon={MessageSquare} label="Treez Chat" />
            <NavItem mode={AppMode.LIVE} icon={Mic} label="Treez Live" />
            <NavItem mode={AppMode.VIDEO} icon={Video} label="Treez Motion" />
          </div>

          {!isCollapsed && (
            <div className="mt-8 space-y-1 animate-fade-in">
                <p className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">History</p>
                <div className="px-4 py-2 text-sm text-gray-500 italic">No history yet</div>
            </div>
          )}
        </div>

        <div className="mt-auto p-4 border-t border-white/5 space-y-2">
            {!user ? (
                 <button 
                    onClick={() => setIsAuthModalOpen(true)}
                    className={`flex items-center gap-3 px-3 py-2 text-sm text-white bg-treez-accent/10 hover:bg-treez-accent/20 border border-treez-accent/20 transition-colors w-full rounded-lg ${isCollapsed ? 'justify-center' : ''}`}
                 >
                    <UserCircle size={18} className="text-treez-accent" />
                    {!isCollapsed && <span>Sign In</span>}
                 </button>
            ) : (
                <button 
                    onClick={() => setActiveMode(AppMode.PROFILE)}
                    className={`flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors w-full rounded-lg ${isCollapsed ? 'justify-center' : ''} ${activeMode === AppMode.PROFILE ? 'bg-white/10 text-white' : ''}`}
                 >
                    {user.photoURL ? (
                        <img src={user.photoURL} alt="User" className="w-5 h-5 rounded-full object-cover" />
                    ) : (
                        <UserCircle size={18} />
                    )}
                    {!isCollapsed && <span className="truncate max-w-[120px]">{user.displayName || 'My Account'}</span>}
                 </button>
            )}

            <button 
                className={`flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors w-full rounded-lg hover:bg-white/5 ${isCollapsed ? 'justify-center' : ''}`}
                title="Settings"
            >
                <Settings size={18} />
                {!isCollapsed && <span>Settings</span>}
            </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col relative h-full">
         
         {/* Top Header - Floating above content */}
         <header className="absolute top-0 left-0 right-0 z-50 h-16 flex items-center justify-end px-6 pointer-events-none">
             <div className="pointer-events-auto flex items-center gap-4">
                 <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-treez-secondary/20 to-purple-500/20 border border-white/10 hover:border-treez-accent/50 rounded-lg text-xs font-semibold text-treez-accent hover:text-white transition-all">
                    <Sparkles size={14} />
                    <span>Upgrade to Pro</span>
                 </button>
                 
                 {/* User Profile / Auth Toggle */}
                 {!user ? (
                    <button 
                        onClick={() => setIsAuthModalOpen(true)} 
                        className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors shadow-lg"
                    >
                        Sign In
                    </button>
                 ) : (
                    <button onClick={() => setActiveMode(AppMode.PROFILE)} className="relative group">
                         <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 hover:border-treez-accent transition-colors">
                              {user.photoURL ? (
                                  <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                              ) : (
                                  <div className="w-full h-full bg-treez-800 flex items-center justify-center">
                                      <User size={16} className="text-gray-400" />
                                  </div>
                              )}
                         </div>
                    </button>
                 )}
             </div>
         </header>

         {/* Content Area */}
         <main className="flex-1 h-full relative pt-16 md:pt-0">
            {renderContent()}
         </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default App;