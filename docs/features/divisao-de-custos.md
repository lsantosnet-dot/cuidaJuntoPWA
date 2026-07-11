# Especificação — Divisão de custos entre membros do círculo

Status: proposta (não implementada) · Autor: sessão Claude Code · Data: 2026-07-11

## 1. Problema

Famílias que cuidam de um parente em conjunto compartilham despesas recorrentes
(remédios, fraldas/higiene, cuidador contratado, exames) mas hoje resolvem o
rateio "por fora" — WhatsApp, planilha paralela ou de cabeça. Isso gera atrito
real: ninguém sabe ao certo quanto já gastou, quem está devendo, ou se o valor
combinado foi realmente dividido de forma justa. O CuidaJunto já é o lugar
onde a equipe coordena remédios, plantões e diário; custos é a peça financeira
que falta para o "cuidado compartilhado" ser completo.

**Dor central:** falta de transparência sobre "quem gastou o quê" e "quem deve
para quem", que corrói a confiança entre os membros do círculo com o tempo.

## 2. Objetivo do MVP

Permitir que qualquer membro do círculo registre uma despesa, diga quem pagou
e como ela deve ser dividida, e que todo o círculo veja em tempo real:

1. o histórico de despesas por categoria;
2. quanto cada membro pagou vs. quanto deveria ter pago (saldo);
3. quem deve para quem, com o menor número de transações possível;
4. um jeito de marcar uma dívida como quitada (registro manual, sem
   integração de pagamento real).

## 3. Fora de escopo (fase 2+)

- Despesas recorrentes/automáticas (ex.: salário mensal do cuidador, fralda
  todo mês) — no MVP cada gasto é lançado manualmente, mesmo que se repita.
- Integração com gateway de pagamento (Pix, cartão) — quitar é só um registro
  informativo dentro do app.
- Anexar comprovante/nota fiscal (poderia reaproveitar o padrão de
  `attachment_url` de `medical_records` numa fase futura).
- Múltiplas moedas simultâneas no mesmo círculo (fixamos BRL).
- Orçamento/limite mensal por categoria e relatórios exportáveis.

## 4. Decisões de produto já validadas

| Decisão | Escolha |
|---|---|
| Regra de rateio padrão | Igual entre participantes, com opção de personalizar valor/participantes por despesa |
| Acompanhamento de pagamento | Mostra saldo **e** permite registrar quitação (não é só informativo) |
| Recorrência | Fora do MVP |
| Quem pode lançar/editar despesas | Qualquer membro do círculo (admin, family, caregiver) — mesmo padrão hoje usado em remédios/diário |

## 5. Modelo de dados

Segue a convenção já usada no schema (`supabase/migrations/0001_schema.sql`):
tabelas por `circle_id`, ids de usuário como `text` (Clerk `sub`), RLS por
"qualquer membro do círculo tem acesso total" (`is_circle_member`).

Valores monetários em **centavos (`integer`)** para evitar erro de
arredondamento com `float` — é a primeira feature financeira do app, vale
começar certo.

