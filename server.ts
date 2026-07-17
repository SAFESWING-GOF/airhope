import express from 'express';
import path from 'path';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

// --- Types ---
export type UserStatus = 'online' | 'idle' | 'dnd' | 'offline';

export interface User {
  id: string;
  username: string;
  avatar: string;
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
  icon: string;
  iconBg: string;
  banner: string;
  channels: Channel[];
  ownerId: string;
}

export interface Message {
  id: string;
  channelId: string;
  sender: User;
  content: string;
  timestamp: string;
  attachments?: string[];
  reactions?: any[];
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

// --- DB Persistence ---
const DB_PATH = path.join(process.cwd(), 'db.json');

interface DatabaseSchema {
  users: Record<string, User>;
  servers: Server[];
  messages: Record<string, Message[]>;
  friends: Record<string, Friend[]>; // userId -> Friend[]
  dms: Record<string, DM[]>; // userId -> DM[]
  streams: Record<string, { userId: string; streamType: 'camera' | 'screen' }>; // channelId -> Streamer details
}

// Seed Initial Data (Mirrors client mock data)
const INITIAL_USERS: Record<string, User> = {
  me: {
    id: 'u_me',
    username: 'Guest_User',
    avatar: 'bg-emerald-500',
    status: 'online',
    customStatus: 'Exploring Airhope!',
  },
  hope_bot: {
    id: 'u_hope_bot',
    username: 'Hope AI',
    avatar: 'bg-indigo-600',
    status: 'online',
    customStatus: 'Here to help! Ask me anything.',
    isBot: true,
    activity: {
      name: 'System Diagnostics',
      type: 'playing',
      details: 'Optimizing Airhope server'
    }
  },
  zenith_gamer: {
    id: 'u_zenith_gamer',
    username: 'Zenith_Gamer',
    avatar: 'bg-rose-500',
    status: 'online',
    customStatus: 'Climbing the ranks 🎮',
    activity: {
      name: 'Valorant',
      type: 'playing',
      details: 'Ranked Match - 14/12/5'
    }
  },
  astro_coder: {
    id: 'u_astro_coder',
    username: 'AstroCoder',
    avatar: 'bg-cyan-500',
    status: 'dnd',
    customStatus: 'Code is poetry 💻',
    activity: {
      name: 'VS Code',
      type: 'playing',
      details: 'Refactoring Typescript components'
    }
  },
  chill_vibes: {
    id: 'u_chill_vibes',
    username: 'Chill_Vibes',
    avatar: 'bg-amber-500',
    status: 'idle',
    customStatus: 'Relaxing with lofi',
    activity: {
      name: 'Spotify',
      type: 'listening',
      details: 'Lofi hip hop radio - beats to study/relax to'
    }
  },
  pixel_queen: {
    id: 'u_pixel_queen',
    username: 'PixelQueen',
    avatar: 'bg-purple-500',
    status: 'online',
    customStatus: 'Drawing cute sprites ✨',
    activity: {
      name: 'Aseprite',
      type: 'playing',
      details: 'Drawing character sprites'
    }
  },
  matrix_neo: {
    id: 'u_matrix_neo',
    username: 'Neo_The_One',
    avatar: 'bg-neutral-800',
    status: 'offline',
  }
};

const INITIAL_SERVERS: Server[] = [
  {
    id: 's_airhope',
    name: 'Airhope Official',
    icon: 'AH',
    iconBg: 'bg-indigo-600',
    banner: 'bg-gradient-to-r from-indigo-600 to-sky-500',
    ownerId: 'u_hope_bot',
    channels: [
      { id: 'c_welcome', name: 'welcome-rules', type: 'text', description: 'Rules and general info for Airhope!' },
      { id: 'c_general', name: 'general-chat', type: 'text', description: 'The main place to hang out and talk.' },
      { id: 'c_tech', name: 'tech-talk', type: 'text', description: 'Let\'s talk programming, hardware, and tech!' },
      { id: 'c_memes', name: 'memes', type: 'text', description: 'Post your funniest memes here.' },
      { id: 'c_lounge_v', name: 'Lounge 🔊', type: 'voice' },
      { id: 'c_gaming_v', name: 'Gaming Zone 🔊', type: 'voice' },
      { id: 'c_music_v', name: 'Music Jam 🔊', type: 'voice' },
    ]
  },
  {
    id: 's_gamers',
    name: 'Gamers Guild',
    icon: 'GG',
    iconBg: 'bg-rose-600',
    banner: 'bg-gradient-to-r from-rose-500 to-orange-500',
    ownerId: 'u_zenith_gamer',
    channels: [
      { id: 'c_game_news', name: 'gaming-news', type: 'text', description: 'Latest news, patch updates, and esports.' },
      { id: 'c_party_up', name: 'lfg-party', type: 'text', description: 'Find teammates and players for active lobby calls.' },
      { id: 'c_clips', name: 'epic-clips', type: 'text', description: 'Share your highlights and game screenshots.' },
      { id: 'c_squad1_v', name: 'Squad Call 1 🔊', type: 'voice' },
      { id: 'c_squad2_v', name: 'Squad Call 2 🔊', type: 'voice' },
    ]
  }
];

const INITIAL_FRIENDS: Friend[] = [
  { id: 'f1', user: INITIAL_USERS.hope_bot, relation: 'friend' },
  { id: 'f2', user: INITIAL_USERS.zenith_gamer, relation: 'friend' },
  { id: 'f3', user: INITIAL_USERS.astro_coder, relation: 'friend' },
  { id: 'f4', user: INITIAL_USERS.chill_vibes, relation: 'friend' },
  { id: 'f5', user: INITIAL_USERS.pixel_queen, relation: 'friend' }
];

const INITIAL_MESSAGES: Record<string, Message[]> = {
  c_welcome: [
    {
      id: 'w1',
      channelId: 'c_welcome',
      sender: INITIAL_USERS.hope_bot,
      content: 'Welcome to **Airhope**! 🚀 This is a real-time full-stack collaboration platform styled precisely like Discord. Share **AirHope.net** with friends, join voice channels, and live-stream your screen or camera!',
      timestamp: 'Today at 9:00 AM'
    }
  ],
  c_general: [
    {
      id: 'g1',
      channelId: 'c_general',
      sender: INITIAL_USERS.chill_vibes,
      content: 'Hey everyone, welcome to the full-stack version of Airhope! Share **AirHope.net** to invite other users to chat in real-time!',
      timestamp: 'Today at 10:15 AM'
    }
  ]
};

// Database helper functions
function loadDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading db.json, resetting database:', err);
  }

  // Set default initial DB structure
  const db: DatabaseSchema = {
    users: INITIAL_USERS,
    servers: INITIAL_SERVERS,
    messages: INITIAL_MESSAGES,
    friends: { 'u_me': INITIAL_FRIENDS },
    dms: {},
    streams: {}
  };
  saveDatabase(db);
  return db;
}

