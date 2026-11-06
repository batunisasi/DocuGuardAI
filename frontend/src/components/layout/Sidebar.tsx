import { user } from '../../data/dashboard'
import { CASE_NAV, WORKSPACE_NAV } from '../../data/screens'
import { useDemo } from '../../state/DemoStore'
import { Icon } from '../ui/Icon'
import { LogoMark, Wordmark } from '../ui/Logo'
import { PrototypeModePanel } from './PrototypeModePanel'

type Props = {
  active: string
  onSelect: (id: string) => void
  prototypeOpen: boolean
  onTogglePrototype: () => void
  onClose?: () => void
  onCollapse?: () => void
}

export function Sidebar({
  active,
  onSelect,
  prototypeOpen,
  onTogglePrototype,
  onClose,
  onCollapse,
}: Props) {
  const { current, viewVersion, reviews, hr, processing, sampleTarget } = useDemo()
  const hasActiveCase = Boolean(current)
  const activeReview = current ? reviews[viewVersion] ?? reviews.V1 : null
  const showProcessingItem = processing.status !== 'idle' || active === 'processing'

  const processingBadge =
    processing.status === 'running'
      ? { text: 'Berjalan', cls: 'bg-champagne/20 text-champagne' }
      : processing.status === 'failed'
        ? { text: 'Terhenti', cls: 'bg-missing-soft text-white' }
        : processing.status === 'done'
          ? { text: 'Selesai', cls: 'bg-white/15 text-champagne' }
          : { text: 'Simulasi', cls: 'bg-white/10 text-white/65' }

  return (
    <aside
      id={onClose ? 'mobile-sidebar-drawer' : 'desktop-sidebar'}
      aria-label="Bilah sisi aplikasi"
      className="flex h-full flex-col gap-4 rounded-[1.75rem] border border-white/15 p-4 text-[#FFFEFA] shadow-[0_28px_56px_-24px_rgb(18_61_59/0.55),inset_0_1px_0_rgb(255_254_250/0.16)]"
      style={{ background: 'var(--sidebar-bg)' }}
    >
      {/* Brand + Collapse/Close Control */}
      <div className="flex shrink-0 items-center justify-between gap-2 px-2 pt-1">
        <div className="flex min-w-0 items-center gap-3">
          <LogoMark />
          <Wordmark light />
        </div>
        {onCollapse && (
          <button
            type="button"
            onClick={onCollapse}
            aria-label="Ciutkan bilah sisi"
            aria-expanded={true}
            aria-controls="desktop-sidebar"
            title="Ciutkan bilah sisi"
            className="hidden size-9 shrink-0 place-items-center rounded-xl border border-white/12 bg-white/6 text-white/75 transition duration-200 hover:border-champagne/35 hover:bg-white/14 hover:text-[#FFFEFA] lg:grid"
          >
            <Icon name="panel-left-close" size={18} />
          </button>
        )}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup menu navigasi"
            title="Tutup menu navigasi"
            className="grid size-10 shrink-0 place-items-center rounded-xl text-white/80 transition hover:bg-white/12 hover:text-[#FFFEFA] lg:hidden"
          >
            <Icon name="close" />
          </button>
        )}
      </div>

      {/* Contextual Two-Group Navigation */}
      <nav aria-label="Navigasi utama" className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-0.5">
        {/* Group A — Ruang Kerja */}
        <div>
          <p className="mb-1.5 px-3 text-[10px] font-semibold tracking-[0.14em] text-white/50 uppercase">
            Ruang Kerja
          </p>
          <ul className="space-y-1">
            {WORKSPACE_NAV.map((item) => {
              const on = item.id === active
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(item.id)
                      onClose?.()
                    }}
                    aria-current={on ? 'page' : undefined}
                    className={`group flex min-h-10 w-full items-center gap-3 rounded-control px-3 text-left text-sm font-medium transition duration-200 ${
                      on
                        ? 'border border-champagne/35 bg-white/12 text-[#FFFEFA] shadow-[inset_0_1px_0_rgb(255_254_250/0.2)]'
                        : 'border border-transparent text-white/75 hover:translate-x-0.5 hover:bg-white/8 hover:text-[#FFFEFA]'
                    }`}
                  >
                    <Icon name={item.icon} size={18} className={on ? 'text-champagne' : ''} />
                    <span className="flex-1 truncate">{item.label}</span>
                  </button>
                </li>
              )
            })}

            {/* Pemrosesan AI appears in main nav only while processing is active or currently viewed */}
            {showProcessingItem && (
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onSelect('processing')
                    onClose?.()
                  }}
                  aria-current={active === 'processing' ? 'page' : undefined}
                  className={`group flex min-h-10 w-full items-center gap-3 rounded-control px-3 text-left text-sm font-medium transition duration-200 ${
                    active === 'processing'
                      ? 'border border-champagne/35 bg-white/12 text-[#FFFEFA] shadow-[inset_0_1px_0_rgb(255_254_250/0.2)]'
                      : 'border border-champagne/20 bg-white/6 text-white/85 hover:translate-x-0.5 hover:bg-white/10 hover:text-[#FFFEFA]'
                  }`}
                >
                  <Icon name="spark" size={18} className="text-champagne" />
                  <span className="flex-1 truncate">Pemrosesan AI</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${processingBadge.cls}`}>
                    {processingBadge.text}
                  </span>
                </button>
              </li>
            )}
          </ul>
        </div>

        <div className="mx-3 border-t border-white/10" role="separator" />

        {/* Group B — Kasus Aktif */}
        <div>
          <div className="mb-1.5 flex items-center justify-between gap-2 px-3">
            <p className="text-[10px] font-semibold tracking-[0.14em] text-white/50 uppercase">Kasus Aktif</p>
            {current ? (
              <span
                className="inline-flex items-center gap-1.5 rounded-full border border-champagne/35 bg-champagne/14 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-champagne"
                title={`Kasus aktif: ${current.id} (${viewVersion})`}
              >
                <span className="size-1.5 rounded-full bg-champagne" />
                {current.id} · {viewVersion}
              </span>
            ) : sampleTarget ? (
              <span
                className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/70"
                title={`Menampilkan ringkasan riwayat ${sampleTarget.id} (${sampleTarget.version})`}
              >
                {sampleTarget.id} · Riwayat
              </span>
            ) : (
              <span className="rounded-full bg-white/8 px-2 py-0.5 text-[10px] font-medium text-white/45">
                Belum dipilih
              </span>
            )}
          </div>

          {!hasActiveCase && !sampleTarget && (
            <p className="mb-2 px-3 text-[11px] leading-relaxed text-white/50">
              Mulai pemeriksaan baru atau muat kasus contoh di Mode Prototype untuk membuka menu kasus.
            </p>
          )}

          <ul className="space-y-1">
            {CASE_NAV.map((item) => {
              const isResultWithSample = item.id === 'result' && Boolean(sampleTarget) && !hasActiveCase
              const enabled = hasActiveCase || isResultWithSample
              const on =
                item.id === active &&
                (item.id === 'result' ? hasActiveCase || Boolean(sampleTarget) : hasActiveCase)

              let metaBadge: { text: string; cls: string } | null = null
              if (hasActiveCase && activeReview) {
                if (item.id === 'findings') {
                  metaBadge = {
                    text: String(activeReview.findings.length),
                    cls: 'bg-white/10 text-white/75',
                  }
                } else if (item.id === 'human') {
                  metaBadge =
                    hr.status === 'reviewed'
                      ? { text: 'Selesai', cls: 'bg-white/12 text-champagne' }
                      : { text: 'Menunggu', cls: 'bg-champagne/20 text-champagne' }
                } else if (item.id === 'compare') {
                  metaBadge = reviews.V2
                    ? { text: 'V1→V2', cls: 'bg-champagne/20 text-champagne' }
                    : { text: 'V1', cls: 'bg-white/10 text-white/55' }
                }
              }

              return (
                <li key={item.id}>
                  <button
                    type="button"
                    disabled={!enabled}
                    aria-disabled={!enabled || undefined}
                    aria-current={on ? 'page' : undefined}
                    title={
                      enabled
                        ? `${item.label}${current ? ` (${current.id} · ${viewVersion})` : ''}`
                        : 'Belum ada kasus aktif — mulai pemeriksaan baru atau muat contoh di Mode Prototype'
                    }
                    onClick={() => {
                      if (!enabled) return
                      onSelect(item.id)
                      onClose?.()
                    }}
                    className={`group flex min-h-10 w-full items-center gap-3 rounded-control px-3 text-left text-sm font-medium transition duration-200 ${
                      !enabled
                        ? 'cursor-not-allowed border border-transparent text-white/35 opacity-60'
                        : on
                          ? 'border border-champagne/35 bg-white/12 text-[#FFFEFA] shadow-[inset_0_1px_0_rgb(255_254_250/0.2)]'
                          : 'border border-transparent text-white/75 hover:translate-x-0.5 hover:bg-white/8 hover:text-[#FFFEFA]'
                    }`}
                  >
                    <Icon name={item.icon} size={18} className={on ? 'text-champagne' : ''} />
                    <span className="flex-1 truncate">{item.label}</span>
                    {metaBadge && (
                      <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${metaBadge.cls}`}>
                        {metaBadge.text}
                      </span>
                    )}
                    {!enabled && <Icon name="lock" size={13} className="shrink-0 text-white/30" />}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </nav>

      {/* Collapsible Mode Prototype Section */}
      <div className="shrink-0">
        <PrototypeModePanel
          open={prototypeOpen}
          onToggle={onTogglePrototype}
          onSelect={onSelect}
          onAfterAction={onClose}
        />
      </div>

      {/* Active Reviewer Profile */}
      <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-white/12 bg-white/6 p-2.5">
        <div className="grid size-10 shrink-0 place-items-center rounded-full bg-primary-hover text-sm font-semibold text-[#FFFEFA] ring-1 ring-champagne/40">
          {user.initials}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[#FFFEFA]">{user.name}</p>
          <p className="truncate text-xs text-white/60">{user.role}</p>
        </div>
      </div>
    </aside>
  )
}
