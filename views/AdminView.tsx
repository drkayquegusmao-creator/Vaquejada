import React, { useState } from 'react';
import {
    AdminStats,
    EventItem,
    User,
    Advertisement,
    Communication,
    Sponsor,
    PostItem
} from '../types';

type AdminModule = 'DASHBOARD' | 'EVENTS' | 'ADS' | 'USERS' | 'COMMUNICATIONS' | 'SOCIAL' | 'SPONSORS' | 'NOTIFICATIONS' | 'SETTINGS';

// Mock Data
const MOCK_STATS: AdminStats = {
    totalUsers: 12543,
    activeEvents: 8,
    activeAds: 1432,
    pendingComplaints: 12,
    activeCommunications: 3,
    activeSponsors: 5,
    revenue: 'R$ 45.200,00'
};

const MASTER_EMAIL = 'kayquegusmao@icloud.com';

const MOCK_USERS: User[] = [
    { id: '1', name: 'Kayque Gusmão', email: 'kayquegusmao@icloud.com', phone: '83999999999', state_id: 'PB', city_id: 'CG', type: 'admin', role: 'ADMIN', permissions: [], trustLevel: 'normal', blocked: false, isMaster: true, createdAt: '2024-01-01' },
    { id: '2', name: 'Vitor Vaqueiro', email: 'vitor@vaquejada.com', phone: '83988888888', state_id: 'PB', city_id: 'CG', type: 'common', role: 'USER', permissions: [], trustLevel: 'normal', blocked: false, createdAt: '2024-02-01' },
    { id: '3', name: 'Ana Montaria', email: 'ana@vaquejada.com', phone: '83977777777', state_id: 'PE', city_id: 'Recife', type: 'common', role: 'USER', permissions: [], trustLevel: 'normal', blocked: false, createdAt: '2024-03-01' },
];

