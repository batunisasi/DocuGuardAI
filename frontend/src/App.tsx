import { DemoProvider, useDemo } from './state/DemoStore'
import { AppShell } from './components/layout/AppShell'
import { Button } from './components/ui/Button'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import { GlassPanel } from './components/ui/Glass'
import { EmptyState } from './components/ui/States'
import { ToastHost } from './components/ui/Toast'
import { RevisionDialog } from './components/review/RevisionDialog'
import { ResetDialog } from './components/review/ResetDialog'
import { UnsavedDialog } from './components/review/UnsavedDialog'
import { AIProcessing } from './screens/AIProcessing'
import { Dashboard } from './screens/Dashboard'
import { FindingsEvidence } from './screens/FindingsEvidence'
import { HumanReview } from './screens/HumanReview'
import { NewReview } from './screens/NewReview'
import { ReviewHistory } from './screens/ReviewHistory'
import { ReviewResult } from './screens/ReviewResult'
import { VersionComparison } from './screens/VersionComparison'

function renderScreen(active: string, navigate: (id: string) => void) {
  switch (active) {
    case 'dashboard':
      return <Dashboard onNavigate={navigate} />
    case 'new':
      return <NewReview onNavigate={navigate} />
    case 'processing':
      return <AIProcessing />
    case 'result':
      return <ReviewResult onNavigate={navigate} />
    case 'findings':
      return <FindingsEvidence onNavigate={navigate} />
    case 'human':
      return <HumanReview onNavigate={navigate} />
    case 'history':
      return <ReviewHistory />
    case 'compare':
      return <VersionComparison />
    default:
      return (
        <GlassPanel variant="glass-strong" className="mx-auto mt-10 max-w-lg">
          <EmptyState icon="info" title="Halaman tidak ditemukan" body="Halaman yang Anda tuju tidak tersedia."
            action={<Button variant="glass" onClick={() => navigate('dashboard')}>Kembali ke Dasbor</Button>} />
        </GlassPanel>
      )
  }
}

function Screens() {
  const { active, navigate } = useDemo()
  return (
    <AppShell active={active} onSelect={navigate}>
      {renderScreen(active, navigate)}
      <RevisionDialog />
      <UnsavedDialog />
      <ResetDialog />
      <ToastHost />
    </AppShell>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <DemoProvider>
        <Screens />
      </DemoProvider>
    </ErrorBoundary>
  )
}
