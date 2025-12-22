
import React, { useState, useEffect, useRef } from 'react';
import { geminiService } from '../services/geminiService';
import { PLATFORMS } from '../constants';
import { GeneratedPost } from '../types';
import { storageService } from '../services/storageService';

interface PostGeneratorProps {
  state: any;
  setState: (state: any) => void;
  onPostCreated: (post: GeneratedPost) => void;
  onIdeaSaved: (idea: any) => void;
  onShare: (title: string, text: string, url: string) => void;
  onCreditsSpent: () => void;
  credits: number;
}

const PostGenerator: React.FC<PostGeneratorProps> = ({ state, setState, onPostCreated, onIdeaSaved, onShare, onCreditsSpent, credits }) => {
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [businessType, setBusinessType] = useState<'url' | 'manual'>('url');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [isScheduling, setIsScheduling] = useState(false);
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);
  
  const GEN_COST = 10;

  // Modal states
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [showCaptionModal, setShowCaptionModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [tempCaption, setTempCaption] = useState('');
  const [tempImagePrompt, setTempImagePrompt] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setConnectedPlatforms(storageService.getConnections());
  }, []);

  const updateState = (updates: any) => {
    setState({ ...state, ...updates });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateState({
          brandData: {
            ...state.brandData,
            logoUrl: reader.result as string
          }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInitialAction = async () => {
    if (businessType === 'url') {
      if (!state.inputUrl.startsWith('http')) {
        alert('Please enter a valid URL (including https://)');
        return;
      }
      setLoading(true);
      setLoadingMsg('Scanning website for brand identity...');
      try {
        const info = await geminiService.extractBusinessInfo(state.inputUrl);
        updateState({
          brandData: {
            ...state.brandData,
            businessName: info.businessName || '',
            description: info.description || '',
            niche: info.niche || '',
            keywords: (info.keywords || []).join(', '),
            contactInfo: info.contactInfo || '',
            primaryColor: info.primaryColor?.startsWith('#') ? info.primaryColor : '#6366f1',
            logoUrl: info.logoUrl || ''
          },
          step: 2
        });
      } catch (err) {
        console.error(err);
        alert('Extraction failed. Check the URL or your API key.');
      } finally {
        setLoading(false);
      }
    } else {
      updateState({ step: 2 });
    }
  };

  const generatePosts = async () => {
    if (credits < GEN_COST) {
      alert(`Insufficient credits. Generation requires ${GEN_COST} CR.`);
      return;
    }

    setLoading(true);
    setLoadingMsg('Generating branded post strategies...');
    try {
      const info = {
        ...state.brandData,
        keywords: state.brandData.keywords.split(',').map((k: string) => k.trim())
      };

      const ideas = await geminiService.generatePostIdeas(info, 3);
      
      setLoadingMsg('Rendering professional assets...');
      const postsWithImages = await Promise.all(ideas.map(async (idea: any) => {
        const imageUrl = await geminiService.generateImage(idea.imagePrompt, info);
        // Ensure unique ID for each generated post
        return { ...idea, imageUrl, id: `post-${Date.now()}-${Math.random().toString(36).substr(2, 5)}` };
      }));

      storageService.spendCredits(GEN_COST);
      onCreditsSpent();

      updateState({
        generatedPosts: postsWithImages,
        step: 3
      });
    } catch (err) {
      console.error(err);
      alert('Generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const regeneratePostImage = async () => {
    const REGEN_COST = 2;
    if (credits < REGEN_COST) {
      alert(`Insufficient credits for image re-forge. Required: ${REGEN_COST} CR.`);
      return;
    }

    if (editingIdx === null) return;
    const post = state.generatedPosts[editingIdx];
    setLoading(true);
    setLoadingMsg('Re-crafting your unique visual...');
    try {
      const promptToUse = tempImagePrompt || post.imagePrompt;
      const newImageUrl = await geminiService.generateImage(promptToUse, state.brandData);
      
      storageService.spendCredits(REGEN_COST);
      onCreditsSpent();

      const updatedPosts = [...state.generatedPosts];
      updatedPosts[editingIdx] = { 
        ...post, 
        imageUrl: newImageUrl, 
        imagePrompt: promptToUse
      };
      
      updateState({ generatedPosts: updatedPosts });
      setShowImageModal(false);
      setEditingIdx(null);
    } catch (err) {
      alert('Failed to regenerate image.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCaptionEdit = () => {
    if (editingIdx === null) return;
    const updatedPosts = [...state.generatedPosts];
    updatedPosts[editingIdx] = { ...updatedPosts[editingIdx], caption: tempCaption };
    updateState({ generatedPosts: updatedPosts });
    setShowCaptionModal(false);
    setEditingIdx(null);
  };

  const handleFinalize = () => {
    if (state.selectedPostIndices.size === 0) return;
    if (connectedPlatforms.length === 0) return;
    if (selectedPlatforms.length === 0) return;

    state.selectedPostIndices.forEach((idx: number) => {
      const post = state.generatedPosts[idx];
      const finalPost: GeneratedPost = {
        id: `pub-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        caption: post.caption,
        imageUrl: post.imageUrl,
        status: isScheduling ? 'scheduled' : 'posted',
        scheduledTime: isScheduling ? new Date(Date.now() + 86400000).toISOString() : undefined,
        platforms: selectedPlatforms,
        createdAt: new Date().toISOString(),
        businessInfo: state.brandData
      };
      onPostCreated(finalPost);
    });

    resetForm();
  };

  const resetForm = () => {
    setState({
      step: 1,
      inputUrl: '',
      brandData: {
        businessName: '',
        description: '',
        niche: '',
        keywords: '',
        contactInfo: '',
        primaryColor: '#6366f1',
        logoUrl: ''
      },
      generatedPosts: [],
      selectedPostIndices: new Set<number>()
    });
  };

  const handleSaveForLater = (idx: number) => {
    const post = state.generatedPosts[idx];
    if (!post) return;
    
    onIdeaSaved({
      ...post,
      businessInfo: state.brandData
    });
  };

  const togglePostSelection = (idx: number) => {
    const newSet = new Set(state.selectedPostIndices);
    if (newSet.has(idx)) newSet.delete(idx);
    else newSet.add(idx);
    updateState({ selectedPostIndices: newSet });
  };

  const togglePlatform = (id: string) => {
    if (!connectedPlatforms.includes(id)) return;
    setSelectedPlatforms(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const renderPoster = (post: any, idx: number) => {
    const style = post.visualStyle || 'Editorial';
    const baseClasses = "relative aspect-square overflow-hidden bg-slate-950 transition-all duration-500 shadow-2xl group cursor-pointer";
    
    if (style === 'Editorial') {
      return (
        <div className={baseClasses} onClick={() => togglePostSelection(idx)}>
          <img src={post.imageUrl} className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700" alt="post" />
          <div className="absolute inset-0 p-4 md:p-6 flex flex-col justify-between pointer-events-none">
            <div className="flex justify-end">
              {state.brandData.logoUrl && (
                <div className="bg-white/95 backdrop-blur p-1.5 md:p-2 rounded-xl shadow-lg border border-white/50 w-10 md:w-14 h-10 md:h-14 flex items-center justify-center">
                  <img src={state.brandData.logoUrl} className="max-w-full max-h-full object-contain" />
                </div>
              )}
            </div>
            <div className="bg-black/60 backdrop-blur-md p-3 md:p-4 rounded-xl md:rounded-2xl border border-white/10">
              <p className="text-[8px] md:text-[10px] text-white/90 font-black uppercase tracking-[0.2em]">{state.brandData.businessName}</p>
              <p className="text-[7px] md:text-[8px] text-white/60 font-medium truncate mt-1">{state.brandData.contactInfo}</p>
            </div>
          </div>
        </div>
      );
    }

    if (style === 'Commercial') {
      return (
        <div className={baseClasses} onClick={() => togglePostSelection(idx)}>
          <img src={post.imageUrl} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" alt="post" />
          <div className="absolute inset-0 p-4 flex flex-col items-center justify-between pointer-events-none">
            <div className="mt-2 md:mt-4 flex flex-col items-center gap-2 md:gap-3">
               {state.brandData.logoUrl && (
                  <div className="bg-white p-1.5 md:p-2 rounded-full shadow-2xl w-10 md:w-14 h-10 md:h-14 flex items-center justify-center border-2 md:border-4 border-indigo-500/20">
                    <img src={state.brandData.logoUrl} className="max-w-full max-h-full object-contain" />
                  </div>
               )}
            </div>
            <div className="w-full bg-gradient-to-t from-black/95 to-transparent p-5 md:p-8 rounded-b-xl md:rounded-b-3xl">
              <p className="text-[8px] md:text-[10px] text-white font-black uppercase tracking-widest text-center">{state.brandData.businessName}</p>
              <p className="text-[7px] md:text-[8px] text-white/70 font-medium text-center mt-1">{state.brandData.contactInfo}</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={`${baseClasses} p-4 md:p-6 bg-white border border-slate-200 flex flex-col`} onClick={() => togglePostSelection(idx)}>
        <div className="relative w-full flex-1 overflow-hidden bg-slate-50 rounded-sm">
           <img src={post.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="post" />
        </div>
        <div className="h-14 md:h-20 flex items-center justify-between pt-3 md:pt-4 pointer-events-none">
           <div className="flex flex-col">
             <p className="text-[8px] md:text-[10px] font-black text-slate-900 uppercase tracking-tighter">{state.brandData.businessName}</p>
             <p className="text-[6px] md:text-[7px] text-slate-500 font-bold tracking-widest uppercase">{state.brandData.contactInfo}</p>
           </div>
           {state.brandData.logoUrl && (
             <img src={state.brandData.logoUrl} className="w-8 md:w-10 h-8 md:h-10 object-contain opacity-80" />
           )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] md:h-[400px] space-y-6">
        <div className="relative">
          <div className="w-16 h-16 border-2 border-white/5 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
        <div className="text-center px-6">
          <p className="text-lg font-medium tracking-tight">{loadingMsg}</p>
          <p className="text-xs text-slate-500 mt-2 uppercase tracking-widest animate-pulse">Forging Assets</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 md:space-y-12 pb-20">
      {/* Step 1: Input URL */}
      {state.step === 1 && (
        <div className="bg-slate-900/40 p-6 md:p-12 rounded-[2rem] md:rounded-[2.5rem] border border-white/5 backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-black">Creative Engine</h2>
              <p className="text-slate-500 text-[10px] mt-1 uppercase tracking-widest">Enterprise Generation Suite</p>
            </div>
            <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
              <span className="text-[10px] font-black uppercase text-indigo-400">Cost: {GEN_COST} CR</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-8">
            <button
              onClick={() => setBusinessType('url')}
              className={`flex-1 py-4 md:py-5 px-6 rounded-2xl font-black border transition-all flex items-center justify-center gap-3 uppercase text-[10px] tracking-widest ${
                businessType === 'url' ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl' : 'bg-slate-950 border-white/5 text-slate-500'
              }`}
            >
              🌐 AI Scan
            </button>
            <button
              onClick={() => setBusinessType('manual')}
              className={`flex-1 py-4 md:py-5 px-6 rounded-2xl font-black border transition-all flex items-center justify-center gap-3 uppercase text-[10px] tracking-widest ${
                businessType === 'manual' ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl' : 'bg-slate-950 border-white/5 text-slate-500'
              }`}
            >
              📝 Manual
            </button>
          </div>

          <div className="space-y-4">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Business Identifier</label>
            <input
              type="text"
              value={state.inputUrl}
              onChange={(e) => updateState({ inputUrl: e.target.value })}
              placeholder="https://your-brand.com"
              disabled={businessType === 'manual'}
              className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 md:px-6 py-4 md:py-5 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-700 disabled:opacity-30"
            />
          </div>

          <button
            onClick={handleInitialAction}
            className="w-full mt-8 md:mt-10 bg-white text-black hover:bg-slate-200 font-black py-5 md:py-6 rounded-2xl transition-all shadow-2xl active:scale-[0.98] uppercase tracking-[0.2em] text-xs md:text-sm"
          >
            {businessType === 'url' ? 'Launch Analysis' : 'Define Brand'}
          </button>
        </div>
      )}

      {/* Step 2: Branding Setup */}
      {state.step === 2 && (
        <div className="bg-slate-900/40 p-6 md:p-12 rounded-[2rem] md:rounded-[2.5rem] border border-white/5 backdrop-blur-md animate-in slide-in-from-right-4 duration-500">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
            <h2 className="text-2xl md:text-3xl font-black">Verification</h2>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                <span className="text-[9px] font-black uppercase text-indigo-400">Gen Cost: {GEN_COST} CR</span>
              </div>
              <button onClick={() => updateState({ step: 1 })} className="text-slate-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.2em] border border-white/5 px-4 py-2 rounded-full">← Back</button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
            <div className="space-y-8">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Identity Signature</label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-xl">
                    {state.brandData.logoUrl ? (
                      <img src={state.brandData.logoUrl} className="max-w-full max-h-full object-contain p-3" />
                    ) : (
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Empty</span>
                    )}
                  </div>
                  <div className="flex-1 w-full space-y-3">
                    <input
                      type="text"
                      value={state.brandData.logoUrl}
                      onChange={(e) => updateState({ brandData: { ...state.brandData, logoUrl: e.target.value } })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-[10px] outline-none font-mono"
                      placeholder="Logo URL"
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300"
                    >
                      Browse Files
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleLogoUpload} className="hidden" accept="image/*" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Brand Name</label>
                  <input
                    type="text"
                    value={state.brandData.businessName}
                    onChange={(e) => updateState({ brandData: { ...state.brandData, businessName: e.target.value } })}
                    className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-500/30 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Brand Color</label>
                  <div className="flex gap-4">
                    <input 
                      type="color" 
                      value={state.brandData.primaryColor} 
                      onChange={(e) => updateState({ brandData: { ...state.brandData, primaryColor: e.target.value } })} 
                      className="w-14 h-14 bg-transparent border-none cursor-pointer rounded-xl" 
                    />
                    <input 
                      type="text" 
                      value={state.brandData.primaryColor} 
                      onChange={(e) => updateState({ brandData: { ...state.brandData, primaryColor: e.target.value } })} 
                      className="flex-1 bg-slate-950 border border-white/10 rounded-2xl px-5 py-4 outline-none font-mono text-xs" 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Contact Payload</label>
                <input
                  type="text"
                  value={state.brandData.contactInfo}
                  onChange={(e) => updateState({ brandData: { ...state.brandData, contactInfo: e.target.value } })}
                  placeholder="e.g. hello@brand.com"
                  className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Brand Description</label>
                <textarea
                  value={state.brandData.description}
                  onChange={(e) => updateState({ brandData: { ...state.brandData, description: e.target.value } })}
                  className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 outline-none h-32 resize-none text-sm leading-relaxed"
                ></textarea>
              </div>
            </div>
          </div>

          <button
            disabled={credits < GEN_COST}
            onClick={generatePosts}
            className={`w-full mt-12 font-black py-5 md:py-6 rounded-2xl shadow-xl transition-all uppercase tracking-[0.2em] text-xs md:text-sm ${
              credits >= GEN_COST 
                ? 'bg-indigo-600 text-white hover:bg-indigo-500' 
                : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
            }`}
          >
            {credits >= GEN_COST ? 'Consume Credits & Generate' : 'Insufficient Credits'}
          </button>
        </div>
      )}

      {/* Step 3: Generated Deliverables */}
      {state.step === 3 && (
        <div className="space-y-12 animate-in slide-in-from-right-4 duration-500 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-black">AI Outputs</h2>
              <p className="text-slate-500 mt-2 text-sm md:text-lg">Individually styled assets with deterministic branding.</p>
            </div>
            <button onClick={() => updateState({ step: 2 })} className="text-slate-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.2em] border border-white/5 px-6 py-3 rounded-full">← Settings</button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
            {state.generatedPosts.map((post: any, idx: number) => (
              <div 
                key={post.id || idx}
                className={`flex flex-col group rounded-[2rem] md:rounded-[2.5rem] border transition-all duration-500 overflow-hidden bg-slate-900/40 relative z-20 ${
                  state.selectedPostIndices.has(idx) ? 'border-indigo-500 ring-8 ring-indigo-500/10 scale-[1.02]' : 'border-white/5'
                }`}
              >
                <div className="relative">
                  {renderPoster(post, idx)}
                  
                  {state.selectedPostIndices.has(idx) && (
                    <div className="absolute top-4 left-4 bg-indigo-600 text-white w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-2xl border-2 border-white/20 z-10 pointer-events-none">✓</div>
                  )}

                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                     <button 
                       onClick={(e) => {
                         e.stopPropagation();
                         setEditingIdx(idx);
                         setTempImagePrompt(post.imagePrompt);
                         setShowImageModal(true);
                       }}
                       className="p-3 md:p-4 bg-white/10 backdrop-blur-xl rounded-2xl text-white border border-white/10 hover:bg-white/20 transition-all flex items-center gap-2 text-[8px] md:text-[10px] font-black uppercase tracking-[0.1em]"
                     >
                       🔄 Re-Forge Image (2 CR)
                     </button>
                  </div>
                </div>

                <div className="p-6 md:p-8 flex-1 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-black uppercase tracking-[0.1em] text-indigo-400">Caption Package</span>
                       <div className="flex gap-4">
                          <button 
                            onClick={() => {
                              setEditingIdx(idx);
                              setTempCaption(post.caption);
                              setShowCaptionModal(true);
                            }}
                            className="text-slate-400 hover:text-white text-[10px] font-black uppercase"
                          >
                            Edit ✏️
                          </button>
                          <button 
                            onClick={() => onShare(state.brandData.businessName, post.caption, post.imageUrl)}
                            className="text-indigo-400 hover:text-indigo-300 text-[10px] font-black uppercase"
                          >
                            Share 📤
                          </button>
                       </div>
                    </div>
                    <div className="bg-slate-950/50 p-5 md:p-6 rounded-2xl md:rounded-3xl border border-white/5 font-medium text-xs md:text-sm text-slate-300 leading-relaxed max-h-[180px] md:max-h-[250px] overflow-y-auto custom-scrollbar">
                      <p className="whitespace-pre-wrap">{post.caption}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 relative z-30">
                    <button 
                      onClick={() => handleSaveForLater(idx)}
                      className="flex-1 py-4 text-[10px] font-black uppercase tracking-[0.1em] bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all text-slate-400 cursor-pointer"
                    >
                      💾 Save
                    </button>
                    <button 
                      onClick={() => togglePostSelection(idx)}
                      className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.1em] rounded-2xl transition-all border cursor-pointer ${
                        state.selectedPostIndices.has(idx) ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-950 border-white/5 text-slate-600'
                      }`}
                    >
                      {state.selectedPostIndices.has(idx) ? 'Deselect' : 'Select'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {state.selectedPostIndices.size > 0 && (
            <div className="bg-indigo-600/10 p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] border border-indigo-500/30 animate-in fade-in duration-300 backdrop-blur-xl">
              <h3 className="text-xl md:text-2xl font-black mb-8 uppercase tracking-widest text-indigo-300 text-center lg:text-left">Post Orchestration</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16">
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Target Channels</h3>
                    {connectedPlatforms.length === 0 ? (
                      <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-black text-center uppercase">
                        ⚠️ Connect Social Accounts via Hub first.
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2 md:gap-4 justify-center lg:justify-start">
                        {PLATFORMS.filter(p => connectedPlatforms.includes(p.id)).map(p => (
                          <button
                            key={p.id}
                            onClick={() => togglePlatform(p.id)}
                            className={`px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-[10px] border transition-all uppercase tracking-widest ${
                              selectedPlatforms.includes(p.id) ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' : 'bg-slate-950 border-white/10 text-slate-600'
                            }`}
                          >
                            {p.icon} {p.name}
                          </button>
                        ))}
                      </div>
                    )}
                </div>

                <div className="space-y-8">
                  <div className="flex items-center justify-between p-5 md:p-6 bg-slate-950/50 rounded-2xl md:rounded-3xl border border-white/5">
                    <div>
                      <span className="font-black text-[10px] md:text-sm uppercase tracking-widest">Schedule Queue</span>
                      <p className="text-[8px] md:text-[10px] text-slate-500 uppercase mt-1">Smart Distribution</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={isScheduling} onChange={e => setIsScheduling(e.target.checked)} />
                      <div className="w-12 h-6 md:w-14 md:h-7 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 md:after:h-6 after:w-5 md:after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <button
                    disabled={connectedPlatforms.length === 0 || selectedPlatforms.length === 0}
                    onClick={handleFinalize}
                    className="w-full py-5 md:py-6 bg-white text-black hover:bg-slate-100 disabled:opacity-20 font-black rounded-2xl md:rounded-3xl shadow-2xl transition-all uppercase tracking-[0.2em] text-xs md:text-sm"
                  >
                    {isScheduling ? `Queue ${state.selectedPostIndices.size} Updates` : `Fire ${state.selectedPostIndices.size} Live Posts`}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODALS - Fixed for full coverage */}
      {showCaptionModal && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-slate-950/98 backdrop-blur-2xl animate-in fade-in duration-200 p-0 md:p-12">
          <div className="bg-slate-900 border border-white/10 w-full h-full md:h-auto max-w-2xl md:rounded-[3rem] p-6 md:p-12 shadow-2xl space-y-6 md:space-y-8 animate-in zoom-in-95 duration-200 flex flex-col md:max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center flex-shrink-0 pt-6 md:pt-0">
              <div>
                <h3 className="text-xl md:text-2xl font-black uppercase tracking-widest">Refine Messaging</h3>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1 text-indigo-400">Content Control</p>
              </div>
              <button onClick={() => setShowCaptionModal(false)} className="text-slate-500 hover:text-white transition-colors text-2xl p-2">✕</button>
            </div>
            
            <textarea
              value={tempCaption}
              onChange={(e) => setTempCaption(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-2xl md:rounded-3xl p-6 md:p-8 text-sm text-slate-200 flex-1 outline-none focus:ring-4 focus:ring-indigo-500/10 resize-none leading-relaxed font-medium"
            />

            <div className="flex gap-4 flex-shrink-0 pb-12 md:pb-0">
              <button
                onClick={() => setShowCaptionModal(false)}
                className="flex-1 py-4 md:py-5 bg-slate-800 text-slate-500 font-black rounded-xl md:rounded-2xl hover:bg-slate-700 transition-all uppercase tracking-widest text-[10px]"
              >
                Discard
              </button>
              <button
                onClick={handleSaveCaptionEdit}
                className="flex-[2] py-4 md:py-5 bg-white text-black font-black rounded-xl md:rounded-2xl hover:bg-slate-100 transition-all uppercase tracking-widest text-[10px] shadow-2xl"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {showImageModal && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-slate-950/98 backdrop-blur-2xl animate-in fade-in duration-200 p-0 md:p-12">
          <div className="bg-slate-900 border border-white/10 w-full h-full md:h-auto max-w-2xl md:rounded-[3rem] p-6 md:p-12 shadow-2xl space-y-6 md:space-y-8 animate-in zoom-in-95 duration-200 flex flex-col md:max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center flex-shrink-0 pt-6 md:pt-0">
              <div>
                <h3 className="text-xl md:text-2xl font-black uppercase tracking-widest text-indigo-400">Regenerate Asset</h3>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Creative Override</p>
              </div>
              <button onClick={() => setShowImageModal(false)} className="text-slate-500 hover:text-white transition-colors text-2xl p-2">✕</button>
            </div>
            
            <div className="space-y-6 overflow-y-auto flex-1 pr-1 custom-scrollbar">
              <div className="p-4 md:p-6 bg-slate-950/50 rounded-2xl md:rounded-3xl border border-white/5">
                <p className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-600 mb-2">Original Context</p>
                <p className="text-[10px] md:text-xs text-slate-500 italic leading-relaxed">"{state.generatedPosts[editingIdx!]?.imagePrompt}"</p>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Creative Direction</label>
                <textarea
                  value={tempImagePrompt}
                  onChange={(e) => setTempImagePrompt(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-2xl md:rounded-3xl p-6 md:p-8 text-sm text-slate-200 h-40 outline-none focus:ring-4 focus:ring-indigo-500/10 resize-none leading-relaxed font-medium"
                  placeholder="Describe your vision..."
                />
              </div>
              <div className="p-4 md:p-6 bg-indigo-500/5 rounded-xl border border-indigo-500/10">
                <p className="text-[8px] md:text-[9px] text-indigo-400 font-bold uppercase leading-tight tracking-widest">Re-forge cost: 2 CR</p>
              </div>
            </div>

            <div className="flex gap-4 flex-shrink-0 pt-4 pb-12 md:pb-0">
              <button
                onClick={() => setShowImageModal(false)}
                className="flex-1 py-4 md:py-5 bg-slate-800 text-slate-500 font-black rounded-xl md:rounded-2xl hover:bg-slate-700 transition-all uppercase tracking-widest text-[10px]"
              >
                Abort
              </button>
              <button
                onClick={regeneratePostImage}
                disabled={credits < 2}
                className="flex-[2] py-4 md:py-5 bg-indigo-600 text-white font-black rounded-xl md:rounded-2xl hover:bg-indigo-500 transition-all uppercase tracking-widest text-[10px] shadow-2xl disabled:opacity-20"
              >
                {credits >= 2 ? 'Apply AI Re-Forge' : 'Insufficient Credits'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostGenerator;
