import React, { useState } from 'react';
import { Users, MessageSquareCode, Plus, Search, MessageSquare, Phone, UserX, UserCheck, Inbox, Flame, Sparkles } from 'lucide-react';
import { DM, Friend, Message, User } from '../types';
import ChatArea from './ChatArea';
import { playSound } from '../utils/audio';

interface HomeViewProps {
  activeChannelId: string; // DM ID or 'friends_dashboard'
  onSelectDMChannel: (id: string) => void;
  dms: DM[];
  friends: Friend[];
  messages: Record<string, Message[]>;
  onSendMessage: (content: string) => void;
  currentUser: User;
  isTyping: boolean;
  typingUser: User | null;
  onAddReaction: (messageId: string, emoji: string) => void;
  onStartDM: (user: User) => void;
  onAddFriend: (username: string) => boolean;
}

type FriendsTab = 'online' | 'all' | 'pending' | 'blocked' | 'add_friend';

export default function HomeView({
  activeChannelId,
  onSelectDMChannel,
  dms,
  friends,
  messages,
  onSendMessage,
  currentUser,
  isTyping,
  typingUser,
  onAddReaction,
  onStartDM,
  onAddFriend,
}: HomeViewProps) {
  const [activeTab, setActiveTab] = useState<FriendsTab>('online');
  const [addFriendInput, setAddFriendInput] = useState('');
  const [friendError, setFriendError] = useState('');
  const [friendSuccess, setFriendSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Handle adding friend
  const handleAddFriendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addFriendInput.trim()) return;
    
    const success = onAddFriend(addFriendInput.trim());
    if (success) {
      setFriendSuccess(`Success! Sent a friend request to @${addFriendInput}`);
      setFriendError('');
      setAddFriendInput('');
      playSound('join');
    } else {
      setFriendError(`Could not find user "${addFriendInput}"`);
      setFriendSuccess('');
    }
  };

  // Filter friends based on query
  const filteredFriends = friends.filter((fr) => {
    const matchesSearch = fr.user.username.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (activeTab === 'online') return fr.user.status !== 'offline' && fr.relation === 'friend';
    if (activeTab === 'all') return fr.relation === 'friend';
    if (activeTab === 'pending') return fr.relation === 'pending_incoming' || fr.relation === 'pending_outgoing';
    if (activeTab === 'blocked') return fr.relation === 'blocked';
    
    return false;
  });

  const activeNowUsers = friends.filter((fr) => fr.user.status !== 'offline' && fr.user.activity);

  // If chat is active inside a selected DM
  const currentDM = dms.find((d) => d.id === activeChannelId);

  return (
    <div className="flex-1 flex overflow-hidden h-full bg-[#313338]">
      {/* HOME SIDEBAR (DM Lists) */}
      <div className="w-60 bg-[#2b2d31] flex flex-col flex-shrink-0 select-none h-full">
        {/* Search DM Button */}
        <div className="h-12 border-b border-[#1f2023] flex items-center justify-center px-3">
          <button className="w-full bg-[#1e1f22] text-xs text-[#949ba4] rounded-md px-2 py-1.5 flex items-center justify-between hover:bg-[#35373c] transition-all duration-150">
            <span>Find or start a conversation</span>
            <Search size={12} />
          </button>
        </div>

        {/* Home Navigation */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
          <div className="space-y-0.5">
            {/* Friends Tab selector button */}
            <button
              onClick={() => onSelectDMChannel('friends_dashboard')}
              className={`w-full flex items-center px-3 py-2 rounded-md transition-all duration-150 text-left ${
                activeChannelId === 'friends_dashboard'
                  ? 'bg-[#404249] text-white'
                  : 'text-[#949ba4] hover:bg-[#35373c] hover:text-[#dbdee1]'
              }`}
            >
              <Users size={20} className="mr-3 text-[#80848e]" />
              <span className="text-sm font-medium">Friends</span>
            </button>
          </div>

          {/* DIRECT MESSAGES LIST */}
          <div>
            <div className="flex items-center justify-between text-[#949ba4] px-3 py-1 hover:text-[#dbdee1] transition-colors duration-150 uppercase tracking-wider text-xs font-bold">
              <span>Direct Messages</span>
              <button className="text-[#949ba4] hover:text-white" title="New DM">
                <Plus size={14} />
              </button>
            </div>

            <div className="space-y-0.5 mt-1">
              {dms.map((dm) => {
                const isActive = activeChannelId === dm.id;
                let statusColor = 'bg-[#23a55a]';
                if (dm.participant.status === 'idle') statusColor = 'bg-[#f0b232]';
                if (dm.participant.status === 'dnd') statusColor = 'bg-[#f23f43]';
                if (dm.participant.status === 'offline') statusColor = 'bg-[#80848e]';

                return (
                  <button
                    key={dm.id}
                    onClick={() => onSelectDMChannel(dm.id)}
                    className={`w-full flex items-center px-3 py-1.5 rounded-md transition-all duration-150 text-left group relative ${
                      isActive
                        ? 'bg-[#404249] text-white'
                        : 'text-[#949ba4] hover:bg-[#35373c] hover:text-[#dbdee1]'
                    }`}
                  >
                    <div className="relative mr-3 flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full ${dm.participant.avatar} flex items-center justify-center text-xs font-bold text-white shadow-sm`}>
                        {dm.participant.username.substring(0, 2).toUpperCase()}
                      </div>
                      <span className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-[#2b2d31] rounded-full ${statusColor}`} />
                    </div>

                    <div className="flex flex-col truncate flex-1">
                      <span className="text-sm font-medium truncate">
                        {dm.participant.username}
                      </span>
                      {dm.participant.activity && (
                        <span className="text-[10px] text-[#949ba4] truncate">
                          Playing {dm.participant.activity.name}
                        </span>
                      )}
                    </div>

                    {dm.unreadCount > 0 && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#f23f43] text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                        {dm.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom guest identifier */}
        <div className="h-[52px] bg-[#232428] flex items-center px-3 select-none flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full ${currentUser.avatar} flex items-center justify-center text-xs font-bold text-white`}>
              {currentUser.username.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white leading-none">{currentUser.username}</span>
              <span className="text-[10px] text-[#949ba4] mt-0.5">Guest Profile</span>
            </div>
          </div>
        </div>
      </div>

      {/* CENTER WORKSPACE */}
      <div className="flex-1 flex overflow-hidden h-full">
        {activeChannelId !== 'friends_dashboard' && currentDM ? (
          /* ACTIVE DM CHAT VIEW */
          <ChatArea
            server={null}
            channel={{
              id: currentDM.id,
              name: currentDM.participant.username,
              type: 'text',
              description: `This is the beginning of your direct message history with @${currentDM.participant.username}.`
            }}
            messages={messages[currentDM.id] || []}
            onSendMessage={onSendMessage}
            currentUser={currentUser}
            isTyping={isTyping}
            typingUser={typingUser}
            onToggleMembersList={() => {}}
            showMembersList={false}
            onAddReaction={onAddReaction}
            voiceState={{
              serverId: null,
              channelId: null,
              isMuted: false,
              isDeafened: false,
              connectedUsers: [],
              activeSpeakers: []
            }}
            onJoinVoiceChannel={() => {}}
            onDisconnectVoice={() => {}}
            activeChannelId={activeChannelId}
            localStream={null}
            remoteStream={null}
            isStreaming={false}
            streamType={null}
            streams={{}}
            serverUsers={{}}
            onStartStream={() => {}}
            onStopStream={() => {}}
            onWatchStream={() => {}}
            onStopWatchingStream={() => {}}
            isWatching={false}
          />
        ) : (
          /* FRIENDS DASHBOARD VIEW */
          <div className="flex-1 bg-[#313338] flex flex-col overflow-hidden h-full">
            {/* Header toolbar */}
            <div className="h-12 border-b border-[#1f2023] flex items-center justify-between px-4 flex-shrink-0 bg-[#313338] select-none shadow-sm z-10">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                <Users size={20} className="text-[#80848e] mr-2" />
                <span className="font-bold text-white text-[15px] mr-4">Friends</span>
                <div className="w-[1px] h-4 bg-[#3f4147] mx-1 hidden sm:block" />

                <div className="flex gap-1.5 sm:gap-2">
                  {(['online', 'all', 'pending', 'blocked'] as FriendsTab[]).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1 text-xs sm:text-sm font-medium rounded-md transition-all duration-150 capitalize whitespace-nowrap ${
                        activeTab === tab
                          ? 'bg-[#404249] text-white'
                          : 'text-[#b5bac1] hover:bg-[#35373c] hover:text-[#dbdee1]'
                      }`}
                    >
                      {tab.replace('_', ' ')}
                    </button>
                  ))}
                  <button
                    onClick={() => setActiveTab('add_friend')}
                    className={`px-3 py-1 text-xs sm:text-sm font-bold rounded-md transition-all duration-150 whitespace-nowrap ${
                      activeTab === 'add_friend'
                        ? 'text-[#23a55a] bg-[#23a55a]/10'
                        : 'bg-[#23a55a] text-white hover:bg-[#1a7f43]'
                    }`}
                  >
                    Add Friend
                  </button>
                </div>
              </div>
            </div>

            {/* MAIN FRIENDS CONTAINER */}
            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {activeTab === 'add_friend' ? (
                  /* ADD FRIEND PANEL */
                  <div className="max-w-xl space-y-4">
                    <h2 className="text-white font-bold text-base uppercase tracking-wider">Add Friend</h2>
                    <p className="text-xs text-[#949ba4] leading-relaxed">
                      You can add friends with their Airhope username (e.g. <span className="font-semibold text-[#dbdee1]">AstroCoder</span>, <span className="font-semibold text-[#dbdee1]">Zenith_Gamer</span>, or <span className="font-semibold text-[#dbdee1]">Chill_Vibes</span>).
                    </p>

                    <form onSubmit={handleAddFriendSubmit} className="flex gap-3 bg-[#1e1f22] rounded-lg p-2.5 border border-[#1f2023] focus-within:border-indigo-500 transition-all duration-200">
                      <input
                        type="text"
                        placeholder="Enter a Username"
                        value={addFriendInput}
                        onChange={(e) => setAddFriendInput(e.target.value)}
                        className="bg-transparent text-sm text-white focus:outline-none flex-1 placeholder-[#949ba4]"
                      />
                      <button
                        type="submit"
                        disabled={!addFriendInput.trim()}
                        className="bg-[#5865f2] hover:bg-[#4752c4] disabled:bg-[#3f4147] disabled:cursor-not-allowed font-bold text-xs text-white px-4 py-1.5 rounded transition-all duration-150"
                      >
                        Send Request
                      </button>
                    </form>

                    {friendError && (
                      <p className="text-xs font-semibold text-[#f23f43]">{friendError}</p>
                    )}
                    {friendSuccess && (
                      <p className="text-xs font-semibold text-[#23a55a]">{friendSuccess}</p>
                    )}
                  </div>
                ) : (
                  /* FRIENDS LIST */
                  <div className="space-y-4">
                    {/* Filter bar */}
                    <div className="bg-[#1e1f22] rounded-md px-3 py-2 flex items-center max-w-md shadow-inner">
                      <input
                        type="text"
                        placeholder="Search friends..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent text-xs text-white focus:outline-none w-full placeholder-[#949ba4]"
                      />
                      <Search size={14} className="text-[#949ba4] ml-2" />
                    </div>

                    <div className="text-[#949ba4] text-xs font-bold uppercase tracking-wider px-1">
                      {activeTab.replace('_', ' ')} Friends — {filteredFriends.length}
                    </div>

                    {filteredFriends.length === 0 ? (
                      <div className="flex flex-col items-center justify-center p-8 border border-dashed border-[#404249] rounded-lg bg-[#2b2d31] text-center max-w-md select-none">
                        <Users size={40} className="text-[#4e5058] mb-3" />
                        <p className="text-xs text-[#949ba4]">No friends found in this section.</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-[#3f4147]">
                        {filteredFriends.map((fr) => (
                          <div
                            key={fr.id}
                            className="flex items-center justify-between py-2.5 hover:bg-[#2b2d31] -mx-2 px-2 rounded-lg group transition-colors duration-150"
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <div className={`w-10 h-10 rounded-full ${fr.user.avatar} flex items-center justify-center text-sm font-bold text-white shadow-sm`}>
                                  {fr.user.username.substring(0, 2).toUpperCase()}
                                </div>
                                <span
                                  className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-[#313338] rounded-full ${
                                    fr.user.status === 'online'
                                      ? 'bg-[#23a55a]'
                                      : fr.user.status === 'idle'
                                      ? 'bg-[#f0b232]'
                                      : fr.user.status === 'dnd'
                                      ? 'bg-[#f23f43]'
                                      : 'bg-[#80848e]'
                                  }`}
                                />
                              </div>

                              <div className="flex flex-col truncate">
                                <span className="text-sm font-semibold text-white truncate">
                                  {fr.user.username}
                                </span>
                                {fr.user.activity ? (
                                  <span className="text-xs text-[#949ba4] truncate font-medium">
                                    {fr.user.activity.type === 'playing' ? 'Playing' : 'Listening to'}{' '}
                                    <span className="font-semibold text-[#dbdee1]">{fr.user.activity.name}</span>
                                  </span>
                                ) : fr.user.customStatus ? (
                                  <span className="text-xs text-[#949ba4] truncate">
                                    {fr.user.customStatus}
                                  </span>
                                ) : (
                                  <span className="text-xs text-[#949ba4] capitalize">{fr.user.status}</span>
                                )}
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2">
                              {fr.relation === 'friend' && (
                                <>
                                  <button
                                    onClick={() => onStartDM(fr.user)}
                                    className="p-2 bg-[#2b2d31] hover:bg-[#1e1f22] rounded-full text-[#b5bac1] hover:text-white transition-all duration-150 shadow"
                                    title="Message"
                                  >
                                    <MessageSquare size={16} />
                                  </button>
                                  <button
                                    className="p-2 bg-[#2b2d31] hover:bg-[#1e1f22] rounded-full text-[#b5bac1] hover:text-white transition-all duration-150 shadow"
                                    title="Voice Call"
                                  >
                                    <Phone size={16} />
                                  </button>
                                </>
                              )}
                              {fr.relation === 'pending_incoming' && (
                                <button
                                  onClick={() => onStartDM(fr.user)}
                                  className="p-2 bg-[#23a55a]/10 hover:bg-[#23a55a] rounded-full text-[#23a55a] hover:text-white transition-all duration-150"
                                  title="Accept Friend Request"
                                >
                                  <UserCheck size={16} />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ACTIVE NOW RIGHT SIDEBAR PANEL */}
              <div className="w-80 bg-[#313338] border-l border-[#1f2023] hidden xl:flex flex-col p-5 select-none overflow-y-auto">
                <h3 className="text-white text-base font-bold uppercase tracking-wider mb-4">Active Now</h3>
                
                {activeNowUsers.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-[#2b2d31] border border-dashed border-[#404249] rounded-xl">
                    <Flame size={32} className="text-[#4e5058] mb-2" />
                    <h4 className="text-xs font-bold text-white mb-1">It's quiet, for now...</h4>
                    <p className="text-[11px] text-[#949ba4]">When a friend starts activity like playing games or listening to music, it will show up here!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeNowUsers.map((fr) => (
                      <div
                        key={fr.id}
                        className="bg-[#2b2d31] rounded-xl p-4 border border-[#1f2023] hover:bg-[#35373c] cursor-pointer transition-all duration-150 shadow-sm"
                        onClick={() => onStartDM(fr.user)}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="relative">
                            <div className={`w-8 h-8 rounded-full ${fr.user.avatar} flex items-center justify-center text-xs font-bold text-white shadow`}>
                              {fr.user.username.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#23a55a] border border-[#2b2d31] rounded-full" />
                          </div>

                          <div className="flex flex-col truncate">
                            <span className="text-xs font-bold text-white truncate leading-none">{fr.user.username}</span>
                            <span className="text-[9px] text-[#949ba4] mt-1 uppercase font-semibold tracking-wide">
                              Playing a Game
                            </span>
                          </div>
                        </div>

                        {fr.user.activity && (
                          <div className="bg-[#1e1f22] p-2.5 rounded-lg flex items-center gap-2.5">
                            <div className="w-10 h-10 bg-[#2b2d31] rounded flex items-center justify-center text-indigo-400 font-bold border border-[#2b2d31] shadow">
                              <Sparkles size={20} />
                            </div>
                            <div className="flex flex-col truncate flex-1">
                              <span className="text-xs font-bold text-white truncate">
                                {fr.user.activity.name}
                              </span>
                              <span className="text-[10px] text-[#949ba4] truncate mt-0.5">
                                {fr.user.activity.details || 'Active online session'}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
