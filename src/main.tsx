import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.tsx'
import { I18nProvider } from './i18n/I18nProvider'
import { GOOGLE_CLIENT_ID } from './constants/env'

const STRICT_MODE = false

const app = (
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <I18nProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </I18nProvider>
  </GoogleOAuthProvider>
)

createRoot(document.getElementById('root')!).render(STRICT_MODE ? <StrictMode>{app}</StrictMode> : app)
