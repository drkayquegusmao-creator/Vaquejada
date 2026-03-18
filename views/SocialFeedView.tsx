
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
    userId: 'mock-user-1',
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
    userId: 'mock-user-2',
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
  user: any; // Using any to avoid strict type issues for now
  onMediaCreation: () => void;
}

const SocialFeedView: React.FC<SocialFeedViewProps> = ({ user, onMediaCreation }) => {
  const [feedPosts, setFeedPosts] = useState<PostItem[]>(() => {
    const locals = JSON.parse(localStorage.getItem('arena_local_feed') || '[]');
    // Map locals to PostItem format if needed
    const formattedLocals = locals.map((p: any) => ({
      id: p.id,
      userId: 'offline-user',
      username: p.username || 'vaqueiro_local',
      imageUrl: p.img,
      likes: '0',
      comments: 0,
      caption: p.caption || '',
      hashtags: [],
      timeAgo: 'AGORA',
      isVerified: false,
      location: p.location || 'Brasil'
    }));
    return [...formattedLocals, ...INITIAL_POSTS];
  });
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set(['1']));
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [storyProgress, setStoryProgress] = useState(0);

  // DM State
  const [isDMScreenOpen, setIsDMScreenOpen] = useState(false);
  const [activeChatUser, setActiveChatUser] = useState<string | null>(null);
  const [messages, setMessages] = useState<{sender: string, text: string, time: string, chatWith: string}[]>(() => {
    const saved = localStorage.getItem('arena_dms');
    return saved ? JSON.parse(saved) : [];
  });
  const [newMessage, setNewMessage] = useState('');

  // Persist DMs
  useEffect(() => {
    localStorage.setItem('arena_dms', JSON.stringify(messages));
  }, [messages]);

  // Additional Social States (Comments & Notifications)
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [activeCommentsPost, setActiveCommentsPost] = useState<PostItem | null>(null);
  const [commentText, setCommentText] = useState('');
  const [postComments, setPostComments] = useState<{username: string, text: string, time: string}[]>([]);
  
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);
  const [hasUnreadDMs, setHasUnreadDMs] = useState(true);
  const [notificationsMock] = useState([
    { id: 1, type: 'follow', user: 'haras_nobre', text: 'começou a seguir você.', time: 'há 2m' },
    { id: 2, type: 'like', user: 'vitor_vaqueiro', text: 'curtiu sua publicação.', time: 'há 1h' },
    { id: 3, type: 'comment', user: 'ana_montaria', text: 'comentou: "Belo cavalo!"', time: 'há 5h' },
  ]);

  // Logic to handle direct navigation to a chat
  useEffect(() => {
    const handleSocialNav = (e: any) => {
        if (e.detail?.openDM) {
            setIsDMScreenOpen(true);
            setActiveChatUser(e.detail.openDM);
        }
    };
    window.addEventListener('arena_navigate', handleSocialNav);
    return () => window.removeEventListener('arena_navigate', handleSocialNav);
  }, []);

  const handleShare = (post: PostItem) => {
    if (navigator.share) {
      navigator.share({
        title: `Post de ${post.username} no +Vaquejada`,
        text: post.caption,
        url: window.location.href,
      }).catch(err => console.error('Erro ao compartilhar', err));
    } else {
      alert(`Link do post copiado: ${window.location.href}`);
    }
  };

  const navigateToProfile = (username: string) => {
    // format username by removing @
    const formatted = username.startsWith('@') ? username.substring(1) : username;
    window.dispatchEvent(new CustomEvent('arena_navigate', { detail: { view: 'PROFILE', username: formatted } }));
  };

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

          <button 
            onClick={() => navigateToProfile(user?.username || 'meu-perfil')}
            className="w-8 h-8 rounded-full border border-[#ECA413] p-0.5 overflow-hidden active:scale-90 transition-transform"
          >
            <img 
              src={user?.avatar_url || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random`} 
              className="w-full h-full rounded-full object-cover" 
              alt="Profile"
            />
          </button>
          
          <button className="relative" onClick={() => { setIsNotificationsOpen(!isNotificationsOpen); setHasUnreadNotifications(false); }}>
            <span className={`material-icons text-2xl ${isNotificationsOpen ? 'text-[#ECA413]' : 'text-white'}`}>favorite_border</span>
            {hasUnreadNotifications && (
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[#ECA413] border-2 border-background-dark rounded-full"></span>
            )}
          </button>

          <button className="relative" onClick={() => { setIsDMScreenOpen(true); setHasUnreadDMs(false); }}>
            <span className="material-icons text-2xl text-white">send</span>
            {hasUnreadDMs && (
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[#ECA413] border-2 border-background-dark rounded-full"></span>
            )}
          </button>
        </div>
      </header>

      {/* Notifications Overlay */}
      {isNotificationsOpen && (
        <>
            {/* Click Outside to Dismiss */}
            <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)}></div>
            <div className="absolute top-[68px] right-4 w-[300px] z-50 bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-4 overflow-hidden">
                <div className="p-4 border-b border-white/10">
                <h3 className="font-black text-white tracking-widest text-[11px] uppercase">Ações & Notificações</h3>
            </div>
            <div className="max-h-[300px] overflow-y-auto">
                {notificationsMock.map(notif => (
                    <div key={notif.id} className="p-4 border-b border-white/5 flex gap-3 items-center hover:bg-white/5 transition-colors cursor-pointer" onClick={() => navigateToProfile(notif.user)}>
                        <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden shrink-0">
                            <img src={`https://picsum.photos/seed/${notif.user}/100`} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                            <p className="text-[12px] text-white/90 leading-tight">
                                <span className="font-black mr-1">{notif.user}</span>
                                {notif.text}
                            </p>
                            <p className="text-[#ECA413] text-[9px] font-black uppercase tracking-wider mt-1">{notif.time}</p>
                        </div>
                        {notif.type === 'follow' && (
                            <button className="bg-white/10 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest active:scale-95 transition-transform">
                                Seguir
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
        </>
      )}

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
              <span 
                onClick={() => navigateToProfile(story.username)}
                className={`text-[10px] font-bold tracking-tight cursor-pointer hover:underline ${story.hasNew ? 'text-white' : 'opacity-40 text-white'}`}
              >
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
                <div 
                   onClick={() => navigateToProfile(post.username)}
                   className="w-10 h-10 rounded-full border border-[#ECA413]/30 p-0.5 cursor-pointer active:scale-95 transition-transform"
                >
                  <img className="w-full h-full object-cover rounded-full bg-neutral-800" src={`https://picsum.photos/seed/${post.username}/100`} alt={post.username} />
                </div>
                <div>
                  <div className="flex items-center gap-1 cursor-pointer hover:underline" onClick={() => navigateToProfile(post.username)}>
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
                  onClick={() => {
                    setActiveCommentsPost(post);
                    setIsCommentsOpen(true);
                    setPostComments([
                      { username: 'vitor_vaqueiro', text: 'Belo cavalo patrão, tá top! 🐎', time: '1h' },
                      { username: 'ana_montaria', text: 'Sensacional, próxima etapa a gente se vê.', time: '4h' }
                    ]);
                  }}
                  className="flex items-center gap-2"
                >
                  <span className="material-icons text-[24px] text-white">chat_bubble_outline</span>
                  <span className="text-[14px] font-black text-white/90 tracking-tight">{post.comments}</span>
                </button>
                <button onClick={() => handleShare(post)}>
                  <span className="material-icons text-[24px] text-white">send</span>
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
                <span 
                  className="font-black mr-2 text-white cursor-pointer hover:underline"
                  onClick={() => navigateToProfile(post.username)}
                >
                  {post.username}
                </span>
                <span className="text-white/90 font-medium">{post.caption}</span>
              </p>
              <button
                onClick={() => {
                  setActiveCommentsPost(post);
                  setIsCommentsOpen(true);
                  setPostComments([
                    { username: 'vitor_vaqueiro', text: 'Belo cavalo patrão, tá top! 🐎', time: '1h' },
                    { username: 'ana_montaria', text: 'Sensacional, próxima etapa a gente se vê.', time: '4h' }
                  ]);
                }}
                className="text-[11px] font-black opacity-40 text-white uppercase tracking-widest block py-0.5 active:opacity-100"
              >
                VER TODOS OS {post.comments} COMENTÁRIOS
              </button>
              <div className="text-[9px] font-black opacity-30 text-white uppercase tracking-[0.15em]">{post.timeAgo}</div>
            </div>
          </article>
        ))}
      </main>

      {/* Coments Sliding Panel Overlay */}
      {isCommentsOpen && activeCommentsPost && (
        <div className="fixed inset-0 z-[200] flex flex-col justify-end animate-in slide-in-from-bottom duration-300 pointer-events-none">
            {/* Click to dismiss */}
            <div className="absolute inset-0 bg-black/60 pointer-events-auto" onClick={() => setIsCommentsOpen(false)}></div>
            
            <div className="bg-[#1C1C1E] h-[80vh] w-full rounded-t-3xl relative z-10 pointer-events-auto flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t border-white/5">
                <div className="flex justify-center p-3">
                    <div className="w-10 h-1 rounded-full bg-white/20"></div>
                </div>
                <div className="px-6 py-2 border-b border-white/5 text-center">
                    <h3 className="font-black text-xs text-white uppercase tracking-widest">Comentários</h3>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Caption / description block inside comments */}
                    <div className="flex gap-4 pb-6 border-b border-white/5">
                        <div className="w-8 h-8 rounded-full border border-white/10 shrink-0 overflow-hidden">
                            <img src={`https://picsum.photos/seed/${activeCommentsPost.username}/100`} />
                        </div>
                        <div>
                            <p className="text-[13px] text-white/90 leading-snug">
                                <span className="font-black mr-2 text-white">{activeCommentsPost.username}</span>
                                {activeCommentsPost.caption}
                            </p>
                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-2 block">{activeCommentsPost.timeAgo}</span>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {postComments.map((comment, i) => (
                            <div key={i} className="flex gap-4">
                                <div className="w-8 h-8 rounded-full border border-white/10 shrink-0 overflow-hidden cursor-pointer" onClick={() => { setIsCommentsOpen(false); navigateToProfile(comment.username) }}>
                                    <img src={`https://picsum.photos/seed/${comment.username}/100`} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[13px] text-white/90 leading-snug">
                                        <span onClick={() => { setIsCommentsOpen(false); navigateToProfile(comment.username) }} className="font-black mr-2 text-white cursor-pointer">{comment.username}</span>
                                        {comment.text}
                                    </p>
                                    <div className="flex gap-4 items-center mt-1">
                                        <span className="text-[10px] font-bold text-white/40">{comment.time}</span>
                                        <button className="text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-white">Responder</button>
                                    </div>
                                </div>
                                <button className="material-icons text-[14px] text-white/20 hover:text-red-500 transition-colors">favorite_border</button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Input Area */}
                <div className="p-4 bg-background-dark/80 backdrop-blur-md border-t border-white/5 flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-neutral-800 shrink-0 border border-white/10 overflow-hidden">
                        <img src="https://picsum.photos/seed/myAvatar/100" />
                    </div>
                    <div className="flex-1 bg-white/10 rounded-full flex items-center px-4 border border-white/10">
                        <input
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            onKeyDown={e => {
                                if(e.key === 'Enter' && commentText.trim()) {
                                    setPostComments([...postComments, { username: 'voce_vaqueiro', text: commentText, time: 'agora' }]);
                                    setCommentText('');
                                }
                            }}
                            className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-white/40"
                            placeholder="Adicione um comentário..."
                        />
                    </div>
                    {commentText.trim() && (
                        <button onClick={() => {
                            setPostComments([...postComments, { username: 'voce_vaqueiro', text: commentText, time: 'agora' }]);
                            setCommentText('');
                        }} className="font-black text-[12px] text-[#ECA413] px-2 uppercase active:scale-95 transition-transform">
                            Publicar
                        </button>
                    )}
                </div>
            </div>
        </div>
      )}

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
              <span 
                  onClick={() => {
                    setActiveStoryIndex(null);
                    navigateToProfile(stories[activeStoryIndex].username);
                  }}
                  className="text-white text-xs font-black uppercase tracking-widest drop-shadow-md cursor-pointer hover:underline"
                >
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
            <button className="material-icons text-white drop-shadow-md" onClick={() => handleShare(INITIAL_POSTS[0])}>send</button>
          </div>
        </div>
      )}

      {/* Direct Messages Overlay */}
      {isDMScreenOpen && (
        <div className="fixed inset-0 z-[200] bg-background-dark flex flex-col animate-in slide-in-from-right duration-300">
          <header className="px-6 py-4 flex items-center justify-between border-b border-white/5 bg-background-dark/95 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <button onClick={() => { activeChatUser ? setActiveChatUser(null) : setIsDMScreenOpen(false); }} className="material-icons text-white">arrow_back</button>
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-white">
                  {activeChatUser ? activeChatUser : 'MENSAGENS'}
                </h3>
                {activeChatUser && <p className="text-[10px] font-bold text-[#ECA413] uppercase tracking-tight">Visto por último: há 10 min</p>}
              </div>
            </div>
            {!activeChatUser && (
              <button className="material-icons text-white">edit_square</button>
            )}
          </header>

          {!activeChatUser ? (
            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-2">
                  <span className="material-icons text-white/40">search</span>
                  <input type="text" placeholder="Buscar..." className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-white/40" />
                </div>
              </div>
              <h4 className="px-6 py-2 text-[10px] font-black uppercase text-white/40 tracking-widest">Recentes</h4>
              {Array.from(new Set([...['vitor_vaqueiro', 'ana_montaria', 'haras_nobre'], ...messages.map(m => m.chatWith)])).map(user => {
                const userMessages = messages.filter(m => m.chatWith === user);
                const lastMessage = userMessages.length > 0 ? userMessages[userMessages.length - 1] : {text: 'Tocar para conversar...', time: ''};
                return (
                  <div key={user} onClick={() => { setActiveChatUser(user); }} className="px-6 py-4 flex items-center gap-4 border-b border-white/5 active:bg-white/5 cursor-pointer transition-colors">
                    <div className="w-14 h-14 rounded-full border border-white/10 overflow-hidden bg-neutral-800">
                      <img src={`https://picsum.photos/seed/${user}/100`} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-sm text-white mb-0.5">{user}</p>
                      <p className="text-xs font-medium text-white/60 truncate">{lastMessage.text}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] font-bold text-white/40">{lastMessage.time}</span>
                      {user === 'vitor_vaqueiro' && userMessages.length === 0 && <div className="w-2 h-2 rounded-full bg-[#ECA413]"></div>}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex-1 flex flex-col bg-neutral-900/50 relative">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="flex justify-center mb-6">
                  <div className="bg-white/10 rounded-full px-3 py-1 text-[10px] font-bold text-white/60 uppercase">HOJE</div>
                </div>
                {messages.filter(m => m.chatWith === activeChatUser).map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${msg.sender === 'me' ? 'bg-[#ECA413] text-black rounded-tr-sm' : 'bg-white/10 text-white rounded-tl-sm'}`}>
                      <p className="font-medium text-[13px]">{msg.text}</p>
                      <p className={`text-[9px] font-black uppercase mt-1 text-right ${msg.sender === 'me' ? 'text-black/60' : 'text-white/40'}`}>{msg.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-background-dark border-t border-white/5 drop-shadow-2xl flex gap-2">
                <div className="flex-1 bg-white/10 rounded-full flex items-center px-4 border border-white/10">
                  <input 
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && newMessage.trim() && activeChatUser) {
                        setMessages([...messages, { sender: 'me', text: newMessage, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), chatWith: activeChatUser }]);
                        setNewMessage('');
                      }
                    }}
                    placeholder="Mensagem..." 
                    className="w-full bg-transparent text-sm py-3 outline-none font-medium placeholder:text-white/40"
                  />
                </div>
                {newMessage.trim() ? (
                  <button 
                    onClick={() => {
                      if (activeChatUser) {
                        setMessages([...messages, { sender: 'me', text: newMessage, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), chatWith: activeChatUser }]);
                        setNewMessage('');
                      }
                    }}
                    className="w-12 h-12 rounded-full bg-[#ECA413] flex items-center justify-center text-black shadow-lg"
                  >
                    <span className="material-icons text-[20px]">send</span>
                  </button>
                ) : (
                  <button className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white/60">
                    <span className="material-icons text-[20px]">mic</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SocialFeedView;
