# Conecta Estudante — Protótipo funcional

Web app de demonstração: cadastro de aluno, login e presença por reconhecimento
facial usando a câmera do navegador (celular ou desktop).

Stack: **Next.js 16** (App Router) + **Supabase** (Auth, Postgres, Storage) +
**face-api.js** (detecção facial no navegador, 100% client-side) + **Tailwind CSS**.

> Este protótipo faz **detecção de rosto + captura da foto**, não faz
> reconhecimento biométrico (não compara o rosto com um cadastro anterior).
> É suficiente para demonstrar o fluxo completo ao cliente: o app detecta que
> há um rosto na câmera, tira a foto e registra a presença vinculada ao aluno
> logado.

## Configuração (uma vez)

### 1. Banco de dados

No painel do seu projeto Supabase, abra **SQL Editor** e rode, **nesta ordem**:

1. [`supabase/schema.sql`](./supabase/schema.sql) — cria `alunos` e `presencas`.
2. [`supabase/schema_v2.sql`](./supabase/schema_v2.sql) — adiciona `notas`,
   `comunicados`, colunas de consentimento e as políticas de leitura ampla
   usadas pelas telas de "visão da secretaria" (demo).
3. [`supabase/schema_v3.sql`](./supabase/schema_v3.sql) — adiciona
   `responsaveis` e o vínculo `aluno_responsavel`, e habilita o Supabase
   Realtime na tabela `presencas` (necessário para a notificação em tempo
   real no app do responsável).

Também desative a confirmação por e-mail em **Authentication → Sign In /
Providers → User Signups → "Confirm email"** (o serviço de e-mail gratuito do
Supabase tem um limite baixo de envios, e não faz sentido pedir confirmação
num protótipo de demonstração).

### 2. Storage (fotos de presença)

Em **Storage → New bucket**, crie um bucket chamado `presencas` marcado como
**Public bucket**. As políticas de acesso (cada aluno só sobe/lê a própria
pasta) já estão no final do `schema.sql`.

### 3. Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha com os dados do seu projeto
(**Settings → API**):

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
```

## Rodando localmente

```bash
npm install
npm run dev
```

Abra http://localhost:3000 — funciona em qualquer navegador com câmera
(o navegador vai pedir permissão de câmera na página `/presenca`).

## Deploy (Vercel)

1. Importe este repositório em [vercel.com/new](https://vercel.com/new).
2. Em **Environment Variables**, adicione `NEXT_PUBLIC_SUPABASE_URL` e
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` com os mesmos valores do `.env.local`.
3. Deploy. A cada push na branch `main`, a Vercel gera um novo deploy
   automaticamente.

## Fluxo do app — 15 telas

**App do aluno** (autenticado):

1. `/` — landing
2. `/signup` — criar conta
3. `/login` — entrar
4. `/dashboard` — status do dia + histórico recente
5. `/presenca` — câmera com detecção facial + registro de presença
6. `/notas` — boletim (lido do banco, alimentado pela secretaria)
7. `/comunicados` — avisos da escola
8. `/rota` — status do ônibus (dados simulados para a demo)
9. `/perfil` — dados pessoais, toggles de consentimento LGPD, logout
10. `/historico` — histórico completo de presenças

**Visão da secretaria** (demo — mesma sessão do aluno, sem papel
administrativo separado; é o próximo passo natural para uma versão com
múltiplos perfis de acesso):

11. `/secretaria` — dashboard com KPIs e check-ins do dia
12. `/secretaria/alunos` — lista de todos os alunos matriculados
13. `/secretaria/notas` — lançar nota para um aluno
14. `/secretaria/comunicados` — publicar um aviso
15. `/secretaria/evasao` — alunos sem presença há 7+ dias

**App do responsável (pai/mãe)** — conta separada, vinculada ao aluno pela
matrícula:

16. `/signup-responsavel` — criar conta e vincular ao filho(a)
17. `/pai` — lista dos filhos vinculados, status do dia, e um feed de
    check-ins em tempo real (Supabase Realtime): assim que o aluno bate
    presença, o responsável vê aparecer na hora, sem precisar recarregar a
    página. Tem também um botão para ativar notificações do navegador
    (usa a Notification API — funciona com o app aberto ou minimizado em
    segundo plano; para notificação com o app totalmente fechado, o
    próximo passo é implementar Web Push com service worker).
18. `/pai/vincular` — vincular outro filho(a) usando a matrícula dele(a)

## Estrutura

```
src/app/            páginas (App Router)
src/components/     componentes compartilhados (cabeçalho)
src/lib/            cliente Supabase + contexto de autenticação
public/models/      pesos do modelo de detecção facial (face-api.js)
supabase/schema.sql schema do banco + políticas de storage
```
