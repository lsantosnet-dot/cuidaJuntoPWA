import { useTranslation } from 'react-i18next'
import { Button, Icon, Chip } from '@/components/ui'
import { useDisclosure } from '@/hooks/useDisclosure'
import { cn } from '@/lib/cn'
import { useCareCircle } from '../CareCircleContext'
import { CreateCircleModal } from './CreateCircleModal'

/** Lists the circles the user belongs to and switches the active one. */
export function CircleSwitcher() {
  const { t } = useTranslation()
  const { memberships, activeCircleId, setActiveCircleId } = useCareCircle()
  const create = useDisclosure()

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-2">
        {memberships.map((m) => {
          const active = m.circle_id === activeCircleId
          return (
            <li key={m.circle_id}>
              <button
                type="button"
                onClick={() => setActiveCircleId(m.circle_id)}
                aria-pressed={active}
                className={cn(
                  'flex w-full min-h-touch items-center gap-3 rounded-card px-3 py-2 text-left transition-colors',
                  active
                    ? 'bg-primary/10 ring-2 ring-primary'
                    : 'bg-surface-container hover:bg-surface-high',
                )}
              >
                <span
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-pill',
                    active ? 'text-primary' : 'text-transparent',
                  )}
                >
                  <Icon name="check" size={20} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-base font-semibold text-content">
                    {m.care_circles.name}
                  </span>
                </span>
                <Chip tone="neutral">{t(`team.role.${m.role}`)}</Chip>
              </button>
            </li>
          )
        })}
      </ul>

      <Button
        variant="outline"
        onClick={create.open}
        leadingIcon={<Icon name="plus" size={20} />}
      >
        {t('circles.create')}
      </Button>

      <CreateCircleModal isOpen={create.isOpen} onClose={create.close} />
    </div>
  )
}
