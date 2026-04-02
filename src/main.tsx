import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { I18nProvider } from './i18n/I18nProvider'

const STRICT_MODE = false

const app = (
  <I18nProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </I18nProvider>
)

createRoot(document.getElementById('root')!).render(
  STRICT_MODE ? <StrictMode>{app}</StrictMode> : app,
)
