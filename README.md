# CuidaJunto PWA

Aplicativo **PWA** (Android + iOS) de **cuidado compartilhado** para famílias e cuidadores:
remédios, diário de cuidados, escala de plantão, histórico médico e alertas — tudo coordenado em equipe.

> Reescrita do app Android `cuidaJuntoAndroid` como Progressive Web App, com autenticação real,
> banco de dados na nuvem, internacionalização (PT/EN) e notificações push.

## Stack

| Camada | Tecnologia |
| --- | --- |
| UI | React + TypeScript + Vite |
| Estilo | Tailwind CSS (design "Calm Guardian") |
| Rotas | React Router (HashRouter — compatível com GitHub Pages) |
| i18n | react-i18next (PT-BR / EN) |
| PWA | vite-plugin-pwa + service worker próprio (`src/sw.ts`) |
| Auth | Clerk |
| Banco | Supabase / Postgres + RLS |
| Push | Web Push (VAPID) + Supabase Edge Functions *(Fase 4)* |
| Deploy | GitHub Actions → GitHub Pages |

## Arquitetura

Organização **por funcionalidade**, com arquivos pequenos e componentes reutilizáveis.

```
src/
├─ app/            # AppProviders (auth → gate → círculo) + Router
├─ components/
│  ├─ ui/          # Primitivos reutilizáveis: Button, Card, Chip, Avatar, Icon, Modal…
│  ├─ layout/      # AppShell, AppHeader, BottomNav, SideDrawer, SosButton, LanguageToggle
│  └─ common/      # Blocos compartilhados (ModulePlaceholder, DemoModeBanner)
├─ features/       # Módulos isolados por funcionalidade
│  ├─ auth/        # AuthProvider (Clerk ou demo), RequireAuth, UserMenu
│  └─ care-circle/ # Contexto do círculo de cuidado ativo + API
├─ config/         # navigation.ts, env.ts, appInfo.ts
├─ hooks/          # useDisclosure, useLanguage, useSupabaseClient…
├─ lib/            # i18n, rotas, supabase (client + tipos), utilitários
├─ locales/        # pt/*.json · en/*.json (por namespace)
├─ pages/          # Composição fina de cada tela (lazy-loaded)
├─ styles/         # Tokens de design + base Tailwind
└─ sw.ts           # Service worker (precache + handlers de push)

supabase/         # Migrações SQL (schema + RLS) e guia de configuração
```

### Autenticação e dados

- **Clerk** cuida do login; **Supabase** (Postgres + RLS) guarda os dados.
- O app envia o token do Clerk ao Supabase (integração third-party auth), e a RLS
  restringe cada consulta ao **círculo de cuidado** do usuário.
- **Modo demonstração:** enquanto as chaves não estão configuradas, o app roda
  navegável e sem persistência (um aviso aparece no topo). Basta definir as chaves
  para ativar login e banco — sem mudar código.
- Configuração passo a passo em [`supabase/README.md`](supabase/README.md).

## Rodando localmente

```bash
npm install
cp .env.example .env   # preencha as chaves quando chegar às Fases 2/4
npm run dev            # http://localhost:5173/cuidaJuntoPWA/
```

Outros comandos:

```bash
npm run build       # type-check + build de produção (gera dist/)
npm run preview     # serve o build de produção
npm run typecheck   # apenas verificação de tipos
```

## Deploy no GitHub Pages

1. Crie um repositório chamado **`cuidaJuntoPWA`** e faça push da branch `main`.
2. Em **Settings → Pages**, defina **Source: GitHub Actions**.
3. O workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) faz build e publica automaticamente a cada push.
4. App disponível em `https://SEU_USUARIO.github.io/cuidaJuntoPWA/`.

> Usando **domínio personalizado**? Defina o secret/variável `VITE_BASE_PATH=/` no workflow.

As chaves de cliente ficam em **Settings → Secrets and variables → Actions**
(`VITE_CLERK_PUBLISHABLE_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_VAPID_PUBLIC_KEY`).

## Roadmap

- [x] **Fase 1 — Scaffold:** Vite + React + TS + Tailwind, PWA instalável, i18n PT/EN, navegação (bottom nav + drawer + SOS), design tokens.
- [x] **Fase 2 — Auth + dados:** Clerk (com modo demo), cliente Supabase vinculado ao token, schema + RLS por círculo de cuidado, provider do círculo ativo.
- [x] **Fase 3 — Módulos:** onboarding/círculo, dashboard, remédios, diário, escala, equipe, histórico, perfil — ligados ao Supabase, com dados de exemplo em modo demo.
- [x] **Fase 4 — Notificações:** Web Push (VAPID) por usuário; Edge Functions `notify` (SOS imediato) e `medication-reminders` (via pg_cron); dark mode e ajustes de UI no celular. *Requer deploy das functions/migração — ver [supabase/README](supabase/README.md#5-notificações-push-fase-4).*
- [ ] **Fase 5 — Deploy:** ajustes finais de CI/CD e documentação.

### Multi-círculo
Um usuário pode participar de vários círculos (um idoso por círculo). Troque o
círculo ativo em **Configurações → Meus círculos**; convide por link em **Equipe**
e aceite em `/join/<token>`.

## ⚠️ Notas sobre push no iOS

No iPhone, o Web Push só funciona quando o PWA é **adicionado à tela de início** (iOS 16.4+) e aberto pelo
ícone — não funciona no Safari comum. No Android funciona normalmente. O app exibirá um aviso de instalação
para usuários iOS na Fase 4.
