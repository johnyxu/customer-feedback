import { Navigate, Route, Routes } from 'react-router-dom'
import { FeedbackEntryPage } from './pages/feedback/FeedbackEntryPage'
import { FeedbackDetailPage } from './pages/feedback/FeedbackDetailPage'
import { FeedbackListPage } from './pages/feedback/FeedbackListPage'
import { FeedbackPage } from './pages/feedback/FeedbackPage'
import { FeedbackVerifyPage } from './pages/feedback/FeedbackVerifyPage'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage'
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage'
import { RouterLocaleSync } from './components/RouterLocaleSync'

function App() {
  return (
    <>
      <RouterLocaleSync />
      <Routes>
        <Route path="/feedback/start" element={<FeedbackEntryPage />} />
        <Route path="/feedback/verify" element={<FeedbackVerifyPage />} />
        <Route path="/feedback/list" element={<FeedbackListPage />} />
        <Route path="/feedback/:feedbackId/detail" element={<FeedbackDetailPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
        <Route path="*" element={<Navigate to="/feedback/start" replace />} />
      </Routes>
    </>
  )
}

export default App
