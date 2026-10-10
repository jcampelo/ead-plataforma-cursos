# EAD Distrito Manaus

Plataforma de cursos online voltada à qualificação profissional para o Distrito Industrial de Manaus. Cobre o ciclo completo do aluno: catálogo, compra por Pix, aulas em vídeo protegidas e certificado em PDF com validação pública por QR Code.

## O que faz

- **Catálogo e área do aluno:** cursos organizados em módulos e aulas, com registro do progresso de cada aula.
- **Pagamento por Pix** via Abacate Pay. O webhook confirma o pagamento e libera a matrícula sozinho.
- **Vídeos protegidos:** o Nginx só entrega o MP4 depois que a aplicação valida um token JWT assinado para aquele arquivo, com validade de 2 horas (`auth_request`).
- **Certificado em PDF** gerado no servidor (Puppeteer), com QR Code que leva a uma página pública de validação.
- **Painel administrativo:** alunos, cursos e módulos.
- **Banco com Row Level Security** no Supabase (Postgres): cada aluno só acessa os próprios dados.

## Stack

Next.js (App Router) · React · TypeScript · Tailwind CSS · Supabase (Auth + Postgres + RLS) · Abacate Pay (Pix) · JWT (`jose`) · Puppeteer · Nginx · PM2 · GitHub Actions

## Estrutura

```
app/                     páginas (catálogo, aluno, admin, checkout, certificado) e rotas de API
app/api/webhooks/        confirmação de pagamento (Abacate Pay)
app/api/auth-video/      validação do token de vídeo, chamada pelo Nginx
lib/video/token.ts       assinatura e verificação do JWT de vídeo
lib/certificate/         geração do certificado em PDF com QR Code
supabase/migrations/     esquema do banco e políticas de RLS
nginx/videos.conf        proxy da aplicação e entrega protegida dos vídeos
ecosystem.config.js      processo no PM2
```

## Rodando localmente

```bash
npm install
cp .env.local.example .env.local    # preencha Supabase, Abacate Pay e VIDEO_JWT_SECRET
npm run dev                         # http://localhost:3000
```

Rode o SQL de `supabase/migrations/` no SQL Editor do seu projeto Supabase antes do primeiro acesso.

## Deploy

O workflow `.github/workflows/deploy.yml` faz o deploy por SSH numa VPS (build e `pm2 reload`). Nesta cópia ele roda só sob demanda (`workflow_dispatch`) e usa os segredos `VPS_HOST`, `VPS_PORT`, `VPS_USER` e `VPS_SSH_KEY`.
