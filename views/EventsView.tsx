
import React, { useState, useEffect } from 'react';
import { EventItem } from '../types';

const INITIAL_EVENTS: EventItem[] = [
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
    instagram: '@vaquejadasurubim',
    phone: '(81) 99999-9999',
    prizes: 'R$ 200.000,00 em prêmios + 2 Motos 0km',
    description: 'A maior vaquejada do Brasil está de volta! Venha viver a emoção de derrubar o boi na faixa e curtir grandes shows.'
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
    instagram: '@portalvaquejada',
    phone: '(81) 98888-8888',
    prizes: 'R$ 300.000,00 em prêmios',
    description: 'Etapa decisiva do campeonato portal. Os melhores vaqueiros do Brasil reunidos em um só lugar.'
  },
  {
    id: '3',
    title: 'Vaquejada de Serrinha',
    location: 'Serrinha, BA',
    park: 'Parque Maria do Carmo',
    price: 'R$ 500,00',
    category: 'Amador',
    date: { month: 'NOV', day: '10' },
    imageUrl: 'https://picsum.photos/seed/event3/800/600',
    site: 'www.vaquejadaserrinha.com.br',
    instagram: '@vaquejadaserrinhaoficial',
    phone: '(75) 97777-7777',
    prizes: 'R$ 150.000,00',
    description: 'A festa do gado na Bahia! Tradição e modernidade se encontram em Serrinha.'
  },
  {
    id: '4',
    title: 'Vaquejada de Mossoró',
    location: 'Mossoró, RN',
    park: 'Porcino Park Center',
    price: 'R$ 350,00',
    category: 'Aspirante',
    date: { month: 'DEZ', day: '05' },
    imageUrl: 'https://picsum.photos/seed/event4/800/600',
    site: 'www.porcinopark.com.br',
    instagram: '@porcinopark',
    phone: '(84) 96666-6666',
    prizes: 'R$ 100.000,00',
    description: 'O grande encontro do Rio Grande do Norte. Vaquejada com padrão de qualidade Porcino Park.'
  }
];

const STATES = [
  'TODOS', 'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 'RO',
  'RR', 'RS', 'SC', 'SE', 'SP', 'TO'
];

const MOCK_ADVERTISERS = [
  { id: '1', name: 'Haras PFF', img: 'https://picsum.photos/seed/haras1/800/200' },
  { id: '2', name: 'Integral Mix', img: 'https://picsum.photos/seed/haras2/800/200' },
  { id: '3', name: 'Organnact', img: 'https://picsum.photos/seed/haras3/800/200' },
  { id: '4', name: 'Vaquejada do Sertão', img: 'https://picsum.photos/seed/haras4/800/200' },
];

