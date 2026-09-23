-- Conecta Estudante — expansão do protótipo (rode DEPOIS do schema.sql)
-- Adiciona: notas, comunicados, colunas de consentimento e leitura ampla
-- para as telas de "visão da secretaria" (demo — sem login separado de
-- secretaria, qualquer aluno autenticado consegue ver essas telas).

-- Colunas de consentimento no perfil do aluno (tela Perfil & Privacidade)
alter table public.alunos
  add column if not exists consentimento_facial boolean not null default true,
  add column if not exists consentimento_geo boolean not null default true,
  add column if not exists consentimento_cftv boolean not null default false;

-- Notas
create table if not exists public.notas (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references public.alunos(id) on delete cascade,
  disciplina text not null,
  avaliacao text not null,
  nota numeric(4,1) not null,
  criado_em timestamptz not null default now()
);

alter table public.notas enable row level security;

create policy "autenticados leem notas (demo secretaria)"
  on public.notas for select
  using (auth.role() = 'authenticated');

create policy "autenticados lancam notas (demo secretaria)"
  on public.notas for insert
  with check (auth.role() = 'authenticated');

-- Comunicados
create table if not exists public.comunicados (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  mensagem text not null,
  turma text not null default 'Todas',
  autor text not null default 'Secretaria',
  criado_em timestamptz not null default now()
);

alter table public.comunicados enable row level security;

create policy "autenticados leem comunicados"
  on public.comunicados for select
  using (auth.role() = 'authenticated');

create policy "autenticados criam comunicados (demo secretaria)"
  on public.comunicados for insert
  with check (auth.role() = 'authenticated');

-- Leitura ampla de alunos e presenças para as telas de secretaria (demo).
-- Numa versão real, isso seria restrito por uma coluna de "role".
create policy "leitura ampla de alunos (demo secretaria)"
  on public.alunos for select
  using (auth.role() = 'authenticated');

create policy "leitura ampla de presencas (demo secretaria)"
  on public.presencas for select
  using (auth.role() = 'authenticated');
