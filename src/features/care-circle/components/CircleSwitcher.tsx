import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Icon, Chip } from '@/components/ui'
import { useDisclosure } from '@/hooks/useDisclosure'
import { ROUTES } from '@/lib/routes'
import { cn } from '@/lib/cn'
import { useCareCircle } from '../CareCircleContext'
import { CreateCircleModal } from './CreateCircleModal'

/** Lists the circles the user belongs to and switches the active one. */
export function CircleSwitcher() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { memberships, activeCircleId, setActiveCircleId } = useCareCircle()
  const create = useDisclosure()

  // Switching context sends the user to the dashboard of the new circle, so
  // it's immediately obvious the whole app now reflects the other recipient.
  const switchTo = (circleId: string) => {
    const changed = circleId !== activeCircleId
    setActiveCircleId(circleId)
    if (changed) navigate(ROUTES.home)
  }

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-2">
        {memberships.map((m) => {
          const active = m.circle_id === activeCircleId
          return (
            <li key={m.circle_id}>
              <button
                type="button"
                onClick={() => switchTo(m.circle_id)}
                aria-pressed={active}
                className={cn(
                  'flex w-full min-h-touch items-start gap-2 rounded-card px-3 py-3 text-left transition-colors',
                  active
                    ? 'bg-primary/10 ring-2 ring-primary'
                    : 'bg-surface-container hover:bg-surface-high',
                )}
              >
                <span
                  className={cn(
                    'mt-0.5 shrink-0',
                    active ? 'text-primary' : 'text-transparent',
                  )}
                >
                  <Icon name="check" size={20} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block break-words text-base font-semibold text-content">
                    {m.care_circles.name}
                  </span>
                  <span className="mt-1 inline-flex">
                    <Chip tone="neutral">{t(`team.role.${m.role}`)}</Chip>
                  </span>
                </span>
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