const EventsView: React.FC = () => {
  const [selectedState, setSelectedState] = useState('TODOS');
  const [viewingEvent, setViewingEvent] = useState<EventItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [adIndex, setAdIndex] = useState(0);
  const [favorites, setFavorites] = useState<string[]>(() => {
    // Load from local storage if available for persistence mocking
    const saved = localStorage.getItem('arena_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('arena_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    const timer = setInterval(() => {
      setAdIndex(prev => (prev + 1) % MOCK_ADVERTISERS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
  };

  const handleShare = (event: EventItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    alert(`Compartilhando link do evento: ${event.title} via WhatsApp!`);
  };

  const handleComment = (comment: string) => {
    alert(`Comentário enviado: "${comment}"`);
  };

  const filteredEvents = INITIAL_EVENTS.filter(e => {
    const matchesState = selectedState === 'TODOS' || e.location.includes(selectedState);
    const matchesSearch = searchQuery === '' ||
      e.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesState && matchesSearch;
  });

  // Detail View Overlay
  if (viewingEvent) {
    const isFav = favorites.includes(viewingEvent.id);
    return (
      <div className="absolute inset-0 z-[100] flex justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="w-full max-w-[480px] h-full bg-background-dark relative overflow-y-auto hide-scrollbar shadow-2xl animate-in slide-in-from-bottom-10 duration-300">

          {/* Header Image & Nav */}
          <div className="relative h-[400px]">
            <img src={viewingEvent.imageUrl} className="w-full h-full object-cover" alt={viewingEvent.title} />
            <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-black/60"></div>

            {/* Navbar */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-10">
              <button onClick={() => setViewingEvent(null)} className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-white active:scale-95 transition-transform">
                <span className="material-icons">arrow_back</span>
              </button>
              <div className="flex gap-2">
                <button onClick={() => handleShare(viewingEvent)} className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-white active:scale-95 transition-transform">
                  <span className="material-icons">share</span>
                </button>
                <button onClick={() => toggleFavorite(viewingEvent.id)} className={`w-10 h-10 rounded-full backdrop-blur-md border border-white/10 flex items-center justify-center active:scale-95 transition-transform ${isFav ? 'bg-[#D4AF37] text-black' : 'bg-black/20 text-white'}`}>
                  <span className="material-icons">{isFav ? 'favorite' : 'favorite_border'}</span>
                </button>
              </div>
            </div>

            {/* Hero Info */}
            <div className="absolute bottom-0 left-0 right-0 p-6 pt-12 bg-gradient-to-t from-background-dark to-transparent">
              <span className="bg-[#D4AF37] text-background-dark text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest mb-3 inline-block shadow-lg shadow-[#D4AF37]/20">
                {viewingEvent.category}
              </span>
              <h1 className="text-3xl font-black uppercase leading-tight mb-2 text-white drop-shadow-xl">{viewingEvent.title}</h1>
              <div className="flex items-center gap-2 text-white/90">
                <span className="material-icons text-[#D4AF37] text-sm">place</span>
                <span className="text-sm font-bold uppercase tracking-wide">{viewingEvent.location}</span>
              </div>
            </div>
          </div>

          <div className="px-6 pb-32 space-y-8 -mt-2 relative z-10">
            {/* Quick Info Bar */}
            <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-4 -mx-6 px-6">
              <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl flex-shrink-0 min-w-[120px]">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Valor Senha</p>
                <p className="text-base font-black text-[#D4AF37]">{viewingEvent.price}</p>
              </div>
              <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl flex-shrink-0 min-w-[100px]">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Data</p>
                <p className="text-base font-black text-white">{viewingEvent.date.day} <span className="text-sm opacity-60">{viewingEvent.date.month}</span></p>
              </div>
              {viewingEvent.phone && (
                <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl flex-shrink-0 min-w-[140px]">
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Contato</p>
                  <p className="text-base font-black text-white">{viewingEvent.phone}</p>
                </div>
              )}
              {/* Espaçador final para garantir que o scroll não cole na bordinha */}
              <div className="w-1 flex-shrink-0"></div>
            </div>

            {/* Prizes */}
            <div>
              <h3 className="text-sm font-black uppercase tracking-wide mb-4 flex items-center gap-2 text-white">
                <span className="w-1 h-4 bg-[#D4AF37] rounded-full"></span>
                Premiação
              </h3>
              <div className="bg-gradient-to-r from-[#D4AF37]/20 to-transparent p-6 rounded-2xl border border-[#D4AF37]/20 relative overflow-hidden">
                <span className="material-icons absolute -right-4 -bottom-4 text-[100px] text-[#D4AF37]/10 rotate-12">emoji_events</span>
                <p className="text-2xl font-black text-[#D4AF37] relative z-10">{viewingEvent.prizes}</p>
                <p className="text-xs font-bold text-[#D4AF37]/60 uppercase tracking-widest mt-1 relative z-10">Premiação Total Garantida</p>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-sm font-black uppercase tracking-wide mb-4 flex items-center gap-2 text-white">
                <span className="w-1 h-4 bg-[#D4AF37] rounded-full"></span>
                Detalhes
              </h3>
              <p className="text-sm text-white/70 leading-relaxed font-medium text-justify">
                {viewingEvent.description}
              </p>
            </div>

            {/* Links */}
            <div className="space-y-3">
              {viewingEvent.instagram && (
                <a href={`https://instagram.com/${viewingEvent.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10 active:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="material-icons text-white/60">photo_camera</span>
                    <div>
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Instagram</p>
                      <p className="text-sm font-bold text-white">{viewingEvent.instagram}</p>
                    </div>
                  </div>
                  <span className="material-icons text-white/20">open_in_new</span>
                </a>
              )}
              {viewingEvent.site && (
                <a href={`https://${viewingEvent.site}`} target="_blank" rel="noreferrer" className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10 active:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="material-icons text-white/60">language</span>
                    <div>
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Site Oficial</p>
                      <p className="text-sm font-bold text-white truncate max-w-[150px]">{viewingEvent.site}</p>
                    </div>
                  </div>
                  <span className="material-icons text-white/20">open_in_new</span>
                </a>
              )}
            </div>

          </div>

          {/* Sticky Bottom Bar */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background-dark via-background-dark to-transparent z-20">
            <button onClick={() => handleComment("Eu vou!!")} className="w-full bg-[#ECA413] text-background-dark font-black py-4 rounded-xl uppercase tracking-widest shadow-lg shadow-[#ECA413]/20 flex items-center justify-center gap-2 active:scale-95 transition-transform">
              <span className="material-icons">check_circle</span>
              Confirmar Presença
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main List View (Horizontal Scroll + Vertical List)
  return (
    <div className="px-6 py-6 pb-24 min-h-full bg-background-dark">
      <header className="mb-6 sticky top-0 bg-background-dark z-40 py-2 -mx-6 px-6">
        <div className="flex justify-between items-center mb-6">
          {!isSearchOpen ? (
            <h1 className="text-2xl font-black uppercase text-[#D4AF37] tracking-tighter italic">VAQUEJADAS</h1>
          ) : (
            <div className="flex-1 mr-4 relative animate-in slide-in-from-right-2 duration-300">
              <input
                type="text"
                autoFocus
                placeholder="Buscar cidade..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/10 border border-[#D4AF37]/30 rounded-full py-2 px-4 text-sm text-white outline-none"
              />
              <button onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }} className="absolute right-3 top-1/2 -translate-y-1/2 material-icons text-white/40 text-sm">close</button>
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${isSearchOpen ? 'bg-[#D4AF37] border-[#D4AF37] text-background-dark' : 'bg-white/5 border-white/10 text-[#D4AF37]'}`}
            >
              <span className="material-icons text-xl">{isSearchOpen ? 'search_off' : 'search'}</span>
            </button>
            <div className="w-10 h-10 rounded-full border border-[#D4AF37]/20 p-1">
              <img src="https://picsum.photos/seed/user/100" className="w-full h-full rounded-full object-cover" alt="User" />
            </div>
          </div>
        </div>

        {/* Roller de Anunciantes */}
        <div className="relative mb-6 h-28 w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          {MOCK_ADVERTISERS.map((ad, idx) => (
            <div
              key={ad.id}
              className={`absolute inset-0 transition-opacity duration-1000 flex items-center justify-center ${idx === adIndex ? 'opacity-100' : 'opacity-0'}`}
            >
              <img src={ad.img} className="w-full h-full object-cover" alt={ad.name} />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.3em] text-center">{ad.name}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Horizontal Scrollable States */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
          {STATES.map((uf, idx) => (
            <button
              key={uf}
              onClick={() => setSelectedState(uf)}
              className={`px-6 py-2.5 rounded-full font-black text-[11px] uppercase tracking-widest whitespace-nowrap transition-all border ${selectedState === uf ? 'bg-[#D4AF37] border-[#D4AF37] text-background-dark shadow-lg shadow-[#D4AF37]/20' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}
            >
              {uf}
            </button>
          ))}
        </div>
      </header>

      <div className="space-y-6">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => {
            const isFav = favorites.includes(event.id);
            return (
              <div key={event.id} className="bg-white/5 border border-white/10 rounded-[32px] overflow-hidden shadow-xl group">
                <div className="relative h-64">
                  <img src={event.imageUrl} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500" alt={event.title} />
                  <div className="absolute top-4 left-4 bg-[#D4AF37] px-3 py-1 rounded text-[10px] font-black text-background-dark flex items-center gap-1 shadow-lg">
                    <span className="material-icons text-[14px]">verified</span> OFICIAL
                  </div>
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md rounded-xl p-2.5 text-center min-w-[50px] border border-white/10 shadow-lg">
                    <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest leading-none mb-0.5">{event.date.month}</p>
                    <p className="text-xl font-black text-white leading-none">{event.date.day}</p>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-background-dark to-transparent opacity-80"></div>

                  <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="text-2xl font-black mb-1 font-display text-white leading-tight">{event.title}</h3>
                    <div className="flex items-center gap-1 text-[#D4AF37]">
                      <span className="material-icons text-sm">place</span>
                      <span className="text-xs font-medium uppercase tracking-wide">{event.location} • {event.park}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-white/[0.02]">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">VALOR DA SENHA</p>
                      <p className="text-xl font-black text-[#D4AF37]">{event.price} <span className="text-xs font-normal text-white/40">/{event.category}</span></p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={(e) => toggleFavorite(event.id, e)}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-colors ${isFav ? 'bg-[#D4AF37]/10 border-[#D4AF37] text-[#D4AF37]' : 'bg-white/5 border-white/10 text-white/40 hover:text-white'}`}
                      >
                        <span className="material-icons">{isFav ? 'favorite' : 'favorite_border'}</span>
                      </button>
                      <button
                        onClick={(e) => handleShare(event, e)}
                        className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 text-white/40 hover:text-white transition-colors"
                      >
                        <span className="material-icons">share</span>
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => setViewingEvent(event)}
                    className="w-full bg-[#D4AF37] text-background-dark font-black py-4 rounded-2xl flex items-center justify-center gap-2 uppercase tracking-widest shadow-lg shadow-[#D4AF37]/20 active:scale-[0.98] transition-all hover:bg-[#c5a028]"
                  >
                    VER DETALHES <span className="material-icons text-lg">arrow_forward</span>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-20 opacity-40">
            <span className="material-icons text-5xl mb-4">event_busy</span>
            <p className="font-bold uppercase tracking-widest">Nenhum evento neste estado</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsView;
