import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '@/lib/i18n'
import '@/styles/index.css'
import { AppProviders } from '@/app/AppProviders'
import { AppRouter } from '@/app/AppRouter'
import { UpdateNotice } from '@/components/common/UpdateNotice'

const container = document.getElementById('root')
if (!container) throw new Error('Root element #root not found')

createRoot(container).render(
  <StrictMode>
    <UpdateNotice />
    <AppProviders>
      <AppRouter />
    </AppProviders>
  </StrictMode>,
)
