-- Conecta Estudante — schema minimo para o protótipo
-- Rode este script no SQL Editor do seu projeto Supabase.

create table if not exists public.alunos (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  turma text not null default '',
  matricula text not null default '',
  criado_em timestamptz not null default now()
);

create table if not exists public.presencas (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references public.alunos(id) on delete cascade,
  registrado_em timestamptz not null default now(),
  foto_url text
);

alter table public.alunos enable row level security;
alter table public.presencas enable row level security;

-- Cada aluno só vê e edita o próprio perfil
create policy "aluno le proprio perfil"
  on public.alunos for select
  using (auth.uid() = id);

create policy "aluno cria proprio perfil"
  on public.alunos for insert
  with check (auth.uid() = id);

create policy "aluno atualiza proprio perfil"
  on public.alunos for update
  using (auth.uid() = id);

-- Cada aluno só vê e registra a própria presença
create policy "aluno le propria presenca"
  on public.presencas for select
  using (auth.uid() = aluno_id);

create policy "aluno registra propria presenca"
  on public.presencas for insert
  with check (auth.uid() = aluno_id);

-- Bucket de storage para as fotos de presença:
-- 1. No painel do Supabase, vá em Storage → New bucket → nome "presencas" → marque "Public bucket".
-- 2. Depois rode as políticas abaixo para permitir que cada aluno suba/veja só as próprias fotos
--    (o caminho do arquivo sempre começa com o próprio user id, ex: "<user_id>/123.jpg").

create policy "aluno envia propria foto"
  on storage.objects for insert
  with check (
    bucket_id = 'presencas'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "aluno le propria foto"
  on storage.objects for select
  using (
    bucket_id = 'presencas'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
