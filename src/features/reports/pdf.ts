import { jsPDF } from 'jspdf'
import { autoTable } from 'jspdf-autotable'
import type { TFunction } from 'i18next'
import type { AppLanguage } from '@/lib/i18n'
import { formatDate } from '@/lib/datetime'
import type { ReportData } from './types'

/** Brand teal, mirrors --color-primary in src/styles/index.css. */
const PRIMARY_RGB: [number, number, number] = [0, 83, 91]
const MUTED_RGB: [number, number, number] = [90, 90, 90]

const MARGIN = 14
const HEADER_HEIGHT = 30

function ageFromBirthDate(birthDate: string): number {
  const b = new Date(birthDate)
  const now = new Date()
  let age = now.getFullYear() - b.getFullYear()
  const m = now.getMonth() - b.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--
  return age
}

function drawHeader(doc: jsPDF, t: TFunction, lang: AppLanguage) {
  const pageWidth = doc.internal.pageSize.getWidth()
  doc.setFillColor(...PRIMARY_RGB)
  doc.rect(0, 0, pageWidth, HEADER_HEIGHT, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.text(t('app.name'), MARGIN, 11)

  doc.setFontSize(11)
  doc.text(t('reports.pdf.documentTitle'), MARGIN, 18)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(t('reports.pdf.subtitle'), MARGIN, 24)

  const generatedAt = t('reports.pdf.generatedAt', { date: formatDate(new Date(), lang) })
  doc.text(generatedAt, pageWidth - MARGIN, 24, { align: 'right' })

  doc.setTextColor(0, 0, 0)
}

function addSectionTitle(doc: jsPDF, y: number, title: string): number {
  const pageHeight = doc.internal.pageSize.getHeight()
  let cursorY = y
  if (cursorY > pageHeight - 30) {
    doc.addPage()
    cursorY = MARGIN
  }
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(...PRIMARY_RGB)
  doc.text(title, MARGIN, cursorY)
  doc.setTextColor(0, 0, 0)
  return cursorY + 6
}

function finalY(doc: jsPDF): number {
  return (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY
}

function addFooters(doc: jsPDF, t: TFunction, lang: AppLanguage) {
  const pageCount = doc.getNumberOfPages()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setDrawColor(...MUTED_RGB)
    doc.setLineWidth(0.2)
    doc.line(MARGIN, pageHeight - 16, pageWidth - MARGIN, pageHeight - 16)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...MUTED_RGB)
    doc.text(
      t('reports.pdf.footer', { date: formatDate(new Date(), lang) }),
      MARGIN,
      pageHeight - 11,
      { maxWidth: pageWidth - MARGIN * 2 - 30 },
    )
    doc.text(t('reports.pdf.confidential'), MARGIN, pageHeight - 6)
    doc.text(t('reports.pdf.page', { page: i, total: pageCount }), pageWidth - MARGIN, pageHeight - 6, {
      align: 'right',
    })
    doc.setTextColor(0, 0, 0)
  }
}

