
import React from 'react';
import * as Icons from './Icons';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Home', Icon: Icons.IconDashboard },
    { id: 'saved', label: 'Ideas', Icon: Icons.IconSaved },
    { id: 'connections', label: 'Hub', Icon: Icons.IconConnections },
    { id: 'history', label: 'Log', Icon: Icons.IconHistory },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-950/80 border-t border-white/10 backdrop-blur-2xl z-[100] flex justify-between items-center px-4 py-3 pb-8">
      {/* First 2 items */}
      <div className="flex flex-1 justify-around">
        {menuItems.slice(0, 2).map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeTab === id ? 'text-indigo-400' : 'text-slate-500'
            }`}
          >
            <Icon />
            <span className="text-[9px] font-black uppercase tracking-tighter">{label}</span>
          </button>
        ))}
      </div>

      {/* Primary Action Button */}
      <div className="relative -top-8 mx-4">
        <button
          onClick={() => setActiveTab('generator')}
          className={`w-16 h-16 rounded-full bg-indigo-600 shadow-[0_0_30px_rgba(99,102,241,0.4)] flex items-center justify-center border-4 border-slate-950 transition-all active:scale-90 ${
            activeTab === 'generator' ? 'bg-white text-indigo-600' : 'text-white'
          }`}
        >
          <Icons.IconPlus />
        </button>
      </div>

      {/* Last 2 items */}
      <div className="flex flex-1 justify-around">
        {menuItems.slice(2, 4).map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeTab === id ? 'text-indigo-400' : 'text-slate-500'
            }`}
          >
            <Icon />
            <span className="text-[9px] font-black uppercase tracking-tighter">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
