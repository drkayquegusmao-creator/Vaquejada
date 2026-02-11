
import React from 'react';
import { NewsItem } from '../types';

const news: NewsItem[] = [
  {
    id: '1',
    tag: 'OFICIAL',
    title: 'ALTERAÇÃO DE DATA: GRANDE PRÊMIO PORTAL',
    description: 'Devido às condições climáticas severas, a etapa final do GP Portal foi reprogramada para o próximo final de semana. Fique atento aos novos horários de pesagem.',
    date: '14 MAI, 2024 • 09:15',
    type: 'official'
  },
  {
    id: '2',
    tag: 'OFICIAL',
    title: 'NOVO REGULAMENTO VETERINÁRIO 2024',
    description: 'Atualizamos as diretrizes de bem-estar animal para a temporada. A apresentação da GTA e exames de Anemia/Mormo agora é 100% digital via App.',
    date: '12 MAI, 2024 • 14:40',
    type: 'official'
  },
  {
    id: '3',
    tag: 'OFICIAL',
    title: 'INSCRIÇÕES ABERTAS: PARQUE DAS PALMEIRAS',
    description: 'Garanta sua senha antecipada para o maior evento do mês. Lotes promocionais disponíveis para as categorias Profissional e Amador.',
    date: '10 MAI, 2024 • 11:20',
    type: 'official'
  }
];

const NewsView: React.FC = () => {
  return (
    <div className="p-6 pb-24">
      <header className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <span className="material-icons text-primary-orange">campaign</span>
            <h1 className="text-3xl font-black uppercase text-primary font-display">+VAQUEJADA</h1>
          </div>
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
              <span className="material-icons text-xl">search</span>
            </button>
            <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
              <span className="material-icons text-xl">notifications</span>
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto hide-scrollbar">
          {['TUDO', 'EVENTOS', 'REGULAMENTO', 'NOTÍCIAS'].map((tab, idx) => (
            <button key={tab} className={`px-6 py-2 rounded-full font-bold text-xs whitespace-nowrap border-2 ${idx === 0 ? 'bg-primary-orange border-primary-orange text-white' : 'border-white/10 text-white/40'}`}>
              {tab}
            </button>
          ))}
        </div>

        <div className="mb-8">
          <h2 className="text-4xl font-black text-primary-orange uppercase leading-none mb-2 font-display tracking-tight">ARENA NOTÍCIAS</h2>
          <p className="text-white/40 text-sm">O seu canal oficial de informações</p>
        </div>
      </header>

      <div className="space-y-6">
        {news.map((item) => (
          <div key={item.id} className="bg-sand-light rounded-2xl overflow-hidden shadow-2xl border border-white/10 group active:scale-[0.98] transition-all">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="bg-leather text-white text-[10px] font-black px-3 py-1 rounded flex items-center gap-1">
                  <span className="material-icons text-[12px]">verified</span> {item.tag}
                </span>
                <span className="text-[10px] text-leather/60 font-bold">{item.date}</span>
              </div>
              <h3 className="text-2xl font-black text-leather mb-3 uppercase leading-tight font-display">{item.title}</h3>
              <p className="text-leather/80 text-sm leading-relaxed mb-6 font-medium line-clamp-2">{item.description}</p>

              <button
                onClick={() => alert(`Abrindo notícia: ${item.title}`)}
                className="w-full bg-leather/5 hover:bg-leather/10 text-leather font-black text-xs uppercase tracking-widest py-4 rounded-xl flex items-center justify-center gap-2 mb-4 transition-colors"
              >
                <span className="material-icons text-sm">visibility</span>
                LER NOTÍCIA
              </button>

              <div className="flex items-center justify-between border-t border-leather/10 pt-4">
                {item.id === '3' ? (
                  <>
                    <span className="text-[10px] font-bold text-leather/40 uppercase tracking-widest">EVENTO ID: #PP2024</span>
                    <button className="bg-primary-orange text-white px-4 py-2 rounded-lg font-black uppercase text-[9px] tracking-widest shadow-lg shadow-primary-orange/20">GARANTIR SENHA</button>
                  </>
                ) : item.id === '2' ? (
                  <>
                    <div className="flex gap-2">
                      <span className="w-8 h-8 rounded-full bg-primary-orange flex items-center justify-center text-white"><span className="material-icons text-sm">description</span></span>
                      <span className="w-8 h-8 rounded-full bg-leather flex items-center justify-center text-white"><span className="material-icons text-sm">photo</span></span>
                    </div>
                    <button className="text-primary-orange font-black text-[9px] uppercase tracking-widest flex items-center gap-1">ANEXOS PDF <span className="material-icons text-sm">attach_file</span></button>
                  </>
                ) : (
                  <>
                    <span className="text-[10px] font-black text-primary-orange uppercase tracking-widest">URGENTE</span>
                    <div className="flex gap-1">
                      <span className="material-icons text-leather/20">attachment</span>
                      <span className="text-[9px] font-black text-leather/40">2 ANEXOS</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center pb-8 opacity-20">
        <span className="material-icons text-6xl text-primary">shield</span>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-2">Autenticidade Garantida</p>
      </div>
    </div>
  );
};

export default NewsView;