/** Builds the "report for the doctor" PDF and triggers a browser download. */
export function generateDoctorReportPdf(data: ReportData, t: TFunction, lang: AppLanguage): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const contentWidth = pageWidth - MARGIN * 2

  drawHeader(doc, t, lang)

  const { recipient, medications, records, diary, routineItems } = data
  const patientName = recipient?.name || t('reports.pdf.noData')

  let y = HEADER_HEIGHT + 10
  y = addSectionTitle(doc, y, t('reports.pdf.patientSection'))

  const patientRows: [string, string][] = [
    [t('reports.pdf.name'), patientName],
    [
      t('reports.pdf.age'),
      recipient?.birth_date ? String(ageFromBirthDate(recipient.birth_date)) : t('reports.pdf.noData'),
    ],
    [
      t('reports.pdf.birthDate'),
      recipient?.birth_date ? formatDate(recipient.birth_date, lang) : t('reports.pdf.noData'),
    ],
    [
      t('reports.pdf.conditions'),
      recipient?.conditions?.length ? recipient.conditions.join(', ') : t('reports.pdf.noData'),
    ],
    [t('reports.pdf.notes'), recipient?.notes || t('reports.pdf.noData')],
  ]
  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    theme: 'plain',
    styles: { fontSize: 9.5, cellPadding: 1.2 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 35 }, 1: { cellWidth: contentWidth - 35 } },
    body: patientRows,
  })
  y = finalY(doc) + 10

  y = addSectionTitle(doc, y, t('reports.pdf.medicationsSection'))
  if (medications.length === 0) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9.5)
    doc.text(t('reports.pdf.noMedications'), MARGIN, y)
    y += 10
  } else {
    autoTable(doc, {
      startY: y,
      margin: { left: MARGIN, right: MARGIN },
      headStyles: { fillColor: PRIMARY_RGB },
      styles: { fontSize: 9 },
      head: [[
        t('reports.pdf.medicationName'),
        t('reports.pdf.dosage'),
        t('reports.pdf.schedule'),
        t('reports.pdf.instructions'),
      ]],
      body: medications.map((m) => [
        m.name,
        m.dosage || '—',
        m.schedule_times.join(', ') || '—',
        m.instructions || '—',
      ]),
    })
    y = finalY(doc) + 10
  }

  y = addSectionTitle(doc, y, t('reports.pdf.historySection'))
  if (records.length === 0) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9.5)
    doc.text(t('reports.pdf.noRecords'), MARGIN, y)
    y += 10
  } else {
    autoTable(doc, {
      startY: y,
      margin: { left: MARGIN, right: MARGIN },
      headStyles: { fillColor: PRIMARY_RGB },
      styles: { fontSize: 9 },
      head: [[
        t('reports.pdf.recordDate'),
        t('reports.pdf.recordTitle'),
        t('reports.pdf.recordCategory'),
        t('reports.pdf.recordDetails'),
      ]],
      body: records.map((r) => [
        formatDate(r.record_date, lang),
        r.title,
        t(`history.category.${r.category}`),
        r.details || '—',
      ]),
    })
    y = finalY(doc) + 10
  }

  y = addSectionTitle(doc, y, t('reports.pdf.diarySection'))
  if (diary.length === 0) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9.5)
    doc.text(t('reports.pdf.noDiary'), MARGIN, y)
    y += 10
  } else {
    autoTable(doc, {
      startY: y,
      margin: { left: MARGIN, right: MARGIN },
      headStyles: { fillColor: PRIMARY_RGB },
      styles: { fontSize: 8.5 },
      head: [[
        t('reports.pdf.diaryDate'),
        t('reports.pdf.diaryAuthor'),
        t('reports.pdf.diaryMood'),
        t('reports.pdf.diarySleep'),
        t('reports.pdf.diaryAppetite'),
        t('reports.pdf.diaryContent'),
      ]],
      body: diary.map((d) => [
        formatDate(d.created_at, lang),
        d.author_name || '—',
        d.mood ? t(`diary.mood.${d.mood}`) : '—',
        d.sleep_quality ? t(`diary.sleep.${d.sleep_quality}`) : '—',
        d.appetite ? t(`diary.appetite.${d.appetite}`) : '—',
        d.content || '—',
      ]),
    })
    y = finalY(doc) + 10
  }

  y = addSectionTitle(doc, y, t('reports.pdf.routineSection'))
  if (routineItems.length === 0) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9.5)
    doc.text(t('reports.pdf.noRoutine'), MARGIN, y)
  } else {
    autoTable(doc, {
      startY: y,
      margin: { left: MARGIN, right: MARGIN },
      headStyles: { fillColor: PRIMARY_RGB },
      styles: { fontSize: 9 },
      head: [[t('reports.pdf.routineItem'), t('reports.pdf.routineType'), t('reports.pdf.routineTarget')]],
      body: routineItems.map((i) => [
        i.name,
        t(`routine.type.${i.type}`),
        t('routine.target', { count: i.target_count_per_day }),
      ]),
    })
  }

  addFooters(doc, t, lang)

  const slug = patientName
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
  doc.save(`relatorio-medico-${slug || 'paciente'}-${todayFileStamp()}.pdf`)
}

function todayFileStamp(): string {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}
