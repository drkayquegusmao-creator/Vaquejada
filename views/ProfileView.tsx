import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabase';

interface ProfileViewProps {
    user: User | null;
    targetUsername?: string | null;
    onLogout: () => void;
    onAdminView: () => void;
    onSettingsView: () => void;
}

// -----------------------------------------------------------------------------
// DADOS MOCKADOS
// -----------------------------------------------------------------------------
const MY_POSTS_MOCK = [
    { id: '1', img: 'https://picsum.photos/seed/feed1/500', likes: 120, comments: 12 },
    { id: '2', img: 'https://picsum.photos/seed/feed2/500', likes: 85, comments: 4 },
    { id: '3', img: 'https://picsum.photos/seed/feed3/500', likes: 230, comments: 45 },
    { id: '4', img: 'https://picsum.photos/seed/feed4/500', likes: 45, comments: 2 },
    { id: '5', img: 'https://picsum.photos/seed/feed5/500', likes: 67, comments: 8 },
    { id: '6', img: 'https://picsum.photos/seed/feed6/500', likes: 112, comments: 15 },
];

const ADS_MOCK = [
    { title: 'SELA PROFISSIONAL LUXO', price: 'R$ 1.500', loc: 'CG, PB', img: 'https://picsum.photos/seed/sela/400' },
    { title: 'CAMINHÃO REBOQUE 2024', price: 'R$ 85.000', loc: 'JP, PB', img: 'https://picsum.photos/seed/truck/400' },
];

type TabType = 'POSTS' | 'ADS' | 'FAVORITES' | 'HIGHLIGHTS' | 'EVENTS';

