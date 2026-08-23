import { Routes, Route } from 'react-router-dom'
import { AppHeader } from '@/components/AppHeader'
import { AuthProvider } from '@/context/AuthContext'
import { LandingPage } from '@/pages/LandingPage'
import { HowItWorksPage } from '@/pages/HowItWorksPage'
import { DashboardPage } from '@/pages/DashboardPage'

export default function App() {
  return (
    <AuthProvider>
      <div className="flex h-screen flex-col overflow-hidden bg-[#0d1117]">
        <AppHeader />
        <div className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/app" element={<DashboardPage />} />
          </Routes>
        </div>
      </div>
    </AuthProvider>
  )
}
