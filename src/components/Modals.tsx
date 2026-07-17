import React, { useState } from 'react';
import { X, Hash, Volume2, Plus, Sparkles } from 'lucide-react';
import { User, Server } from '../types';

interface ModalsProps {
  activeModal: 'create_server' | 'create_channel' | 'user_settings' | null;
  onClose: () => void;
  onSubmitCreateServer: (name: string, bgClass: string) => void;
  onSubmitCreateChannel: (name: string, type: 'text' | 'voice', description: string) => void;
  currentUser: User;
  onUpdateUser: (updatedUser: Partial<User>) => void;
}

const AVATAR_COLORS = [
  'bg-emerald-500',
  'bg-indigo-600',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-amber-500',
  'bg-purple-500',
  'bg-sky-500',
  'bg-red-500',
  'bg-neutral-700'
];

export default function Modals({
  activeModal,
  onClose,
  onSubmitCreateServer,
  onSubmitCreateChannel,
  currentUser,
  onUpdateUser
}: ModalsProps) {
  // Modal specific state
  const [serverName, setServerName] = useState('');
  const [serverBg, setServerBg] = useState('bg-indigo-600');

  const [channelName, setChannelName] = useState('');
  const [channelType, setChannelType] = useState<'text' | 'voice'>('text');
  const [channelDesc, setChannelDesc] = useState('');

  const [editUsername, setEditUsername] = useState(currentUser.username);
  const [editAvatar, setEditAvatar] = useState(currentUser.avatar);
  const [editStatus, setEditStatus] = useState(currentUser.customStatus || '');

  if (!activeModal) return null;

  // Handle server submission
  const handleServerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serverName.trim()) return;
    onSubmitCreateServer(serverName.trim(), serverBg);
    setServerName('');
    onClose();
  };

  // Handle channel submission
  const handleChannelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelName.trim()) return;
    
    // Format name to match discord format (lowercase, hyphens)
    const formattedName = channelType === 'text' 
      ? channelName.trim().toLowerCase().replace(/\s+/g, '-') 
      : channelName.trim();

    onSubmitCreateChannel(formattedName, channelType, channelDesc.trim());
    setChannelName('');
    setChannelDesc('');
    onClose();
  };

  // Handle profile settings submission
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUsername.trim()) return;
    onUpdateUser({
      username: editUsername.trim(),
      avatar: editAvatar,
      customStatus: editStatus.trim() || undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="w-full max-w-[440px] bg-[#313338] border border-[#1f2023] rounded-lg shadow-2xl overflow-hidden animate-fade-in text-white relative">
        {/* Close Button top-right */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[#949ba4] hover:text-[#dbdee1] transition-colors duration-150"
          title="Close Modal"
        >
          <X size={20} />
        </button>

        {/* 1. CREATE SERVER MODAL */}
        {activeModal === 'create_server' && (
          <form onSubmit={handleServerSubmit} className="flex flex-col">
            <div className="p-6 text-center">
              <h2 className="text-xl font-bold text-white">Create Your Server</h2>
              <p className="text-xs text-[#949ba4] mt-1.5 max-w-sm mx-auto">
                Give your new server a personality by naming it and picking an icon theme gradient. You can always change this later!
              </p>

              <div className="mt-5 space-y-4 text-left">
                {/* Name field */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#b5bac1]">
                    Server Name
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={25}
                    placeholder="My Gaming Club"
                    value={serverName}
                    onChange={(e) => setServerName(e.target.value)}
                    className="bg-[#1e1f22] border border-[#1f2023] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 w-full"
                  />
                </div>

                {/* Color Selector */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#b5bac1]">
                    Icon Theme Palette
                  </label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {AVATAR_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setServerBg(color)}
                        className={`w-8 h-8 rounded-full ${color} transition-all duration-150 ${
                          serverBg === color ? 'ring-4 ring-indigo-500 scale-110 shadow-lg' : 'hover:scale-105'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions banner */}
            <div className="bg-[#2b2d31] px-6 py-4 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-semibold text-[#dbdee1] hover:underline"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!serverName.trim()}
                className="bg-[#5865f2] hover:bg-[#4752c4] disabled:bg-[#3f4147] disabled:cursor-not-allowed text-xs font-bold px-5 py-2 rounded text-white transition-all duration-150"
              >
                Create Server
              </button>
            </div>
          </form>
        )}

        {/* 2. CREATE CHANNEL MODAL */}
        {activeModal === 'create_channel' && (
          <form onSubmit={handleChannelSubmit} className="flex flex-col">
            <div className="p-6">
              <h2 className="text-xl font-bold text-white">Create Channel</h2>
              <p className="text-xs text-[#949ba4] mt-1">In your selected Airhope server</p>

              <div className="mt-5 space-y-4">
                {/* Type toggle */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#b5bac1]">
                    Channel Type
                  </label>
                  
                  <div className="flex flex-col gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setChannelType('text')}
                      className={`flex items-center gap-3 p-3 rounded-md border transition-all duration-150 text-left ${
                        channelType === 'text'
                          ? 'bg-[#404249] border-indigo-500'
                          : 'bg-[#2b2d31] border-transparent hover:bg-[#35373c]'
                      }`}
                    >
                      <Hash size={24} className="text-[#80848e]" />
                      <div className="flex flex-col leading-none">
                        <span className="text-sm font-semibold text-white">Text</span>
                        <span className="text-[11px] text-[#949ba4] mt-1">Post messages, images, memes, and code blocks</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setChannelType('voice')}
                      className={`flex items-center gap-3 p-3 rounded-md border transition-all duration-150 text-left ${
                        channelType === 'voice'
                          ? 'bg-[#404249] border-indigo-500'
                          : 'bg-[#2b2d31] border-transparent hover:bg-[#35373c]'
                      }`}
                    >
                      <Volume2 size={24} className="text-[#80848e]" />
                      <div className="flex flex-col leading-none">
                        <span className="text-sm font-semibold text-white">Voice</span>
                        <span className="text-[11px] text-[#949ba4] mt-1">Join immersive voice calls with simulated online partners</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Name input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#b5bac1]">
                    Channel Name
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={20}
                    placeholder="new-lobby"
                    value={channelName}
                    onChange={(e) => setChannelName(e.target.value)}
                    className="bg-[#1e1f22] border border-[#1f2023] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 w-full"
                  />
                </div>

                {/* Description if Text */}
                {channelType === 'text' && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#b5bac1]">
                      Description
                    </label>
                    <input
                      type="text"
                      maxLength={50}
                      placeholder="Talk about cool things..."
                      value={channelDesc}
                      onChange={(e) => setChannelDesc(e.target.value)}
                      className="bg-[#1e1f22] border border-[#1f2023] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 w-full"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions banner */}
            <div className="bg-[#2b2d31] px-6 py-4 flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-semibold text-[#dbdee1] hover:underline"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!channelName.trim()}
                className="bg-[#23a55a] hover:bg-[#1a7f43] disabled:bg-[#3f4147] disabled:cursor-not-allowed text-xs font-bold px-5 py-2 rounded text-white transition-all duration-150"
              >
                Create Channel
              </button>
            </div>
          </form>
        )}

        {/* 3. USER SETTINGS MODAL */}
        {activeModal === 'user_settings' && (
          <form onSubmit={handleProfileSubmit} className="flex flex-col">
            <div className="p-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-1.5">
                <Sparkles size={20} className="text-indigo-400" /> User Profile Settings
              </h2>
              <p className="text-xs text-[#949ba4] mt-1">Customize your Airhope client card</p>

              <div className="mt-5 space-y-4">
                {/* Avatar color selector */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#b5bac1]">
                    Profile Card Color
                  </label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {AVATAR_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setEditAvatar(color)}
                        className={`w-7 h-7 rounded-full ${color} transition-all duration-150 ${
                          editAvatar === color ? 'ring-4 ring-indigo-500 scale-110' : 'hover:scale-105'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Nickname */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#b5bac1]">
                    Nickname
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={15}
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="bg-[#1e1f22] border border-[#1f2023] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 w-full"
                  />
                </div>

                {/* Custom Status */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#b5bac1]">
                    Custom Status Message
                  </label>
                  <input
                    type="text"
                    maxLength={35}
                    placeholder="Coding on Airhope..."
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="bg-[#1e1f22] border border-[#1f2023] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 w-full"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="bg-[#2b2d31] px-6 py-4 flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-semibold text-[#dbdee1] hover:underline"
              >
                Discard
              </button>
              <button
                type="submit"
                disabled={!editUsername.trim()}
                className="bg-[#5865f2] hover:bg-[#4752c4] disabled:bg-[#3f4147] disabled:cursor-not-allowed text-xs font-bold px-5 py-2 rounded text-white transition-all duration-150"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