const AdminView: React.FC = () => {
    const [activeModule, setActiveModule] = useState<AdminModule>('DASHBOARD');
    const [editingEvent, setEditingEvent] = useState<Partial<EventItem> | null>(null);
    const [isEventFormOpen, setIsEventFormOpen] = useState(false);
    const [users, setUsers] = useState<User[]>(MOCK_USERS);
    const [searchUser, setSearchUser] = useState('');

    const handleSaveEvent = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Vaquejada salva com sucesso! (Simulação)');
        setIsEventFormOpen(false);
        setEditingEvent(null);
    };

    const toggleAdminRole = (userId: string) => {
        const user = users.find(u => u.id === userId);
        if (user?.email === MASTER_EMAIL) {
            alert('Atenção: O usuário Master não pode ter seu cargo alterado por segurança.');
            return;
        }

        setUsers(prev => prev.map(u => {
            if (u.id === userId) {
                const newRole = u.role === 'ADMIN' ? 'USER' : 'ADMIN';
                return { ...u, role: newRole as any };
            }
            return u;
        }));
    };

    const handleDeleteUser = (userId: string) => {
        const user = users.find(u => u.id === userId);
        if (user?.email === MASTER_EMAIL) {
            alert('Erro Crítico: Operação Negada. O usuário Master não pode ser removido.');
            return;
        }

        if (confirm(`Deseja realmente remover o usuário ${user?.name}?`)) {
            setUsers(prev => prev.filter(u => u.id !== userId));
        }
    };

    const renderEventForm = () => (
        <div className="pb-24 animate-in slide-in-from-bottom duration-300">
            <header className="flex items-center gap-4 mb-6">
                <button onClick={() => { setIsEventFormOpen(false); setEditingEvent(null); }} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center active:scale-95 transition-transform">
                    <span className="material-icons text-white">close</span>
                </button>
                <div>
                    <h1 className="text-xl font-black text-white uppercase italic tracking-tight">{editingEvent?.id ? 'Editar Evento' : 'Nova Vaquejada'}</h1>
                    <p className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-widest">Preencha os dados oficiais</p>
                </div>
            </header>

            <form className="space-y-6" onSubmit={handleSaveEvent}>
                {/* Image Section */}
                <div className="space-y-4 bg-white/5 p-6 rounded-2xl border border-white/10">
                    <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Capa do Evento</h3>

                    <div className="aspect-video bg-neutral-900 rounded-xl overflow-hidden border border-white/10 relative group">
                        {editingEvent?.imageUrl ? (
                            <img src={editingEvent.imageUrl} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-white/20">
                                <span className="material-icons text-4xl mb-2">image</span>
                                <p className="text-[10px] font-bold uppercase">Sem imagem selecionada</p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Endereço (URL) da Imagem</label>
                            <input
                                type="text"
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/20 focus:border-[#D4AF37] outline-none text-xs"
                                placeholder="https://exemplo.com/foto.jpg"
                                defaultValue={editingEvent?.imageUrl}
                                onChange={(e) => setEditingEvent({ ...editingEvent, imageUrl: e.target.value })}
                            />
                        </div>

                        <div className="relative">
                            <div className="flex items-center gap-4">
                                <div className="h-[1px] flex-1 bg-white/10"></div>
                                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">OU</span>
                                <div className="h-[1px] flex-1 bg-white/10"></div>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => alert('Simulando abertura do seletor de arquivos...')}
                            className="w-full bg-white/5 border border-white/10 py-4 rounded-xl flex items-center justify-center gap-2 group hover:bg-white/10 transition-colors"
                        >
                            <span className="material-icons text-white/40 group-hover:text-white">cloud_upload</span>
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Anexar do Dispositivo</span>
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Nome do Evento</label>
                        <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/20 focus:border-[#D4AF37] outline-none font-bold" placeholder="Ex: Grande Vaquejada de Surubim" defaultValue={editingEvent?.title} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Cidade/UF</label>
                            <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/20 focus:border-[#D4AF37] outline-none" placeholder="Surubim, PE" defaultValue={editingEvent?.location} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Parque</label>
                            <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/20 focus:border-[#D4AF37] outline-none" placeholder="Parque J. Galdino" defaultValue={editingEvent?.park} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Data</label>
                            <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/20 focus:border-[#D4AF37] outline-none" placeholder="DD/MM" defaultValue={`${editingEvent?.date?.day || ''}/${editingEvent?.date?.month || ''}`} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Valor Senha</label>
                            <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/20 focus:border-[#D4AF37] outline-none" placeholder="R$ 0,00" defaultValue={editingEvent?.price} />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Premiação Total</label>
                        <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/20 focus:border-[#D4AF37] outline-none" placeholder="Ex: R$ 200.000,00 em prêmios" defaultValue={editingEvent?.prizes} />
                    </div>

                    <div className="space-y-3 pt-4">
                        <div className="flex items-center gap-3">
                            <input type="checkbox" id="highlight" defaultChecked={editingEvent?.isHighlight} className="w-5 h-5 accent-[#D4AF37] bg-white/5 border-white/10 rounded" />
                            <label htmlFor="highlight" className="text-sm text-white font-bold select-none">Destacar na Home (Carrossel)</label>
                        </div>
                        <div className="flex items-center gap-3">
                            <input type="checkbox" id="paused" defaultChecked={editingEvent?.isPaused} className="w-5 h-5 accent-red-500 bg-white/5 border-white/10 rounded" />
                            <label htmlFor="paused" className="text-sm text-white font-bold select-none text-red-400">Pausar Evento (Oculto)</label>
                        </div>
                    </div>
                </div>

                <button type="submit" className="w-full bg-[#D4AF37] text-background-dark font-black py-4 rounded-xl uppercase tracking-widest mt-6 shadow-lg shadow-[#D4AF37]/20">
                    Salvar Alterações
                </button>
            </form>
        </div>
    );

    const renderDashboard = () => (
        <div className="space-y-6 pb-24">
            <header className="mb-6">
                <h1 className="text-3xl font-black text-[#D4AF37] uppercase italic tracking-tighter">Painel Admin</h1>
                <p className="text-white/40 text-xs font-medium uppercase tracking-widest">Gestão da Arena Digital</p>
            </header>

            {/* Main Stats Grid */}
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Métricas Gerais</h3>
            <div className="grid grid-cols-2 gap-3">
                <div onClick={() => setActiveModule('USERS')} className="bg-white/5 border border-white/10 p-4 rounded-2xl active:scale-95 transition-transform cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                        <span className="material-icons text-white/40">group</span>
                        <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded font-bold">+12%</span>
                    </div>
                    <p className="text-2xl font-black text-white">{MOCK_STATS.totalUsers.toLocaleString()}</p>
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Usuários Totais</p>
                </div>
                <div onClick={() => setActiveModule('EVENTS')} className="bg-white/5 border border-white/10 p-4 rounded-2xl active:scale-95 transition-transform cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                        <span className="material-icons text-[#D4AF37]">emoji_events</span>
                        <span className="text-[10px] bg-[#D4AF37]/20 text-[#D4AF37] px-1.5 py-0.5 rounded font-bold">ATIVOS</span>
                    </div>
                    <p className="text-2xl font-black text-white">{MOCK_STATS.activeEvents}</p>
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Vaquejadas</p>
                </div>
                <div onClick={() => setActiveModule('ADS')} className="bg-white/5 border border-white/10 p-4 rounded-2xl active:scale-95 transition-transform cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                        <span className="material-icons text-blue-400">storefront</span>
                    </div>
                    <p className="text-2xl font-black text-white">{MOCK_STATS.activeAds.toLocaleString()}</p>
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Anúncios Ativos</p>
                </div>
                <div onClick={() => setActiveModule('USERS')} className="bg-white/5 border border-white/10 p-4 rounded-2xl active:scale-95 transition-transform cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                        <span className="material-icons text-red-400">gavel</span>
                        {MOCK_STATS.pendingComplaints > 0 && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>}
                    </div>
                    <p className="text-2xl font-black text-white">{MOCK_STATS.pendingComplaints}</p>
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Denúncias</p>
                </div>
            </div>

            {/* Secondary Stats */}
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2 mt-6">Financeiro & Comunicados</h3>
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-1">Comunicados</p>
                    <p className="text-lg font-black text-white">{MOCK_STATS.activeCommunications}</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-3 rounded-xl col-span-2">
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-1">Patrocínios Ativos</p>
                    <p className="text-lg font-black text-[#D4AF37]">{MOCK_STATS.activeSponsors}</p>
                </div>
            </div>

            {/* Actions List */}
            <div className="space-y-2 mt-8">
                <button onClick={() => setActiveModule('NOTIFICATIONS')} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl flex items-center justify-between group active:bg-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                            <span className="material-icons text-white/60">campaign</span>
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-black text-white uppercase tracking-wide">Nova Notificação</p>
                            <p className="text-[10px] text-white/40 font-medium">Enviar push para usuários</p>
                        </div>
                    </div>
                    <span className="material-icons text-white/20 group-hover:text-white/60">chevron_right</span>
                </button>
            </div>
        </div>
    );

    const renderModuleHeader = (title: string, icon: string) => (
        <header className="flex items-center gap-4 mb-6">
            <button onClick={() => setActiveModule('DASHBOARD')} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center active:scale-95 transition-transform">
                <span className="material-icons text-white">arrow_back</span>
            </button>
            <div>
                <h1 className="text-xl font-black text-white uppercase italic tracking-tight">{title}</h1>
                <p className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-widest">Painel de Controle</p>
            </div>
        </header>
    );

    const renderComingSoon = (moduleName: string) => (
        <div className="flex flex-col items-center justify-center py-20 opacity-40">
            <span className="material-icons text-6xl mb-4">construction</span>
            <p className="font-black uppercase tracking-widest text-center">Módulo {moduleName} <br />Em Desenvolvimento</p>
        </div>
    );

    const renderContent = () => {
        switch (activeModule) {
            case 'DASHBOARD': return renderDashboard();
            case 'EVENTS':
                if (isEventFormOpen) return renderEventForm();
                return (
                    <div className="pb-24">
                        {renderModuleHeader('Gestão de Vaquejadas', 'emoji_events')}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <button onClick={() => { setEditingEvent({}); setIsEventFormOpen(true); }} className="bg-[#D4AF37] text-background-dark p-4 rounded-xl font-black uppercase tracking-widest text-xs flex flex-col items-center gap-2 active:scale-95 transition-transform">
                                <span className="material-icons">add_circle</span>
                                Adicionar Nova
                            </button>
                            <button className="bg-white/5 border border-white/10 text-white p-4 rounded-xl font-black uppercase tracking-widest text-xs flex flex-col items-center gap-2 active:scale-95 transition-transform">
                                <span className="material-icons">history</span>
                                Histórico
                            </button>
                        </div>
                        {/* List Placeholder */}
                        <div className="space-y-3">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 px-1">Eventos Ativos</h3>
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-xl flex justify-between items-center group">
                                    <div>
                                        <h4 className="font-bold text-white">Vaquejada de Surubim</h4>
                                        <p className="text-[10px] text-white/40 uppercase font-black tracking-wide">15 SET • PARQUE J. GALDINO</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => { setEditingEvent({ id: '1', title: 'Vaquejada de Surubim', location: 'Surubim, PE', park: 'Parque J. Galdino', price: 'R$ 450,00' }); setIsEventFormOpen(true); }} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 hover:bg-[#D4AF37] hover:text-black transition-colors">
                                            <span className="material-icons text-sm">edit</span>
                                        </button>
                                        <button onClick={() => alert('Tem certeza?')} className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-colors">
                                            <span className="material-icons text-sm">delete</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'ADS':
                return (
                    <div className="pb-24">
                        {renderModuleHeader('Gestão de Anúncios', 'storefront')}
                        <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-6 pb-2">
                            {['Todos', 'Denunciados', 'Patrocinados', 'Pausados'].map(filter => (
                                <button key={filter} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-white whitespace-nowrap hover:bg-white/10 transition-colors">
                                    {filter}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 flex gap-4">
                                    <div className="w-20 h-20 bg-neutral-800 rounded-lg shrink-0 overflow-hidden">
                                        <img src={`https://picsum.photos/seed/ad${i}/200`} className="w-full h-full object-cover" alt="Ad" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-white truncate max-w-[80%]">Cavalo Quarto de Milha</h4>
                                            <button className="material-icons text-white/20 text-sm">more_vert</button>
                                        </div>
                                        <p className="text-[#D4AF37] font-black text-sm mb-1">R$ 15.000</p>
                                        <p className="text-[10px] text-white/40 uppercase truncate">Vendedor: João Vaqueiro • PE</p>

                                        <div className="flex gap-2 mt-3">
                                            <button className="px-3 py-1.5 rounded bg-green-500/20 text-green-400 text-[9px] font-black uppercase tracking-widest border border-green-500/30">
                                                Aprovar
                                            </button>
                                            <button className="px-3 py-1.5 rounded bg-red-500/20 text-red-400 text-[9px] font-black uppercase tracking-widest border border-red-500/30">
                                                Bloquear
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'USERS':
                const filteredUsers = users.filter(u =>
                    u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
                    u.email.toLowerCase().includes(searchUser.toLowerCase())
                );

                return (
                    <div className="pb-24">
                        {renderModuleHeader('Gestão de Usuários', 'group')}
                        <div className="relative mb-6">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-icons text-white/30">search</span>
                            <input
                                type="text"
                                placeholder="Buscar usuário por nome ou email..."
                                value={searchUser}
                                onChange={(e) => setSearchUser(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white text-sm focus:border-[#D4AF37] outline-none"
                            />
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 px-1">Usuários Encontrados ({filteredUsers.length})</h3>
                            {filteredUsers.map(u => (
                                <div key={u.id} className={`bg-white/5 border ${u.email === MASTER_EMAIL ? 'border-[#D4AF37]/30' : 'border-white/10'} p-4 rounded-xl flex justify-between items-center group`}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center relative">
                                            <span className="material-icons text-white/20">person</span>
                                            {u.role === 'ADMIN' && <span className="absolute -top-1 -right-1 material-icons text-[14px] text-[#D4AF37]">shield</span>}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-white text-sm">{u.name}</h4>
                                                {u.email === MASTER_EMAIL && <span className="text-[8px] bg-[#D4AF37] text-background-dark px-1 rounded font-black uppercase">Master</span>}
                                            </div>
                                            <p className="text-[10px] text-white/40 font-medium">{u.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => toggleAdminRole(u.id)}
                                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${u.role === 'ADMIN' ? 'bg-[#D4AF37] text-background-dark' : 'bg-white/5 text-white/40 border border-white/10'}`}
                                        >
                                            {u.role === 'ADMIN' ? 'Admin' : 'Tornar Admin'}
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUser(u.id)}
                                            disabled={u.email === MASTER_EMAIL}
                                            className={`w-8 h-8 rounded-full flex items-center justify-center border transition-colors ${u.email === MASTER_EMAIL ? 'opacity-20 border-white/10' : 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white'}`}
                                        >
                                            <span className="material-icons text-sm">delete</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            // Implement other cases as skeletons
            case 'COMMUNICATIONS': return <div className="pb-24">{renderModuleHeader('Comunicados', 'campaign')}{renderComingSoon('Comunicados')}</div>;
            case 'SOCIAL': return <div className="pb-24">{renderModuleHeader('Moderação Social', 'thumbs_up_down')}{renderComingSoon('Social')}</div>;
            case 'SPONSORS': return <div className="pb-24">{renderModuleHeader('Patrocinadores', 'paid')}{renderComingSoon('Patrocinadores')}</div>;
            case 'NOTIFICATIONS': return <div className="pb-24">{renderModuleHeader('Notificações', 'notifications')}{renderComingSoon('Notificações')}</div>;
            case 'SETTINGS': return <div className="pb-24">{renderModuleHeader('Configurações', 'settings')}{renderComingSoon('Configurações')}</div>;
            default: return renderDashboard();
        }
    };

    return (
        <div className="min-h-full bg-background-dark text-white p-6">
            {renderContent()}

            {/* Bottom Navigation for Admin */}
            {activeModule === 'DASHBOARD' && (
                <div className="absolute bottom-6 left-4 right-4 bg-neutral-900/90 backdrop-blur-md border border-white/10 rounded-2xl p-2 shadow-2xl flex justify-between overflow-x-auto hide-scrollbar gap-1 z-[60]">
                    {[
                        { id: 'EVENTS', icon: 'emoji_events', label: 'Eventos' },
                        { id: 'ADS', icon: 'storefront', label: 'Anúncios' },
                        { id: 'USERS', icon: 'group', label: 'Usuários' },
                        { id: 'SOCIAL', icon: 'thumb_up', label: 'Social' },
                        { id: 'SPONSORS', icon: 'paid', label: 'Patrocínio' },
                        { id: 'SETTINGS', icon: 'settings', label: 'Config' },
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveModule(item.id as AdminModule)}
                            className="flex flex-col items-center justify-center gap-1 min-w-[54px] p-2 hover:bg-white/5 rounded-xl transition-colors"
                        >
                            <span className="material-icons text-white/50 text-lg">{item.icon}</span>
                            <span className="text-[7px] font-black text-white/40 uppercase tracking-widest">{item.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminView;
