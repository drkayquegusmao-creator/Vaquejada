import React, { useState, useEffect, useRef } from 'react';
import { EventItem, User } from '../types';
import { supabase } from '../lib/supabase';

interface ProfileViewProps {
    user: User | null;
    onLogout: () => void;
    onAdminView: () => void;
    onSettingsView: () => void;
}

// -----------------------------------------------------------------------------
// DADOS MOCKADOS
// -----------------------------------------------------------------------------

const ALL_EVENTS: EventItem[] = [
    {
        id: '1',
        title: 'Grande Vaquejada de Surubim',
        location: 'Surubim, PE',
        park: 'Parque J. Galdino',
        price: 'R$ 450,00',
        category: 'Inicial',
        date: { month: 'SET', day: '15' },
        imageUrl: 'https://picsum.photos/seed/event1/800/600',
        site: 'www.vaquejadasurubim.com.br',
        phone: '(81) 99999-9999',
        prizes: 'R$ 200.000,00 em prêmios',
        description: 'A maior vaquejada do Brasil está de volta!'
    },
    {
        id: '2',
        title: 'Circuito Portal Vaquejada',
        location: 'Bezerros, PE',
        park: 'Parque Rufina Borba',
        price: 'R$ 800,00',
        category: 'Profissional',
        date: { month: 'OUT', day: '02' },
        imageUrl: 'https://picsum.photos/seed/event2/800/600',
        site: 'www.portalvaquejada.com.br',
        phone: '(81) 98888-8888',
        prizes: 'R$ 300.000,00 em prêmios',
        description: 'Etapa decisiva do campeonato portal.'
    }
];

const ALL_ADS = [
    { title: 'SELA PROFISSIONAL LUXO', price: 'R$ 1.500', loc: 'CG, PB', img: 'https://picsum.photos/seed/sela/400', isNew: true },
    { title: 'CAMINHÃO REBOQUE 2024', price: 'R$ 85.000', loc: 'JP, PB', img: 'https://picsum.photos/seed/truck/400', isNew: true },
];

const MY_POSTS_MOCK = [
    { id: '1', img: 'https://picsum.photos/seed/feed1/500', likes: 120, comments: 12 },
    { id: '2', img: 'https://picsum.photos/seed/feed2/500', likes: 85, comments: 4 },
    { id: '3', img: 'https://picsum.photos/seed/feed3/500', likes: 230, comments: 45 },
    { id: '4', img: 'https://picsum.photos/seed/feed4/500', likes: 45, comments: 2 },
    { id: '5', img: 'https://picsum.photos/seed/feed5/500', likes: 67, comments: 8 },
    { id: '6', img: 'https://picsum.photos/seed/feed6/500', likes: 112, comments: 15 },
];

// -----------------------------------------------------------------------------
// COMPONENTE PRINCIPAL ProfileView
// -----------------------------------------------------------------------------

