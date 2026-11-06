import { useEffect, useRef, useState, type ReactNode } from 'react'
import { nav } from '../../data/dashboard'
import { PrototypeModePanel } from './PrototypeModePanel'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

const SIDEBAR_STORAGE_KEY = 'docuguard:sidebar-collapsed'
const PROTO_STORAGE_KEY = 'docuguard:prototype-mode-open'
const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function AppShell({ active, onSelect, children }: { active: string; onSelect: (id: string) => void; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)
  const floatingProtoRef = useRef<HTMLDivElement>(null)

  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === '1'
    } catch {
      return false
    }
  })
  const [protoOpen, setProtoOpen] = useState<boolean>(() => {
    try {
      return window.localStorage.getItem(PROTO_STORAGE_KEY) === '1'
    } catch {
      return false
    }
  })

  const setDesktopCollapsed = (next: boolean) => {
    setCollapsed(next)
    try {
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, next ? '1' : '0')
    } catch {
      // Ignore storage errors in restricted environments
    }
  }

  const toggleProtoOpen = () => {
    setProtoOpen((prev) => {
      const next = !prev
      try {
        window.localStorage.setItem(PROTO_STORAGE_KEY, next ? '1' : '0')
      } catch {
        // Ignore storage errors
      }
      return next
    })
  }

  // Mobile drawer accessibility: move focus in, trap Tab/Shift+Tab, close on Escape, restore focus to trigger
  useEffect(() => {
    if (!open) return
    const opener = document.activeElement as HTMLElement | null
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const focusables = () =>
      [...(drawerRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])].filter(
        (el) => el.offsetParent !== null || el === drawerRef.current,
      )

    const initialTarget =
      drawerRef.current?.querySelector<HTMLElement>('button[aria-label="Tutup menu navigasi"]') ??
      focusables()[0] ??
      drawerRef.current
    initialTarget?.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        setOpen(false)
        return
      }
      if (e.key !== 'Tab') return
      const f = focusables()
      if (f.length === 0) {
        e.preventDefault()
        return
      }
      const first = f[0]
      const last = f[f.length - 1]
      const activeEl = document.activeElement as HTMLElement | null
      if (!drawerRef.current?.contains(activeEl)) {
        e.preventDefault()
        first.focus()
      } else if (e.shiftKey && activeEl === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && activeEl === last) {
        e.preventDefault()
        first.focus()
      }
    }

    const onResize = () => {
      if (window.innerWidth >= 1024) setOpen(false)
    }

    document.addEventListener('keydown', onKeyDown, true)
    window.addEventListener('resize', onResize)
    return () => {
      document.body.style.overflow = prevOverflow
      document.removeEventListener('keydown', onKeyDown, true)
      window.removeEventListener('resize', onResize)
      if (opener && document.contains(opener)) opener.focus()
    }
  }, [open])

  // Floating Prototype Mode accessibility when desktop sidebar is collapsed: Escape & outside pointer dismissal
  useEffect(() => {
    if (!collapsed || !protoOpen) return
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null
      if (!target) return
      if (floatingProtoRef.current?.contains(target)) return
      if (target.closest?.('[data-proto-trigger]')) return
      if (target.closest?.('[role="dialog"]')) return
      setProtoOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setProtoOpen(false)
        document.querySelector<HTMLElement>('[data-proto-trigger]')?.focus()
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [collapsed, protoOpen])

  const currentNav = nav.find((n) => n.id === active)
  const title = currentNav?.label ?? ''
  const groupLabel = currentNav?.group === 'case' ? 'Kasus Aktif' : currentNav?.group === 'prototype' ? 'Mode Prototype' : 'Ruang Kerja'

  return (
    <>
      <div className="app-backdrop" aria-hidden="true">
        <span className="liquid-orb liquid-orb-teal-a" />
        <span className="liquid-orb liquid-orb-teal-b" />
        <span className="liquid-orb liquid-orb-champagne" />
        <span className="liquid-orb liquid-orb-ivory" />
        <i className="liquid-sheen" />
      </div>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2">Lewati ke konten utama</a>
      <div className="mx-auto flex min-h-screen max-w-[1600px] p-3 sm:p-5">
        <div
          aria-hidden={collapsed || undefined}
          inert={collapsed || undefined}
          className={`sticky top-5 hidden h-[calc(100vh-2.5rem)] shrink-0 transition-[width,margin,opacity] duration-250 ease-in-out motion-reduce:transition-none lg:block ${
            collapsed
              ? 'pointer-events-none w-0 overflow-hidden opacity-0 lg:mr-0'
              : 'w-64 opacity-100 lg:mr-5 xl:w-72'
          }`}
        >
          <div className="h-full w-64 xl:w-72">
            <Sidebar
              active={active}
              onSelect={onSelect}
              prototypeOpen={protoOpen}
              onTogglePrototype={toggleProtoOpen}
              onCollapse={() => setDesktopCollapsed(true)}
            />
          </div>
        </div>

        {/* Floating Mode Prototype panel when desktop sidebar is collapsed */}
        {collapsed && protoOpen && (
          <div
            ref={floatingProtoRef}
            id="floating-prototype-panel"
            role="region"
            aria-label="Panel Mode Prototype"
            className="fixed top-20 left-5 z-30 hidden w-80 lg:block"
          >
            <PrototypeModePanel
              open={true}
              onToggle={toggleProtoOpen}
              onSelect={onSelect}
              onAfterAction={() => setProtoOpen(false)}
              floating
            />
          </div>
        )}

        {open && (
          <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu navigasi">
            <div className="absolute inset-0 bg-navy/45 backdrop-blur-sm transition-opacity" onClick={() => setOpen(false)} aria-hidden="true" />
            <div ref={drawerRef} tabIndex={-1} className="absolute inset-y-3 left-3 w-72 max-w-[85vw] outline-none">
              <Sidebar
                active={active}
                onSelect={onSelect}
                prototypeOpen={protoOpen}
                onTogglePrototype={toggleProtoOpen}
                onClose={() => setOpen(false)}
              />
            </div>
          </div>
        )}
        <div
          aria-hidden={open || undefined}
          inert={open || undefined}
          className="flex min-w-0 flex-1 flex-col gap-6"
        >
          <Topbar
            title={title}
            groupLabel={groupLabel}
            mobileOpen={open}
            onMenu={() => setOpen(true)}
            sidebarCollapsed={collapsed}
            onExpandSidebar={() => setDesktopCollapsed(false)}
            prototypeOpen={protoOpen}
            onTogglePrototype={toggleProtoOpen}
            onNew={() => onSelect('new')}
          />
          <main id="main" className="flex-1">{children}</main>
        </div>
      </div>
    </>
  )
}
