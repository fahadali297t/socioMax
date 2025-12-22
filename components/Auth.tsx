
import React, { useState } from 'react';
import { storageService } from '../services/storageService';

interface AuthProps {
  onLogin: (user: any) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (isLogin) {
      const user = storageService.findUser(email);
      if (user && user.password === password) {
        storageService.setActiveUser(user);
        onLogin(user);
      } else {
        setError('Invalid credentials. Did you sign up first?');
      }
    } else {
      if (!name || !email || !password) {
        setError('Please fill in all fields.');
        return;
      }
      const newUser = { name, email, password };
      storageService.registerUser(newUser);
      storageService.setActiveUser(newUser);
      onLogin(newUser);
    }
  };

  const handleDemoLogin = () => {
    const demoUser = { name: 'Demo User', email: 'demo@socialflow.ai', password: 'password' };
    storageService.setActiveUser(demoUser);
    onLogin(demoUser);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-600/10 blur-[120px] rounded-full"></div>

      <div className="max-w-md w-full space-y-8 bg-slate-900/40 p-10 rounded-[2.5rem] border border-white/5 backdrop-blur-2xl shadow-2xl relative z-10">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold bg-gradient-to-br from-white to-slate-500 bg-clip-text text-transparent mb-3">
            SocialFlow AI
          </h1>
          <p className="text-slate-500 text-sm font-medium tracking-wide uppercase">
            {isLogin ? 'Intelligence for Creators' : 'Create your digital identity'}
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold animate-in shake duration-300">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-3">
            {!isLogin && (
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-5 py-4 bg-slate-950/50 border border-white/10 rounded-2xl text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
              />
            )}
            <input
              type="email"
              required
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 bg-slate-950/50 border border-white/10 rounded-2xl text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
            />
            <input
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 bg-slate-950/50 border border-white/10 rounded-2xl text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-5 px-4 border border-transparent rounded-2xl shadow-xl text-sm font-bold text-black bg-white hover:bg-slate-200 focus:outline-none transition-all transform active:scale-[0.98]"
          >
            {isLogin ? 'Sign In' : 'Begin Journey'}
          </button>
        </form>

        <div className="flex flex-col gap-4 mt-8">
          <button
            onClick={handleDemoLogin}
            className="w-full py-4 text-xs font-bold uppercase tracking-widest text-indigo-400 border border-indigo-500/20 rounded-2xl hover:bg-indigo-500/5 transition-all"
          >
            Instant Demo Access
          </button>
          
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-slate-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors"
          >
            {isLogin ? "No account? Sign up instead" : 'Already registered? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
