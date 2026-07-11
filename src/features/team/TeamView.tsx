import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  PageHeader,
  Button,
  Icon,
  IconButton,
  EmptyState,
  Spinner,
  Card,
  Avatar,
  Chip,
  ConfirmDialog,
} from '@/components/ui'
import { useDisclosure } from '@/hooks/useDisclosure'
import { useLanguage } from '@/hooks/useLanguage'
import { formatDate } from '@/lib/datetime'
import { useTeam } from './useTeam'
import { InviteForm } from './components/InviteForm'
import type { MembershipRole, MembershipRow } from './types'

const ROLE_TONE: Record<MembershipRole, 'teal' | 'sage' | 'sand'> = {
  admin: 'teal',
  family: 'sand',
  caregiver: 'sage',
}

export function TeamView() {
  const { t } = useTranslation()
  const { current } = useLanguage()
  const { members, invites, isLoading, error, invite, revoke, remove, currentUserId } = useTeam()
  const form = useDisclosure()
  const [pendingDelete, setPendingDelete] = useState<MembershipRow | null>(null)
  const [deleting, setDeleting] = useState(false)

  const isAdmin = members.some((m) => m.user_id === currentUserId && m.role === 'admin')

  const confirmDelete = async () => {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      await remove(pendingDelete.id)
      setPendingDelete(null)
    } finally {
      setDeleting(false)
    }
  }

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
              {members.map((m) => {
                const isYou = m.user_id === currentUserId
                const name = m.display_name ?? m.email ?? t('team.unnamed')
                const youLabel = t('team.you')
                const detail = m.email ?? t('team.memberSince', { date: formatDate(m.created_at, current) })
                return (
                  <li key={m.id}>
                    <Card>
                      <div className="flex items-start gap-3">
                        <Avatar name={name} src={m.avatar_url} size={48} className="mt-0.5 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-base font-bold text-content">
                              {name}
                              {isYou && name !== youLabel && (
                                <span className="font-normal text-content-variant"> · {youLabel}</span>
                              )}
                            </p>
                            {isAdmin && !isYou && (
                              <IconButton
                                label={t('team.removeLabel')}
                                icon="trash"
                                iconSize={20}
                                className="ml-auto shrink-0 text-content-variant hover:text-sos"
                                onClick={() => setPendingDelete(m)}
                              />
                            )}
                          </div>
                          <div className="mt-0.5 flex items-center gap-2">
                            <p className="truncate text-sm text-content-variant" title={detail}>
                              {detail}
                            </p>
                            <Chip tone={ROLE_TONE[m.role]} className="ml-auto shrink-0">
                              {t(`team.role.${m.role}`)}
                            </Chip>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </li>
                )
              })}
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

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => void confirmDelete()}
        busy={deleting}
        title={t('team.removeTitle')}
        description={t('team.removeDescription', {
          name: pendingDelete?.display_name ?? pendingDelete?.email ?? '',
        })}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
      />
    </div>
  )
}
