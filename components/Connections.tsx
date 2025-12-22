
import React, { useState, useEffect } from 'react';
import { PLATFORMS } from '../constants';
import { storageService } from '../services/storageService';

const Connections: React.FC = () => {
  const [connectedIds, setConnectedIds] = useState<string[]>([]);

  useEffect(() => {
    setConnectedIds(storageService.getConnections());
  }, []);

  const handleToggleConnect = (platformId: string) => {
    const updated = storageService.toggleConnection(platformId);
    setConnectedIds(updated);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 md:space-y-10 animate-in slide-in-from-bottom-4 duration-500">
      <header className="px-1 text-center md:text-left">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Channel Hub</h2>
        <p className="text-slate-500 mt-1 text-sm">Connect your digital presence to synchronize your voice across platforms.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
        {PLATFORMS.map((platform) => {
          const isConfigured = !!(process.env as any)[platform.envKey];
          const isConnected = connectedIds.includes(platform.id);
          
          return (
            <div key={platform.id} className={`p-6 md:p-8 rounded-[2rem] border flex flex-col gap-6 transition-all group ${
              isConnected ? 'bg-indigo-600/5 border-indigo-500/30 shadow-2xl shadow-indigo-600/5' : 'bg-slate-900/40 border-white/5 hover:border-white/10'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-slate-950 flex items-center justify-center text-2xl md:text-3xl border border-white/5 group-hover:scale-105 transition-transform duration-500">
                      {platform.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm md:text-lg">{platform.name}</h3>
                      <p className="text-[8px] md:text-[9px] uppercase tracking-widest font-black text-slate-600">
                        {isConfigured ? 'Direct API Ready' : 'Development phase'}
                      </p>
                    </div>
                </div>
                {isConnected && (
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                )}
              </div>

              {isConfigured ? (
                <button
                  onClick={() => handleToggleConnect(platform.id)}
                  className={`w-full py-4 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs transition-all border uppercase tracking-widest ${
                    isConnected 
                      ? 'bg-slate-950 text-slate-500 border-white/5 hover:text-red-400 hover:bg-red-500/5' 
                      : 'bg-white text-black hover:bg-slate-100'
                  }`}
                >
                  {isConnected ? 'Revoke Access' : 'Authenticate'}
                </button>
              ) : (
                <div className="w-full py-4 bg-slate-950 border border-white/5 rounded-xl md:rounded-2xl flex items-center justify-center text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-slate-800">
                  Coming Soon
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-6 md:p-8 bg-slate-900/20 border border-white/5 rounded-[2rem] text-center md:text-left">
        <h4 className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-600 mb-4">Security Infrastructure</h4>
        <p className="text-[11px] md:text-xs text-slate-500 leading-relaxed max-w-2xl">
          SocialFlow AI implements enterprise-grade AES-256 encryption for all session tokens. 
          We leverage native API architectures to ensure zero-risk connectivity between our engine and your brand channels. 
          Your credentials are never stored in plain text.
        </p>
      </div>
    </div>
  );
};

export default Connections;
