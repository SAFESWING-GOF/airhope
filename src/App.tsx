import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Users, Hash, Volume2, Sparkles } from 'lucide-react';
import { User, Server, Channel, Message, DM, Friend, VoiceState } from './types';
import ServerList from './components/ServerList';
import ChannelSidebar from './components/ChannelSidebar';
import ChatArea from './components/ChatArea';
import MemberList from './components/MemberList';
import HomeView from './components/HomeView';
import Modals from './components/Modals';
import { playSound } from './utils/audio';
import {
  MOCK_USERS,
  DEFAULT_SERVERS,
  DEFAULT_FRIENDS,
  DEFAULT_DMS,
  INITIAL_MESSAGES,
  getBotResponse,
  getRandomAmbientMessage
} from './utils/simulation';

export default function App() {
  // --- Standard Local User ---
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('ah_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id && parsed.id !== 'u_me') {
          return parsed;
        }
      } catch (e) {
        // Fall through
      }
    }
    const randId = 'u_' + Math.random().toString(36).substring(2, 11);
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const bgColors = ['bg-emerald-500', 'bg-rose-500', 'bg-cyan-500', 'bg-amber-500', 'bg-purple-500', 'bg-blue-500', 'bg-indigo-500', 'bg-teal-500'];
    const randomBg = bgColors[Math.floor(Math.random() * bgColors.length)];
    return {
      id: randId,
      username: `Guest_${randNum}`,
      avatar: randomBg,
      status: 'online',
      customStatus: 'Exploring Airhope!',
    };
  });

  // --- Real-time Synchronized States ---
  const [servers, setServers] = useState<Server[]>(DEFAULT_SERVERS);
  const [messages, setMessages] = useState<Record<string, Message[]>>(INITIAL_MESSAGES);
  const [dms, setDms] = useState<DM[]>(DEFAULT_DMS);
  const [friends, setFriends] = useState<Friend[]>(DEFAULT_FRIENDS);
  const [serverUsers, setServerUsers] = useState<Record<string, User>>(MOCK_USERS);
  const [streams, setStreams] = useState<Record<string, { userId: string; streamType: 'camera' | 'screen' }>>({});

  // --- Navigation States ---
  const [activeServerId, setActiveServerId] = useState<'home' | string>('home');
  const [activeChannelId, setActiveChannelId] = useState<string>('friends_dashboard');
  const [showMembersList, setShowMembersList] = useState(true);
  const [activeModal, setActiveModal] = useState<'create_server' | 'create_channel' | 'user_settings' | null>(null);
  const [createChannelType, setCreateChannelType] = useState<'text' | 'voice'>('text');

  // Drawer states
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileMembersOpen, setMobileMembersOpen] = useState(false);

  // --- Voice call simulation ---
  const [voiceState, setVoiceState] = useState<VoiceState>({
    serverId: null,
    channelId: null,
    isMuted: false,
    isDeafened: false,
    connectedUsers: [],
    activeSpeakers: []
  });

  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<User | null>(null);

  // --- WebRTC Live Streaming States ---
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isWatching, setIsWatching] = useState(false);
  const [streamType, setStreamType] = useState<'camera' | 'screen' | null>(null);

  // --- WebSockets Connection ---
  const socketRef = useRef<WebSocket | null>(null);
  const peerConnectionsRef = useRef<Record<string, RTCPeerConnection>>({});
  const localStreamRef = useRef<MediaStream | null>(null);

  // Sync current local user state to local storage
  useEffect(() => {
    localStorage.setItem('ah_user', JSON.stringify(currentUser));
  }, [currentUser]);

  // Connect to the WebSocket full-stack server
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socket = new WebSocket(`${protocol}//${window.location.host}`);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('[WS] Full-Stack Server connected!');
      // Register our user session with the real-time hub
      socket.send(JSON.stringify({
        type: 'user:join',
        payload: { user: currentUser }
      }));
    };

    socket.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        const { type, payload } = data;

        if (type === 'init') {
          // Sync full database state
          if (payload.currentUser) setCurrentUser(payload.currentUser);
          if (payload.servers) setServers(payload.servers);
          if (payload.messages) setMessages(payload.messages);
          if (payload.friends && payload.friends.length > 0) setFriends(payload.friends);
          if (payload.dms && payload.dms.length > 0) setDms(payload.dms);
          if (payload.users) setServerUsers(payload.users);
          if (payload.streams) setStreams(payload.streams);
        } else if (type === 'presence:updated') {
          const { userId, status, customStatus, user } = payload;
          setServerUsers(prev => ({
            ...prev,
            [userId]: {
              ...prev[userId],
              ...user,
              status,
              customStatus
            }
          }));
        } else if (type === 'message:received') {
          const { message } = payload;
          setMessages(prev => {
            const currentList = prev[message.channelId] || [];
            if (currentList.some(m => m.id === message.id)) return prev;
            return {
              ...prev,
              [message.channelId]: [...currentList, message]
            };
          });

          // Unread/Activity tone
          if (activeChannelId !== message.channelId) {
            playSound('message');
          }
        } else if (type === 'server:created') {
          const { server } = payload;
          setServers(prev => {
            if (prev.some(s => s.id === server.id)) return prev;
            return [...prev, server];
          });
        } else if (type === 'channel:created') {
          const { serverId, channel } = payload;
          setServers(prev => prev.map(s => {
            if (s.id !== serverId) return s;
            if (s.channels.some(c => c.id === channel.id)) return s;
            return {
              ...s,
              channels: [...s.channels, channel]
            };
          }));
        } else if (type === 'friend:added') {
          const { friend } = payload;
          setFriends(prev => [friend, ...prev]);
        } else if (type === 'stream:started') {
          const { userId, serverId, channelId, streamType } = payload;
          setStreams(prev => ({
            ...prev,
            [channelId]: { userId, streamType }
          }));
          playSound('join');
        } else if (type === 'stream:stopped') {
          const { userId, channelId } = payload;
          setStreams(prev => {
            const next = { ...prev };
            delete next[channelId];
            return next;
          });
          if (isWatching) {
            handleStopWatchingStream();
          }
          playSound('leave');
        } else if (type === 'rtc:signal') {
          const { from, signal } = payload;
          handleIncomingRTCSignal(from, signal);
        }
      } catch (err) {
        console.error('[WS] Message handling failure:', err);
      }
    };

    socket.onclose = () => {
      console.log('[WS] Connection closed. Retrying link shortly...');
    };

    return () => {
      socket.close();
    };
  }, [currentUser.id]);

  // --- WebRTC Signaling Methods ---
  const handleIncomingRTCSignal = async (fromUserId: string, signal: any) => {
    try {
      if (signal.type === 'request-watch') {
        // We are the STREAMER. Build peer connection for watcher
        const pc = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });
        peerConnectionsRef.current[fromUserId] = pc;

        // Feed local streaming tracks
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach(track => {
            pc.addTrack(track, localStreamRef.current!);
          });
        }

        pc.onicecandidate = (event) => {
          if (event.candidate && socketRef.current) {
            socketRef.current.send(JSON.stringify({
              type: 'rtc:signal',
              payload: {
                to: fromUserId,
                from: currentUser.id,
                signal: { type: 'candidate', candidate: event.candidate }
              }
            }));
          }
        };

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        if (socketRef.current) {
          socketRef.current.send(JSON.stringify({
            type: 'rtc:signal',
            payload: {
              to: fromUserId,
              from: currentUser.id,
              signal: { type: 'offer', sdp: offer.sdp }
            }
          }));
        }

      } else if (signal.type === 'offer') {
        // We are the WATCHER. Create our viewer peer connection
        const pc = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });
        peerConnectionsRef.current[fromUserId] = pc;

        pc.onicecandidate = (event) => {
          if (event.candidate && socketRef.current) {
            socketRef.current.send(JSON.stringify({
              type: 'rtc:signal',
              payload: {
                to: fromUserId,
                from: currentUser.id,
                signal: { type: 'candidate', candidate: event.candidate }
              }
            }));
          }
        };

        pc.ontrack = (event) => {
          console.log('[WebRTC] Stream track received', event.streams[0]);
          setRemoteStream(event.streams[0]);
        };

        await pc.setRemoteDescription(new RTCSessionDescription(signal));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        if (socketRef.current) {
          socketRef.current.send(JSON.stringify({
            type: 'rtc:signal',
            payload: {
              to: fromUserId,
              from: currentUser.id,
              signal: { type: 'answer', sdp: answer.sdp }
            }
          }));
        }

      } else if (signal.type === 'answer') {
        // We are the STREAMER. Finalize handshakes
        const pc = peerConnectionsRef.current[fromUserId];
        if (pc) {
          await pc.setRemoteDescription(new RTCSessionDescription(signal));
        }

      } else if (signal.type === 'candidate') {
        // Adding candidate safely
        const pc = peerConnectionsRef.current[fromUserId];
        if (pc) {
          await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
        }
      }
    } catch (err) {
      console.error('[WebRTC] Signal sync error:', err);
    }
  };

  // Start Live Streaming (Screen Share or Camera WebCam)
  const handleStartStream = async (type: 'camera' | 'screen') => {
    try {
      playSound('join');
      let stream: MediaStream;

      if (type === 'camera') {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: true
        });
      } else {
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
      }

      setLocalStream(stream);
      localStreamRef.current = stream;
      setIsStreaming(true);
      setStreamType(type);

      // Broadcast start to WebSocket hub
      if (socketRef.current) {
        socketRef.current.send(JSON.stringify({
          type: 'stream:start',
          payload: {
            serverId: activeServerId === 'home' ? null : activeServerId,
            channelId: activeChannelId,
            streamType: type,
            userId: currentUser.id
          }
        }));
      }
    } catch (err) {
      console.error('[WebRTC] Failed to acquire stream:', err);
    }
  };

  // Stop Streaming
  const handleStopStream = () => {
    playSound('leave');
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      setLocalStream(null);
      localStreamRef.current = null;
    }
    setIsStreaming(false);
    setStreamType(null);

    // Clean connections
    Object.entries(peerConnectionsRef.current).forEach(([id, pc]) => {
      (pc as RTCPeerConnection).close();
    });
    peerConnectionsRef.current = {};

    if (socketRef.current) {
      socketRef.current.send(JSON.stringify({
        type: 'stream:stop',
        payload: {
          channelId: activeChannelId,
          userId: currentUser.id
        }
      }));
    }
  };

  // Watch someone else's stream
  const handleWatchStream = (streamerId: string) => {
    setIsWatching(true);
    playSound('join');

    // Initiate WebRTC invite request-watch to the streamer
    if (socketRef.current) {
      socketRef.current.send(JSON.stringify({
        type: 'rtc:signal',
        payload: {
          to: streamerId,
          from: currentUser.id,
          signal: { type: 'request-watch' }
        }
      }));
    }
  };

  // Stop watching
  const handleStopWatchingStream = () => {
    setIsWatching(false);
    setRemoteStream(null);
    playSound('leave');

    Object.entries(peerConnectionsRef.current).forEach(([id, pc]) => {
      (pc as RTCPeerConnection).close();
    });
    peerConnectionsRef.current = {};
  };

  // --- Voice call simulation ---
  const handleJoinVoiceChannel = (channelId: string) => {
    playSound('join');
    const candidates = (Object.values(serverUsers) as User[]).filter(
      u => u.id !== currentUser.id && u.id !== 'u_hope_bot' && u.status !== 'offline'
    );
    const attendees = candidates.slice(0, Math.floor(Math.random() * 2) + 2);

    setVoiceState({
      serverId: activeServerId === 'home' ? null : activeServerId,
      channelId,
      isMuted: voiceState.isMuted,
      isDeafened: voiceState.isDeafened,
      connectedUsers: attendees,
      activeSpeakers: []
    });

    setActiveChannelId(channelId);
  };

  const handleDisconnectVoice = () => {
    playSound('leave');
    setVoiceState({
      serverId: null,
      channelId: null,
      isMuted: false,
      isDeafened: false,
      connectedUsers: [],
      activeSpeakers: []
    });
    if (isStreaming) handleStopStream();
    if (isWatching) handleStopWatchingStream();
  };

  const handleToggleMute = () => {
    setVoiceState(prev => {
      const nm = !prev.isMuted;
      return {
        ...prev,
        isMuted: nm,
        isDeafened: nm ? prev.isDeafened : false
      };
    });
  };

  const handleToggleDeafen = () => {
    setVoiceState(prev => {
      const nd = !prev.isDeafened;
      return {
        ...prev,
        isDeafened: nd,
        isMuted: nd ? true : prev.isMuted
      };
    });
  };

  // --- Send Message via WebSocket ---
  const handleSendMessage = (content: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const messageId = `msg_${Date.now()}`;

    const newMsg: Message = {
      id: messageId,
      channelId: activeChannelId,
      sender: currentUser,
      content,
      timestamp: `Today at ${timestamp}`,
      reactions: []
    };

    // Save locally optimistically
    setMessages(prev => {
      const currentList = prev[activeChannelId] || [];
      return {
        ...prev,
        [activeChannelId]: [...currentList, newMsg]
      };
    });

    // Send through WebSocket to broadcast to others
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'message:send',
        payload: { message: newMsg }
      }));
    }

    // Bot Auto responses (retains cozy single-user interactivity)
    const botReplyData = getBotResponse(activeChannelId, content, currentUser);
    if (botReplyData) {
      setIsTyping(true);
      setTypingUser(botReplyData.user);

      setTimeout(() => {
        const botTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const botMsg: Message = {
          id: `bot_${Date.now()}`,
          channelId: activeChannelId,
          sender: botReplyData.user,
          content: botReplyData.text,
          timestamp: `Today at ${botTimestamp}`,
          reactions: []
        };

        setMessages(prev => {
          const currentList = prev[activeChannelId] || [];
          return {
            ...prev,
            [activeChannelId]: [...currentList, botMsg]
          };
        });

        // Send bot message via websocket too so everyone sees the reply
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify({
            type: 'message:send',
            payload: { message: botMsg }
          }));
        }

        setIsTyping(false);
        setTypingUser(null);
        playSound('message');
      }, 1500 + Math.random() * 1000);
    }
  };

  const handleAddReaction = (messageId: string, emoji: string) => {
    // Optimistic reactions
    setMessages((prev) => {
      const channelMsgs = prev[activeChannelId] || [];
      const updatedMsgs = channelMsgs.map((msg) => {
        if (msg.id !== messageId) return msg;

        const currentReactions = msg.reactions || [];
        const existingReactIdx = currentReactions.findIndex((r) => r.emoji === emoji);

        if (existingReactIdx > -1) {
          const reactObj = currentReactions[existingReactIdx];
          const hasReacted = reactObj.users.includes(currentUser.id);

          let updatedUsers = [...reactObj.users];
          let updatedCount = reactObj.count;

          if (hasReacted) {
            updatedUsers = updatedUsers.filter((id) => id !== currentUser.id);
            updatedCount -= 1;
          } else {
            updatedUsers.push(currentUser.id);
            updatedCount += 1;
          }

          const newReactions = [...currentReactions];
          if (updatedCount === 0) {
            newReactions.splice(existingReactIdx, 1);
          } else {
            newReactions[existingReactIdx] = {
              emoji,
              count: updatedCount,
              users: updatedUsers
            };
          }

          return { ...msg, reactions: newReactions };
        } else {
          return {
            ...msg,
            reactions: [...currentReactions, { emoji, count: 1, users: [currentUser.id] }]
          };
        }
      });

      return {
        ...prev,
        [activeChannelId]: updatedMsgs
      };
    });
  };

  // --- Server and Channel Addition ---
  const handleAddServer = (name: string, bgClass: string) => {
    const serverId = `s_${Date.now()}`;
    const initials = name.split(' ').map(w => w[0]).join('').substring(0, 3).toUpperCase() || name.substring(0, 2).toUpperCase();

    const newServer: Server = {
      id: serverId,
      name,
      icon: initials,
      iconBg: bgClass,
      banner: `bg-gradient-to-r from-indigo-600 to-indigo-800`,
      ownerId: currentUser.id,
      channels: [
        { id: `c_${serverId}_gen`, name: 'general', type: 'text', description: 'General text chat channel' },
        { id: `c_${serverId}_vc`, name: 'General Voice 🔊', type: 'voice' }
      ]
    };

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'server:create',
        payload: { server: newServer }
      }));
    }

    setActiveServerId(serverId);
    setActiveChannelId(`c_${serverId}_gen`);
  };

  const handleAddChannel = (name: string, type: 'text' | 'voice', description: string) => {
    if (activeServerId === 'home') return;

    const newChan: Channel = {
      id: `c_${Date.now()}`,
      name,
      type,
      description: type === 'text' ? description : undefined
    };

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'channel:create',
        payload: { serverId: activeServerId, channel: newChan }
      }));
    }
  };

  // Friends adding
  const handleAddFriend = (username: string): boolean => {
    const found = (Object.values(serverUsers) as User[]).some(u => u.username.toLowerCase() === username.toLowerCase());
    if (found && socketRef.current) {
      socketRef.current.send(JSON.stringify({
        type: 'friend:add',
        payload: { fromUserId: currentUser.id, targetUsername: username }
      }));
      return true;
    }
    return false;
  };

  const handleStartDM = (user: User) => {
    let existingDM = dms.find((d) => d.participant.id === user.id);

    if (!existingDM) {
      const dmId = `dm_${user.username.toLowerCase()}`;
      existingDM = { id: dmId, participant: user, unreadCount: 0 };
      setDms((prev) => [existingDM!, ...prev]);
    }

    setActiveServerId('home');
    setActiveChannelId(existingDM.id);
    setMobileMenuOpen(false);
  };

  const handleSelectServer = (serverId: 'home' | string) => {
    setActiveServerId(serverId);
    setMobileMenuOpen(false);

    if (serverId === 'home') {
      setActiveChannelId('friends_dashboard');
    } else {
      const server = servers.find((s) => s.id === serverId);
      if (server) {
        const firstText = server.channels.find((c) => c.type === 'text');
        if (firstText) {
          setActiveChannelId(firstText.id);
        } else if (server.channels.length > 0) {
          setActiveChannelId(server.channels[0].id);
        }
      }
    }
  };

  const handleSelectChannel = (channelId: string) => {
    setMobileMenuOpen(false);

    let selectedChannel: Channel | undefined;
    if (activeServerId !== 'home') {
      const currentServer = servers.find(s => s.id === activeServerId);
      selectedChannel = currentServer?.channels.find(c => c.id === channelId);
    }

    if (selectedChannel && selectedChannel.type === 'voice') {
      handleJoinVoiceChannel(channelId);
    } else {
      setActiveChannelId(channelId);
      setDms((prev) =>
        prev.map((d) => (d.id === channelId ? { ...d, unreadCount: 0 } : d))
      );
    }
  };

  const handleUpdateUser = (updated: Partial<User>) => {
    const nextUser = { ...currentUser, ...updated };
    setCurrentUser(nextUser);

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'user:join',
        payload: { user: nextUser }
      }));
    }
  };

  // Active server/channel resolution
  const activeServer = servers.find((s) => s.id === activeServerId) || null;
  const activeChannel = activeServer
    ? activeServer.channels.find((c) => c.id === activeChannelId) || null
    : null;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#1e1f22] text-[#dbdee1] font-sans antialiased">
      {/* 1. SERVER RAIL COLUMN (DESKTOP) */}
      <div className="hidden md:flex h-full flex-shrink-0">
        <ServerList
          servers={servers}
          activeServerId={activeServerId}
          onSelectServer={handleSelectServer}
          onAddServerClick={() => setActiveModal('create_server')}
          dms={dms}
        />
      </div>

      {/* 2. CHANNELS AND PROFILE AREA (DESKTOP) */}
      <div className="hidden md:flex h-full flex-shrink-0">
        {activeServerId === 'home' ? null : (
          activeServer && (
            <ChannelSidebar
              server={activeServer}
              activeChannelId={activeChannelId}
              onSelectChannel={handleSelectChannel}
              onCreateChannelClick={(type) => {
                setCreateChannelType(type);
                setActiveModal('create_channel');
              }}
              currentUser={currentUser}
              voiceState={voiceState}
              onToggleMute={handleToggleMute}
              onToggleDeafen={handleToggleDeafen}
              onSettingsClick={() => setActiveModal('user_settings')}
              onDisconnectVoice={handleDisconnectVoice}
            />
          )
        )}
      </div>

      {/* MOBILE SHELL OVERLAYS / SIDEBAR DRAWERS */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden bg-black/50 select-none">
          <div className="flex h-full animate-slide-in">
            <ServerList
              servers={servers}
              activeServerId={activeServerId}
              onSelectServer={handleSelectServer}
              onAddServerClick={() => {
                setMobileMenuOpen(false);
                setActiveModal('create_server');
              }}
              dms={dms}
            />
            {activeServerId !== 'home' && activeServer && (
              <ChannelSidebar
                server={activeServer}
                activeChannelId={activeChannelId}
                onSelectChannel={handleSelectChannel}
                onCreateChannelClick={(type) => {
                  setMobileMenuOpen(false);
                  setCreateChannelType(type);
                  setActiveModal('create_channel');
                }}
                currentUser={currentUser}
                voiceState={voiceState}
                onToggleMute={handleToggleMute}
                onToggleDeafen={handleToggleDeafen}
                onSettingsClick={() => {
                  setMobileMenuOpen(false);
                  setActiveModal('user_settings');
                }}
                onDisconnectVoice={handleDisconnectVoice}
              />
            )}
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* 3. MAIN INTERACTION CANVAS AREA */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* MOBILE TOP NAVIGATION BAR */}
        <div className="h-12 border-b border-[#1f2023] flex md:hidden items-center justify-between px-4 bg-[#313338] select-none flex-shrink-0">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="text-[#b5bac1] hover:text-white"
            title="Open Menu"
          >
            <Menu size={24} />
          </button>

          <div className="flex items-center gap-1.5 font-bold text-white text-sm">
            <Sparkles size={16} className="text-indigo-400" />
            <span>Airhope</span>
            <span className="text-[#949ba4] font-medium text-xs">
              {activeServerId === 'home' ? 'Home' : `/${activeChannel?.name || 'chat'}`}
            </span>
          </div>

          <button
            onClick={() => {
              if (activeServerId !== 'home') {
                setMobileMembersOpen(!mobileMembersOpen);
              }
            }}
            disabled={activeServerId === 'home'}
            className={`text-[#b5bac1] hover:text-white ${activeServerId === 'home' ? 'opacity-30' : ''}`}
            title="Server Members"
          >
            <Users size={20} />
          </button>
        </div>

        {/* MOBILE MEMBERS SHEET OVERLAY */}
        {mobileMembersOpen && activeServerId !== 'home' && (
          <div className="fixed inset-0 z-40 flex justify-end md:hidden bg-black/40">
            <div className="w-1" onClick={() => setMobileMembersOpen(false)} />
            <div className="w-64 bg-[#2b2d31] h-full flex flex-col p-4 relative select-none animate-slide-in">
              <button
                onClick={() => setMobileMembersOpen(false)}
                className="absolute left-4 top-4 text-[#949ba4] hover:text-white"
              >
                <X size={20} />
              </button>
              <div className="mt-8 flex-1 overflow-y-auto">
                <MemberList
                  serverId={activeServerId}
                  serverUsers={serverUsers}
                  currentUser={currentUser}
                  onUserClick={(usr) => handleStartDM(usr)}
                />
              </div>
            </div>
          </div>
        )}

        {/* INNER WORKSPACE ROUTING */}
        <div className="flex-1 flex overflow-hidden min-w-0 h-full">
          {activeServerId === 'home' ? (
            <HomeView
              activeChannelId={activeChannelId}
              onSelectDMChannel={handleSelectChannel}
              dms={dms}
              friends={friends}
              messages={messages}
              onSendMessage={handleSendMessage}
              currentUser={currentUser}
              isTyping={isTyping}
              typingUser={typingUser}
              onAddReaction={handleAddReaction}
              onStartDM={handleStartDM}
              onAddFriend={handleAddFriend}
            />
          ) : (
            <>
              <ChatArea
                server={activeServer}
                channel={activeChannel}
                messages={messages[activeChannelId] || []}
                onSendMessage={handleSendMessage}
                currentUser={currentUser}
                isTyping={isTyping}
                typingUser={typingUser}
                onToggleMembersList={() => setShowMembersList(!showMembersList)}
                showMembersList={showMembersList}
                onAddReaction={handleAddReaction}
                voiceState={voiceState}
                onJoinVoiceChannel={() => handleJoinVoiceChannel(activeChannelId)}
                onDisconnectVoice={handleDisconnectVoice}
                activeChannelId={activeChannelId}
                // WebRTC Live stream props:
                localStream={localStream}
                remoteStream={remoteStream}
                isStreaming={isStreaming}
                streamType={streamType}
                streams={streams}
                serverUsers={serverUsers}
                onStartStream={handleStartStream}
                onStopStream={handleStopStream}
                onWatchStream={handleWatchStream}
                onStopWatchingStream={handleStopWatchingStream}
                isWatching={isWatching}
              />

              {showMembersList && activeServer && (
                <MemberList
                  serverId={activeServerId}
                  serverUsers={serverUsers}
                  currentUser={currentUser}
                  onUserClick={(usr) => handleStartDM(usr)}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* 4. MODALS OVERLAYS */}
      <Modals
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
        onSubmitCreateServer={handleAddServer}
        onSubmitCreateChannel={(name, type, desc) => handleAddChannel(name, type, desc)}
        currentUser={currentUser}
        onUpdateUser={handleUpdateUser}
      />
    </div>
  );
}