const ProfileView: React.FC<ProfileViewProps> = ({ user, onLogout, onAdminView, onSettingsView }) => {
    const [subView, setSubView] = useState<'NONE' | 'EVENTS' | 'ADS' | 'FAVORITES' | 'CALENDAR' | 'WALLET'>('NONE');
    const [profilePosts, setProfilePosts] = useState(MY_POSTS_MOCK);
    const [selectedPost, setSelectedPost] = useState<any>(null);
    const [favoriteEvents, setFavoriteEvents] = useState<string[]>([]);
    const [favoriteAds, setFavoriteAds] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const postInputRef = useRef<HTMLInputElement>(null);

    // Mock initial comments for the detail view
    const [comments, setComments] = useState([
        { id: '1', user: '@vitor_vaqueiro', text: 'Show de bola, patrão! 🐎🔥', userId: 'vitor_id' },
        { id: '2', user: '@haras_nobre', text: 'Esse cavalo é diferenciado demais.', userId: 'haras_id' },
        { id: '3', user: '@ana_montaria', text: 'Parabéns pela postagem!', userId: 'ana_id' },
    ]);
    const [newComment, setNewComment] = useState('');
    const [editingComment, setEditingComment] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');
    const [showOptions, setShowOptions] = useState<string | null>(null);

    // Social States
    const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
    const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);

    // Mobile Detection
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const [showDesktopBlock, setShowDesktopBlock] = useState(false);

    // Post Wizard States
    const [wizard, setWizard] = useState({
        show: false,
        step: 0, // 0: Options, 1: Editor, 2: Finalize
        file: null as File | null,
        preview: '',
        caption: '',
        location: '',
        coords: null as { lat: number, lng: number } | null,
        rotation: 0,
        aspect: '1:1' as '1:1' | '4:5',
        type: 'POST' as 'POST' | 'AVATAR'
    });

    const [permissionStatus, setPermissionStatus] = useState({
        camera: 'prompt' as 'prompt' | 'granted' | 'denied',
        gallery: 'prompt' as 'prompt' | 'granted' | 'denied'
    });

    const handleAddAvatar = () => {
        if (!isMobile && process.env.NODE_ENV === 'production') {
            setShowDesktopBlock(true);
            return;
        }
        setWizard({ ...wizard, show: true, step: 0, type: 'AVATAR' });
    };

    const handleAddPost = () => {
        if (!isMobile && process.env.NODE_ENV === 'production') {
            setShowDesktopBlock(true);
            return;
        }
        setWizard({ ...wizard, show: true, step: 0, type: 'POST' });
    };

    const handleLike = (postId: string) => {
        setLikedPosts(prev => {
            const next = new Set(prev);
            if (next.has(postId)) next.delete(postId);
            else next.add(postId);
            return next;
        });
    };

    const handleSavePost = (postId: string) => {
        setSavedPosts(prev => {
            const next = new Set(prev);
            if (next.has(postId)) next.delete(postId);
            else next.add(postId);
            return next;
        });
    };

    const handleShare = async (post: any) => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: '+Vaquejada Post',
                    text: post.caption || 'Confira este post no +Vaquejada!',
                    url: window.location.href,
                });
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            alert('Link copiado para a área de transferência!');
            navigator.clipboard.writeText(window.location.href);
        }
    };

    const handleGeolocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocalização não suportada no seu navegador.');
            return;
        }

        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                setWizard(prev => ({
                    ...prev,
                    coords: { lat: latitude, lng: longitude },
                    location: 'Localização Capturada'
                }));

                // Simulation of reverse geocoding
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const data = await res.json();
                    if (data.address) {
                        const city = data.address.city || data.address.town || data.address.village;
                        const state = data.address.state;
                        setWizard(prev => ({ ...prev, location: `${city}, ${state}` }));
                    }
                } catch (e) {
                    console.error('Geo error:', e);
                } finally {
                    setLoading(false);
                }
            },
            (err) => {
                setLoading(false);
                if (err.code === 1) {
                    alert('Permissão de localização negada. Ative nas configurações para marcar o post.');
                    setWizard(prev => ({ ...prev, location: 'Localização desativada' }));
                }
            },
            { timeout: 10000 }
        );
    };

    const handlePostComment = () => {
        if (!newComment.trim()) return;
        const comment = {
            id: Date.now().toString(),
            user: `@${user.name.toLowerCase().replace(/\s+/g, '_')}`,
            text: newComment,
            userId: user.id
        };
        setComments([...comments, comment]);
        setNewComment('');
        // Scroll would happen here
    };

    const handleDeleteComment = (commentId: string) => {
        if (confirm('Deseja excluir este comentário?')) {
            setComments(comments.filter(c => c.id !== commentId));
            setShowOptions(null);
        }
    };

    const handleStartEdit = (comment: any) => {
        setEditingComment(comment.id);
        setEditValue(comment.text);
        setShowOptions(null);
    };

    const handleSaveEdit = () => {
        setComments(comments.map(c => c.id === editingComment ? { ...c, text: editValue } : c));
        setEditingComment(null);
    };

    useEffect(() => {
        const storedEvents = JSON.parse(localStorage.getItem('arena_favorites') || '[]');
        setFavoriteEvents(storedEvents);
        const storedAds = JSON.parse(localStorage.getItem('arena_market_favorites') || '[]');
        setFavoriteAds(storedAds);
    }, [subView]);

    if (!user) return null;

    const handleAddPhoto = () => setWizard({ ...wizard, show: true, step: 0 });

    const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const preview = URL.createObjectURL(file);
            setWizard(prev => ({ ...prev, file, preview, step: 1 }));
        }
    };

    const requestLegacyPermission = (type: 'camera' | 'gallery') => {
        // In Web, we trigger the input, if it fails or user cancels, we handle here
        if (type === 'camera') {
            postInputRef.current?.setAttribute('capture', 'environment');
        } else {
            postInputRef.current?.removeAttribute('capture');
        }
        postInputRef.current?.click();
    };

    const publishFinalPost = async () => {
        if (!wizard.file) return;
        setLoading(true);
        try {
            const fileName = `${user.id}/${Date.now()}.jpg`;

            // 1. Upload to Storage
            const { data: storageData, error: storageError } = await supabase.storage
                .from('posts')
                .upload(fileName, wizard.file, { contentType: 'image/jpeg' });

            if (storageError) throw storageError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('posts')
                .getPublicUrl(fileName);

            if (wizard.type === 'AVATAR') {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .update({ avatar_url: publicUrl })
                    .eq('id', user.id);
                if (profileError) throw profileError;

                // Update local UI
                user.avatar_url = publicUrl;
            } else {
                // 3. Save to posts table
                const { error: dbError } = await supabase
                    .from('posts')
                    .insert({
                        user_id: user.id,
                        media_url: publicUrl,
                        caption: wizard.caption,
                        location_text: wizard.location,
                        lat: wizard.coords?.lat,
                        lng: wizard.coords?.lng,
                        status: 'ACTIVE'
                    });
                if (dbError) throw dbError;

                // Update Local UI (Mock list)
                const newPost = {
                    id: Date.now().toString(),
                    img: publicUrl,
                    likes: 0,
                    comments: 0
                };
                setProfilePosts([newPost, ...profilePosts]);
            }

            setWizard({ ...wizard, show: false, step: 0, preview: '', caption: '', location: '', coords: null, file: null });
            alert(wizard.type === 'AVATAR' ? 'Foto de perfil atualizada!' : 'Publicado com sucesso! 🐎');
        } catch (e: any) {
            console.error('Upload error:', e);
            alert(`Erro ao publicar: ${e.message || 'Tente novamente.'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleProfilePicChange = () => {
        if (fileInputRef.current) fileInputRef.current.click();
    };

    const renderHeader = (title: string) => (
        <div className="flex items-center gap-4 mb-6">
            <button onClick={() => setSubView('NONE')} className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md text-[#1A1108]">
                <span className="material-icons">arrow_back</span>
            </button>
            <h2 className="text-2xl font-black uppercase text-[#1A1108] italic tracking-tight">{title}</h2>
        </div>
    );

    // Detalhe do Post (Overlay)
    if (selectedPost) {
        return (
            <div className="absolute inset-0 z-[110] bg-white flex flex-col animate-in slide-in-from-bottom duration-300">
                <header className="px-6 py-4 flex items-center gap-4 border-b border-[#1A1108]/5">
                    <button onClick={() => setSelectedPost(null)} className="material-icons text-leather">arrow_back</button>
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-[#1A1108]">Publicação</h3>
                        <p className="text-[10px] font-bold text-[#1A1108]/40 uppercase tracking-tight">Postado recentemente</p>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto">
                    {/* User Info */}
                    <div className="px-5 py-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full border border-[#D4AF37] p-0.5">
                            <img className="w-full h-full object-cover rounded-full" src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.name}`} />
                        </div>
                        <span className="font-black text-xs text-[#1A1108] uppercase tracking-tight">{user.name}</span>
                    </div>

                    {/* Image */}
                    <div className="w-full aspect-square bg-neutral-100">
                        <img src={selectedPost.img} className="w-full h-full object-cover" />
                    </div>

                    {/* Interactions */}
                    <div className="px-5 py-4 flex justify-between items-center">
                        <div className="flex gap-6 items-center">
                            <button
                                onClick={() => handleLike(selectedPost.id)}
                                className="flex items-center gap-2 active:scale-125 transition-transform"
                            >
                                <span className={`material-icons text-[24px] ${likedPosts.has(selectedPost.id) ? 'text-red-500' : 'text-[#1A1108]'}`}>
                                    {likedPosts.has(selectedPost.id) ? 'favorite' : 'favorite_border'}
                                </span>
                                <span className="text-[14px] font-black text-[#1A1108]">
                                    {selectedPost.likes + (likedPosts.has(selectedPost.id) ? 1 : 0)}
                                </span>
                            </button>
                            <button onClick={() => alert('Role para ver os comentários abaixo!')} className="flex items-center gap-2">
                                <span className="material-icons text-[24px] text-[#1A1108]">chat_bubble_outline</span>
                                <span className="text-[14px] font-black text-[#1A1108]">{selectedPost.comments}</span>
                            </button>
                            <button onClick={() => handleShare(selectedPost)}>
                                <span className="material-icons text-[24px] text-[#1A1108]">share</span>
                            </button>
                        </div>
                        <button
                            onClick={() => handleSavePost(selectedPost.id)}
                            className={`active:scale-125 transition-transform ${savedPosts.has(selectedPost.id) ? 'text-[#D4AF37]' : 'text-[#1A1108]/20'}`}
                        >
                            <span className="material-icons text-[24px]">{savedPosts.has(selectedPost.id) ? 'bookmark' : 'bookmark_border'}</span>
                        </button>
                    </div>

                    {/* Comments List */}
                    <div className="px-5 space-y-4 pb-10">
                        <p className="text-[11px] font-black text-black/30 uppercase tracking-[0.2em] mb-4">Comentários</p>
                        <div className="space-y-4">
                            {comments.map(c => {
                                const isPostOwner = true; // Since this is ProfileView, user is the owner
                                const isAuthor = c.userId === user.id;
                                const isAdmin = user.role === 'ADMIN';
                                const canDelete = isAuthor || isPostOwner || isAdmin;
                                const canEdit = isAuthor;

                                return (
                                    <div key={c.id} className="flex gap-3 group relative">
                                        <div className="w-8 h-8 rounded-full bg-neutral-100 shrink-0 overflow-hidden border border-leather/5">
                                            <img src={`https://picsum.photos/seed/${c.user}/50`} className="w-full h-full object-cover" alt="" />
                                        </div>
                                        <div className="flex-1">
                                            {editingComment === c.id ? (
                                                <div className="space-y-2">
                                                    <textarea
                                                        className="w-full bg-leather/5 rounded-xl p-3 text-xs font-bold text-black border border-[#D4AF37]/50 focus:outline-none"
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        autoFocus
                                                    />
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={() => setEditingComment(null)} className="text-[9px] font-black uppercase text-leather/40">Cancelar</button>
                                                        <button onClick={handleSaveEdit} className="text-[9px] font-black uppercase text-[#D4AF37]">Salvar</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="flex justify-between items-start">
                                                        <p className="text-xs leading-relaxed text-black">
                                                            <span className="font-black mr-2 uppercase text-[10px] tracking-tight">{c.user}</span>
                                                            <span className="font-bold">{c.text}</span>
                                                        </p>
                                                        {(canDelete || canEdit) && (
                                                            <div className="relative">
                                                                <button onClick={() => setShowOptions(showOptions === c.id ? null : c.id)} className="material-icons text-leather/20 text-lg hover:text-leather/60 transition-colors">more_vert</button>
                                                                {showOptions === c.id && (
                                                                    <div className="absolute right-0 top-6 bg-white shadow-xl border border-leather/5 rounded-xl py-1 z-50 w-32 animate-in fade-in zoom-in duration-150">
                                                                        {canEdit && <button onClick={() => handleStartEdit(c)} className="w-full px-4 py-2 text-left text-[10px] font-black uppercase text-leather hover:bg-leather/5 flex items-center gap-2"><span className="material-icons text-sm">edit</span> Editar</button>}
                                                                        {canDelete && <button onClick={() => handleDeleteComment(c.id)} className="w-full px-4 py-2 text-left text-[10px] font-black uppercase text-red-500 hover:bg-red-50 flex items-center gap-2"><span className="material-icons text-sm">delete</span> Excluir</button>}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-3 mt-1 opacity-20 hover:opacity-100 transition-opacity">
                                                        <span className="text-[9px] font-black uppercase cursor-pointer">Responder</span>
                                                        <span className="text-[9px] font-black uppercase cursor-pointer">Curtir</span>
                                                        <span className="text-[9px] font-black uppercase opacity-60">Há 5 min</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Comment Input */}
                <div className="p-4 border-t border-[#1A1108]/5 flex gap-4 items-center bg-white">
                    <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                        <img src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.name}`} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 relative">
                        <input
                            placeholder="Adicione um comentário..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handlePostComment()}
                            className="w-full bg-black/5 rounded-full py-4 px-6 text-xs font-bold text-black outline-none pr-20 focus:bg-black/10 transition-colors placeholder:text-black/30"
                        />
                        <button
                            onClick={handlePostComment}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#D4AF37] font-black text-[10px] uppercase tracking-widest active:scale-95 transition-transform"
                        >
                            Publicar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (subView === 'EVENTS') {
        const myEvents = ALL_EVENTS.filter(e => favoriteEvents.includes(e.id));
        return (
            <div className="min-h-full bg-[#F8F5F2] px-6 py-8 animate-in slide-in-from-right duration-300 pb-24">
                {renderHeader('Meus Eventos')}
                <div className="space-y-4">
                    {myEvents.length > 0 ? myEvents.map(event => (
                        <div key={event.id} className="bg-white rounded-2xl p-4 shadow-sm border border-[#1A1108]/5 flex gap-4">
                            <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-200 shrink-0">
                                <img src={event.imageUrl} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest mb-1">{event.date.day} {event.date.month}</p>
                                <h3 className="font-black text-sm text-[#1A1108] leading-tight mb-1">{event.title}</h3>
                                <p className="text-xs text-[#1A1108]/60">{event.location}</p>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-20 opacity-40">
                            <span className="material-icons text-4xl mb-2">event_busy</span>
                            <p className="font-bold text-sm uppercase">Nenhum evento favoritado</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (subView === 'FAVORITES') {
        const myFavAds = ALL_ADS.filter(ad => favoriteAds.includes(ad.title));
        return (
            <div className="min-h-full bg-[#F8F5F2] px-6 py-8 animate-in slide-in-from-right duration-300 pb-24">
                {renderHeader('Anúncios Favoritos')}
                <div className="grid grid-cols-2 gap-4">
                    {myFavAds.length > 0 ? myFavAds.map((item, i) => (
                        <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#1A1108]/5">
                            <div className="aspect-square relative overflow-hidden bg-neutral-100">
                                <img src={item.img} className="w-full h-full object-cover" />
                            </div>
                            <div className="p-3">
                                <p className="text-xs font-black text-[#D4AF37] mb-1">{item.price}</p>
                                <h3 className="text-[10px] font-black uppercase tracking-tight line-clamp-2 leading-tight">{item.title}</h3>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-2 text-center py-20 opacity-40">
                            <span className="material-icons text-4xl mb-2">favorite_border</span>
                            <p className="font-bold text-sm uppercase">Nenhum anúncio favoritado</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (subView === 'CALENDAR') {
        return (
            <div className="min-h-full bg-[#F8F5F2] px-6 py-8 animate-in slide-in-from-right duration-300 pb-24">
                {renderHeader('Agenda')}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#1A1108]/5 text-center mb-8">
                    <p className="text-xs font-black text-[#1A1108]/40 uppercase tracking-widest mb-2">HOJE</p>
                    <p className="text-4xl font-black text-[#1A1108] mb-1 leading-none">{new Date().getDate()}</p>
                    <p className="text-lg font-bold text-[#D4AF37] uppercase">{new Date().toLocaleString('pt-BR', { month: 'long' })}</p>
                </div>
                <div className="text-center py-20 opacity-40">
                    <span className="material-icons text-4xl mb-2">calendar_month</span>
                    <p className="font-bold text-sm uppercase">Agenda Vazia</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full bg-white text-leather font-sans pb-24">
            {/* Cleaner Header Section (No Faixa) */}
            <div className="px-6 pt-12">
                <div className="flex justify-between items-center mb-10">
                    <h1 className="text-[#1A1108] font-black text-2xl italic tracking-tighter uppercase">MEU PERFIL</h1>
                    <div className="flex gap-4">
                        <button onClick={onAdminView} className="material-icons text-leather/40">admin_panel_settings</button>
                        <button onClick={onSettingsView} className="material-icons text-leather/40">settings</button>
                        <button onClick={onLogout} className="material-icons text-red-400">logout</button>
                    </div>
                </div>

                {/* Profile Top Info */}
                <div className="flex flex-col items-center mb-10">
                    <div className="relative mb-6">
                        <div
                            onClick={handleAddAvatar}
                            className="w-32 h-32 rounded-full border-4 border-[#D4AF37] p-1.5 bg-white shadow-2xl relative group cursor-pointer active:scale-95 transition-transform"
                        >
                            <img
                                src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                                className="w-full h-full rounded-full object-cover transition-opacity group-hover:opacity-40"
                                alt={user.name}
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="material-icons text-white text-3xl">add_a_photo</span>
                            </div>
                        </div>
                    </div>

                    <h2 className="text-3xl font-black text-[#1A1108] leading-none mb-2">{user.name.toUpperCase()}</h2>
                    <div className="flex items-center gap-1 text-leather/40 mb-2">
                        <span className="material-icons text-sm">place</span>
                        <span className="text-xs font-black uppercase tracking-wider">{user.state_id || 'ARENA +VAQUEJADA'}</span>
                    </div>

                    <p className="text-sm font-medium text-leather/60 text-center max-w-[80%] mb-4 leading-relaxed">
                        {user.bio || 'Bem-vindo ao meu perfil no +Vaquejada!'}
                    </p>

                    <div className="px-3 py-1 bg-leather/5 rounded-full mb-6">
                        <p className="text-[9px] font-black text-leather/30 uppercase tracking-[0.2em]">ID: {user.id.slice(0, 8).toUpperCase()}</p>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-3 gap-8 w-full border-y border-leather/5 py-4 mb-4">
                        <div className="text-center">
                            <p className="text-lg font-black text-[#1A1108]">{profilePosts.length}</p>
                            <p className="text-[9px] font-black text-leather/30 uppercase tracking-widest">Postagens</p>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-black text-[#D4AF37]">1.24k</p>
                            <p className="text-[9px] font-black text-leather/30 uppercase tracking-widest">Pontos</p>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-black text-[#1A1108]">452</p>
                            <p className="text-[9px] font-black text-leather/30 uppercase tracking-widest">Seguidores</p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 w-full">
                        <button
                            onClick={handleAddPost}
                            className="w-full bg-[#1A1108] text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-xl shadow-black/10"
                        >
                            <span className="material-icons text-sm">add</span>
                            Adicionar Foto
                        </button>
                    </div>
                </div>

                {/* Sub-navigation Tabs */}
                {/* ... existing tabs ... */}

            </div>

            {/* Desktop Blocking Modal */}
            {showDesktopBlock && (
                <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6">
                    <div className="bg-white rounded-[32px] p-8 max-w-sm w-full text-center space-y-6">
                        <div className="w-20 h-20 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                            <span className="material-icons text-4xl">stay_primary_portrait</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-black uppercase text-[#1A1108]">Função exclusiva mobile</h3>
                            <p className="text-sm font-bold text-neutral-400 mt-2">Esta função é exclusiva do app mobile para acesso à câmera e galeria do seu celular.</p>
                        </div>
                        <button
                            onClick={() => setShowDesktopBlock(false)}
                            className="w-full bg-[#1A1108] text-white py-4 rounded-2xl font-black uppercase tracking-widest"
                        >
                            Entendi
                        </button>
                    </div>
                </div>
            )}

            {/* Post Wizard Overlay */}
            {wizard.show && (
                <div className="fixed inset-0 z-[200] bg-white flex flex-col animate-in slide-in-from-bottom duration-500">
                    <header className="px-6 py-6 border-b border-[#1A1108]/5 flex items-center justify-between bg-white relative">
                        <button onClick={() => setWizard({ ...wizard, show: false })} className="material-icons text-leather">close</button>
                        <h2 className="text-sm font-black uppercase tracking-[0.2em] italic">Nova Publicação</h2>
                        {wizard.step === 2 ? (
                            <button onClick={publishFinalPost} className="text-[#D4AF37] font-black text-sm uppercase tracking-widest active:scale-95 transition-transform">Publicar</button>
                        ) : wizard.step === 1 ? (
                            <button onClick={() => setWizard({ ...wizard, step: 2 })} className="text-[#D4AF37] font-black text-sm uppercase tracking-widest">Próximo</button>
                        ) : <div className="w-10"></div>}
                    </header>

                    <div className="flex-1 overflow-y-auto bg-[#F8F5F2]">
                        {wizard.step === 0 && (
                            <div className="p-8 space-y-6">
                                <p className="text-center text-[11px] font-black text-leather/30 uppercase tracking-[0.3em] mb-4">Escolha a origem da foto</p>

                                <button
                                    onClick={() => requestLegacyPermission('camera')}
                                    className="w-full bg-white p-7 rounded-[32px] border-2 border-leather/5 flex items-center gap-6 active:scale-[0.98] transition-all hover:border-[#D4AF37]/30 shadow-sm"
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                                        <span className="material-icons text-4xl">photo_camera</span>
                                    </div>
                                    <div className="text-left">
                                        <p className="font-black uppercase text-base italic tracking-tight">Tirar Foto</p>
                                        <p className="text-[11px] font-bold text-leather/40">Usar a câmera do celular</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => requestLegacyPermission('gallery')}
                                    className="w-full bg-white p-7 rounded-[32px] border-2 border-leather/5 flex items-center gap-6 active:scale-[0.98] transition-all hover:border-[#1A1108]/30 shadow-sm"
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-[#1A1108]/10 flex items-center justify-center text-[#1A1108]">
                                        <span className="material-icons text-4xl">photo_library</span>
                                    </div>
                                    <div className="text-left">
                                        <p className="font-black uppercase text-base italic tracking-tight">Galeria</p>
                                        <p className="text-[11px] font-bold text-leather/40">Escolher da memória</p>
                                    </div>
                                </button>

                                {/* Input invisível para acionar o seletor nativo */}
                                <input
                                    type="file"
                                    ref={postInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileSelection}
                                />
                            </div>
                        )}

                        {wizard.step === 1 && (
                            <div className="flex flex-col h-full bg-black">
                                <div className="flex-1 relative flex items-center justify-center overflow-hidden">
                                    <div className="absolute inset-0 opacity-40">
                                        <img src={wizard.preview} className="w-full h-full object-cover blur-2xl" alt="" />
                                    </div>
                                    <div
                                        className="relative transition-all duration-300"
                                        style={{
                                            transform: `rotate(${wizard.rotation}deg)`,
                                            aspectRatio: wizard.aspect === '1:1' ? '1/1' : '4/5',
                                            maxHeight: '80%',
                                            maxWidth: '90%'
                                        }}
                                    >
                                        <img src={wizard.preview} className="w-full h-full object-cover rounded-xl shadow-2xl" alt="Preview" />

                                        {/* Grid Overlay for WOW factor */}
                                        <div className="absolute inset-0 pointer-events-none border border-white/20">
                                            <div className="absolute inset-y-0 left-1/3 border-l border-white/20"></div>
                                            <div className="absolute inset-y-0 left-2/3 border-l border-white/20"></div>
                                            <div className="absolute inset-x-0 top-1/3 border-t border-white/20"></div>
                                            <div className="absolute inset-x-0 top-2/3 border-t border-white/20"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 bg-white rounded-t-[32px] flex justify-around items-center">
                                    <button
                                        onClick={() => setWizard({ ...wizard, aspect: wizard.aspect === '1:1' ? '4:5' : '1:1' })}
                                        className="flex flex-col items-center gap-2"
                                    >
                                        <span className="material-icons text-leather/40">aspect_ratio</span>
                                        <span className="text-[8px] font-black uppercase tracking-widest text-leather/40">{wizard.aspect}</span>
                                    </button>
                                    <button
                                        onClick={() => setWizard({ ...wizard, rotation: (wizard.rotation + 90) % 360 })}
                                        className="flex flex-col items-center gap-2"
                                    >
                                        <span className="material-icons text-leather/40">rotate_right</span>
                                        <span className="text-[8px] font-black uppercase tracking-widest text-leather/40">Girar</span>
                                    </button>
                                    <button className="flex flex-col items-center gap-2">
                                        <span className="material-icons text-[#D4AF37]">auto_fix_high</span>
                                        <span className="text-[8px] font-black uppercase tracking-widest text-[#D4AF37]">Mágico</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {wizard.step === 2 && (
                            <div className="p-6 space-y-8 animate-in slide-in-from-right duration-300">
                                <div className="flex gap-4">
                                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-neutral-100 border border-leather/5 shrink-0 shadow-lg shadow-black/5">
                                        <img src={wizard.preview} className="w-full h-full object-cover" style={{ transform: `rotate(${wizard.rotation}deg)` }} alt="" />
                                    </div>
                                    <textarea
                                        value={wizard.caption}
                                        onChange={(e) => setWizard({ ...wizard, caption: e.target.value })}
                                        placeholder="Escreva uma legenda..."
                                        className="flex-1 bg-white rounded-2xl p-4 text-xs font-bold text-leather border border-leather/5 outline-none focus:border-[#D4AF37] transition-all"
                                        rows={4}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <button
                                        onClick={handleGeolocation}
                                        className="w-full bg-white p-5 rounded-2xl border border-leather/5 flex items-center justify-between group active:scale-[0.98] transition-all"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${wizard.coords ? 'bg-green-100 text-green-600' : 'bg-[#D4AF37]/10 text-[#D4AF37]'}`}>
                                                <span className="material-icons">{wizard.coords ? 'check_circle' : 'place'}</span>
                                            </div>
                                            <div className="text-left">
                                                <p className="text-[11px] font-black uppercase italic">{wizard.location || 'Adicionar Localização'}</p>
                                                <p className="text-[9px] font-bold text-leather/40">Sua localização atual na foto</p>
                                            </div>
                                        </div>
                                        <span className="material-icons text-leather/20">chevron_right</span>
                                    </button>

                                    <div className="p-5 bg-white rounded-2xl border border-leather/5 space-y-4">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-[11px] font-black uppercase italic">Marcar Usuários</p>
                                                <p className="text-[9px] font-bold text-leather/40">Marque seus amigos na postagem</p>
                                            </div>
                                            <span className="material-icons text-leather/20 text-lg">person_add</span>
                                        </div>
                                        <div className="h-[1px] bg-leather/5"></div>
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-[11px] font-black uppercase italic">Configurações Avançadas</p>
                                                <p className="text-[9px] font-bold text-leather/40">Ocultar curtidas, comentários...</p>
                                            </div>
                                            <span className="material-icons text-leather/20 text-lg">tune</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {loading && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-[300] flex flex-col items-center justify-center">
                            <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] animate-pulse">Processando Mídia...</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProfileView;
