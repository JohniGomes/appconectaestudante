-- Conecta Estudante — vínculo de responsáveis (rode DEPOIS do schema.sql e schema_v2.sql)

create table if not exists public.responsaveis (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  criado_em timestamptz not null default now()
);

alter table public.responsaveis enable row level security;

create policy "responsavel le proprio perfil"
  on public.responsaveis for select
  using (auth.uid() = id);

create policy "responsavel cria proprio perfil"
  on public.responsaveis for insert
  with check (auth.uid() = id);

-- Vínculo N:N entre responsáveis e alunos
create table if not exists public.aluno_responsavel (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references public.alunos(id) on delete cascade,
  responsavel_id uuid not null references public.responsaveis(id) on delete cascade,
  criado_em timestamptz not null default now(),
  unique (aluno_id, responsavel_id)
);

alter table public.aluno_responsavel enable row level security;

-- O responsável vê os próprios vínculos; o aluno também vê quem está
-- vinculado a ele (para uma futura tela "meus responsáveis").
create policy "ve proprios vinculos"
  on public.aluno_responsavel for select
  using (auth.uid() = responsavel_id or auth.uid() = aluno_id);

-- Qualquer autenticado pode criar um vínculo em nome do PRÓPRIO responsavel_id
-- (o app confere a matrícula do aluno antes de chamar isso).
create policy "responsavel cria vinculo"
  on public.aluno_responsavel for insert
  with check (auth.uid() = responsavel_id);

create policy "responsavel remove vinculo"
  on public.aluno_responsavel for delete
  using (auth.uid() = responsavel_id);

-- Habilita o Supabase Realtime na tabela de presenças, para que o app do
-- responsável receba o check-in do filho assim que ele acontece.
alter publication supabase_realtime add table public.presencas;
