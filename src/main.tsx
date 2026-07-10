import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '@/lib/i18n'
import '@/styles/index.css'
import { AppRouter } from '@/app/AppRouter'

const container = document.getElementById('root')
if (!container) throw new Error('Root element #root not found')

createRoot(container).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>,
)
