import { User } from '../types';

interface MemberListProps {
  serverId: string;
  serverUsers: Record<string, User>;
  currentUser: User;
  onUserClick: (user: User) => void;
}

export default function MemberList({ serverId, serverUsers, currentUser, onUserClick }: MemberListProps) {
  // Convert serverUsers object to list
  const allUsers = Object.values(serverUsers || {});

  // Identify simulated/bot/offline mock IDs
  const mockUserIds = ['u_hope_bot', 'u_zenith_gamer', 'u_astro_coder', 'u_chill_vibes', 'u_pixel_queen', 'u_matrix_neo', 'u_me'];

  // Detect if there are other REAL users currently registered (not the local user, and not in mock IDs)
  const otherRealUsers = allUsers.filter(u => 
    u.id !== currentUser.id && 
    !mockUserIds.includes(u.id) &&
    !u.isBot
  );
  
  const hasRealUsers = otherRealUsers.length > 0;

  // Get members belonging to this specific server
  const getMembersForServer = (id: string): User[] => {
    // If there are real users using the app, strictly remove all bots and AI personas
    if (hasRealUsers) {
      return allUsers.filter(u => 
        !u.isBot && 
        !mockUserIds.includes(u.id) || u.id === currentUser.id
      );
    }

    // Otherwise, show simulated users to keep the server feeling active when testing alone
    if (id === 's_gamers') {
      return allUsers.filter(u => u.id !== 'u_hope_bot' && u.id !== 'u_astro_coder'); // Gamers focus
    } else if (id === 's_creatives') {
      return allUsers.filter(u => u.id !== 'u_hope_bot' && u.id !== 'u_zenith_gamer'); // Creative/chill focus
    }
    return allUsers; // All users for Airhope Official
  };

  const members = getMembersForServer(serverId);

  // Group members
  const bots = members.filter(m => m.isBot);
  const online = members.filter(m => !m.isBot && m.status !== 'offline');
  const offline = members.filter(m => !m.isBot && m.status === 'offline');

  const renderMemberRow = (member: User) => {
    // Determine status color dot
    let statusColor = 'bg-[#23a55a]'; // online
    if (member.status === 'idle') statusColor = 'bg-[#f0b232]';
    if (member.status === 'dnd') statusColor = 'bg-[#f23f43]';
    if (member.status === 'offline') statusColor = 'bg-[#80848e]';

    return (
      <button
        key={member.id}
        onClick={() => onUserClick(member)}
        className="w-full flex items-center gap-3 px-2 py-1.5 rounded hover:bg-[#35373c] transition-colors duration-150 group text-left"
      >
        <div className="relative">
          <div className={`w-8 h-8 rounded-full ${member.avatar} flex items-center justify-center text-xs font-bold text-white`}>
            {member.username.substring(0, 2).toUpperCase()}
          </div>
          <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-[3px] border-[#2b2d31] rounded-full ${statusColor}`} />
        </div>

        <div className="flex flex-col truncate">
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium text-[#dbdee1] group-hover:text-white truncate">
              {member.username}
            </span>
            {member.isBot && (
              <span className="bg-[#5865f2] text-white text-[9px] font-extrabold px-1 py-0.5 rounded uppercase leading-none">
                Bot
              </span>
            )}
          </div>

          {/* Subtext for Custom Status or Playing Game */}
          {member.activity ? (
            <span className="text-xs text-[#949ba4] truncate mt-0.5">
              {member.activity.type === 'playing' && 'Playing '}
              {member.activity.type === 'listening' && 'Listening to '}
              {member.activity.type === 'streaming' && 'Streaming '}
              <span className="font-semibold">{member.activity.name}</span>
            </span>
          ) : member.customStatus ? (
            <span className="text-xs text-[#949ba4] truncate mt-0.5">
              {member.customStatus}
            </span>
          ) : null}
        </div>
      </button>
    );
  };

  return (
    <div className="w-60 bg-[#2b2d31] hidden lg:flex flex-col flex-shrink-0 py-4 px-2 overflow-y-auto select-none border-l border-[#1f2023]">
      {/* ONLINE SECTION */}
      {online.length > 0 && (
        <div className="mb-4">
          <h2 className="text-[#949ba4] text-xs font-bold uppercase tracking-wider px-2 mb-1">
            Online — {online.length}
          </h2>
          <div className="space-y-0.5">{online.map(renderMemberRow)}</div>
        </div>
      )}

      {/* BOTS SECTION */}
      {bots.length > 0 && (
        <div className="mb-4">
          <h2 className="text-[#949ba4] text-xs font-bold uppercase tracking-wider px-2 mb-1">
            Bots — {bots.length}
          </h2>
          <div className="space-y-0.5">{bots.map(renderMemberRow)}</div>
        </div>
      )}

      {/* OFFLINE SECTION */}
      {offline.length > 0 && (
        <div className="mb-4">
          <h2 className="text-[#949ba4] text-xs font-bold uppercase tracking-wider px-2 mb-1">
            Offline — {offline.length}
          </h2>
          <div className="space-y-0.5">{offline.map(renderMemberRow)}</div>
        </div>
      )}
    </div>
  );
}
