import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PageHeader, Button, Icon, EmptyState, Spinner, Card, ConfirmDialog } from '@/components/ui'
import { useDisclosure } from '@/hooks/useDisclosure'
import { useTeam } from './useTeam'
import { InviteForm } from './components/InviteForm'
import { MemberCard } from './components/MemberCard'
import type { MembershipRow } from './types'

export function TeamView() {
  const { t } = useTranslation()
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
              {members.map((m) => (
                <li key={m.id}>
                  <MemberCard
                    member={m}
                    isYou={m.user_id === currentUserId}
                    canRemove={isAdmin && m.user_id !== currentUserId}
                    onDelete={setPendingDelete}
                  />
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