```sql
-- Despesa lançada por um membro do círculo.
create table public.cost_entries (
  id            uuid primary key default gen_random_uuid(),
  circle_id     uuid not null references public.care_circles(id) on delete cascade,
  description   text not null,
  category      text not null default 'other'
                  check (category in ('medication', 'diaper', 'caregiver', 'other')),
  amount_cents  integer not null check (amount_cents > 0),
  currency      text not null default 'BRL',
  expense_date  date not null default current_date,
  paid_by       text not null,                     -- Clerk user id de quem adiantou o dinheiro
  paid_by_name  text,
  split_type    text not null default 'equal'
                  check (split_type in ('equal', 'custom')),
  notes         text,
  created_by    text not null,
  created_at    timestamptz not null default now()
);

-- Quanto cada participante deve por uma despesa específica.
-- Uma linha por participante (inclui quem pagou, se ele também consumiu).
create table public.cost_shares (
  id             uuid primary key default gen_random_uuid(),
  cost_entry_id  uuid not null references public.cost_entries(id) on delete cascade,
  circle_id      uuid not null references public.care_circles(id) on delete cascade,
  user_id        text not null,
  user_name      text,
  share_cents    integer not null check (share_cents >= 0),
  created_at     timestamptz not null default now(),
  unique (cost_entry_id, user_id)
);

-- Registro manual de quitação entre dois membros (não vinculado a uma
-- despesa específica; abate do saldo geral entre as duas pessoas).
create table public.cost_settlements (
  id             uuid primary key default gen_random_uuid(),
  circle_id      uuid not null references public.care_circles(id) on delete cascade,
  from_user_id   text not null,                    -- quem pagou a dívida
  from_user_name text,
  to_user_id     text not null,                    -- quem recebeu
  to_user_name   text,
  amount_cents   integer not null check (amount_cents > 0),
  note           text,
  settled_at     timestamptz not null default now(),
  created_by     text not null,
  created_at     timestamptz not null default now()
);

create index idx_cost_entries_circle     on public.cost_entries (circle_id, expense_date desc);
create index idx_cost_shares_entry       on public.cost_shares (cost_entry_id);
create index idx_cost_shares_circle_user on public.cost_shares (circle_id, user_id);
create index idx_cost_settlements_circle on public.cost_settlements (circle_id, settled_at desc);
```

RLS (mesma receita de `0002_rls.sql`):

```sql
alter table public.cost_entries     enable row level security;
alter table public.cost_shares      enable row level security;
alter table public.cost_settlements enable row level security;

create policy cost_entries_all on public.cost_entries
  for all using (public.is_circle_member(circle_id))
  with check (public.is_circle_member(circle_id));

create policy cost_shares_all on public.cost_shares
  for all using (public.is_circle_member(circle_id))
  with check (public.is_circle_member(circle_id));

create policy cost_settlements_all on public.cost_settlements
  for all using (public.is_circle_member(circle_id))
  with check (public.is_circle_member(circle_id));
```

### Por que uma tabela `cost_shares` separada em vez de uma coluna JSON

Dá para indexar "quanto o usuário X deve no total" com uma query simples,
mantém a integridade referencial (cascade ao apagar despesa) e evita parsing
de JSON no cliente para todo cálculo de saldo — consistente com o resto do
schema, que não usa colunas JSON em lugar nenhum.

## 6. Regras de negócio

### 6.1 Criar despesa

- Campos obrigatórios: descrição, categoria, valor, data, quem pagou.
- Participantes por padrão = todos os membros ativos do círculo no momento
  do lançamento; quem cria pode desmarcar quem não participa daquela despesa
  específica (ex.: fralda é rateada só entre os 2 filhos, não o cuidador).
- **Divisão igual**: `amount_cents / participantes`, com o resto da divisão
  inteira (centavos que sobram do arredondamento) atribuído a quem pagou —
  evita que a soma dos `share_cents` divirja do `amount_cents` total.
- **Divisão customizada**: quem lança define valor (R$) ou percentual por
  participante; a soma tem que bater exatamente com o total antes de salvar
  (validação no formulário, com um indicador "faltam R$ X" / "sobram R$ X").
- Quem pagou também pode não ser participante (ex.: um neto adianta o
  cuidador mas não mora com o idoso e não "consome" aquele gasto).

### 6.2 Cálculo de saldo (derivado, não armazenado)

Para cada membro do círculo, em centavos:

```
saldo(membro) = Σ amount_cents das despesas em que ele é paid_by
              − Σ share_cents das cost_shares onde user_id = membro
              + Σ amount_cents de cost_settlements onde to_user_id = membro
              − Σ amount_cents de cost_settlements onde from_user_id = membro
```

`saldo > 0` → o grupo deve para esse membro. `saldo < 0` → esse membro deve
para o grupo.

### 6.3 "Quem deve para quem" (simplificação de dívidas)

Em vez de listar toda transação par-a-par, aplicar o algoritmo guloso clássico
de simplificação (mesmo usado por apps tipo Splitwise): ordenar credores e
devedores pelo saldo absoluto, casar o maior devedor com o maior credor até
zerar as pontas. Isso minimiza o número de "fulano deve X para beltrano"
exibido — importante porque círculos costumam ter 3–6 membros e a lista
par-a-par cresceria rápido sem necessidade.

