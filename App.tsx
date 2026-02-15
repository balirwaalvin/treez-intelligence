import React, { useState, useEffect } from "react";
import { AppMode } from "./types";
import { Logo, LogoMark } from "./components/Logo";
import { ChatInterface } from "./components/ChatInterface";
import { LiveInterface } from "./components/LiveInterface";
import { VideoInterface } from "./components/VideoInterface";
import { AuthModal } from "./components/AuthModal";
import { ProfilePage } from "./components/ProfilePage";
import { SettingsPage } from "./components/SettingsPage";
import { SubscriptionModal } from "./components/SubscriptionModal";
import { useAuth } from "./contexts/AuthContext";
import { chatService } from "./services/firebase";
import {
  MessageSquare,
  Mic,
  Video,
  Settings,
  Menu,
  X,
  Sparkles,
  PanelLeftClose,
  PanelLeft,
  Lock,
  UserCircle,
  User,
  Zap,
  ChevronRight,
  MessageCircle,
  Trash2,
} from "lucide-react";

const App: React.FC = () => {
  const [activeMode, setActiveMode] = useState<AppMode>(AppMode.CHAT);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [chatSessionId, setChatSessionId] = useState(Date.now()); // Used as refresh trigger
  const [recentChats, setRecentChats] = useState<any[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const { user } = useAuth();

  // Load recent chats
  const loadRecentChats = async () => {
    if (user) {
      const result = await chatService.getUserChatSessions(user.uid);
      if (result.success && result.sessions) {
        setRecentChats(result.sessions);
      }
    } else {
      setRecentChats([]);
    }
  };

  useEffect(() => {
    loadRecentChats();
  }, [user, chatSessionId]);

  const handleSessionChange = (sessionId: string) => {
    // Refresh list to show new title/preview
    loadRecentChats();
    // Optionally set active if it originated from within ChatInterface (e.g. first save)
    if (activeSessionId !== sessionId) {
      setActiveSessionId(sessionId);
    }
  };

  const handleDeleteChat = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    if (!sessionId) return;

    if (confirm("Delete this chat?")) {
      const result = await chatService.deleteChatSession(sessionId);
      if (result.success) {
        // If active, clear it
        if (activeSessionId === sessionId) {
          setActiveSessionId(null);
          setChatSessionId(Date.now()); // Reset chat interface
        }
        loadRecentChats(); // Refresh list
      }
    }
  };

  const renderContent = () => {
    switch (activeMode) {
      case AppMode.CHAT:
        return (
          <ChatInterface
            key={activeSessionId || `new-${chatSessionId}`}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            initialSessionId={activeSessionId}
            onSessionChange={handleSessionChange}
          />
        );
      case AppMode.LIVE:
        return <LiveInterface />;
      case AppMode.VIDEO:
        return <VideoInterface />;
      case AppMode.PROFILE:
        return <ProfilePage onBack={() => setActiveMode(AppMode.CHAT)} />;
      case AppMode.SETTINGS:
        return <SettingsPage onBack={() => setActiveMode(AppMode.CHAT)} />;
      default:
        return (
          <ChatInterface
            key={activeSessionId || `new-${chatSessionId}`}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            initialSessionId={activeSessionId}
            onSessionChange={handleSessionChange}
          />
        );
    }
  };

  const handleModeSwitch = (mode: AppMode) => {
    if (mode === AppMode.LIVE && !user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (mode === AppMode.VIDEO) {
      if (!user) {
        setIsAuthModalOpen(true);
        return;
      }
      if (user.plan !== "pro" && user.plan !== "pro_plus") {
        setIsSubscriptionModalOpen(true);
        return;
      }
    }

    setActiveMode(mode);
    setIsSidebarOpen(false);
  };

  const handleNewChat = () => {
    setActiveMode(AppMode.CHAT);
    setActiveSessionId(null); // Reset session
    setChatSessionId(Date.now()); // Force refresh/reset
    setIsSidebarOpen(false);
  };

  // ... (NavItem component remains same, verify indentation/placement)
  const NavItem = ({
    mode,
    icon: Icon,
    label,
    desc,
  }: {
    mode: AppMode;
    icon: any;
    label: string;
    desc?: string;
  }) => {
    // Determine if the item is locked
    let isLocked = false;

    if (mode === AppMode.LIVE && !user) {
      isLocked = true;
    } else if (mode === AppMode.VIDEO) {
      if (!user || (user.plan !== "pro" && user.plan !== "pro_plus")) {
        isLocked = true;
      }
    }

    const isActive = activeMode === mode;

    return (
      <button
        onClick={() => handleModeSwitch(mode)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative
            ${
              isActive
                ? "bg-treez-indigo/10 text-white border border-treez-indigo/20 shadow-glow-sm"
                : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
            } ${isCollapsed ? "justify-center" : ""}`}
        title={isCollapsed ? label : undefined}
      >
        {/* Active indicator bar */}
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[60%] rounded-r-full bg-gradient-to-b from-treez-accent to-treez-indigo shadow-glow-cyan" />
        )}

        <div
          className={`p-1.5 rounded-lg transition-all ${isActive ? "bg-treez-indigo/20" : "bg-transparent group-hover:bg-white/5"}`}
        >
          <Icon
            size={16}
            className={`transition-colors shrink-0 
              ${isActive ? "text-treez-accent" : "group-hover:text-gray-200"} 
              ${isLocked ? "opacity-50" : ""}`}
          />
        </div>

        {!isCollapsed && (
          <div className="flex-1 text-left overflow-hidden">
            <span className="font-medium text-sm whitespace-nowrap block">
              {label}
            </span>
            {desc && (
              <span className="text-[10px] text-gray-500 block whitespace-nowrap">
                {desc}
              </span>
            )}
          </div>
        )}

        {isLocked && !isCollapsed && (
          <div className="text-gray-600">
            <Lock size={12} />
          </div>
        )}

        {isActive && !isCollapsed && (
          <ChevronRight size={14} className="text-treez-accent/50" />
        )}
      </button>
    );
  };

  return (
    <div className="flex h-screen bg-[#050511] text-white font-sans overflow-hidden noise-overlay">
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
      />

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 glass-panel flex items-center justify-between px-4">
        <Logo size={28} />
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* ========== SIDEBAR ========== */}
      <aside
        className={`
        fixed md:relative z-40 h-full flex flex-col transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        ${isCollapsed ? "md:w-[72px]" : "md:w-[260px]"}
        w-[260px]
      `}
      >
        {/* Sidebar background with subtle gradient */}
        <div className="absolute inset-0 bg-[#050511] border-r border-white/[0.04]" />
        <div className="absolute inset-0 bg-gradient-to-b from-treez-indigo/[0.02] to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full">
          {/* Sidebar Header */}
          <div
            className={`h-16 flex items-center shrink-0 ${isCollapsed ? "justify-center px-2" : "justify-between px-4"} transition-all duration-300`}
          >
            {isCollapsed ? (
              <LogoMark size={32} />
            ) : (
              <div className="animate-fade-in">
                <Logo size={34} />
              </div>
            )}

            {/* Desktop Toggle */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex text-gray-500 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-all"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? (
                <PanelLeft size={18} />
              ) : (
                <PanelLeftClose size={18} />
              )}
            </button>

            {/* Mobile Close */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden text-gray-400 hover:text-white transition-colors p-1.5"
            >
              <X size={18} />
            </button>
          </div>

          {/* New Chat Button */}
          <div className={`px-3 pb-2 ${isCollapsed ? "px-2" : "px-3"}`}>
            <button
              onClick={handleNewChat}
              className={`w-full flex items-center bg-gradient-to-r from-treez-indigo/10 to-treez-purple/10 hover:from-treez-indigo/20 hover:to-treez-purple/20 border border-treez-indigo/20 hover:border-treez-indigo/30 rounded-xl text-sm font-medium transition-all group treez-btn
                 ${isCollapsed ? "justify-center p-3" : "justify-between px-4 py-3"}`}
              title="New Chat"
            >
              <div className="flex items-center gap-2.5 text-gray-200">
                <Sparkles
                  size={isCollapsed ? 18 : 15}
                  className="text-treez-accent"
                />
                {!isCollapsed && <span className="font-medium">New Chat</span>}
              </div>
              {!isCollapsed && (
                <div className="bg-white/5 rounded-md px-1.5 py-0.5 text-[10px] text-gray-500 font-mono group-hover:text-treez-accent transition-colors">
                  ⌘N
                </div>
              )}
            </button>
          </div>

          {/* Navigation */}
          <div
            className={`flex-1 overflow-y-auto overflow-x-hidden ${isCollapsed ? "px-2" : "px-3"} py-2`}
          >
            {!isCollapsed && (
              <p className="px-3 text-[10px] font-semibold text-gray-500/80 uppercase tracking-[0.15em] mb-2 mt-2 animate-fade-in">
                Platform
              </p>
            )}
            <div className="space-y-1">
              <NavItem
                mode={AppMode.CHAT}
                icon={MessageSquare}
                label="TREEZ Chat"
                desc="AI Assistant"
              />
              <NavItem
                mode={AppMode.LIVE}
                icon={Mic}
                label="TREEZ Live"
                desc="Voice Interface"
              />
              <NavItem
                mode={AppMode.VIDEO}
                icon={Video}
                label="TREEZ Motion"
                desc="Video Generation"
              />
            </div>

            {!isCollapsed && user && (
              <div className="mt-6 animate-fade-in group">
                <div className="flex items-center justify-between px-3 mb-2">
                  <p className="text-[10px] font-semibold text-gray-500/80 uppercase tracking-[0.15em]">
                    Recent
                  </p>
                </div>

                <div className="space-y-1">
                  {recentChats.length === 0 ? (
                    <div className="px-3 py-3 text-[13px] text-gray-600 italic flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-gray-700" />
                      No conversations yet
                    </div>
                  ) : (
                    recentChats.map((chat) => (
                      <button
                        key={chat.id}
                        onClick={() => {
                          setActiveMode(AppMode.CHAT);
                          setActiveSessionId(chat.id);
                          setIsSidebarOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all flex items-center gap-3 group/item
                                ${activeSessionId === chat.id ? "bg-white/5 text-white shadow-glow-sm" : "text-gray-400 hover:text-white hover:bg-white/[0.04]"}`}
                      >
                        <MessageCircle
                          size={14}
                          className={`shrink-0 ${activeSessionId === chat.id ? "text-treez-accent" : "text-gray-600 group-hover/item:text-gray-400"}`}
                        />
                        <div className="flex-1 truncate">
                          <div className="truncate font-medium">
                            {chat.title || "Untitled Chat"}
                          </div>
                          <div className="text-[10px] text-gray-600 truncate">
                            {new Date(chat.updatedAt).toLocaleDateString()}
                          </div>
                        </div>

                        <button
                          onClick={(e) => handleDeleteChat(e, chat.id)}
                          className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-white/10 rounded-lg opacity-0 group-hover/item:opacity-100 transition-all"
                          title="Delete Chat"
                        >
                          <Trash2 size={13} />
                        </button>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Footer (User Info) */}
          <div className="mt-auto p-3 border-t border-white/[0.04] space-y-1.5 ">
            <div
              className={`text-center mb-2 ${isCollapsed ? "hidden" : "block"}`}
            >
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-600">
                TREEZ Intelligence
              </span>
            </div>
            {!user ? (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-treez-indigo/15 to-treez-purple/15 hover:from-treez-indigo/25 hover:to-treez-purple/25 border border-treez-indigo/20 transition-all w-full rounded-xl treez-btn ${isCollapsed ? "justify-center" : ""}`}
              >
                <UserCircle size={18} className="text-treez-accent shrink-0" />
                {!isCollapsed && <span>Sign In</span>}
              </button>
            ) : (
              <button
                onClick={() => setActiveMode(AppMode.PROFILE)}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/[0.04] transition-all w-full rounded-xl ${isCollapsed ? "justify-center" : ""} ${activeMode === AppMode.PROFILE ? "bg-white/5 text-white" : ""}`}
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="User"
                    className="w-6 h-6 rounded-full object-cover ring-2 ring-treez-indigo/30 shrink-0"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-treez-indigo to-treez-purple flex items-center justify-center shrink-0">
                    <User size={12} className="text-white" />
                  </div>
                )}
                {!isCollapsed && (
                  <span className="truncate max-w-[130px] font-medium">
                    {user.displayName || "My Account"}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={() => setActiveMode(AppMode.SETTINGS)}
              className={`flex items-center gap-3 px-3 py-2 text-sm text-gray-500 hover:text-gray-300 transition-all w-full rounded-xl hover:bg-white/[0.03] ${isCollapsed ? "justify-center" : ""} ${activeMode === AppMode.SETTINGS ? "bg-white/5 text-white" : ""}`}
              title="Settings"
            >
              <Settings size={16} className="shrink-0" />
              {!isCollapsed && <span>Settings</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* ========== MAIN CONTENT ========== */}
      <div className="flex-1 flex flex-col relative h-full">
        {/* Top Header Bar */}
        <header className="absolute top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-5 pointer-events-none">
          {/* Left: Current mode indicator */}
          <div className="pointer-events-auto flex items-center gap-2">
            {/* Subtle breadcrumb - only on desktop */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
              <div className="w-1.5 h-1.5 rounded-full bg-treez-accent animate-pulse" />
              <span className="text-xs text-gray-400 font-medium tracking-wide">
                {activeMode === AppMode.CHAT && "TREEZ Chat"}
                {activeMode === AppMode.LIVE && "TREEZ Live"}
                {activeMode === AppMode.VIDEO && "TREEZ Motion"}
                {activeMode === AppMode.PROFILE && "Profile"}
                {activeMode === AppMode.SETTINGS && "Settings"}
              </span>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="pointer-events-auto flex items-center gap-3">
            <button
              onClick={() => setIsSubscriptionModalOpen(true)}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-treez-indigo/10 to-treez-purple/10 border border-treez-indigo/20 hover:border-treez-indigo/40 rounded-xl text-xs font-semibold text-white transition-all group overflow-hidden relative treez-btn"
            >
              <Zap size={13} className="text-treez-accent" />
              <span className="relative z-10">Upgrade Pro</span>
            </button>

            {/* User Profile / Auth Toggle */}
            {!user ? (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-gradient-to-r from-treez-indigo to-treez-purple text-white px-5 py-2 rounded-xl text-sm font-semibold hover:shadow-glow-md transition-all"
              >
                Sign In
              </button>
            ) : (
              <button
                onClick={() => setActiveMode(AppMode.PROFILE)}
                className="relative group"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white/10 hover:border-treez-indigo/50 transition-all ring-2 ring-transparent hover:ring-treez-indigo/20">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-treez-indigo to-treez-purple flex items-center justify-center">
                      <User size={14} className="text-white" />
                    </div>
                  )}
                </div>
              </button>
            )}
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 h-full relative pt-14 md:pt-0">
          {renderContent()}
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
