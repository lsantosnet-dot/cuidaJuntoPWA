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
