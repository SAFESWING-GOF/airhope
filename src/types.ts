export type UserStatus = 'online' | 'idle' | 'dnd' | 'offline';

export interface User {
  id: string;
  username: string;
  avatar: string; // URL or background color code
  status: UserStatus;
  customStatus?: string;
  isBot?: boolean;
  activity?: {
    name: string;
    type: 'playing' | 'streaming' | 'listening' | 'competing';
    details?: string;
  };
}

export interface Channel {
  id: string;
  name: string;
  type: 'text' | 'voice';
  description?: string;
}

export interface Server {
  id: string;
  name: string;
  icon: string; // initials or emoji/abbreviation
  iconBg: string; // Tailwind background class
  banner: string; // URL or Tailwind gradient class
  channels: Channel[];
  ownerId: string;
}

export interface Reaction {
  emoji: string;
  count: number;
  users: string[]; // User IDs who reacted
}

export interface Message {
  id: string;
  channelId: string; // Server channel ID or DM ID
  sender: User;
  content: string;
  timestamp: string;
  attachments?: string[];
  reactions?: Reaction[];
  isPinned?: boolean;
}

export interface DM {
  id: string;
  participant: User;
  unreadCount: number;
}

export interface Friend {
  id: string;
  user: User;
  relation: 'friend' | 'pending_incoming' | 'pending_outgoing' | 'blocked';
}

export interface VoiceState {
  serverId: string | null;
  channelId: string | null;
  isMuted: boolean;
  isDeafened: boolean;
  connectedUsers: User[];
  activeSpeakers: string[]; // User IDs
}

export interface AppState {
  currentUser: User;
  servers: Server[];
  activeServerId: 'home' | string;
  activeChannelId: string; // can be channel ID or DM ID
  messages: Record<string, Message[]>; // channelId -> Message[]
  dms: DM[];
  friends: Friend[];
  voiceState: VoiceState;
}
