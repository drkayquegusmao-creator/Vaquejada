-- Tabela de Seguidores (Follows)
CREATE TABLE IF NOT EXISTS public.follows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    follower_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    following_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(follower_id, following_id)
);

-- Tabela de Comentários (Comments)
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL, -- Referência à tabela de posts (ajuste se já tiver uma tabela posts rolando)
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Mensagens Diretas (DMs)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Notificações Atividades (Notificações do Coração)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE, -- Quem recebe a notificação
    actor_id UUID REFERENCES public.users(id) ON DELETE CASCADE, -- Quem realizou a ação
    type TEXT NOT NULL, -- Exemplo: 'follow', 'like', 'comment'
    reference_id UUID, -- ID do post, do comentário, etc.
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Setup RLS (Row Level Security) - Recomendações Básicas
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Exemplo RLS: Todos podem ver follows publicos
CREATE POLICY "Public follows" ON public.follows FOR SELECT USING (true);
CREATE POLICY "Usuários podem dar unfollow na própria conta" ON public.follows FOR DELETE USING (auth.uid() = follower_id);
CREATE POLICY "Usuários podem seguir terceiros" ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);

-- Exemplo RLS: Dms protegidos entre sender/receiver
CREATE POLICY "Podem ver mensagens quem enviou ou recebeu" ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Podem enviar mensagens quem está logado" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Podem deletar a propria mensagem enviada" ON public.messages FOR DELETE USING (auth.uid() = sender_id);

-- Para comentários e notificações, ajuste o RLS de acordo com a regra de exibir feeds públicos da plataforma.
CREATE POLICY "Comentarios sao publicos" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Podem comentar" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Ver proprias notificacoes" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Inserir notificacoes para outros" ON public.notifications FOR INSERT WITH CHECK (auth.uid() = actor_id);
