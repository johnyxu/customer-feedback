import { Navigate, Route, Routes } from 'react-router-dom'
import { FeedbackEntryPage } from './pages/feedback/FeedbackEntryPage'
import { FeedbackDetailPage } from './pages/feedback/FeedbackDetailPage'
import { FeedbackListPage } from './pages/feedback/FeedbackListPage'
import { FeedbackPage } from './pages/feedback/FeedbackPage'
import { FeedbackVerifyPage } from './pages/feedback/FeedbackVerifyPage'

function App() {
  return (
    <Routes>
      <Route path="/feedback/start" element={<FeedbackEntryPage />} />
      <Route path="/feedback/verify" element={<FeedbackVerifyPage />} />
      <Route path="/feedback/list" element={<FeedbackListPage />} />
      <Route path="/feedback/detail" element={<FeedbackDetailPage />} />
      <Route path="/feedback" element={<FeedbackPage />} />
      <Route path="*" element={<Navigate to="/feedback/start" replace />} />
    </Routes>
  )
}

export default App
