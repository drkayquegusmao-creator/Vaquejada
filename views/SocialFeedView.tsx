
import React, { useState, useEffect, useRef } from 'react';
import { PostItem, StoryItem } from '../types';

const stories: StoryItem[] = [
  { id: '1', username: 'Seu Status', imageUrl: 'https://picsum.photos/seed/my/100', mediaUrl: 'https://picsum.photos/seed/my_story/1080/1920', mediaType: 'image', hasNew: false },
  { id: '2', username: '@vitor_vaqueiro', imageUrl: 'https://picsum.photos/seed/vitor/100', mediaUrl: 'https://picsum.photos/seed/vitor_story/1080/1920', mediaType: 'image', hasNew: true },
  { id: '3', username: '@parque_palmeira', imageUrl: 'https://picsum.photos/seed/parque/100', mediaUrl: 'https://picsum.photos/seed/parque_story/1080/1920', mediaType: 'image', hasNew: true },
  { id: '4', username: '@ana_montaria', imageUrl: 'https://picsum.photos/seed/ana/100', mediaUrl: 'https://picsum.photos/seed/ana_story/1080/1920', mediaType: 'image', hasNew: false },
  { id: '5', username: '@haras_nobre', imageUrl: 'https://picsum.photos/seed/haras/100', mediaUrl: 'https://picsum.photos/seed/haras_story/1080/1920', mediaType: 'image', hasNew: true },
];

const INITIAL_POSTS: PostItem[] = [
  {
    id: '1',
    username: 'joao_vaquejada',
    isVerified: true,
    location: 'PARQUE DAS PALMEIRAS • SE',
    imageUrl: 'https://picsum.photos/seed/horse1/1000/1000',
    likes: '1.2k',
    comments: 84,
    caption: 'A poeira sobe e a adrenalina toma conta! Preparação forte para o grande prêmio deste final de semana. 🐎🔥',
    hashtags: ['#Vaquejada2024'],
    timeAgo: 'HÁ 2 HORAS',
    isFeature: true
  },
  {
    id: '2',
    username: 'ana_montaria',
    isVerified: false,
    location: 'CIRCUITO NORDESTINO',
    imageUrl: 'https://picsum.photos/seed/horse2/1000/1250',
    likes: '3.8k',
    comments: 210,
    caption: 'A conexão entre o vaqueiro e o cavalo é o que faz a diferença na arena. Respeito e tradição! 🌵👢',
    hashtags: [],
    timeAgo: 'HÁ 5 HORAS',
    views: '32.4k views'
  }
];

interface SocialFeedViewProps {
  onMediaCreation: () => void;
}

