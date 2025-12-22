
import React from 'react';
import * as Icons from './Icons';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: any;
  onLogout: () => void;
  credits: number;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, user, onLogout, credits }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', Icon: Icons.IconDashboard },
    { id: 'generator', label: 'AI Generator', Icon: Icons.IconSparkles },
    { id: 'saved', label: 'Idea Library', Icon: Icons.IconSaved },
    { id: 'connections', label: 'Channels', Icon: Icons.IconConnections },
    { id: 'history', label: 'Analytics', Icon: Icons.IconHistory },
  ];

  return (
    <div className="hidden md:flex w-72 bg-slate-950/40 border-r border-white/5 flex-col h-full shrink-0 backdrop-blur-3xl relative z-50">
      <div className="p-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <Icons.IconSparkles />
          </div>
          <h1 className="text-xl font-black bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent tracking-tight">
            SocialFlow
          </h1>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 mt-4">
        {menuItems.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`w-full flex items-center gap-3.5 px-5 py-4 rounded-2xl transition-all duration-300 relative group ${
              activeTab === id
                ? 'bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.03)] border border-white/10'
                : 'text-slate-500 hover:bg-white/5 hover:text-white'
            }`}
          >
            <span className={`transition-transform duration-300 group-hover:scale-110 ${activeTab === id ? 'text-indigo-400' : ''}`}>
              <Icon />
            </span>
            <span className="text-sm font-bold tracking-tight uppercase tracking-[0.1em]">{label}</span>
            {activeTab === id && (
              <div className="absolute right-4 w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-[0_0_10px_#6366f1]"></div>
            )}
          </button>
        ))}
      </nav>

      <div className="p-6 space-y-4">
        {/* Credits Badge */}
        <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/10 p-5 rounded-3xl border border-indigo-500/20 shadow-inner">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Available Credits</span>
            <span className="text-xs font-bold text-white">{credits}</span>
          </div>
          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mb-4">
            <div 
              className="h-full bg-indigo-500 transition-all duration-500" 
              style={{ width: `${Math.min(100, (credits / 100) * 100)}%` }}
            ></div>
          </div>
          <button 
             onClick={() => setActiveTab('dashboard')}
             className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
          >
            Refill Wallet
          </button>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-black text-sm text-white border-2 border-white/10">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-sm font-bold truncate leading-none mb-1">{user?.name || 'User'}</p>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black">Creator Pro</p>
          </div>
        </div>
        
        <button
          onClick={onLogout}
          className="w-full py-3.5 px-3 text-[10px] font-black uppercase tracking-widest text-red-400/70 hover:text-red-400 hover:bg-red-500/5 rounded-2xl transition-all flex items-center justify-center gap-2 border border-red-500/10"
        >
          <Icons.IconLogout />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
