import { useTranslation } from 'react-i18next'
import { PageHeader, Button, Icon, EmptyState, Spinner, Card, Avatar, Chip } from '@/components/ui'
import { useDisclosure } from '@/hooks/useDisclosure'
import { useTeam } from './useTeam'
import { InviteForm } from './components/InviteForm'
import type { MembershipRole } from './types'

const ROLE_TONE: Record<MembershipRole, 'teal' | 'sage' | 'sand'> = {
  admin: 'teal',
  family: 'sand',
  caregiver: 'sage',
}

export function TeamView() {
  const { t } = useTranslation()
  const { members, invites, isLoading, error, invite, revoke } = useTeam()
  const form = useDisclosure()

  return (
    <div>
      <PageHeader title={t('pages.team.title')} subtitle={t('pages.team.subtitle')} />

      <div className="mb-4 flex justify-end">
        <Button size="md" onClick={form.open} leadingIcon={<Icon name="plus" size={20} />}>
          {t('team.invite')}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner label={t('common.loading')} />
        </div>
      ) : error ? (
        <EmptyState icon="alert" title={t('common.error')} description={error} />
      ) : (
        <div className="flex flex-col gap-6">
          <section>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-content-variant">
              {t('team.membersSection', { count: members.length })}
            </h2>
            <ul className="flex flex-col gap-3">
              {members.map((m) => (
                <li key={m.id}>
                  <Card>
                    <div className="flex items-center gap-3">
                      <Avatar name={m.display_name ?? m.email ?? '?'} size={40} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-base font-bold text-content">
                          {m.display_name ?? m.email}
                        </p>
                        {m.email && (
                          <p className="truncate text-sm text-content-variant">{m.email}</p>
                        )}
                      </div>
                      <Chip tone={ROLE_TONE[m.role]}>{t(`team.role.${m.role}`)}</Chip>
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          </section>

          {invites.length > 0 && (
            <section>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-content-variant">
                {t('team.invitesSection')}
              </h2>
              <ul className="flex flex-col gap-3">
                {invites.map((i) => (
                  <li key={i.id}>
                    <Card elevated={false}>
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-pill bg-surface-container text-content-variant">
                          <Icon name="user" size={22} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-base font-semibold text-content">{i.email}</p>
                          <p className="text-sm text-content-variant">
                            {t('team.pending')} · {t(`team.role.${i.role}`)}
                          </p>
                        </div>
                        <Button variant="ghost" size="md" onClick={() => void revoke(i.id)}>
                          {t('team.revoke')}
                        </Button>
                      </div>
                    </Card>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}

      <InviteForm isOpen={form.isOpen} onClose={form.close} onSubmit={invite} />
    </div>
  )
}
