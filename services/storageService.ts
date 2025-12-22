
import { GeneratedPost } from '../types';

const STORAGE_KEYS = {
  POSTS: 'socialflow_posts',
  SAVED_IDEAS: 'socialflow_saved_ideas',
  CONNECTIONS: 'socialflow_connections',
  USER: 'socialflow_active_user',
  USERS_DB: 'socialflow_users_database',
  CREDITS: 'socialflow_user_credits'
};

export const storageService = {
  // Credit Management
  getCredits: (): number => {
    const data = localStorage.getItem(STORAGE_KEYS.CREDITS);
    return data ? parseInt(data) : 50; // Initial 50 credits
  },

  setCredits: (amount: number) => {
    localStorage.setItem(STORAGE_KEYS.CREDITS, amount.toString());
    return amount;
  },

  spendCredits: (cost: number): boolean => {
    const current = storageService.getCredits();
    if (current < cost) return false;
    storageService.setCredits(current - cost);
    return true;
  },

  // Post Management
  getPosts: (): GeneratedPost[] => {
    const data = localStorage.getItem(STORAGE_KEYS.POSTS);
    return data ? JSON.parse(data) : [];
  },

  savePost: (post: GeneratedPost) => {
    const posts = storageService.getPosts();
    const updatedPosts = [post, ...posts];
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(updatedPosts));
    return updatedPosts;
  },

  // Saved Ideas
  getSavedIdeas: (): any[] => {
    const data = localStorage.getItem(STORAGE_KEYS.SAVED_IDEAS);
    return data ? JSON.parse(data) : [];
  },

  saveIdea: (idea: any) => {
    const ideas = storageService.getSavedIdeas();
    // Use a unique ID check but also handle cases where ID might be missing (fallback to content hash or similar if needed)
    const existingId = idea.id || `temp-${Date.now()}`;
    if (ideas.find((i: any) => i.id === existingId)) {
        console.warn("Attempted to save duplicate idea ID:", existingId);
        return ideas;
    }
    
    const updated = [{...idea, id: existingId}, ...ideas];
    localStorage.setItem(STORAGE_KEYS.SAVED_IDEAS, JSON.stringify(updated));
    return updated;
  },

  deleteIdea: (id: string) => {
    const ideas = storageService.getSavedIdeas().filter((i: any) => i.id !== id);
    localStorage.setItem(STORAGE_KEYS.SAVED_IDEAS, JSON.stringify(ideas));
    return ideas;
  },

  // Connections
  getConnections: (): string[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CONNECTIONS);
    return data ? JSON.parse(data) : [];
  },

  toggleConnection: (platformId: string) => {
    let connections = storageService.getConnections();
    if (connections.includes(platformId)) {
      connections = connections.filter(id => id !== platformId);
    } else {
      connections.push(platformId);
    }
    localStorage.setItem(STORAGE_KEYS.CONNECTIONS, JSON.stringify(connections));
    return connections;
  },

  // Auth
  setActiveUser: (user: any) => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  getActiveUser: () => {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : null;
  },

  clearSession: () => {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.CREDITS);
  },

  registerUser: (user: any) => {
    const db = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS_DB) || '[]');
    db.push(user);
    localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(db));
  },

  findUser: (email: string) => {
    const db = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS_DB) || '[]');
    return db.find((u: any) => u.email === email);
  }
};