Esse cálculo é 100% client-side, em cima dos dados já carregados (não precisa
de view/RPC no banco) — mesmo padrão de `useShifts`/`useTeam`, que derivam
estado (`activeShift`, etc.) em `useMemo` a partir da lista bruta.

### 6.4 Quitar uma dívida

- Na tela de saldo, ao lado de "Você deve R$ 80 para Ana", um botão **Marcar
  como pago** abre um modal de confirmação (valor pré-preenchido, editável
  para pagamento parcial) e insere um `cost_settlements`.
- Quitação parcial é permitida (ex.: pagar R$ 40 dos R$ 80); o saldo recalcula
  e a pendência continua aparecendo com o valor restante.
- Qualquer um dos dois lados da dívida pode registrar a quitação (evita
  travar o fluxo esperando só quem pagou confirmar).

### 6.5 Edição e exclusão

- Editar/excluir uma despesa é permitido a qualquer membro (mesma política
  simples de remédios/diário hoje — sem workflow de aprovação no MVP).
- Excluir uma despesa remove suas `cost_shares` em cascata e recalcula saldos
  automaticamente (são derivados, não hay nada para "desfazer" além do
  registro em si).
- Seguir o padrão já existente de exclusão com confirmação (o commit
  `7d50e63` já adicionou esse padrão para outros cards) — usar o mesmo
  componente de confirmação nos cards de despesa.

## 7. Fluxos de UI

Reaproveitando os padrões visuais já estabelecidos (cards expansíveis tipo
`DoseCard`/`MemberCard`, formulário modal tipo `AddShiftForm`).

### 7.1 Navegação

Nova rota `/costs`, item **"Custos"** na gaveta lateral (`CARE_NAV`, ao lado
de Equipe/Histórico/Perfil) — não entra na bottom nav para manter os 4 itens
"calmos" já documentados em `src/config/navigation.ts`. Precisa de um ícone
novo (`wallet` ou `coins`) em `src/components/ui/Icon.tsx`, que hoje não tem
nenhum ícone financeiro.

### 7.2 Tela principal (`CostsView`)

1. **Resumo de saldo** no topo: card por membro do círculo mostrando "pagou
   R$ X" / "saldo: +R$ Y" ou "−R$ Y", com destaque para o próprio saldo do
   usuário logado.
2. **Quem deve para quem**: lista simplificada (seção 6.3), cada linha com
   botão "Marcar como pago".
3. **Histórico de despesas**: lista cronológica (mais recente primeiro),
   agrupável/filtrável por categoria (chips: Remédios, Fraldas, Cuidador,
   Outros — reaproveita o mesmo estilo de filtro/chip usado em
   `MedicationsView` ou `HistoryPage`, a confirmar durante implementação).
   Cada item é um card expansível mostrando descrição, valor, quem pagou e o
   detalhamento por participante ao expandir.
4. Botão flutuante/fixo **"+ Nova despesa"**.

### 7.3 Formulário de nova despesa (`AddCostForm`)

- Descrição (texto livre)
- Categoria (seletor: Remédios / Fraldas e higiene / Cuidador contratado /
  Outros)
- Valor (input monetário, formatado em R$)
- Data (default: hoje)
- Quem pagou (seletor entre os membros do círculo, default: usuário logado)
- Divisão: toggle "Dividir igualmente" (default, ligado) vs "Personalizar"
  - Igual: lista de checkboxes dos membros (todos marcados por padrão) —
    quem estiver desmarcado não participa do rateio.
  - Personalizado: lista de membros com campo de valor por pessoa, mostrando
    o total já alocado e a diferença para o valor total em tempo real.
- Observações (opcional)

### 7.4 Modal de quitação (`SettleUpModal`)

- Mostra "de [A] para [B]", valor pendente pré-preenchido, campo editável,
  campo de observação opcional, botão confirmar.

## 8. Integração com o app existente