const ProfileView: React.FC<ProfileViewProps> = ({ user, targetUsername, onLogout, onAdminView, onSettingsView }) => {
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('POSTS');
    const [profileData, setProfileData] = useState<any>(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [selectedPost, setSelectedPost] = useState<any>(null);
    const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
    const [profilePosts, setProfilePosts] = useState(MY_POSTS_MOCK);
    const [editingPost, setEditingPost] = useState<string | null>(null);
    const [editCaption, setEditCaption] = useState('');

    // Determines if the user is looking at their own profile
    const isMyProfile = !targetUsername || (user && user.username && targetUsername === user.username);

    const handleShare = (post: any) => {
        if (navigator.share) {
            navigator.share({
                title: `Post de ${profileData?.username} no +Vaquejada`,
                text: post.caption || 'Foto na arena! 🐎',
                url: window.location.href,
            }).catch(err => console.error('Erro ao compartilhar', err));
        } else {
            alert(`Link do post copiado: ${window.location.href}`);
        }
    };

    useEffect(() => {
        // Simulate fetching profile data dynamically
        setLoading(true);
        setTimeout(() => {
            if (isMyProfile && user) {
                setProfileData({
                    id: user.id,
                    name: user.name,
                    username: user.username || user.name.toLowerCase().replace(/\s+/g, ''),
                    avatar_url: user.avatar_url,
                    bio: user.bio || 'Bem-vindo ao meu perfil no +Vaquejada!',
                    location: `${user.city_id || 'Arena'}, ${user.state_id || '+VAQUEJADA'}`,
                    posts: profilePosts.length,
                    followers: 452,
                    following: 128,
                    points: '1.2k',
                    ads: ADS_MOCK.length,
                    isVerified: user.type === 'admin' || user.role === 'ADMIN'
                });
            } else {
                // Mock public profile data based on targetUsername
                setProfileData({
                    id: `public_${targetUsername}`,
                    name: targetUsername?.replace(/_/g, ' ').toUpperCase() || 'USUÁRIO NÃO ENCONTRADO',
                    username: targetUsername,
                    avatar_url: `https://picsum.photos/seed/${targetUsername}/200`,
                    bio: 'Competidor profissional do Circuito Nordestino. Apaixonado por cavalos e adrenalina.',
                    location: 'PARQUE DAS PALMEIRAS, SE',
                    posts: 45,
                    followers: '10k',
                    following: 340,
                    points: '3.5k',
                    ads: 1,
                    isVerified: targetUsername === 'joao_vaquejada'
                });
            }
            setLoading(false);
        }, 600);
    }, [isMyProfile, targetUsername, user]);

    if (!user) return null;

    if (loading || !profileData) {
        return (
            <div className="min-h-full bg-background-dark px-6 py-12 flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-white/5 animate-pulse mb-4"></div>
                <div className="w-40 h-6 bg-white/5 animate-pulse rounded-md mb-2"></div>
                <div className="w-24 h-4 bg-white/5 animate-pulse rounded-md mb-8"></div>
                <div className="w-full flex justify-between gap-4 mb-8">
                    <div className="w-20 h-10 bg-white/5 animate-pulse rounded-md"></div>
                    <div className="w-20 h-10 bg-white/5 animate-pulse rounded-md"></div>
                    <div className="w-20 h-10 bg-white/5 animate-pulse rounded-md"></div>
                </div>
                <div className="w-full h-32 bg-white/5 animate-pulse rounded-xl mb-4"></div>
            </div>
        );
    }

    return (
        <div className="min-h-full bg-background-dark text-white font-sans pb-24 font-display">
            {/* Header / Actions */}
            <div className="px-6 pt-10 pb-4 flex justify-between items-center sticky top-0 bg-background-dark/90 backdrop-blur-md z-10 border-b border-white/5">
                <button
                   onClick={() => window.history.back()}
                   className="material-icons opacity-60 hover:opacity-100 transition-opacity"
                >
                   {isMyProfile ? '' : 'arrow_back'}
                </button>
                <h1 className="text-white font-black text-lg tracking-wider uppercase border text-center opacity-0">PERFIL</h1> 
                <div className="flex gap-4">
                    {isMyProfile && (
                        <>
                            <button className="material-icons text-white/40 hover:text-white transition-colors">notifications_none</button>
                            <button onClick={onSettingsView} className="material-icons text-white/40 hover:text-white transition-colors">settings</button>
                        </>
                    )}
                    {!isMyProfile && (
                        <button className="material-icons text-white/40 hover:text-white transition-colors">more_vert</button>
                    )}
                </div>
            </div>

            <div className="px-6 pt-4">
                {/* Profile Header Info */}
                <div className="flex flex-row items-center gap-6 mb-6">
                    <div className="relative shrink-0 user-avatar-container">
                        <div className="w-24 h-24 rounded-full border-2 border-[#ECA413] p-1 bg-background-dark shadow-2xl relative group cursor-pointer active:scale-95 transition-transform overflow-hidden">
                            <img
                                src={profileData.avatar_url || `https://ui-avatars.com/api/?name=${profileData.name}&background=random`}
                                className="w-full h-full rounded-full object-cover transition-opacity group-hover:opacity-80 bg-neutral-800"
                                alt={profileData.name}
                            />
                        </div>
                        {isMyProfile && (
                            <div 
                                onClick={() => window.dispatchEvent(new CustomEvent('arena_navigate', { detail: { view: 'MEDIA_CREATION' } }))}
                                className="absolute bottom-0 right-0 bg-[#ECA413] text-black w-8 h-8 rounded-full border-2 border-background-dark flex items-center justify-center cursor-pointer shadow-lg active:scale-90 transition-transform hover:scale-110"
                            >
                                <span className="material-icons text-[16px]">add</span>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 flex justify-between">
                       <div className="flex flex-col items-center">
                           <span className="text-lg font-black text-white">{profileData.posts}</span>
                           <span className="text-[10px] font-medium text-white/40 uppercase tracking-widest">Posts</span>
                       </div>
                       <div className="flex flex-col items-center">
                           <span className="text-lg font-black text-white">{profileData.followers}</span>
                           <span className="text-[10px] font-medium text-white/40 uppercase tracking-widest">Seguidores</span>
                       </div>
                       <div className="flex flex-col items-center">
                           <span className="text-lg font-black text-white">{profileData.following}</span>
                           <span className="text-[10px] font-medium text-white/40 uppercase tracking-widest">Seguindo</span>
                       </div>
                    </div>
                </div>

                {/* Profile Bio */}
                <div className="mb-6">
                    <h2 className="text-lg font-black text-white flex items-center gap-1">
                        {profileData.name}
                        {profileData.isVerified && <span className="material-icons text-[#ECA413] text-[16px]">verified</span>}
                    </h2>
                    <p className="text-[12px] font-black text-[#ECA413] lowercase tracking-tight mb-2">@{profileData.username}</p>
                    <p className="text-sm font-medium text-white/80 leading-snug mb-2 whitespace-pre-wrap">
                        {profileData.bio}
                    </p>
                    <div className="flex items-center gap-1 text-white/40">
                        <span className="material-icons text-[14px]">place</span>
                        <span className="text-[11px] font-black uppercase tracking-wider">{profileData.location}</span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 w-full mb-8">
                    {isMyProfile ? (
                        <>
                            <button className="flex-1 bg-white/10 text-white py-2.5 rounded-lg font-black text-[11px] uppercase tracking-wider flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all">
                                Editar Perfil
                            </button>
                            <button 
                                onClick={() => handleShare(profileData)} 
                                className="flex-1 bg-white/10 text-white py-2.5 rounded-lg font-black text-[11px] uppercase tracking-wider flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all"
                            >
                                Compartilhar
                            </button>
                        </>
                    ) : (
                        <>
                            <button 
                                onClick={() => setIsFollowing(!isFollowing)}
                                className={`flex-1 ${isFollowing ? 'bg-white/10 text-white' : 'bg-[#ECA413] text-black'} py-2.5 rounded-lg font-black text-[11px] uppercase tracking-wider flex items-center justify-center active:scale-95 transition-all`}
                            >
                                {isFollowing ? 'Seguindo' : 'Seguir'}
                            </button>
                            <button 
                                onClick={() => window.dispatchEvent(new CustomEvent('arena_navigate', { detail: { view: 'SOCIAL' } }))}
                                className="flex-1 bg-white/10 text-white py-2.5 rounded-lg font-black text-[11px] uppercase tracking-wider flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all"
                            >
                                Mensagem
                            </button>
                        </>
                    )}
                </div>

                {/* Sub-navigation Tabs */}
                <div className="flex justify-around border-b border-white/10 mb-2 mt-2">
                    <button 
                        onClick={() => setActiveTab('POSTS')}
                        className={`pb-3 flex-1 flex justify-center border-b-2 transition-all ${activeTab === 'POSTS' ? 'border-white text-white' : 'border-transparent text-white/40'}`}
                    >
                        <span className="material-icons text-[24px]">grid_on</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('ADS')}
                        className={`pb-3 flex-1 flex justify-center border-b-2 transition-all ${activeTab === 'ADS' ? 'border-white text-white' : 'border-transparent text-white/40'}`}
                    >
                        <span className="material-icons text-[24px]">storefront</span>
                    </button>
                    {isMyProfile && (
                        <button 
                            onClick={() => setActiveTab('FAVORITES')}
                            className={`pb-3 flex-1 flex justify-center border-b-2 transition-all ${activeTab === 'FAVORITES' ? 'border-white text-white' : 'border-transparent text-white/40'}`}
                        >
                            <span className="material-icons text-[24px]">bookmark_border</span>
                        </button>
                    )}
                </div>

                {/* Tab Content */}
                <div className="mt-1">
                    {activeTab === 'POSTS' && (
                        <div className="grid grid-cols-3 gap-0.5 animate-in fade-in duration-300">
                            {(isMyProfile ? profilePosts : MY_POSTS_MOCK).map(post => (
                                <div key={post.id} onClick={() => setSelectedPost(post)} className="aspect-square bg-white/5 relative group cursor-pointer overflow-hidden">
                                    <img src={post.img} className="w-full h-full object-cover" alt="" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                        <div className="flex items-center gap-1">
                                            <span className="material-icons text-white text-sm">favorite</span>
                                            <span className="text-white font-black text-xs">{post.likes}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'ADS' && (
                        <div className="grid grid-cols-2 gap-2 animate-in fade-in duration-300 pt-2">
                            {ADS_MOCK.map((ad, i) => (
                                <div key={i} className="bg-white/5 rounded-xl overflow-hidden border border-white/10">
                                    <div className="aspect-square bg-black relative">
                                        <img src={ad.img} className="w-full h-full object-cover" alt=""/>
                                    </div>
                                    <div className="p-3">
                                        <p className="text-[#ECA413] font-black text-[11px] mb-1">{ad.price}</p>
                                        <p className="text-white font-bold text-[10px] truncate leading-tight">{ad.title}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'FAVORITES' && isMyProfile && (
                        <div className="py-20 flex flex-col items-center justify-center opacity-40 animate-in fade-in duration-300">
                            <span className="material-icons text-4xl mb-4">bookmark_border</span>
                            <p className="text-xs font-black uppercase tracking-widest">Sem favoritos</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Post Detail Overlay (Instagram style) */}
            {selectedPost && (
                <div className="fixed inset-0 z-[200] bg-background-dark flex flex-col animate-in slide-in-from-bottom duration-300">
                    <header className="px-6 py-4 flex items-center justify-between border-b border-white/5 bg-background-dark/95 backdrop-blur-md sticky top-0 z-10">
                        <div className="flex items-center gap-4">
                            <button onClick={() => { setSelectedPost(null); setEditingPost(null); }} className="material-icons text-white">arrow_back</button>
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-[#ECA413]">Publicação</h3>
                                <p className="text-[10px] font-bold text-white/40 uppercase tracking-tight">{profileData?.name}</p>
                            </div>
                        </div>
                        {isMyProfile && (
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => {
                                        if (editingPost === selectedPost.id) {
                                            // Handle save simulation
                                            setEditingPost(null);
                                        } else {
                                            setEditingPost(selectedPost.id);
                                            setEditCaption(`Legenda do post ${selectedPost.id}`); // Simulate existing caption
                                        }
                                    }}
                                    className="material-icons text-white/60 hover:text-white"
                                >
                                    {editingPost === selectedPost.id ? 'check' : 'edit'}
                                </button>
                                <button 
                                    onClick={() => {
                                        if (confirm('Tem certeza que deseja apagar essa publicação permanentemente?')) {
                                            setProfilePosts(profilePosts.filter(p => p.id !== selectedPost.id));
                                            setSelectedPost(null);
                                        }
                                    }}
                                    className="material-icons text-red-500/80 hover:text-red-500"
                                >
                                    delete
                                </button>
                            </div>
                        )}
                    </header>
                    
                    <div className="flex-1 overflow-y-auto pb-8">
                        {/* User Header */}
                        <div className="px-5 py-3 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full border border-[#ECA413] p-[1.5px]">
                                <img className="w-full h-full object-cover rounded-full" src={profileData?.avatar_url} />
                            </div>
                            <div>
                                <span className="font-black text-xs text-white uppercase tracking-tight flex items-center gap-1">
                                    {profileData?.username} 
                                    {profileData?.isVerified && <span className="material-icons text-[#ECA413] text-[12px]">verified</span>}
                                </span>
                                <span className="text-[9px] font-bold uppercase text-white/40">{profileData?.location}</span>
                            </div>
                        </div>

                        {/* Image */}
                        <div className="w-full aspect-square bg-black">
                            <img src={selectedPost.img} className="w-full h-full object-contain" />
                        </div>

                        {/* Interaction Bar */}
                        <div className="px-5 py-4 flex justify-between items-center bg-background-dark">
                            <div className="flex gap-6 items-center">
                                <button 
                                    onClick={() => {
                                        setLikedPosts(prev => {
                                            const next = new Set(prev);
                                            if (next.has(selectedPost.id)) next.delete(selectedPost.id);
                                            else next.add(selectedPost.id);
                                            return next;
                                        });
                                    }}
                                    className="flex items-center gap-2 group active:scale-125 transition-transform"
                                >
                                    <span className={`material-icons text-[26px] ${likedPosts.has(selectedPost.id) ? 'text-red-500' : 'text-white'}`}>
                                        {likedPosts.has(selectedPost.id) ? 'favorite' : 'favorite_border'}
                                    </span>
                                </button>
                                <button className="flex items-center gap-2">
                                    <span className="material-icons text-[24px] text-white">chat_bubble_outline</span>
                                </button>
                                <button onClick={() => handleShare(selectedPost)} className="flex items-center gap-2">
                                    <span className="material-icons text-[24px] text-white">share</span>
                                </button>
                            </div>
                            <button className="material-icons text-white/50">bookmark_border</button>
                        </div>
                        
                        {/* Likes count & Caption */}
                        <div className="px-5 space-y-2">
                            <p className="font-black text-sm text-white">{selectedPost.likes + (likedPosts.has(selectedPost.id) ? 1 : 0)} curtidas</p>
                            
                            {editingPost === selectedPost.id ? (
                                <div className="mt-2 text-white">
                                    <textarea 
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-[#ECA413] outline-none transition-colors"
                                        rows={3}
                                        value={editCaption}
                                        onChange={(e) => setEditCaption(e.target.value)}
                                        placeholder="Nova legenda..."
                                    />
                                    <p className="text-[10px] text-white/30 uppercase mt-1">Modo de edição. Clique no ✓ acima para salvar.</p>
                                </div>
                            ) : (
                                <p className="text-[13px] leading-snug">
                                    <span className="font-black mr-2 text-white">{profileData?.username}</span>
                                    <span className="text-white/80 font-medium">Lembrança incrível desse dia na arena! Preparação tá a mil por hora pro próximo circuito. 🐎🔥</span>
                                </p>
                            )}

                            <button className="text-[11px] font-black opacity-40 text-white uppercase tracking-widest block py-1 mt-1">
                                VER TODOS OS {selectedPost.comments} COMENTÁRIOS
                            </button>
                            <div className="text-[9px] font-black opacity-30 text-white uppercase tracking-[0.15em] pt-1">HÁ 2 DIAS</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileView;
