import { MessageSquareCode, Plus, Sparkles } from 'lucide-react';
import { Server, DM } from '../types';

interface ServerListProps {
  servers: Server[];
  activeServerId: 'home' | string;
  onSelectServer: (id: 'home' | string) => void;
  onAddServerClick: () => void;
  dms: DM[];
}

export default function ServerList({
  servers,
  activeServerId,
  onSelectServer,
  onAddServerClick,
  dms
}: ServerListProps) {
  // Calculate total unread DMs
  const totalUnreadDMs = dms.reduce((acc, curr) => acc + curr.unreadCount, 0);

  return (
    <div className="w-[72px] bg-[#1e1f22] flex flex-col items-center py-3 gap-2 flex-shrink-0 select-none z-10">
      {/* Home / Direct Messages Button */}
      <div className="relative group flex justify-center w-full">
        {/* Left white indicator pill */}
        <div
          className={`absolute left-0 w-[4px] bg-white rounded-r-md transition-all duration-300 origin-left ${
            activeServerId === 'home'
              ? 'h-10 scale-100'
              : 'h-5 scale-0 group-hover:scale-100 group-hover:h-5'
          }`}
        />
        
        <button
          onClick={() => onSelectServer('home')}
          className={`w-12 h-12 flex items-center justify-center rounded-3xl transition-all duration-300 relative ${
            activeServerId === 'home'
              ? 'bg-[#5865f2] rounded-2xl text-white'
              : 'bg-[#313338] text-[#dbdee1] hover:bg-[#5865f2] hover:rounded-2xl hover:text-white'
          }`}
          title="Direct Messages"
        >
          <MessageSquareCode size={26} />
          {totalUnreadDMs > 0 && (
            <span className="absolute -bottom-1 -right-1 bg-[#f23f43] text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full border-[3px] border-[#1e1f22] min-w-[20px] text-center">
              {totalUnreadDMs}
            </span>
          )}
        </button>
        
        {/* Hover Tooltip */}
        <div className="absolute left-[80px] bg-[#111214] text-[#dbdee1] text-sm font-semibold px-3 py-1.5 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          Direct Messages
        </div>
      </div>

      <div className="w-8 h-[2px] bg-[#35363c] rounded my-1" />

      {/* Scrollable Server List */}
      <div className="flex-1 flex flex-col gap-2 w-full overflow-y-auto no-scrollbar items-center">
        {servers.map((server) => {
          const isActive = activeServerId === server.id;
          return (
            <div key={server.id} className="relative group flex justify-center w-full">
              {/* Left indicator pill */}
              <div
                className={`absolute left-0 w-[4px] bg-white rounded-r-md transition-all duration-300 origin-left ${
                  isActive
                    ? 'h-10 scale-100'
                    : 'h-5 scale-0 group-hover:scale-100 group-hover:h-5'
                }`}
              />

              <button
                onClick={() => onSelectServer(server.id)}
                className={`w-12 h-12 flex items-center justify-center rounded-3xl transition-all duration-300 text-lg font-bold text-white relative ${
                  isActive
                    ? 'rounded-2xl ' + server.iconBg
                    : 'bg-[#313338] hover:rounded-2xl hover:' + server.iconBg
                }`}
                title={server.name}
              >
                {server.icon}
              </button>

              {/* Hover Tooltip */}
              <div className="absolute left-[80px] bg-[#111214] text-[#dbdee1] text-sm font-semibold px-3 py-1.5 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                {server.name}
              </div>
            </div>
          );
        })}

        {/* Add Server Button */}
        <div className="relative group flex justify-center w-full mt-1">
          <button
            onClick={onAddServerClick}
            className="w-12 h-12 flex items-center justify-center bg-[#313338] text-[#23a55a] hover:bg-[#23a55a] hover:text-white rounded-3xl hover:rounded-2xl transition-all duration-300"
            title="Add a Server"
          >
            <Plus size={24} />
          </button>
          
          <div className="absolute left-[80px] bg-[#111214] text-[#dbdee1] text-sm font-semibold px-3 py-1.5 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
            Create Server
          </div>
        </div>
      </div>

      {/* Decorative Brand Tag at Bottom */}
      <div className="relative group flex justify-center w-full mt-auto pt-2">
        <div className="w-10 h-10 bg-gradient-to-tr from-[#313338] to-[#2b2d31] rounded-3xl flex items-center justify-center text-[#949ba4] hover:text-indigo-400 hover:scale-105 transition-all duration-200 cursor-pointer">
          <Sparkles size={18} />
        </div>
        <div className="absolute left-[80px] bg-[#111214] text-[#dbdee1] text-xs px-2.5 py-1.5 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          Powered by <span className="text-indigo-400 font-bold">Airhope v1.0</span>
        </div>
      </div>
    </div>
  );
}
