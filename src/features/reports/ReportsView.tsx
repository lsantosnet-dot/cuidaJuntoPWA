import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PageHeader, Card, Button, Icon, Spinner, EmptyState } from '@/components/ui'
import { useLanguage } from '@/hooks/useLanguage'
import { useReportsData } from './useReportsData'
import { generateDoctorReportPdf } from './pdf'

export function ReportsView() {
  const { t } = useTranslation()
  const { current } = useLanguage()
  const { data, isLoading, error } = useReportsData()
  const [generating, setGenerating] = useState(false)

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      generateDoctorReportPdf(data, t, current)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div>
      <PageHeader title={t('pages.reports.title')} subtitle={t('pages.reports.subtitle')} />

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner label={t('common.loading')} />
        </div>
      ) : error ? (
        <EmptyState icon="alert" title={t('common.error')} description={error} />
      ) : (
        <Card className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-pill bg-primary/10 text-primary">
            <Icon name="fileText" size={24} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-content">{t('reports.doctorReport.title')}</h2>
            <p className="mt-1 text-sm text-content-variant">
              {t('reports.doctorReport.description')}
            </p>
            <Button
              className="mt-4"
              onClick={() => void handleGenerate()}
              loading={generating}
              leadingIcon={<Icon name="fileText" size={20} />}
            >
              {generating ? t('reports.doctorReport.generating') : t('reports.doctorReport.action')}
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
