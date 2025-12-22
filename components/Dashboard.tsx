
import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { INITIAL_DASHBOARD_STATS } from '../constants';
import { storageService } from '../services/storageService';

const chartData = [
  { name: 'Mon', engagement: 400, reach: 2400 },
  { name: 'Tue', engagement: 300, reach: 1398 },
  { name: 'Wed', engagement: 600, reach: 9800 },
  { name: 'Thu', engagement: 278, reach: 3908 },
  { name: 'Fri', engagement: 189, reach: 4800 },
  { name: 'Sat', engagement: 839, reach: 3800 },
  { name: 'Sun', engagement: 349, reach: 4300 },
];

const pieData = [
  { name: 'Images', value: 45, color: '#6366f1' },
  { name: 'Videos', value: 25, color: '#818cf8' },
  { name: 'Carousel', value: 30, color: '#4f46e5' },
];

const Dashboard: React.FC<{ onCreditsUpdate: () => void }> = ({ onCreditsUpdate }) => {
  const [credits, setCredits] = useState(storageService.getCredits());

  const handleBuyCredits = (amount: number) => {
    const updated = storageService.setCredits(credits + amount);
    setCredits(updated);
    onCreditsUpdate();
    alert(`Successfully added ${amount} credits to your wallet!`);
  };

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight">Intelligence</h2>
          <p className="text-slate-500 mt-1 text-sm md:text-base">Real-time performance metrics and credit management.</p>
        </div>
        <div className="flex items-center gap-3 bg-slate-900/50 p-3 rounded-2xl border border-white/5">
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Wallet</p>
            <p className="text-lg font-bold text-indigo-400">{credits} CR</p>
          </div>
          <button 
            onClick={() => handleBuyCredits(100)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-500 transition-all"
          >
            Refill
          </button>
        </div>
      </header>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {INITIAL_DASHBOARD_STATS.map((stat, idx) => (
          <div key={idx} className="bg-slate-900/40 p-6 rounded-3xl border border-white/5 hover:border-indigo-500/20 transition-all group">
            <p className="text-slate-500 text-[10px] uppercase font-black tracking-[0.2em]">{stat.label}</p>
            <div className="flex items-end justify-between mt-4">
              <h3 className="text-2xl md:text-3xl font-black group-hover:scale-105 transition-transform origin-left">{stat.value}</h3>
              <span className={`text-[10px] font-black px-3 py-1 rounded-full bg-slate-950 border border-white/5 ${stat.color}`}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* Large Chart */}
        <div className="lg:col-span-2 bg-slate-900/40 p-6 md:p-8 rounded-[2.5rem] border border-white/5">
          <div className="flex justify-between items-center mb-8">
            <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">Reach Projection</h4>
            <div className="flex gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              <span className="w-2 h-2 rounded-full bg-slate-700"></span>
            </div>
          </div>
          <div className="h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="name" stroke="#ffffff20" fontSize={10} axisLine={false} tickLine={false} dy={10} />
                <YAxis stroke="#ffffff20" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#020617', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="reach" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorReach)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Content Mix Widget */}
        <div className="bg-slate-900/40 p-6 md:p-8 rounded-[2.5rem] border border-white/5 flex flex-col items-center">
          <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 self-start mb-6">Content DNA</h4>
          <div className="h-48 md:h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#020617', border: 'none', borderRadius: '12px', fontSize: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full space-y-3 mt-4">
            {pieData.map(item => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">{item.name}</span>
                </div>
                <span className="text-xs font-black">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Best Time to Post Widget */}
        <div className="bg-slate-900/40 p-6 md:p-8 rounded-[2.5rem] border border-white/5">
          <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6">Peak Engagement</h4>
          <div className="space-y-4">
            {[
              { day: 'Friday', time: '18:00 - 21:00', score: 98 },
              { day: 'Monday', time: '08:00 - 10:00', score: 82 },
              { day: 'Wednesday', time: '12:00 - 14:00', score: 75 }
            ].map(item => (
              <div key={item.day} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-xs font-bold">
                  {item.score}%
                </div>
                <div className="flex-1">
                  <p className="text-xs font-black uppercase tracking-wider">{item.day}</p>
                  <p className="text-[10px] text-slate-500 font-bold">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Feed Widget */}
        <div className="lg:col-span-2 bg-slate-900/40 p-6 md:p-8 rounded-[2.5rem] border border-white/5">
          <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6">Live Pipeline</h4>
          <div className="space-y-6">
            {[
              { type: 'Post Published', target: 'LinkedIn', time: '12 mins ago', status: 'Success' },
              { type: 'Credit Top-up', target: '+100 CR', time: '1 hour ago', status: 'System' },
              { type: 'AI Generation', target: '3 Assets', time: '2 hours ago', status: 'Consumed' },
            ].map((activity, i) => (
              <div key={i} className="flex items-center justify-between pb-4 border-b border-white/5 last:border-0">
                <div className="flex gap-4 items-center">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366f1]"></div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide">{activity.type}</p>
                    <p className="text-[10px] text-slate-500 font-medium">{activity.target}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{activity.status}</p>
                  <p className="text-[9px] text-slate-600 font-bold uppercase">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
