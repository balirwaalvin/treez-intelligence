export enum MessageRole {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system'
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: Date;
  isStreaming?: boolean;
  images?: string[]; // base64
}

export enum AppMode {
  CHAT = 'chat',
  LIVE = 'live',
  VIDEO = 'video',
  PROFILE = 'profile',
  SETTINGS = 'settings'
}

export interface UserPreferences {
  userName: string;
}