- **Modo demo** (`src/features/demo/demoStore.ts`): adicionar `costEntries`,
  `costShares`, `costSettlements` ao `DemoState`, com 3–4 despesas de exemplo
  cobrindo as três categorias citadas (remédio, fralda, cuidador) e um saldo
  não-trivial entre os membros fictícios já existentes (Ana, Carlos), para a
  tela nunca ficar vazia na demonstração.
- **i18n**: novo namespace `costs.*` em `src/locales/pt/common.json` e
  `src/locales/en/common.json`, seguindo o padrão de chaves já usado
  (`nav.costs`, `costs.title`, `costs.addExpense`, `costs.splitEqual`, etc.).
- **Papéis (`MembershipRole`)**: nenhuma tabela nova de permissão — reaproveita
  `is_circle_member`, igual às demais tabelas "todo mundo edita".
- **Notificações** (fase 2, fora do MVP): quando uma despesa for lançada ou
  uma dívida grande ficar pendente, poderia usar a mesma infraestrutura de
  push já existente (`supabase/functions/notify`) — não implementar agora,
  só deixar registrado que o gancho existe.

## 9. Estrutura de código proposta

Seguindo o padrão de `src/features/<nome>/` (ver `shifts` como referência
mais próxima em complexidade):

```
src/features/costs/
  types.ts               # CostEntryRow, CostShareRow, CostSettlementRow,
                          # NewCostEntry, CostCategory, SplitType
  api.ts                  # fetchCostEntries, fetchCostShares, fetchSettlements,
                          # addCostEntry (insere entry + shares), addSettlement,
                          # deleteCostEntry
  useCosts.ts              # hook: carrega dados (demo/supabase), expõe
                          # entries, balances (useMemo), simplifiedDebts (useMemo),
                          # add, settle, remove
  balances.ts              # funções puras: computeBalances(), simplifyDebts()
                          # — isoladas para poder testar sem React/Supabase
  CostsView.tsx
  components/
    AddCostForm.tsx
    CostCard.tsx
    BalanceSummary.tsx
    SettleUpModal.tsx
  index.ts
```

Nova migração: `supabase/migrations/0006_costs.sql` com o schema + RLS da
seção 5.

## 10. Critérios de aceite (MVP)

- [ ] Qualquer membro consegue lançar uma despesa com categoria, valor, quem
      pagou e forma de divisão (igual ou customizada), e ela aparece
      imediatamente para todo o círculo.
- [ ] A soma dos `share_cents` de uma despesa é sempre igual ao `amount_cents`
      total (sem perda por arredondamento).
- [ ] O resumo de saldo mostra corretamente quanto cada membro pagou e seu
      saldo líquido, considerando despesas e quitações.
- [ ] "Quem deve para quem" mostra o número mínimo de transações necessárias
      para zerar todos os saldos do círculo.
- [ ] É possível registrar uma quitação (total ou parcial) e o saldo
      atualiza corretamente.
- [ ] Excluir uma despesa remove suas divisões e recalcula os saldos sem
      deixar resíduo.
- [ ] Funciona no modo demo sem Supabase configurado (mesma paridade que as
      outras features).
- [ ] Textos em pt/en via i18n, sem string solta no componente.
- [ ] RLS testada: usuário fora do círculo não lê nem escreve em
      `cost_entries`/`cost_shares`/`cost_settlements` daquele círculo.

## 11. Perguntas em aberto para antes de implementar

1. Categoria "Outros" é suficiente ou vale já prever mais categorias
   (transporte, alimentação, exames) mesmo que o pedido original cite só
   três? (Sugestão: manter as 4 do MVP e tornar o `check` fácil de estender
   depois — trocar o `check` por uma tabela `cost_categories` só valeria a
   pena se o usuário pedir customização por círculo.)
2. Cuidador contratado que **não** é um membro logado do círculo (ex.: só
   recebe Pix, não usa o app) — despesas relacionadas a ele são só
   categorizadas como "Cuidador contratado" e pagas/rateadas entre os
   membros reais, certo? (Assumido que sim — ele não é um `user_id`
   participante, só uma categoria de gasto.)
3. Moeda: fixar BRL é aceitável dado o público-alvo (famílias brasileiras),
   mas o campo `currency` já fica no schema para não travar expansão futura.