const SocialFeedView: React.FC<SocialFeedViewProps> = ({ onMediaCreation }) => {
  const [feedPosts, setFeedPosts] = useState<PostItem[]>(INITIAL_POSTS);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set(['1']));
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [storyProgress, setStoryProgress] = useState(0);

  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (activeStoryIndex !== null) {
      setStoryProgress(0);
      progressInterval.current = setInterval(() => {
        setStoryProgress(prev => {
          if (prev >= 100) {
            handleNextStory();
            return 100;
          }
          return prev + 1;
        });
      }, 50); // 5 seconds per story
    } else {
      if (progressInterval.current) clearInterval(progressInterval.current);
    }
    return () => { if (progressInterval.current) clearInterval(progressInterval.current); };
  }, [activeStoryIndex]);

  const handleNextStory = () => {
    if (activeStoryIndex !== null) {
      if (activeStoryIndex < stories.length - 1) {
        setActiveStoryIndex(activeStoryIndex + 1);
      } else {
        setActiveStoryIndex(null);
      }
    }
  };

  const handlePrevStory = () => {
    if (activeStoryIndex !== null) {
      if (activeStoryIndex > 0) {
        setActiveStoryIndex(activeStoryIndex - 1);
      } else {
        setActiveStoryIndex(null);
      }
    }
  };

  const handleLike = (postId: string) => {
    setLikedPosts(prev => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
  };

  return (
    <div className="bg-background-dark min-h-full font-display">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 sticky top-0 z-50 bg-background-dark/95 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-black uppercase tracking-tighter text-[#ECA413] italic">VAQUERAMA</h1>
          <span className="bg-[#ECA413] text-[9px] font-black px-1.5 py-0.5 rounded-md text-background-dark mt-0.5">PRO</span>
        </div>
        <div className="flex gap-4">
          <button onClick={onMediaCreation} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 active:scale-90 transition-transform">
            <span className="material-icons text-xl text-white">add_box</span>
          </button>
          <button className="relative">
            <span className="material-icons text-2xl text-white">favorite_border</span>
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[#ECA413] border-2 border-background-dark rounded-full"></span>
          </button>
        </div>
      </header>

      {/* Stories Bar */}
      <div className="py-4 overflow-x-auto hide-scrollbar whitespace-nowrap border-b border-white/5">
        <div className="flex gap-4 px-6">
          {stories.map((story, index) => (
            <div key={story.id} className="flex flex-col items-center gap-1.5 shrink-0">
              <div
                onClick={() => story.id !== '1' ? setActiveStoryIndex(index) : onMediaCreation()}
                className={`relative w-[72px] h-[72px] rounded-full p-[2.5px] cursor-pointer active:scale-95 transition-transform ${story.hasNew ? 'bg-gradient-to-tr from-[#ECA413] via-[#8B4513] to-[#ECA413]' : 'bg-white/10'}`}
              >
                <div className="w-full h-full rounded-full border-[3px] border-background-dark overflow-hidden bg-neutral-800">
                  <img src={story.imageUrl} className="w-full h-full object-cover" alt={story.username} />
                </div>
                {story.id === '1' && (
                  <div
                    className="absolute bottom-0 right-1 bg-[#ECA413] w-6 h-6 rounded-full border-[3px] border-background-dark flex items-center justify-center"
                  >
                    <span className="material-icons text-background-dark text-[16px] font-black">add</span>
                  </div>
                )}
              </div>
              <span className={`text-[10px] font-bold tracking-tight ${story.hasNew ? 'text-white' : 'opacity-40 text-white'}`}>
                {story.username}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Posts Feed */}
      <main className="pb-12">
        {feedPosts.map((post) => (
          <article key={post.id} className="mb-2 last:mb-0 border-t border-white/5 pt-2">
            {/* Post Header */}
            <div className="px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border border-[#ECA413]/30 p-0.5">
                  <img className="w-full h-full object-cover rounded-full bg-neutral-800" src={`https://picsum.photos/seed/${post.username}/100`} alt={post.username} />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-black text-[13px] text-white tracking-tight">{post.username}</span>
                    {post.isVerified && <span className="material-icons text-[#ECA413] text-[14px]">verified</span>}
                  </div>
                  <div className="flex items-center gap-1 opacity-60">
                    <span className="material-icons text-[#ECA413] text-[10px]">place</span>
                    <span className="text-[9px] font-black text-white uppercase tracking-wider">{post.location}</span>
                  </div>
                </div>
              </div>
              <button className="material-icons text-white/40 text-xl">more_vert</button>
            </div>

            {/* Post Media */}
            <div className="relative w-full overflow-hidden bg-neutral-900 group">
              <img
                className={`w-full ${post.id === '2' ? 'aspect-[4/5]' : 'aspect-square'} object-cover`}
                src={post.imageUrl}
                alt="Post content"
              />

              {post.isFeature && (
                <div className="absolute top-4 right-4 bg-background-dark/40 backdrop-blur-sm px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-[0.1em] border border-white/10 text-white/90">
                  DESTAQUE
                </div>
              )}

              {post.id === '2' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                    <span className="material-icons text-white text-4xl translate-x-0.5">play_arrow</span>
                  </div>
                </div>
              )}
            </div>

            {/* Interaction Bar */}
            <div className="px-5 py-4 flex justify-between items-center">
              <div className="flex gap-6 items-center">
                <button
                  onClick={() => handleLike(post.id)}
                  className="flex items-center gap-2 group active:scale-125 transition-transform"
                >
                  <span className={`material-icons text-[26px] ${likedPosts.has(post.id) ? 'text-red-500' : 'text-white'}`}>
                    {likedPosts.has(post.id) ? 'favorite' : 'favorite_border'}
                  </span>
                  <span className="text-[14px] font-black text-white/90 tracking-tight">
                    {likedPosts.has(post.id) && post.likes === '1.2k' ? '1.201' : post.likes}
                  </span>
                </button>
                <button
                  onClick={() => alert("Abrindo comentários...")}
                  className="flex items-center gap-2"
                >
                  <span className="material-icons text-[24px] text-white">chat_bubble_outline</span>
                  <span className="text-[14px] font-black text-white/90 tracking-tight">{post.comments}</span>
                </button>
                <button>
                  <span className="material-icons text-[24px] text-white">share</span>
                </button>
              </div>

              <div className="flex items-center gap-4">
                {post.views && (
                  <span className="text-[11px] font-black text-[#ECA413] uppercase tracking-tighter">{post.views}</span>
                )}
                <button>
                  <span className="material-icons text-[24px] text-white/60">bookmark_border</span>
                </button>
              </div>
            </div>

            {/* Post Content */}
            <div className="px-5 pb-6 space-y-1.5">
              <div className="flex flex-wrap gap-2">
                {post.hashtags.map(tag => (
                  <span key={tag} className="text-[#ECA413] text-[11px] font-black uppercase tracking-wider">
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-[13.5px] leading-snug">
                <span className="font-black mr-2 text-white">{post.username}</span>
                <span className="text-white/90 font-medium">{post.caption}</span>
              </p>
              <button
                onClick={() => alert("Mostrando todos os comentários...")}
                className="text-[11px] font-black opacity-40 text-white uppercase tracking-widest block py-0.5"
              >
                VER TODOS OS {post.comments} COMENTÁRIOS
              </button>
              <div className="text-[9px] font-black opacity-30 text-white uppercase tracking-[0.15em]">{post.timeAgo}</div>
            </div>
          </article>
        ))}
      </main>

      {/* Story Viewer Overlay */}
      {activeStoryIndex !== null && (
        <div className="absolute inset-0 z-[100] bg-black flex flex-col animate-in fade-in duration-300">
          {/* Progress Bars */}
          <div className="absolute top-4 left-0 right-0 px-2 flex gap-1 z-20">
            {stories.map((_, i) => (
              <div key={i} className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-50 ease-linear"
                  style={{
                    width: i < activeStoryIndex ? '100%' : (i === activeStoryIndex ? `${storyProgress}%` : '0%')
                  }}
                />
              </div>
            ))}
          </div>

          {/* Story Header */}
          <div className="absolute top-8 left-0 right-0 px-4 flex justify-between items-center z-20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full border border-white/20 p-0.5">
                <img className="w-full h-full object-cover rounded-full" src={stories[activeStoryIndex].imageUrl} alt="" />
              </div>
              <span className="text-white text-xs font-black uppercase tracking-widest drop-shadow-md">
                {stories[activeStoryIndex].username}
              </span>
            </div>
            <button onClick={() => setActiveStoryIndex(null)} className="material-icons text-white drop-shadow-md">close</button>
          </div>

          {/* Story Content */}
          <div className="flex-1 flex items-center justify-center bg-neutral-900">
            <img
              src={stories[activeStoryIndex].mediaUrl}
              className="w-full max-h-full object-contain"
              alt="Story content"
            />
          </div>

          {/* Navigation Tap Zones */}
          <div className="absolute inset-x-0 top-20 bottom-20 flex z-10">
            <div className="flex-1" onClick={handlePrevStory}></div>
            <div className="flex-1" onClick={handleNextStory}></div>
          </div>

          {/* Story Footer */}
          <div className="absolute bottom-6 left-0 right-0 px-4 flex gap-4 items-center z-20">
            <div className="flex-1 h-12 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center px-4">
              <input
                className="bg-transparent border-none outline-none text-white text-xs w-full placeholder:text-white/40"
                placeholder="Enviar mensagem..."
                onFocus={() => { if (progressInterval.current) clearInterval(progressInterval.current); }}
                onBlur={() => {
                  progressInterval.current = setInterval(() => {
                    setStoryProgress(prev => {
                      if (prev >= 100) { handleNextStory(); return 100; }
                      return prev + 1;
                    });
                  }, 50);
                }}
              />
            </div>
            <button className="material-icons text-white drop-shadow-md">favorite_border</button>
            <button className="material-icons text-white drop-shadow-md">send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialFeedView;
