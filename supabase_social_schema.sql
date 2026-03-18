-- Tabela de Posts
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    media_type TEXT DEFAULT 'image', -- 'image' ou 'video'
    caption TEXT,
    location TEXT,
    event_id UUID, -- Referência opcional à tabela de eventos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Stories
CREATE TABLE IF NOT EXISTS public.stories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    media_type TEXT DEFAULT 'image',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

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

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- POLÍTICAS RLS (Row Level Security)
-- -----------------------------------------------------------------------------

-- Políticas POSTS: todos podem ver posts publicos, apenas o dono pode inserir/deletar/editar
CREATE POLICY "Todos podem ver posts" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Qualquer logado pode postar" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Dono pode gerenciar proprio post" ON public.posts FOR ALL USING (auth.uid() = user_id);

-- Políticas STORIES: todos podem ver stories
CREATE POLICY "Todos podem ver stories" ON public.stories FOR SELECT USING (true);
CREATE POLICY "Dono pode postar story" ON public.stories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Dono pode deletar story" ON public.stories FOR DELETE USING (auth.uid() = user_id);

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

-- -----------------------------------------------------------------------------
-- POLÍTICAS DE STORAGE (Executar após criar os buckets posts_media e stories_media)
-- -----------------------------------------------------------------------------

-- Permitir que usuários logados façam upload para posts_media
CREATE POLICY "Permitir upload de posts" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'posts_media' AND auth.role() = 'authenticated');
CREATE POLICY "Permitir ver posts" ON storage.objects FOR SELECT USING (bucket_id = 'posts_media');

-- Permitir que usuários logados façam upload para stories_media
CREATE POLICY "Permitir upload de stories" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'stories_media' AND auth.role() = 'authenticated');
CREATE POLICY "Permitir ver stories" ON storage.objects FOR SELECT USING (bucket_id = 'stories_media');