function saveDatabase(db: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing to db.json:', err);
  }
}

// Load DB into memory
let database = loadDatabase();

// --- Express Server ---
async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const PORT = 3000;

  app.use(express.json());

  // API Route: Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', activeUsers: Object.keys(clients).length });
  });

  // API Route: Reset Database (For development)
  app.post('/api/reset', (req, res) => {
    database = {
      users: INITIAL_USERS,
      servers: INITIAL_SERVERS,
      messages: INITIAL_MESSAGES,
      friends: { 'u_me': INITIAL_FRIENDS },
      dms: {},
      streams: {}
    };
    saveDatabase(database);
    res.json({ status: 'Database reset successful' });
  });

  // --- WebSockets Real-Time Sync Server ---
  const wss = new WebSocketServer({ noServer: true });

  interface ClientConnection {
    ws: WebSocket;
    userId: string | null;
  }

  const clients: Record<string, ClientConnection> = {}; // socketId -> connection

  // Handle Upgrade from HTTP to WebSocket
  server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  });

  wss.on('connection', (ws: WebSocket) => {
    const socketId = Math.random().toString(36).substr(2, 9);
    clients[socketId] = { ws, userId: null };

    console.log(`[WS] Connected socket: ${socketId}`);

    ws.on('message', (messageRaw: string) => {
      try {
        const data = JSON.parse(messageRaw);
        const { type, payload } = data;

        if (type === 'user:join') {
          const user = payload.user as User;
          clients[socketId].userId = user.id;

          // Register or update user in DB
          database.users[user.id] = {
            ...user,
            status: 'online'
          };
          saveDatabase(database);

          console.log(`[WS] User ${user.username} (${user.id}) joined.`);

          // 1. Send the client their initial synchronization payload
          const syncPayload = {
            type: 'init',
            payload: {
              currentUser: database.users[user.id],
              users: database.users,
              servers: database.servers,
              messages: database.messages,
              friends: database.friends[user.id] || [],
              dms: database.dms[user.id] || [],
              streams: database.streams
            }
          };
          ws.send(JSON.stringify(syncPayload));

          // 2. Broadcast presence change to other connected clients
          broadcast({
            type: 'presence:updated',
            payload: {
              userId: user.id,
              status: 'online',
              user: database.users[user.id]
            }
          }, socketId);

        } else if (type === 'presence:update') {
          const { userId, status, customStatus } = payload;
          if (database.users[userId]) {
            database.users[userId].status = status;
            if (customStatus !== undefined) {
              database.users[userId].customStatus = customStatus;
            }
            saveDatabase(database);

            broadcast({
              type: 'presence:updated',
              payload: {
                userId,
                status,
                customStatus,
                user: database.users[userId]
              }
            });
          }

        } else if (type === 'message:send') {
          const message = payload.message as Message;
          const channelId = message.channelId;

          if (!database.messages[channelId]) {
            database.messages[channelId] = [];
          }
          database.messages[channelId].push(message);
          saveDatabase(database);

          // Broadcast the message to all connected clients
          broadcast({
            type: 'message:received',
            payload: { message }
          });

        } else if (type === 'server:create') {
          const newServer = payload.server as Server;
          database.servers.push(newServer);
          saveDatabase(database);

          broadcast({
            type: 'server:created',
            payload: { server: newServer }
          });

        } else if (type === 'channel:create') {
          const { serverId, channel } = payload as { serverId: string; channel: Channel };
          database.servers = database.servers.map(s => {
            if (s.id === serverId) {
              return {
                ...s,
                channels: [...s.channels, channel]
              };
            }
            return s;
          });
          saveDatabase(database);

          broadcast({
            type: 'channel:created',
            payload: { serverId, channel }
          });

        } else if (type === 'friend:add') {
          const { fromUserId, targetUsername } = payload;
          const targetUser = Object.values(database.users).find(
            u => u.username.toLowerCase() === targetUsername.toLowerCase() && u.id !== fromUserId
          );

          if (targetUser) {
            // Add relation
            if (!database.friends[fromUserId]) database.friends[fromUserId] = [];
            const alreadyFriend = database.friends[fromUserId].some(f => f.user.id === targetUser.id);
            if (!alreadyFriend) {
              const newFriend: Friend = { id: `f_${Date.now()}`, user: targetUser, relation: 'friend' };
              database.friends[fromUserId].push(newFriend);
              saveDatabase(database);

              ws.send(JSON.stringify({
                type: 'friend:added',
                payload: { friend: newFriend }
              }));
            }
          } else {
            ws.send(JSON.stringify({
              type: 'friend:error',
              payload: { message: 'User not found' }
            }));
          }

        } else if (type === 'stream:start') {
          const { serverId, channelId, streamType, userId } = payload;
          database.streams[channelId] = { userId, streamType };
          saveDatabase(database);

          broadcast({
            type: 'stream:started',
            payload: { userId, serverId, channelId, streamType }
          });

        } else if (type === 'stream:stop') {
          const { channelId, userId } = payload;
          if (database.streams[channelId] && database.streams[channelId].userId === userId) {
            delete database.streams[channelId];
            saveDatabase(database);
          }

          broadcast({
            type: 'stream:stopped',
            payload: { userId, channelId }
          });

        } else if (type === 'rtc:signal') {
          const { to, from, signal } = payload;
          // Forward the WebRTC packet to the designated recipient
          const targetSocket = Object.values(clients).find(c => c.userId === to);
          if (targetSocket && targetSocket.ws.readyState === WebSocket.OPEN) {
            targetSocket.ws.send(JSON.stringify({
              type: 'rtc:signal',
              payload: { from, signal }
            }));
          }
        }

      } catch (err) {
        console.error('[WS] Parse error on message:', err);
      }
    });

    ws.on('close', () => {
      const conn = clients[socketId];
      if (conn && conn.userId) {
        // Set user to offline
        if (database.users[conn.userId]) {
          database.users[conn.userId].status = 'offline';
          saveDatabase(database);

          broadcast({
            type: 'presence:updated',
            payload: {
              userId: conn.userId,
              status: 'offline',
              user: database.users[conn.userId]
            }
          });
        }

        // Clean up streams if they were live streaming
        Object.keys(database.streams).forEach(channelId => {
          if (database.streams[channelId].userId === conn.userId) {
            delete database.streams[channelId];
            saveDatabase(database);
            broadcast({
              type: 'stream:stopped',
              payload: { userId: conn.userId, channelId }
            });
          }
        });
      }
      delete clients[socketId];
      console.log(`[WS] Disconnected socket: ${socketId}`);
    });
  });

  // Helper: Broadcast event to all open WebSocket connections
  function broadcast(data: any, skipSocketId?: string) {
    const serialized = JSON.stringify(data);
    Object.entries(clients).forEach(([id, conn]) => {
      if (id !== skipSocketId && conn.ws.readyState === WebSocket.OPEN) {
        conn.ws.send(serialized);
      }
    });
  }

  // --- Vite & Production SPA Router Routing ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Bind to 0.0.0.0 and port 3000
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[SERVER] Full-Stack Airhope server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[SERVER] Failed to start:', err);
});
