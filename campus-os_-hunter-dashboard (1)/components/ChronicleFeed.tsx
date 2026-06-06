import React from 'react';
import { MessageSquare, Heart, Share2, Users, Crown } from 'lucide-react';
import GlassCard from './GlassCard';

const ChronicleFeed: React.FC = () => {
  const posts = [
    {
      id: 1,
      user: "Hunter Sarah",
      level: 28,
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=60",
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=60",
      caption: "System Alert: Grinding for the 'Finals Boss' raid. (+15% Study Synergy Party Buff Active)",
      likes: 124,
      comments: 12
    },
    {
      id: 2,
      user: "Tank Mike",
      level: 35,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=60",
      image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&auto=format&fit=crop&q=60",
      caption: "Mission Complete: Iron Temple [Leg Day]. STR Stat increased by +2.",
      likes: 89,
      comments: 5
    }
  ];

  return (
    <div className="relative h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-2">
         <h2 className="text-2xl font-display font-bold text-slate-700">THE CHRONICLE</h2>
         <div className="flex items-center gap-2 text-xs font-mono text-slate-500 bg-white/50 px-3 py-1 rounded-full border border-white/60">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            LIVE FEED
         </div>
      </div>

      {/* Feed Container */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-20 space-y-6">
         {posts.map(post => (
             <GlassCard key={post.id} className="p-0 overflow-hidden group">
                {/* Header */}
                <div className="p-3 flex items-center justify-between bg-white/30 backdrop-blur-sm">
                   <div className="flex items-center gap-3">
                      <div className="relative">
                          <img src={post.avatar} alt={post.user} className="w-10 h-10 rounded-full border-2 border-white object-cover" />
                          <div className="absolute -bottom-1 -right-1 bg-slate-800 text-white text-[8px] px-1.5 py-0.5 rounded-full font-mono border border-slate-600">
                             Lv.{post.level}
                          </div>
                      </div>
                      <div>
                          <p className="font-bold text-sm text-slate-800">{post.user}</p>
                          <p className="text-[10px] text-slate-500 font-mono tracking-wider">GUILD MEMBER</p>
                      </div>
                   </div>
                   <button className="text-slate-400 hover:text-blue-500 transition-colors">
                      <Share2 className="w-4 h-4" />
                   </button>
                </div>

                {/* Image Content */}
                <div className="relative aspect-video bg-slate-100">
                   <img src={post.image} alt="Post content" className="w-full h-full object-cover" />
                   {/* System Overlay */}
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                       <span className="text-white text-xs font-mono border border-white/30 px-2 py-1 rounded bg-black/20 backdrop-blur">
                          IMAGE_DATA_VERIFIED
                       </span>
                   </div>
                </div>

                {/* Gamified Caption Area */}
                <div className="p-4 bg-gradient-to-b from-white/40 to-white/10">
                   <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 mb-3 relative overflow-hidden">
                       <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-400" />
                       <p className="text-sm text-slate-700 font-medium pl-2 leading-relaxed">
                          {post.caption}
                       </p>
                   </div>

                   <div className="flex items-center gap-4 text-slate-500 text-sm">
                      <button className="flex items-center gap-1.5 hover:text-pink-500 transition-colors">
                          <Heart className="w-4 h-4" /> {post.likes}
                      </button>
                      <button className="flex items-center gap-1.5 hover:text-blue-500 transition-colors">
                          <MessageSquare className="w-4 h-4" /> {post.comments}
                      </button>
                   </div>
                </div>
             </GlassCard>
         ))}
      </div>

      {/* Party Finder Overlay Widget (Sticky Bottom) */}
      <div className="absolute bottom-4 left-0 right-0 px-2">
         <GlassCard variant="tech" className="bg-slate-900/90 text-white border-blue-500/30 shadow-lg shadow-blue-500/20">
             <div className="p-3 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center animate-pulse-glow">
                        <Users className="w-5 h-5 text-white" />
                     </div>
                     <div>
                        <p className="text-xs font-bold text-blue-200 tracking-wider">LFG: CANTEEN RAID</p>
                        <p className="text-[10px] text-slate-400 font-mono">3 slots open for 'Project Collab'</p>
                     </div>
                 </div>
                 <button className="bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold px-4 py-2 rounded font-display transition-colors">
                     JOIN PARTY
                 </button>
             </div>
         </GlassCard>
      </div>
    </div>
  );
};

export default ChronicleFeed;