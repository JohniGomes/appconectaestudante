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

No painel do seu projeto Supabase, abra **SQL Editor** e rode o conteúdo de
[`supabase/schema.sql`](./supabase/schema.sql). Isso cria as tabelas `alunos`
e `presencas`, com Row Level Security (cada aluno só vê os próprios dados).

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

## Fluxo do app

1. **`/signup`** — cria conta (Supabase Auth) e o perfil do aluno (`alunos`).
2. **`/login`** — autentica.
3. **`/dashboard`** — mostra status de presença do dia e histórico recente.
4. **`/presenca`** — abre a câmera, detecta o rosto (face-api.js,
   modelo *tiny face detector* rodando no navegador) e, após ~1,2s de
   detecção contínua, captura a foto, sobe para o Storage e grava a
   presença no banco.

## Estrutura

```
src/app/            páginas (App Router)
src/components/     componentes compartilhados (cabeçalho)
src/lib/            cliente Supabase + contexto de autenticação
public/models/      pesos do modelo de detecção facial (face-api.js)
supabase/schema.sql schema do banco + políticas de storage
```
