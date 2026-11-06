import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from './Button'
import { Icon } from './Icon'

type Props = {
  children: ReactNode
}

type State = {
  hasError: boolean
  error: Error | null
}

const STORAGE_KEY = 'docuguard-demo-state-v3-id'

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[DocuGuard AI ErrorBoundary]', error, info.componentStack)
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  private handleResetAndReload = () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore storage errors */
    }
    if (typeof window !== 'undefined') {
      window.location.hash = '#/dashboard'
      window.location.reload()
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="relative flex min-h-dvh items-center justify-center bg-canvas px-4 py-10 text-ink">
        <div role="alert" className="glass-strong w-full max-w-lg p-6 sm:p-8 text-center">
          <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-missing-soft text-missing">
            <Icon name="alert" size={24} />
          </div>
          <h1 className="mt-4 text-xl font-semibold tracking-tight">Terjadi kendala teknis pada tampilan</h1>
          <p className="mt-2 text-sm text-ink-2">
            Aplikasi mengalami gangguan saat memuat bagian ini. Anda dapat mencoba memuat ulang tampilan atau mengatur ulang data simulasi ke kondisi awal.
          </p>
          {this.state.error?.message && (
            <p className="mt-3 rounded-xl border border-border bg-paper/75 px-3 py-2 font-mono text-xs text-ink-3 break-words">
              {this.state.error.message}
            </p>
          )}
          <div className="mt-6 flex flex-col justify-center gap-2.5 sm:flex-row">
            <Button variant="primary" icon="refresh" onClick={this.handleRetry}>
              Coba lagi
            </Button>
            <Button variant="glass" onClick={this.handleResetAndReload}>
              Reset data simulasi &amp; muat ulang
            </Button>
          </div>
        </div>
      </div>
    )
  }
}
