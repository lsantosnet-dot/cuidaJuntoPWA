import { useTranslation } from 'react-i18next'
import { Card, Avatar, Chip, Icon, IconButton } from '@/components/ui'
import { cn } from '@/lib/cn'
import { useLanguage } from '@/hooks/useLanguage'
import { useDisclosure } from '@/hooks/useDisclosure'
import { formatDate } from '@/lib/datetime'
import type { MembershipRole, MembershipRow } from '../types'

const ROLE_TONE: Record<MembershipRole, 'teal' | 'sage' | 'sand'> = {
  admin: 'teal',
  family: 'sand',
  caregiver: 'sage',
}

export function MemberCard({
  member,
  isYou,
  canRemove,
  onDelete,
}: {
  member: MembershipRow
  isYou: boolean
  canRemove: boolean
  onDelete: (member: MembershipRow) => void
}) {
  const { t } = useTranslation()
  const { current } = useLanguage()
  const { isOpen: expanded, toggle } = useDisclosure()

  const name = member.display_name ?? member.email ?? t('team.unnamed')
  const youLabel = t('team.you')
  const memberSince = t('team.memberSince', { date: formatDate(member.created_at, current) })
  const detail = member.email ?? memberSince

  return (
    <Card>
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={toggle}
          aria-expanded={expanded}
          aria-label={t(expanded ? 'team.collapseLabel' : 'team.expandLabel')}
          className="flex min-w-0 flex-1 items-start gap-3 text-left"
        >
          <Avatar name={name} src={member.avatar_url} size={48} className="mt-0.5 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className={cn('text-base font-bold text-content', !expanded && 'truncate')}>
              {name}
              {isYou && name !== youLabel && (
                <span className="font-normal text-content-variant"> · {youLabel}</span>
              )}
            </p>
            <Chip tone={ROLE_TONE[member.role]} className="mt-1 shrink-0">
              {t(`team.role.${member.role}`)}
            </Chip>
            <p
              className={cn(
                'mt-0.5 text-sm text-content-variant',
                !expanded && 'truncate',
                expanded && 'break-words',
              )}
            >
              {detail}
            </p>
            {expanded && member.email && (
              <p className="mt-1 text-sm text-content-variant">{memberSince}</p>
            )}
          </div>
          <Icon
            name="chevronRight"
            size={20}
            className={cn(
              'mt-0.5 shrink-0 text-content-variant transition-transform',
              expanded ? '-rotate-90' : 'rotate-90',
            )}
          />
        </button>
        {canRemove && (
          <IconButton
            label={t('team.removeLabel')}
            icon="trash"
            iconSize={20}
            className="shrink-0 text-content-variant hover:text-sos"
            onClick={() => onDelete(member)}
          />
        )}
      </div>
    </Card>
  )
}
