import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface LoginViewProps {
  onLogin: (userData: any) => void;
  onSignUp: () => void;
  onForgotPassword: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin, onSignUp, onForgotPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('E-mail e senha são obrigatórios.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message === 'Invalid login credentials' ? 'E-mail ou senha incorretos.' : 'Erro ao entrar. Tente novamente.');
        setLoading(false);
        return;
      }

      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          setError('Erro ao carregar perfil. Verifique sua conexão.');
          setLoading(false);
          return;
        }

        onLogin(profile);
      }
    } catch (err) {
      setError('Erro de conexão com a Arena.');
    } finally {
      if (!error) setLoading(false);
    }
  };

  return (
    <div className="min-h-full flex flex-col bg-[#0F0A05] relative overflow-hidden">
      {/* Background Cinematográfico - Cavalos/Vaquejada */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-[#0F0A05] z-10" />
        <img
          src="https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
          className="w-full h-full object-cover scale-110 animate-pulse duration-[10000ms]"
          alt="Vaquejada Background"
        />
      </div>

      <div className="relative z-20 flex-1 flex flex-col px-8 py-12 justify-center">
        {/* Header Wow Factor */}
        <div className="mb-12 text-center animate-in fade-in slide-in-from-top-10 duration-1000">
          <div className="inline-block px-4 py-1.5 rounded-full bg-[#ECA413]/10 border border-[#ECA413]/20 mb-6">
            <span className="text-[#ECA413] text-[10px] font-black uppercase tracking-[0.3em]">Arena Digital Oficial</span>
          </div>
          <h1 className="text-6xl font-black text-white italic tracking-tighter leading-none mb-2">
            +VAQUE<span className="text-[#ECA413]">JADA</span>
          </h1>
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest italic">A maior paixão do Nordeste em um só lugar</p>
        </div>

        {/* Form Card */}
        <div className="bg-[#1A1108]/80 backdrop-blur-2xl rounded-[40px] p-8 border border-white/5 shadow-[0_25px_100px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in duration-700 delay-300">
          <h2 className="text-xl font-black text-white uppercase italic tracking-tight mb-8">Entrar na Arena</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-right duration-300">
              <span className="material-icons text-red-500 text-lg">error_outline</span>
              <p className="text-xs text-red-200 font-bold uppercase tracking-tight">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#ECA413] ml-2">Seu E-mail</label>
              <div className="relative group">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 material-icons text-white/20 group-focus-within:text-[#ECA413] transition-colors">alternate_email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-sm font-bold text-white focus:outline-none focus:border-[#ECA413] focus:bg-white/10 transition-all placeholder:text-white/10"
                  placeholder="exemplo@email.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#ECA413]">Sua Senha</label>
                <button 
                  type="button" 
                  onClick={onForgotPassword}
                  className="text-[9px] font-black uppercase tracking-widest text-white/30 hover:text-[#ECA413]"
                >
                  Esqueci minha senha
                </button>
              </div>
              <div className="relative group">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 material-icons text-white/20 group-focus-within:text-[#ECA413] transition-colors">lock</span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-12 text-sm font-bold text-white focus:outline-none focus:border-[#ECA413] focus:bg-white/10 transition-all placeholder:text-white/10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-[#ECA413] transition-colors"
                >
                  <span className="material-icons text-lg">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full bg-[#ECA413] hover:bg-[#B47B09] text-white py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-[0_15px_40px_rgba(236,164,19,0.2)] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>ENTRAR NA ARENA <span className="material-icons text-sm">rocket_launch</span></>
              )}
            </button>
          </form>

          <button
            onClick={onSignUp}
            className="w-full mt-8 py-3 text-center text-[11px] font-black text-white/40 uppercase tracking-widest hover:text-white transition-colors"
          >
            Não tem uma conta? <span className="text-[#ECA413]">Crie agora</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
