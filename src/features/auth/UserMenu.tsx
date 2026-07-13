import { useTranslation } from 'react-i18next'
import { Avatar, Button, Chip } from '@/components/ui'
import { useAuth } from './AuthContext'

/**
 * Compact account row for the side drawer: avatar, name/email and a sign-out
 * action. In demo mode it shows a "demo" chip instead of sign-out.
 */
export function UserMenu() {
  const { t } = useTranslation()
  const { user, isDemo, signOut } = useAuth()

  if (!user) return null

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Avatar name={user.name} src={user.imageUrl} size={48} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold text-content">{user.name}</p>
          {user.email && (
            <p className="truncate text-sm text-content-variant">{user.email}</p>
          )}
        </div>
        {isDemo && <Chip tone="neutral">{t('account.demo')}</Chip>}
      </div>
      {!isDemo && (
        <Button
          variant="ghost"
          size="md"
          fullWidth
          className="justify-start text-sos hover:bg-sos/10"
          onClick={() => void signOut()}
        >
          {t('account.signOut')}
        </Button>
      )}
    </div>
  )
}
