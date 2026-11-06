import { Button } from '../ui/Button'
import { Icon } from '../ui/Icon'
import { LogoMark } from '../ui/Logo'
import { NotificationsMenu } from './NotificationsMenu'
import { usePrototypeProgress } from './PrototypeModePanel'
import { TopbarSearch } from './TopbarSearch'

export function Topbar({
  title,
  groupLabel = 'Ruang Kerja',
  onMenu,
  onNew,
  mobileOpen = false,
  sidebarCollapsed = false,
  onExpandSidebar,
  prototypeOpen = false,
  onTogglePrototype,
}: {
  title: string
  groupLabel?: string
  onMenu: () => void
  onNew: () => void
  mobileOpen?: boolean
  sidebarCollapsed?: boolean
  onExpandSidebar?: () => void
  prototypeOpen?: boolean
  onTogglePrototype?: () => void
}) {
  const { doneCount, totalCount } = usePrototypeProgress()

  return (
    <header className="flex items-center gap-3">
      <button
        type="button"
        onClick={onMenu}
        aria-label="Buka menu navigasi"
        aria-expanded={mobileOpen}
        aria-controls="mobile-sidebar-drawer"
        title="Buka menu navigasi"
        className="glass grid size-11 shrink-0 place-items-center !rounded-control text-ink-2 transition hover:border-sage/45 hover:text-brand lg:hidden"
      >
        <Icon name="menu" />
      </button>
      <div className="flex items-center gap-2 lg:hidden"><LogoMark size={28} /></div>

      {sidebarCollapsed && onExpandSidebar && (
        <div className="hidden items-center gap-2 lg:flex">
          <button
            type="button"
            onClick={onExpandSidebar}
            aria-label="Perluas bilah sisi"
            aria-expanded={false}
            aria-controls="desktop-sidebar"
            title="Perluas bilah sisi"
            className="glass grid size-11 shrink-0 place-items-center !rounded-control text-ink-2 transition duration-200 hover:-translate-y-0.5 hover:border-sage/45 hover:text-brand"
          >
            <Icon name="panel-left-open" size={19} />
          </button>
          {onTogglePrototype && (
            <button
              data-proto-trigger
              type="button"
              onClick={onTogglePrototype}
              aria-label="Mode Prototype"
              aria-expanded={prototypeOpen}
              aria-controls="floating-prototype-panel"
              title="Mode Prototype · Panduan & kontrol simulasi"
              className={`glass inline-flex h-11 shrink-0 items-center gap-2 !rounded-control px-3 text-xs font-semibold transition duration-200 hover:-translate-y-0.5 hover:border-sage/45 ${
                prototypeOpen ? '!border-brand/50 !bg-brand-soft text-brand' : 'text-ink-2 hover:text-brand'
              }`}
            >
              <Icon name="spark" size={17} className="text-brand" />
              <span className="hidden xl:inline">Mode Prototype</span>
              <span className="rounded-full bg-brand/12 px-1.5 py-0.5 text-xs font-semibold tabular-nums text-brand">
                {doneCount}/{totalCount}
              </span>
            </button>
          )}
          <LogoMark size={28} />
        </div>
      )}

      <p className="hidden text-sm font-medium text-ink-3 lg:block">
        {groupLabel} <span className="mx-1">/</span> <span className="text-ink">{title}</span>
      </p>
      <TopbarSearch />
      <NotificationsMenu />
      <Button icon="plus" onClick={onNew} className="hidden sm:inline-flex">Pemeriksaan Baru</Button>
    </header>
  )
}
