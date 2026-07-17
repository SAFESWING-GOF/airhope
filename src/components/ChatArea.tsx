import React, { useState, useRef, useEffect } from 'react';
import {
  Hash,
  Volume2,
  Search,
  Users,
  Paperclip,
  Smile,
  Send,
  Mic,
  MicOff,
  PhoneOff,
  Filter,
  Monitor,
  Video,
  VideoOff,
  Tv,
  Eye,
  EyeOff,
  Maximize2
} from 'lucide-react';
import { Server, Channel, Message, User, VoiceState } from '../types';
import { playSound } from '../utils/audio';

interface ChatAreaProps {
  server: Server | null;
  channel: Channel | null;
  messages: Message[];
  onSendMessage: (content: string) => void;
  currentUser: User;
  isTyping: boolean;
  typingUser: User | null;
  onToggleMembersList: () => void;
  showMembersList: boolean;
  onAddReaction: (messageId: string, emoji: string) => void;
  voiceState: VoiceState;
  onJoinVoiceChannel: () => void;
  onDisconnectVoice: () => void;
  activeChannelId: string;
  // Live Streaming props:
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isStreaming: boolean;
  streamType: 'camera' | 'screen' | null;
  streams: Record<string, { userId: string; streamType: 'camera' | 'screen' }>;
  serverUsers: Record<string, User>;
  onStartStream: (type: 'camera' | 'screen') => void;
  onStopStream: () => void;
  onWatchStream: (streamerId: string) => void;
  onStopWatchingStream: () => void;
  isWatching: boolean;
}

type VideoShader = 'none' | 'cyberpunk' | 'cosmic' | 'blur' | 'mono';

