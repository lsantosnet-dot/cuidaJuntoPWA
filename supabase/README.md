# Supabase — setup do CuidaJunto

Banco de dados (Postgres + RLS) e, mais adiante (Fase 4), as Edge Functions de
notificações. A identidade vem do **Clerk**: o app envia o token de sessão do
Clerk em cada requisição e o Supabase o verifica, permitindo que as políticas de
RLS usem `auth.jwt() ->> 'sub'` (o id do usuário no Clerk).

## 1. Criar o projeto

1. Crie um projeto em <https://supabase.com/dashboard>.
2. Em **Project Settings → API**, copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_ANON_KEY`

## 2. Aplicar as migrações

No **SQL Editor** do Supabase, rode os arquivos em ordem:

1. [`migrations/0001_schema.sql`](migrations/0001_schema.sql) — tabelas e índices
2. [`migrations/0002_rls.sql`](migrations/0002_rls.sql) — funções, RLS e políticas
3. [`migrations/0003_invites_accept.sql`](migrations/0003_invites_accept.sql) — token de convite + RPCs `get_invite`/`accept_invite` (entrar em outro círculo)

> Alternativa com a CLI: `supabase link --project-ref <ref>` e depois
> `supabase db push`.

## 3. Conectar o Clerk (third-party auth)

Isto faz o Supabase confiar nos tokens do Clerk.

1. No **Clerk Dashboard**, habilite a integração com Supabase
   (**Configure → Integrations → Supabase**) e copie o **Clerk domain**
   (algo como `https://<seu-app>.clerk.accounts.dev`).
2. No **Supabase Dashboard → Authentication → Sign In / Providers →
   Third-Party Auth**, adicione **Clerk** e informe esse domínio.
3. Garanta que o token de sessão do Clerk inclua o claim `role: "authenticated"`
   (a integração oficial já configura isso). Assim o Supabase trata o usuário
   como autenticado e as políticas de RLS passam a valer.

Referência: <https://clerk.com/docs/integrations/databases/supabase> e
<https://supabase.com/docs/guides/auth/third-party/clerk>.

## 4. Variáveis de ambiente

Local: copie `.env.example` para `.env` e preencha. No GitHub Actions: defina os
mesmos valores em **Settings → Secrets and variables → Actions** (o workflow os
injeta no build).

| Variável | Onde obter |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase → API → anon public |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk → API Keys |

Enquanto essas chaves não estiverem definidas, o app roda em **modo
demonstração** (navegável, sem persistência).

## Modelo de dados (resumo)

- `care_circles` — o espaço compartilhado de um idoso e sua equipe
- `memberships` — usuário ↔ círculo + papel (`admin` / `family` / `caregiver`)
- `care_recipients` — o idoso (1 por círculo)
- `medications` + `medication_logs` — remédios e doses
- `diary_entries` — diário de cuidados
- `shifts` — escala de plantão
- `medical_records` — histórico médico
- `invites` — convites pendentes
- `push_subscriptions` — inscrições de Web Push (Fase 4)

Tudo protegido por RLS: só membros do círculo acessam os dados daquele círculo.
Criação do círculo + primeira associação é feita pela função
`create_care_circle(circle_name, recipient_name)`.

## 5. Notificações push (Fase 4)

As notificações usam **Web Push (VAPID)** enviadas por **Edge Functions**. As
inscrições são **por usuário/aparelho** (`push_subscriptions`), então cada pessoa
recebe alertas de **todos os seus círculos**.

### 5.1 Gerar as chaves VAPID

```bash
npx web-push generate-vapid-keys
```

Guarde a **Public Key** e a **Private Key**.

### 5.2 Definir as chaves

- **Cliente (build):** `VITE_VAPID_PUBLIC_KEY` = Public Key
  - Local: no `.env`. Produção: secret no GitHub Actions.
- **Servidor (Edge Functions):**
  ```bash
  supabase secrets set VAPID_PUBLIC_KEY=<public>
  supabase secrets set VAPID_PRIVATE_KEY=<private>
  supabase secrets set VAPID_SUBJECT=mailto:voce@exemplo.com
  supabase secrets set CRON_SECRET=<uma-string-aleatoria>
  ```
  `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` já são injetados automaticamente.

### 5.3 Deploy das funções

As funções não verificam o JWT do Supabase (o app usa token do Clerk), então
faça o deploy com `--no-verify-jwt`:

```bash
supabase functions deploy notify --no-verify-jwt
supabase functions deploy medication-reminders --no-verify-jwt
```

- **`notify`** — recebe `{ circleId, title, body, url, excludeSelf }`, confere se
  quem chamou é membro do círculo e envia para os demais. Usado pelo **SOS**.
- **`medication-reminders`** — varre os remédios devidos agora sem registro de
  "tomado" e avisa o círculo. Protegida pelo header `x-cron-secret`.

### 5.4 Agendar os lembretes (pg_cron)

No **SQL Editor**, com seu `<PROJECT_REF>` e `<CRON_SECRET>`:

```sql
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'medication-reminders',
  '*/5 * * * *',
  $$
  select net.http_post(
    url := 'https://<PROJECT_REF>.functions.supabase.co/medication-reminders',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron-secret', '<CRON_SECRET>'),
    body := '{}'::jsonb
  );
  $$
);
```

O cron roda a cada 5 min; a função só notifica doses vencidas na janela de 5 min
(config. via `REMINDER_WINDOW_MIN`) e ainda não tomadas. Fuso padrão
`America/Sao_Paulo` (ajuste com `REMINDER_TZ`).

### 5.5 Aplicar a migração 0004

Rode [`migrations/0004_push_per_user.sql`](migrations/0004_push_per_user.sql) —
recria `push_subscriptions` por usuário (a tabela ainda está vazia em produção).

### ⚠️ iOS

No iPhone, o Web Push só funciona com o PWA **adicionado à tela de início**
(iOS 16.4+) e aberto pelo ícone. O app mostra esse aviso automaticamente para
usuários iOS na tela de Configurações.
