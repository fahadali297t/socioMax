
import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { PLATFORMS } from '../constants';
import { GeneratedPost } from '../types';

interface SavedPostsProps {
  savedIdeas: any[];
  onDelete: (id: string) => void;
  onPostNow: (post: GeneratedPost) => void;
  onShare: (title: string, text: string, url: string) => void;
}

const SavedPosts: React.FC<SavedPostsProps> = ({ savedIdeas, onDelete, onPostNow, onShare }) => {
  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);

  useEffect(() => {
    setConnectedPlatforms(storageService.getConnections());
  }, []);

  const handlePostSubmit = () => {
    if (!selectedIdea || selectedPlatforms.length === 0) return;
    
    const finalPost: GeneratedPost = {
      id: `saved-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      caption: selectedIdea.caption,
      imageUrl: selectedIdea.imageUrl,
      status: 'posted',
      platforms: selectedPlatforms,
      createdAt: new Date().toISOString(),
      businessInfo: selectedIdea.businessInfo
    };
    
    onPostNow(finalPost);
    setSelectedIdea(null);
    setSelectedPlatforms([]);
  };

  const togglePlatform = (id: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const renderPoster = (idea: any) => {
    const style = idea.visualStyle || 'Editorial';
    const brand = idea.businessInfo || {};
    const baseClasses = "relative aspect-square overflow-hidden bg-slate-950 transition-all duration-500 shadow-2xl group";
    
    if (style === 'Editorial') {
      return (
        <div className={baseClasses}>
          <img src={idea.imageUrl} className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700" alt="post" />
          <div className="absolute inset-0 p-4 md:p-6 flex flex-col justify-between pointer-events-none">
            <div className="flex justify-end">
              {brand.logoUrl && (
                <div className="bg-white/95 backdrop-blur p-1.5 md:p-2 rounded-xl shadow-lg border border-white/50 w-10 md:w-14 h-10 md:h-14 flex items-center justify-center">
                  <img src={brand.logoUrl} className="max-w-full max-h-full object-contain" />
                </div>
              )}
            </div>
            <div className="bg-black/60 backdrop-blur-md p-3 md:p-4 rounded-xl md:rounded-2xl border border-white/10">
              <p className="text-[8px] md:text-[10px] text-white/90 font-black uppercase tracking-[0.2em]">{brand.businessName}</p>
              <p className="text-[7px] md:text-[8px] text-white/60 font-medium truncate mt-1">{brand.contactInfo}</p>
            </div>
          </div>
        </div>
      );
    }

    if (style === 'Commercial') {
      return (
        <div className={baseClasses}>
          <img src={idea.imageUrl} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" alt="post" />
          <div className="absolute inset-0 p-4 flex flex-col items-center justify-between pointer-events-none">
            <div className="mt-2 md:mt-4 flex flex-col items-center gap-2 md:gap-3">
               {brand.logoUrl && (
                  <div className="bg-white p-1.5 md:p-2 rounded-full shadow-2xl w-10 md:w-14 h-10 md:h-14 flex items-center justify-center border-2 md:border-4 border-indigo-500/20">
                    <img src={brand.logoUrl} className="max-w-full max-h-full object-contain" />
                  </div>
               )}
            </div>
            <div className="w-full bg-gradient-to-t from-black/95 to-transparent p-5 md:p-8 rounded-b-xl md:rounded-b-3xl">
              <p className="text-[8px] md:text-[10px] text-white font-black uppercase tracking-widest text-center">{brand.businessName}</p>
              <p className="text-[7px] md:text-[8px] text-white/70 font-medium text-center mt-1">{brand.contactInfo}</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={`${baseClasses} p-4 md:p-6 bg-white border border-slate-200 flex flex-col`}>
        <div className="relative w-full flex-1 overflow-hidden bg-slate-50 rounded-sm">
           <img src={idea.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="post" />
        </div>
        <div className="h-14 md:h-20 flex items-center justify-between pt-3 md:pt-4 pointer-events-none">
           <div className="flex flex-col">
             <p className="text-[8px] md:text-[10px] font-black text-slate-900 uppercase tracking-tighter">{brand.businessName}</p>
             <p className="text-[6px] md:text-[7px] text-slate-500 font-bold tracking-widest uppercase">{brand.contactInfo}</p>
           </div>
           {brand.logoUrl && (
             <img src={brand.logoUrl} className="w-8 md:w-10 h-8 md:h-10 object-contain opacity-80" />
           )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="px-1">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Idea Library</h2>
        <p className="text-slate-500 mt-1 text-sm">Ready-to-use branded content templates.</p>
      </header>

      {savedIdeas.length === 0 ? (
        <div className="h-[50vh] md:h-[400px] border-2 border-dashed border-white/5 rounded-[2rem] flex flex-col items-center justify-center p-6 text-center space-y-4">
          <span className="text-4xl">🗃️</span>
          <p className="text-slate-500 italic text-xs md:text-sm max-w-sm">No saved ideas yet. Generate some posts with branding to start your collection.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {savedIdeas.map((idea) => (
            <div key={idea.id} className="group bg-slate-900/40 border border-white/5 rounded-[2rem] overflow-hidden hover:border-indigo-500/40 transition-all flex flex-col shadow-xl">
              {renderPoster(idea)}
              
              <div className="p-6 md:p-8 flex-1 flex flex-col justify-between space-y-6">
                <div>
                   <div className="flex justify-between items-center mb-3">
                     <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] truncate mr-4">{idea.businessInfo?.businessName || 'Template'}</h4>
                     <button 
                       onClick={() => onShare(idea.businessInfo?.businessName || 'Social Post', idea.caption, idea.imageUrl)}
                       className="text-[9px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest whitespace-nowrap"
                     >
                       Share 📤
                     </button>
                   </div>
                   <p className="text-xs md:text-sm text-slate-300 leading-relaxed line-clamp-6 md:line-clamp-none">
                     {idea.caption}
                   </p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      if (connectedPlatforms.length === 0) {
                        alert('Connect a channel first in the Hub.');
                        return;
                      }
                      setSelectedIdea(idea);
                    }}
                    className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-all"
                  >
                    Post Now
                  </button>
                  <button 
                    onClick={() => onDelete(idea.id)}
                    className="px-4 py-4 text-red-500/60 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all border border-white/5"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Post Modal - Full Coverage */}
      {selectedIdea && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-slate-950/98 backdrop-blur-2xl animate-in fade-in duration-200 p-0 md:p-12">
          <div className="bg-slate-900 border border-white/10 w-full h-full md:h-auto max-w-lg md:rounded-[2.5rem] p-6 md:p-10 shadow-2xl space-y-8 animate-in zoom-in-95 duration-200 overflow-y-auto md:max-h-[90vh]">
            <div className="flex justify-between items-center pt-6 md:pt-0">
              <div>
                <h3 className="text-xl font-bold uppercase tracking-widest text-white">Deploy Asset</h3>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1 text-indigo-400">Direct Platform Injector</p>
              </div>
              <button onClick={() => setSelectedIdea(null)} className="text-slate-500 hover:text-white transition-colors text-2xl p-2">✕</button>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 p-4 md:p-6 bg-slate-950/50 rounded-2xl border border-white/5">
              <img src={selectedIdea.imageUrl} className="w-full sm:w-24 h-40 sm:h-24 rounded-xl object-cover flex-shrink-0" />
              <div className="flex-1 overflow-hidden">
                 <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-5 sm:line-clamp-4 italic">
                   "{selectedIdea.caption}"
                 </p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Destination Channels</h4>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.filter(p => connectedPlatforms.includes(p.id)).map(p => (
                  <button
                    key={p.id}
                    onClick={() => togglePlatform(p.id)}
                    className={`px-4 py-3 rounded-xl text-[9px] font-black border transition-all uppercase tracking-widest ${
                      selectedPlatforms.includes(p.id) ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' : 'bg-slate-950 border-white/5 text-slate-600'
                    }`}
                  >
                    {p.icon} {p.name}
                  </button>
                ))}
              </div>
              {selectedPlatforms.length === 0 && (
                <p className="text-[10px] text-amber-500/80 font-bold uppercase text-center">Select active channel</p>
              )}
            </div>

            <button
              onClick={handlePostSubmit}
              disabled={selectedPlatforms.length === 0}
              className="w-full py-5 bg-white text-black font-black rounded-2xl disabled:opacity-20 hover:bg-slate-100 transition-all uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-white/5 mb-12 md:mb-0"
            >
              Confirm Deployment
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedPosts;