export default function ChatArea({
  server,
  channel,
  messages,
  onSendMessage,
  currentUser,
  isTyping,
  typingUser,
  onToggleMembersList,
  showMembersList,
  onAddReaction,
  voiceState,
  onJoinVoiceChannel,
  onDisconnectVoice,
  activeChannelId,
  localStream,
  remoteStream,
  isStreaming,
  streamType,
  streams,
  serverUsers,
  onStartStream,
  onStopStream,
  onWatchStream,
  onStopWatchingStream,
  isWatching
}: ChatAreaProps) {
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null); // messageId or 'input'
  const [selectedShader, setSelectedShader] = useState<VideoShader>('none');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Bind local video stream
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, isStreaming]);

  // Bind remote video stream
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, isWatching]);

  if (!channel) {
    return (
      <div className="flex-1 bg-[#313338] flex flex-col items-center justify-center text-[#949ba4] select-none p-6 text-center">
        <h3 className="text-xl font-bold text-white mb-2">No Active Channel</h3>
        <p className="text-sm max-w-sm">Select a channel from the left sidebar or open direct messages to start chatting!</p>
      </div>
    );
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const filteredMessages = messages.filter((msg) =>
    msg.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const emojis = ['👍', '❤️', '😂', '🔥', '🎉', '🚀', '👀'];

  // Check if someone is streaming in this channel
  const activeStreamerDetails = streams[channel.id];
  const activeStreamerId = activeStreamerDetails?.userId;
  const activeStreamer = activeStreamerId ? serverUsers[activeStreamerId] : null;

  // Shader helper classes
  const getShaderClass = (shader: VideoShader) => {
    switch (shader) {
      case 'cyberpunk':
        return 'hue-rotate-180 saturate-200 contrast-125';
      case 'cosmic':
        return 'brightness-90 contrast-125 saturate-50 sepia-[30%]';
      case 'blur':
        return 'blur-xs';
      case 'mono':
        return 'grayscale contrast-150';
      default:
        return '';
    }
  };

  return (
    <div className="flex-1 bg-[#313338] flex flex-col h-full overflow-hidden relative">
      {/* CHANNEL HEADER */}
      <div className="h-12 border-b border-[#1f2023] flex items-center justify-between px-4 select-none flex-shrink-0 shadow-sm bg-[#313338] z-10">
        <div className="flex items-center gap-2">
          {channel.type === 'text' ? (
            <Hash size={24} className="text-[#80848e]" />
          ) : (
            <Volume2 size={24} className="text-[#80848e]" />
          )}
          <span className="font-bold text-white text-[15px]">{channel.name}</span>
          {channel.description && (
            <>
              <div className="w-[1px] h-4 bg-[#3f4147] mx-2 hidden md:block" />
              <span className="text-xs text-[#949ba4] font-medium hidden md:block truncate max-w-[300px]">
                {channel.description}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Interactive Search */}
          <div className="relative bg-[#1e1f22] rounded-md px-2 py-1 flex items-center max-w-[140px] sm:max-w-[180px]">
            <input
              type="text"
              placeholder="Search chat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-none w-full placeholder-[#949ba4]"
            />
            <Search size={14} className="text-[#949ba4] ml-1 flex-shrink-0" />
          </div>

          <button
            onClick={onToggleMembersList}
            className={`text-[#b5bac1] hover:text-[#dbdee1] transition-colors duration-150 hidden sm:block ${
              showMembersList ? 'text-white' : ''
            }`}
            title="Toggle Member List"
          >
            <Users size={20} />
          </button>
        </div>
      </div>

      {/* MAIN VIEW: CHAT OR REAL-TIME LIVE STREAMING STUDIO */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {channel.type === 'voice' && (
          <div className="h-3/5 min-h-[350px] bg-[#111214] border-b border-[#1f2023] flex flex-col p-4 relative overflow-hidden select-none">
            
            {/* Header with Title and Active Stream indicators */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#23a55a] rounded-full animate-pulse" />
                <span className="text-xs text-white font-bold uppercase tracking-wider">
                  Live Streaming Call Studio
                </span>
              </div>
              {activeStreamer && (
                <div className="bg-[#f23f43] text-white text-[10px] font-extrabold px-2 py-0.5 rounded flex items-center gap-1 animate-pulse">
                  <Tv size={12} />
                  <span>{activeStreamer.username.toUpperCase()} IS LIVE</span>
                </div>
              )}
            </div>

            {/* Cinematic Live Screen/Camera Stage */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 overflow-hidden mb-3">
              
              {/* Left Cinematic Screen (Active Live Stream Player) */}
              <div className="lg:col-span-3 bg-[#1e1f22] rounded-lg border border-[#2b2d31] flex flex-col overflow-hidden relative group">
                
                {/* 1. Self is Streaming */}
                {isStreaming && (
                  <div className="w-full h-full flex flex-col relative bg-black">
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className={`w-full h-full object-cover transition-all duration-300 ${getShaderClass(selectedShader)}`}
                    />
                    
                    {/* Floating controls overlay */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="flex items-center gap-2">
                        <span className="bg-emerald-500/80 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                          SELF STREAM ({streamType})
                        </span>
                        <span className="text-[10px] text-[#949ba4] font-mono">1280x720 • 30fps</span>
                      </div>
                      
                      {/* Shader selection pills */}
                      <div className="flex items-center gap-1.5 bg-neutral-900/90 rounded-md px-2 py-1 border border-neutral-700">
                        <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wide mr-1">Shader:</span>
                        {(['none', 'cyberpunk', 'cosmic', 'blur', 'mono'] as VideoShader[]).map((sh) => (
                          <button
                            key={sh}
                            onClick={() => setSelectedShader(sh)}
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded transition-all duration-150 ${
                              selectedShader === sh ? 'bg-indigo-600 text-white' : 'text-[#b5bac1] hover:text-white'
                            }`}
                          >
                            {sh.toUpperCase()}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={onStopStream}
                        className="bg-[#f23f43] hover:bg-[#c93135] text-white text-xs font-bold px-3 py-1 rounded transition-all duration-150"
                      >
                        Stop Stream
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. Watching Someone else's real stream */}
                {!isStreaming && isWatching && remoteStream && (
                  <div className="w-full h-full flex flex-col relative bg-black">
                    <video
                      ref={remoteVideoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="bg-[#f23f43] text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                          WATCHING: {activeStreamer?.username}
                        </span>
                        <span className="text-[10px] text-[#949ba4] font-mono">1080p • Ultra Snappy</span>
                      </div>
                      <button
                        onClick={onStopWatchingStream}
                        className="bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold px-3 py-1 rounded transition-all duration-150 border border-neutral-700"
                      >
                        Stop Watching
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. Streamer is Live, user NOT watching yet */}
                {!isStreaming && !isWatching && activeStreamer && (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-radial from-[#1e1f22] to-[#111214] p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#f23f43] to-[#ff7373] flex items-center justify-center text-white font-black text-2xl shadow-xl animate-bounce mb-3">
                      {activeStreamer.username.substring(0, 2).toUpperCase()}
                    </div>
                    <h3 className="text-white font-bold text-sm">{activeStreamer.username} is Live Streaming!</h3>
                    <p className="text-xs text-[#949ba4] max-w-xs mt-1">Jump into the live camera or screen-share feed to watch in crystal-clear quality.</p>
                    <button
                      onClick={() => onWatchStream(activeStreamerId)}
                      className="mt-4 bg-[#f23f43] hover:bg-[#c93135] text-white text-xs font-bold px-5 py-2 rounded shadow-md flex items-center gap-1.5 transition-all duration-150 scale-100 hover:scale-105"
                    >
                      <Eye size={14} />
                      <span>Watch Live Stream</span>
                    </button>
                  </div>
                )}

                {/* 4. No Live Stream active in channel */}
                {!isStreaming && !isWatching && !activeStreamer && (
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 bg-gradient-to-b from-[#111214] to-[#1e1f22]">
                    <div className="w-12 h-12 rounded-full bg-neutral-800 text-[#949ba4] flex items-center justify-center border border-neutral-700 mb-3 shadow">
                      <Tv size={22} />
                    </div>
                    <h4 className="text-[#dbdee1] text-xs font-bold">No Active Stream</h4>
                    <p className="text-[11px] text-[#949ba4] max-w-xs mt-1">Click Share Screen or camera to start streaming live to other users in this server!</p>
                  </div>
                )}
              </div>

              {/* Right Sidebar: Participant grid list */}
              <div className="lg:col-span-1 bg-[#1e1f22] rounded-lg border border-[#2b2d31] p-3 flex flex-col gap-2 overflow-y-auto no-scrollbar">
                <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-wider border-b border-[#2b2d31] pb-1">
                  ROOM MEMBERS ({voiceState.connectedUsers.length + 1})
                </span>

                {/* Self Item */}
                <div className="bg-[#2b2d31] rounded-md p-2 flex items-center justify-between border border-[#1f2023]">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full ${currentUser.avatar} flex items-center justify-center text-xs font-bold text-white relative`}>
                      {currentUser.username.substring(0, 2).toUpperCase()}
                      {isStreaming && (
                        <span className="absolute -top-1 -right-1 bg-[#f23f43] w-2 h-2 rounded-full border border-[#2b2d31]" />
                      )}
                    </div>
                    <span className="text-xs font-semibold text-white truncate max-w-[80px]">
                      {currentUser.username}
                    </span>
                  </div>
                  {isStreaming && (
                    <span className="bg-[#f23f43] text-[8px] text-white font-extrabold px-1 rounded">LIVE</span>
                  )}
                </div>

                {/* Other simulated/real members in room */}
                {voiceState.connectedUsers.map((user) => {
                  const isSpeaking = voiceState.activeSpeakers.includes(user.id);
                  const isUserStreaming = streams[channel.id]?.userId === user.id;
                  return (
                    <div
                      key={user.id}
                      className={`bg-[#2b2d31] rounded-md p-2 flex items-center justify-between border transition-all duration-150 ${
                        isSpeaking ? 'border-[#23a55a] shadow-[0_0_8px_rgba(35,165,90,0.2)]' : 'border-[#1f2023]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-full ${user.avatar} flex items-center justify-center text-xs font-bold text-white relative transition-shadow duration-150 ${
                          isSpeaking ? 'ring-2 ring-[#23a55a]' : ''
                        }`}>
                          {user.username.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-xs font-semibold text-[#b5bac1] truncate max-w-[80px]">
                          {user.username}
                        </span>
                      </div>
                      {isUserStreaming ? (
                        <button
                          onClick={() => onWatchStream(user.id)}
                          className="bg-[#f23f43] hover:bg-[#c93135] text-[8px] text-white font-extrabold px-1.5 py-0.5 rounded transition-transform active:scale-95"
                        >
                          WATCH
                        </button>
                      ) : (
                        isSpeaking && <span className="w-1.5 h-1.5 bg-[#23a55a] rounded-full animate-pulse" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions Panel Tray at bottom of Call Studio */}
            <div className="bg-[#1e1f22] rounded-md border border-[#2b2d31] p-2 flex items-center justify-between">
              
              {/* Media Sharing controls */}
              <div className="flex items-center gap-2">
                {!isStreaming ? (
                  <>
                    <button
                      onClick={() => onStartStream('camera')}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold px-3 py-1.5 rounded flex items-center gap-1.5 transition-all duration-150 shadow-md"
                    >
                      <Video size={14} />
                      <span>Camera</span>
                    </button>
                    <button
                      onClick={() => onStartStream('screen')}
                      className="bg-neutral-700 hover:bg-neutral-600 text-white text-[11px] font-bold px-3 py-1.5 rounded flex items-center gap-1.5 transition-all duration-150 shadow"
                    >
                      <Monitor size={14} />
                      <span>Share Screen</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={onStopStream}
                    className="bg-[#f23f43] hover:bg-[#c93135] text-white text-[11px] font-bold px-3 py-1.5 rounded flex items-center gap-1.5 transition-all duration-150 shadow-md"
                  >
                    <VideoOff size={14} />
                    <span>Stop Streaming</span>
                  </button>
                )}
              </div>

              {/* Leave Call Button */}
              <button
                onClick={onDisconnectVoice}
                className="bg-[#f23f43] text-white hover:bg-[#c93135] px-4 py-1.5 rounded text-[11px] font-bold flex items-center gap-1.5 transition-all duration-150 shadow-md"
              >
                <PhoneOff size={14} />
                <span>Disconnect</span>
              </button>
            </div>
          </div>
        )}

        {/* CHAT MESSAGES PORT */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {filteredMessages.length === 0 && searchQuery === '' && (
            <div className="mb-6 border border-dashed border-[#404249] rounded-xl p-5 text-center bg-[#2b2d31]">
              <div className="w-12 h-12 bg-[#313338] text-white rounded-full flex items-center justify-center mx-auto mb-3 border border-indigo-500 shadow-md">
                {channel.type === 'text' ? <Hash size={24} /> : <Volume2 size={24} />}
              </div>
              <h2 className="text-lg font-bold text-white">Welcome to #{channel.name}!</h2>
              <p className="text-xs text-[#949ba4] mt-1 max-w-md mx-auto">
                This is the absolute start of the #{channel.name} channel. Be the first to start a conversation, drop a meme, or streaming greeting!
              </p>
            </div>
          )}

          {searchQuery && (
            <div className="bg-[#2b2d31] rounded-md px-3 py-2 flex items-center justify-between text-xs text-[#949ba4] mb-3">
              <span className="flex items-center gap-1.5 font-medium">
                <Filter size={12} /> Showing {filteredMessages.length} results matching "{searchQuery}"
              </span>
              <button
                onClick={() => setSearchQuery('')}
                className="text-indigo-400 hover:underline hover:text-indigo-300 font-bold"
              >
                Clear filter
              </button>
            </div>
          )}

          {/* Messages Map */}
          {filteredMessages.map((msg) => (
            <div
              key={msg.id}
              className="flex gap-4 group relative hover:bg-[#2e3035] -mx-4 px-4 py-1.5 rounded-sm transition-colors duration-150"
            >
              <div className="flex-shrink-0">
                <div className={`w-10 h-10 rounded-full ${msg.sender.avatar} flex items-center justify-center font-bold text-white shadow-sm`}>
                  {msg.sender.username.substring(0, 2).toUpperCase()}
                </div>
              </div>

              <div className="flex-1 overflow-hidden">
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold text-white text-sm hover:underline cursor-pointer">
                    {msg.sender.username}
                  </span>
                  {msg.sender.isBot && (
                    <span className="bg-[#5865f2] text-white text-[9px] font-extrabold px-1 py-0.5 rounded uppercase leading-none">
                      Bot
                    </span>
                  )}
                  <span className="text-[10px] text-[#949ba4] font-medium">{msg.timestamp}</span>
                </div>

                <p className="text-[#dbdee1] text-[15px] whitespace-pre-wrap mt-1 leading-relaxed">
                  {msg.content}
                </p>

                {msg.reactions && msg.reactions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {msg.reactions.map((react, i) => {
                      const userReacted = react.users.includes(currentUser.id);
                      return (
                        <button
                          key={i}
                          onClick={() => onAddReaction(msg.id, react.emoji)}
                          className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-md border transition-all duration-150 ${
                            userReacted
                              ? 'bg-[#3c4270] border-[#5865f2] text-white'
                              : 'bg-[#2b2d31] border-transparent text-[#b5bac1] hover:border-[#3f4147]'
                          }`}
                        >
                          <span>{react.emoji}</span>
                          <span className="font-semibold">{react.count}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#313338] border border-[#1f2023] rounded-md shadow-md hidden group-hover:flex items-center p-0.5 z-20">
                <button
                  onClick={() => setShowEmojiPicker(showEmojiPicker === msg.id ? null : msg.id)}
                  className="p-1.5 text-[#b5bac1] hover:text-[#dbdee1] hover:bg-[#35373c] rounded transition-colors duration-150 relative"
                  title="Add Reaction"
                >
                  <Smile size={18} />

                  {showEmojiPicker === msg.id && (
                    <div className="absolute bottom-8 right-0 bg-[#111214] border border-[#2b2d31] rounded-md p-1.5 flex gap-1 shadow-2xl z-50 animate-fade-in">
                      {emojis.map((em) => (
                        <button
                          key={em}
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddReaction(msg.id, em);
                            setShowEmojiPicker(null);
                          }}
                          className="hover:scale-125 transition-transform duration-100 p-1"
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  )}
                </button>
              </div>
            </div>
          ))}

          {isTyping && typingUser && (
            <div className="flex gap-4 items-center -mx-4 px-4 py-1.5 text-xs text-[#949ba4]">
              <div className={`w-8 h-8 rounded-full ${typingUser.avatar} flex items-center justify-center font-bold text-white text-[10px]`}>
                {typingUser.username.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-[#dbdee1]">{typingUser.username}</span> is typing
                <span className="flex gap-0.5 ml-1">
                  <span className="w-1.5 h-1.5 bg-[#949ba4] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-[#949ba4] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-[#949ba4] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* INPUT FORM FIELD */}
      <div className="px-4 pb-6 select-none bg-[#313338]">
        <form onSubmit={handleSend} className="bg-[#383a40] rounded-lg px-4 py-2.5 flex items-center gap-3 relative shadow-inner">
          <button
            type="button"
            className="text-[#b5bac1] hover:text-[#dbdee1] transition-all duration-150"
            title="Attach file"
          >
            <Paperclip size={20} />
          </button>

          <input
            type="text"
            placeholder={
              channel.type === 'voice'
                ? `Join Voice Call or type here...`
                : `Message #${channel.name}`
            }
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="bg-transparent flex-1 focus:outline-none text-white text-sm placeholder-[#949ba4]"
          />

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(showEmojiPicker === 'input' ? null : 'input')}
              className="text-[#b5bac1] hover:text-[#dbdee1] transition-all duration-150"
              title="Add Emoji"
            >
              <Smile size={20} />
            </button>

            {showEmojiPicker === 'input' && (
              <div className="absolute bottom-8 right-0 bg-[#111214] border border-[#2b2d31] rounded-md p-1.5 flex gap-1 shadow-2xl z-50">
                {emojis.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => {
                      setInputText((prev) => prev + ' ' + em);
                      setShowEmojiPicker(null);
                    }}
                    className="hover:scale-125 transition-transform duration-100 p-1"
                  >
                    {em}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!inputText.trim()}
            className={`transition-all duration-150 ${
              inputText.trim() ? 'text-[#23a55a] hover:scale-105' : 'text-[#4e5058] cursor-not-allowed'
            }`}
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
