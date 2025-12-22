
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import Dashboard from './components/Dashboard';
import PostGenerator from './components/PostGenerator';
import Connections from './components/Connections';
import History from './components/History';
import SavedPosts from './components/SavedPosts';
import Auth from './components/Auth';
import Notification from './components/Notification';
import { GeneratedPost } from './types';
import { storageService } from './services/storageService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [history, setHistory] = useState<GeneratedPost[]>([]);
  const [savedIdeas, setSavedIdeas] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [credits, setCredits] = useState(storageService.getCredits());
  const [isLoaded, setIsLoaded] = useState(false);
  
  const [generatorState, setGeneratorState] = useState<any>({
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

  const [notification, setNotification] = useState<{message: string, isOpen: boolean, type: 'success' | 'error' | 'info'}>({
    message: '',
    isOpen: false,
    type: 'success'
  });

  useEffect(() => {
    const activeUser = storageService.getActiveUser();
    if (activeUser) {
      setUser(activeUser);
    }
    setHistory(storageService.getPosts());
    setSavedIdeas(storageService.getSavedIdeas());
    setCredits(storageService.getCredits());
    setIsLoaded(true);
  }, []);

  const syncCredits = () => {
    setCredits(storageService.getCredits());
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message, isOpen: true, type });
  };

  const handleNewPost = (post: GeneratedPost) => {
    const updatedHistory = storageService.savePost(post);
    setHistory(updatedHistory);
    setActiveTab('history');
    showNotification('Post successfully distributed!');
  };

  const handleIdeaSaved = (idea: any) => {
    const updated = storageService.saveIdea(idea);
    setSavedIdeas(updated);
    showNotification('AI Post Idea saved to your library! ✨');
  };

  const handleDeleteIdea = (id: string) => {
    const updated = storageService.deleteIdea(id);
    setSavedIdeas(updated);
    showNotification('Idea removed from library', 'info');
  };

  const handleLogin = (loggedUser: any) => {
    setUser(loggedUser);
    setCredits(storageService.getCredits());
    showNotification(`Welcome, ${loggedUser.name}!`);
  };

  const handleLogout = () => {
    storageService.clearSession();
    setUser(null);
  };

  const handleShare = async (title: string, text: string, url: string) => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        showNotification('Shared successfully!');
      } catch (err) {
        console.error('Share failed', err);
      }
    } else {
      navigator.clipboard.writeText(`${text}\n\n${url}`);
      showNotification('Link and caption copied to clipboard!');
    }
  };

  if (!isLoaded) return null;

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard onCreditsUpdate={syncCredits} />;
      case 'generator': return (
        <PostGenerator 
          state={generatorState}
          setState={setGeneratorState}
          onPostCreated={handleNewPost} 
          onIdeaSaved={handleIdeaSaved}
          onShare={handleShare}
          onCreditsSpent={syncCredits}
          credits={credits}
        />
      );
      case 'saved': return (
        <SavedPosts 
          savedIdeas={savedIdeas} 
          onDelete={handleDeleteIdea} 
          onPostNow={handleNewPost} 
          onShare={handleShare}
        />
      );
      case 'connections': return <Connections />;
      case 'history': return <History history={history} onShare={handleShare} />;
      default: return <Dashboard onCreditsUpdate={syncCredits} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-50 overflow-hidden relative font-sans selection:bg-indigo-500/30">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        onLogout={handleLogout}
        credits={credits}
      />
      
      <main className="flex-1 overflow-y-auto px-4 py-8 md:p-12 relative z-10 pb-32 md:pb-12 custom-scrollbar">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>

      <BottomNav 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      <Notification 
        message={notification.message} 
        isOpen={notification.isOpen} 
        type={notification.type}
        onClose={() => setNotification(prev => ({ ...prev, isOpen: false }))} 
      />

      {/* Decorative Lights */}
      <div className="fixed top-[-10%] right-[-10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-indigo-600/10 blur-[100px] md:blur-[180px] rounded-full pointer-events-none animate-pulse"></div>
      <div className="fixed bottom-[-10%] left-[10%] md:left-72 w-[250px] md:w-[500px] h-[250px] md:h-[500px] bg-purple-600/10 blur-[100px] md:blur-[180px] rounded-full pointer-events-none"></div>
    </div>
  );
};

export default App;
