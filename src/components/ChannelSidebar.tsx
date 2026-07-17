import { Hash, Volume2, Mic, MicOff, Headphones, Settings, Plus, LogOut, ChevronDown } from 'lucide-react';
import { Server, Channel, User, VoiceState } from '../types';
import { playSound } from '../utils/audio';

interface ChannelSidebarProps {
  server: Server;
  activeChannelId: string;
  onSelectChannel: (channelId: string) => void;
  onCreateChannelClick: (type: 'text' | 'voice') => void;
  currentUser: User;
  voiceState: VoiceState;
  onToggleMute: () => void;
  onToggleDeafen: () => void;
  onSettingsClick: () => void;
  onDisconnectVoice: () => void;
}

export default function ChannelSidebar({
  server,
  activeChannelId,
  onSelectChannel,
  onCreateChannelClick,
  currentUser,
  voiceState,
  onToggleMute,
  onToggleDeafen,
  onSettingsClick,
  onDisconnectVoice,
}: ChannelSidebarProps) {
  const textChannels = server.channels.filter((c) => c.type === 'text');
  const voiceChannels = server.channels.filter((c) => c.type === 'voice');

  return (
    <div className="w-60 bg-[#2b2d31] flex flex-col flex-shrink-0 select-none h-full">
      {/* Server Header */}
      <div className="h-12 border-b border-[#1f2023] flex items-center justify-between px-4 hover:bg-[#35373c] transition-colors duration-150 cursor-pointer shadow-sm relative">
        <h1 className="font-bold text-white text-[15px] truncate max-w-[180px]">
          {server.name}
        </h1>
        <ChevronDown size={18} className="text-[#b5bac1]" />
      </div>

      {/* Channels List */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {/* TEXT CHANNELS */}
        <div>
          <div className="flex items-center justify-between text-[#949ba4] px-2 py-1 hover:text-[#dbdee1] transition-colors duration-150 group">
            <span className="text-xs font-bold uppercase tracking-wider">
              Text Channels
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCreateChannelClick('text');
              }}
              className="text-[#949ba4] hover:text-white transition-colors duration-150"
              title="Create Text Channel"
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="space-y-0.5 mt-1">
            {textChannels.map((channel) => {
              const isActive = activeChannelId === channel.id;
              return (
                <button
                  key={channel.id}
                  onClick={() => onSelectChannel(channel.id)}
                  className={`w-full flex items-center px-2 py-1.5 rounded-md transition-colors duration-150 group text-left ${
                    isActive
                      ? 'bg-[#404249] text-white'
                      : 'text-[#949ba4] hover:bg-[#35373c] hover:text-[#dbdee1]'
                  }`}
                >
                  <Hash size={20} className="text-[#80848e] mr-1.5 flex-shrink-0" />
                  <span className="text-sm font-medium truncate">{channel.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* VOICE CHANNELS */}
        <div>
          <div className="flex items-center justify-between text-[#949ba4] px-2 py-1 hover:text-[#dbdee1] transition-colors duration-150 group">
            <span className="text-xs font-bold uppercase tracking-wider">
              Voice Channels
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCreateChannelClick('voice');
              }}
              className="text-[#949ba4] hover:text-white transition-colors duration-150"
              title="Create Voice Channel"
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="space-y-0.5 mt-1">
            {voiceChannels.map((channel) => {
              const isActiveVoice = voiceState.channelId === channel.id;
              return (
                <div key={channel.id} className="space-y-1">
                  <button
                    onClick={() => onSelectChannel(channel.id)}
                    className={`w-full flex items-center px-2 py-1.5 rounded-md transition-colors duration-150 group text-left ${
                      isActiveVoice
                        ? 'bg-[#35373c] text-[#23a55a]'
                        : 'text-[#949ba4] hover:bg-[#35373c] hover:text-[#dbdee1]'
                    }`}
                  >
                    <Volume2
                      size={20}
                      className={`mr-1.5 flex-shrink-0 ${
                        isActiveVoice ? 'text-[#23a55a]' : 'text-[#80848e]'
                      }`}
                    />
                    <span className="text-sm font-medium truncate flex-1">
                      {channel.name}
                    </span>
                  </button>

                  {/* Active Voice call members shown inside the channel */}
                  {isActiveVoice && (
                    <div className="pl-6 space-y-1.5 pb-2">
                      {/* Active Current User */}
                      <div className="flex items-center gap-2 py-0.5 px-1.5 rounded hover:bg-[#35373c]">
                        <div className="relative">
                          <div className={`w-5 h-5 rounded-full ${currentUser.avatar} flex items-center justify-center text-[10px] text-white font-bold`}>
                            {currentUser.username.substring(0, 2).toUpperCase()}
                          </div>
                          {voiceState.isMuted && (
                            <div className="absolute -bottom-1 -right-1 bg-[#f23f43] p-0.5 rounded-full border border-[#2b2d31]">
                              <MicOff size={8} className="text-white" />
                            </div>
                          )}
                        </div>
                        <span className="text-xs font-medium text-[#dbdee1] truncate max-w-[120px]">
                          {currentUser.username}
                        </span>
                      </div>

                      {/* Active Simulated Call Partners */}
                      {voiceState.connectedUsers.map((user) => {
                        const isSpeaking = voiceState.activeSpeakers.includes(user.id);
                        return (
                          <div
                            key={user.id}
                            className="flex items-center gap-2 py-0.5 px-1.5 rounded hover:bg-[#35373c] transition-colors duration-150"
                          >
                            <div className="relative">
                              <div
                                className={`w-5 h-5 rounded-full ${user.avatar} flex items-center justify-center text-[10px] text-white font-bold transition-shadow duration-150 ${
                                  isSpeaking ? 'ring-2 ring-[#23a55a]' : ''
                                }`}
                              >
                                {user.username.substring(0, 2).toUpperCase()}
                              </div>
                              {isSpeaking && (
                                <span className="absolute -bottom-1 -right-1 bg-[#23a55a] w-1.5 h-1.5 rounded-full border border-[#2b2d31]" />
                              )}
                            </div>
                            <span
                              className={`text-xs font-medium truncate max-w-[120px] transition-colors duration-150 ${
                                isSpeaking ? 'text-[#23a55a] font-semibold' : 'text-[#949ba4]'
                              }`}
                            >
                              {user.username}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Voice Connection Status Pane if active */}
      {voiceState.channelId && (
        <div className="bg-[#232428] border-b border-[#1f2023] px-3 py-2 flex flex-col gap-1 select-none">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-[#23a55a] rounded-full animate-pulse" />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#23a55a] leading-none">
                  Voice Connected
                </span>
                <span className="text-[10px] text-[#949ba4] truncate max-w-[130px] mt-0.5">
                  {server.name}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                playSound('leave');
                onDisconnectVoice();
              }}
              className="text-[#949ba4] hover:text-[#f23f43] p-1.5 hover:bg-[#35373c] rounded transition-all duration-150"
              title="Disconnect Voice"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Bottom User Control Bar */}
      <div className="h-[52px] bg-[#232428] flex items-center justify-between px-2 py-2 select-none flex-shrink-0 z-10">
        <div
          onClick={onSettingsClick}
          className="flex items-center gap-2 hover:bg-[#35373c] px-1.5 py-1 rounded cursor-pointer transition-colors duration-150 max-w-[120px] flex-1"
          title="User Profile"
        >
          <div className="relative">
            <div className={`w-8 h-8 rounded-full ${currentUser.avatar} flex items-center justify-center text-xs font-bold text-white relative`}>
              {currentUser.username.substring(0, 2).toUpperCase()}
            </div>
            {/* Status Indicator circle */}
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#23a55a] border-2 border-[#232428] rounded-full" />
          </div>

          <div className="flex flex-col truncate">
            <span className="text-xs font-bold text-white truncate leading-tight">
              {currentUser.username}
            </span>
            <span className="text-[10px] text-[#949ba4] truncate mt-0.5">
              #0001
            </span>
          </div>
        </div>

        {/* Buttons tray */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => {
              playSound('toggle');
              onToggleMute();
            }}
            className={`p-1.5 rounded text-[#949ba4] hover:bg-[#35373c] hover:text-[#dbdee1] transition-all duration-150`}
            title={voiceState.isMuted ? 'Unmute' : 'Mute'}
          >
            {voiceState.isMuted ? <MicOff size={18} className="text-[#f23f43]" /> : <Mic size={18} />}
          </button>
          <button
            onClick={() => {
              playSound('toggle');
              onToggleDeafen();
            }}
            className="p-1.5 rounded text-[#949ba4] hover:bg-[#35373c] hover:text-[#dbdee1] transition-all duration-150"
            title={voiceState.isDeafened ? 'Undeafen' : 'Deafen'}
          >
            <Headphones size={18} className={voiceState.isDeafened ? 'text-[#f23f43]' : ''} />
          </button>
          <button
            onClick={onSettingsClick}
            className="p-1.5 rounded text-[#949ba4] hover:bg-[#35373c] hover:text-[#dbdee1] transition-all duration-150"
            title="User Settings"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
