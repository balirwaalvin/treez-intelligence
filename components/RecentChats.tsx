import React, { useState, useEffect } from "react";
import { MessageCircle, Trash2, Clock, RefreshCw } from "lucide-react";
import { chatService } from "../services/firebase";
import { useAuth } from "../contexts/AuthContext";

interface RecentChat {
  id: string;
  title: string;
  preview?: string;
  updatedAt: string;
  createdAt: string;
  messageCount?: number;
}

interface RecentChatsProps {
  activeSessionId: string | null;
  onSelectChat: (sessionId: string) => void;
  onDeleteChat: (sessionId: string) => void;
  isCollapsed: boolean;
  refreshTrigger?: number;
}

export const RecentChats: React.FC<RecentChatsProps> = ({
  activeSessionId,
  onSelectChat,
  onDeleteChat,
  isCollapsed,
  refreshTrigger,
}) => {
  const { user } = useAuth();
  const [chats, setChats] = useState<RecentChat[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadChats = async () => {
    if (!user) {
      setChats([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await chatService.getUserChatSessions(user.uid);
      
      if (result.success && result.sessions) {
        // Process and validate chat data
        const validChats = result.sessions
          .filter((chat: any) => chat.id && chat.title)
          .map((chat: any) => ({
            id: chat.id,
            title: chat.title || "Untitled Chat",
            preview: chat.preview || "",
            updatedAt: chat.updatedAt || chat.createdAt || new Date().toISOString(),
            createdAt: chat.createdAt || new Date().toISOString(),
            messageCount: Array.isArray(chat.messages) ? chat.messages.length : 0,
          }));

        setChats(validChats);
        console.log(`✅ Loaded ${validChats.length} recent chats`);
      } else {
        setError(result.error || "Failed to load chats");
        console.error("Failed to load chats:", result.error);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
      console.error("Error loading chats:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load chats when user changes or refresh is triggered
  useEffect(() => {
    loadChats();
  }, [user, refreshTrigger]);

  const handleDelete = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    
    if (!window.confirm("Delete this conversation? This cannot be undone.")) {
      return;
    }

    setDeletingId(chatId);

    try {
      const result = await chatService.deleteChatSession(chatId);
      
      if (result.success) {
        // Remove from local state immediately
        setChats((prev) => prev.filter((chat) => chat.id !== chatId));
        
        // Notify parent if this was the active chat
        if (activeSessionId === chatId) {
          onDeleteChat(chatId);
        }
        
        console.log(`✅ Deleted chat: ${chatId}`);
      } else {
        alert(`Failed to delete: ${result.error}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
      console.error("Delete error:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return date.toLocaleDateString(undefined, { 
        month: "short", 
        day: "numeric" 
      });
    } catch {
      return "Unknown";
    }
  };

  if (isCollapsed) {
    return null;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="mt-6 animate-fade-in">
      <div className="flex items-center justify-between px-3 mb-2">
        <p className="text-[10px] font-semibold text-gray-500/80 uppercase tracking-[0.15em]">
          Recent
        </p>
        <button
          onClick={loadChats}
          disabled={isLoading}
          className="p-1 text-gray-600 hover:text-gray-400 transition-colors disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw size={10} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="space-y-1 max-h-[400px] overflow-y-auto custom-scrollbar">
        {isLoading && chats.length === 0 ? (
          <div className="px-3 py-3 text-[13px] text-gray-600 flex items-center gap-2">
            <RefreshCw size={12} className="animate-spin" />
            Loading...
          </div>
        ) : error ? (
          <div className="px-3 py-2">
            <div className="text-[11px] text-red-400 mb-2">⚠️ {error}</div>
            <button
              onClick={loadChats}
              className="text-[11px] text-treez-accent hover:underline"
            >
              Try again
            </button>
          </div>
        ) : chats.length === 0 ? (
          <div className="px-3 py-3 text-[13px] text-gray-600 italic flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-gray-700" />
            No conversations yet
          </div>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.id}
              className={`w-full relative group/item rounded-xl transition-all flex items-center gap-1 pr-1
                ${activeSessionId === chat.id ? "bg-white/5 shadow-glow-sm" : "hover:bg-white/[0.04]"}
                ${deletingId === chat.id ? "opacity-50 pointer-events-none" : ""}`}
            >
              <button
                onClick={() => onSelectChat(chat.id)}
                className={`flex-1 text-left px-3 py-2.5 rounded-xl transition-all flex items-center gap-3 min-w-0
                  ${activeSessionId === chat.id ? "text-white" : "text-gray-400 group-hover/item:text-white"}`}
              >
                <MessageCircle
                  size={14}
                  className={`shrink-0 ${
                    activeSessionId === chat.id
                      ? "text-treez-accent"
                      : "text-gray-600 group-hover/item:text-gray-400"
                  }`}
                />
                <div className="flex-1 truncate min-w-0">
                  <div className="truncate font-medium text-[13px]">
                    {chat.title}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-600 mt-0.5">
                    <Clock size={9} />
                    <span>{formatDate(chat.updatedAt)}</span>
                    {chat.messageCount !== undefined && chat.messageCount > 0 && (
                      <>
                        <span>·</span>
                        <span>{chat.messageCount} msg{chat.messageCount !== 1 ? 's' : ''}</span>
                      </>
                    )}
                  </div>
                </div>
              </button>

              <button
                onClick={(e) => handleDelete(e, chat.id)}
                disabled={deletingId === chat.id}
                className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-white/10 rounded-lg opacity-0 group-hover/item:opacity-100 transition-all shrink-0 disabled:opacity-50"
                title="Delete Chat"
              >
                {deletingId === chat.id ? (
                  <RefreshCw size={13} className="animate-spin" />
                ) : (
                  <Trash2 size={13} />
                )}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
