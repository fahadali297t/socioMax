
import React from 'react';
import { GeneratedPost } from '../types';

interface HistoryProps {
  history: GeneratedPost[];
  onShare: (title: string, text: string, url: string) => void;
}

const History: React.FC<HistoryProps> = ({ history, onShare }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-3xl font-bold">Content History</h2>
        <p className="text-slate-400 mt-1">Track your published, scheduled, and draft posts.</p>
      </header>

      <div className="overflow-x-auto rounded-2xl border border-slate-800">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full text-left bg-slate-800/20">
            <thead className="bg-slate-900/50 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-300">Preview</th>
                <th className="px-6 py-4 font-semibold text-slate-300">Caption</th>
                <th className="px-6 py-4 font-semibold text-slate-300">Platforms</th>
                <th className="px-6 py-4 font-semibold text-slate-300">Status</th>
                <th className="px-6 py-4 font-semibold text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {history.length === 0 ? (
                 <tr>
                   <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">No posts found yet.</td>
                 </tr>
              ) : history.map((post) => (
                <tr key={post.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4">
                    <img src={post.imageUrl} className="w-12 h-12 rounded-lg object-cover border border-slate-700" alt="post preview" />
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <p className="text-sm line-clamp-2">{post.caption}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1 flex-wrap">
                      {post.platforms.map(p => (
                        <span key={p} className="px-2 py-0.5 bg-slate-900 border border-slate-700 rounded text-[10px] font-bold">
                          {p}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold whitespace-nowrap ${
                      post.status === 'posted' ? 'bg-green-500/10 text-green-500' :
                      post.status === 'scheduled' ? 'bg-blue-500/10 text-blue-500' :
                      'bg-slate-500/10 text-slate-500'
                    }`}>
                      {post.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => onShare(post.businessInfo?.name || 'Post', post.caption, post.imageUrl)}
                      className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 hover:text-indigo-300"
                    >
                      Share 📤
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default History;
