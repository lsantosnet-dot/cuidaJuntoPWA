import { useTranslation } from 'react-i18next'
import { PageHeader, Card, Avatar, Chip, Button, Icon, Spinner, EmptyState } from '@/components/ui'
import { useDisclosure } from '@/hooks/useDisclosure'
import { useLanguage } from '@/hooks/useLanguage'
import { formatDate } from '@/lib/datetime'
import { useProfile } from './useProfile'
import { EditProfileForm } from './components/EditProfileForm'

function ageFrom(birthDate: string): number {
  const b = new Date(birthDate)
  const now = new Date()
  let age = now.getFullYear() - b.getFullYear()
  const m = now.getMonth() - b.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--
  return age
}

export function ProfileView() {
  const { t } = useTranslation()
  const { current } = useLanguage()
  const { recipient, isLoading, error, save } = useProfile()
  const form = useDisclosure()

  return (
    <div>
      <PageHeader title={t('pages.profile.title')} subtitle={t('pages.profile.subtitle')} />

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner label={t('common.loading')} />
        </div>
      ) : error ? (
        <EmptyState icon="alert" title={t('common.error')} description={error} />
      ) : !recipient ? (
        <EmptyState icon="user" title={t('profile.emptyTitle')} description={t('profile.emptyDescription')} />
      ) : (
        <>
          <Card>
            <div className="flex items-center gap-4">
              <Avatar name={recipient.name} src={recipient.photo_url} size={64} />
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-xl font-bold text-content">{recipient.name}</h2>
                {recipient.birth_date && (
                  <p className="text-base text-content-variant">
                    {t('profile.age', { count: ageFrom(recipient.birth_date) })} ·{' '}
                    {formatDate(recipient.birth_date, current)}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="md"
                onClick={form.open}
                leadingIcon={<Icon name="settings" size={20} />}
              >
                {t('common.edit')}
              </Button>
            </div>

            {recipient.conditions.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-content-variant">
                  {t('profile.conditions')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {recipient.conditions.map((cond) => (
                    <Chip key={cond} tone="sand">
                      {cond}
                    </Chip>
                  ))}
                </div>
              </div>
            )}

            {recipient.notes && (
              <div className="mt-4">
                <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-content-variant">
                  {t('profile.notes')}
                </p>
                <p className="whitespace-pre-wrap text-base text-content">{recipient.notes}</p>
              </div>
            )}
          </Card>

          <EditProfileForm
            isOpen={form.isOpen}
            onClose={form.close}
            recipient={recipient}
            onSubmit={save}
          />
        </>
      )}
    </div>
  )
}
