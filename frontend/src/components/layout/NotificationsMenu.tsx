import { useId, useMemo, useState } from 'react'
import { useDemo } from '../../state/DemoStore'
import { Button } from '../ui/Button'
import { Icon } from '../ui/Icon'
import { usePopover } from './usePopover'

type Note = { id: string; icon: string; title: string; body: string; run: () => void }

/** Notifications are derived from real demo state, so they stay consistent with every screen. */
export function NotificationsMenu() {
  const demo = useDemo()
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const headingId = useId()
  const root = usePopover(open, () => setOpen(false))

  const notes = useMemo<Note[]>(() => {
    const out: Note[] = []
    for (const c of [...demo.cases].reverse()) {
      const v = c.reviews.V2 ? 'V2' : 'V1'
      const r = c.reviews[v]
      if (!r) continue
      if (c.reviews.V2) out.push({ id: `v2-${c.id}`, icon: 'compare', title: `${c.id} V2 telah dibuat`, body: 'V1 tetap tersimpan. Bandingkan kedua versi.', run: () => demo.openCompare(c.id) })
      for (const f of r.findings.filter((x) => x.status === 'needs_review'))
        if ((c.hr[v]?.byFinding?.[f.id]?.status ?? c.hr[v]?.status ?? 'pending') !== 'reviewed')
          out.push({ id: `hr-${c.id}-${v}-${f.id}`, icon: 'user', title: 'Temuan memerlukan tinjauan manual', body: `${f.title} · ${c.id} ${v}`, run: () => demo.openHuman(c.id, v, f.id) })
      const openFindings = r.findings.filter((x) => x.status === 'partial' || x.status === 'not_found')
      if (openFindings.length) out.push({ id: `att-${c.id}-${v}-${openFindings.length}`, icon: 'flag', title: `${openFindings.length} temuan memerlukan perhatian`, body: `${openFindings.map((f) => f.title).join(', ')} · ${c.id} ${v}`, run: () => demo.openFinding(c.id, v, openFindings[0].id) })
      if (c.hr[v]?.status === 'reviewed') out.push({ id: `done-${c.id}-${v}`, icon: 'check', title: `Tinjauan manual tercatat untuk ${v}`, body: `${c.id} · Penilaian AI tidak berubah`, run: () => demo.openHuman(c.id, v) })
    }
    return out
  }, [demo.cases, demo.history]) // eslint-disable-line react-hooks/exhaustive-deps

  const unseen = notes.filter((n) => !demo.notifSeen.includes(n.id))
  const choose = (n: Note) => { demo.markNotifsSeen([n.id]); setOpen(false); n.run() }

  return (
    <div ref={root} className="relative shrink-0">
      <button
        data-trigger
        type="button"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((o) => !o)}
        aria-label={unseen.length ? `Notifikasi, ${unseen.length} belum dibaca` : 'Notifikasi, tidak ada yang belum dibaca'}
        title="Notifikasi"
        className="glass relative grid size-11 place-items-center !rounded-control"
      >
        <Icon name="bell" />
        {unseen.length > 0 && (
          <span
            aria-hidden="true"
            className="absolute top-1.5 right-1.5 grid min-w-4 place-items-center rounded-full bg-brand px-1 text-[10px] leading-4 font-semibold text-white ring-2 ring-white"
          >
            {unseen.length}
          </span>
        )}
      </button>
      {open && (
        <div
          id={panelId}
          role="region"
          aria-labelledby={headingId}
          className="surface fixed inset-x-3 top-20 z-30 max-h-[70vh] overflow-y-auto !rounded-2xl p-3 shadow-float sm:absolute sm:inset-x-auto sm:top-[calc(100%+8px)] sm:right-0 sm:w-[24rem]"
        >
          <div className="mb-2 flex items-center justify-between px-1">
            <h2 id={headingId} className="text-sm font-semibold">Notifikasi</h2>
            {unseen.length > 0 && (
              <Button variant="ghost" className="!min-h-9 !px-2.5 text-xs" onClick={() => demo.markNotifsSeen(notes.map((n) => n.id))}>
                Tandai semua dibaca
              </Button>
            )}
          </div>
          {notes.length === 0 ? (
            <div className="grid place-items-center gap-1 px-4 py-8 text-center">
              <span className="grid size-11 place-items-center rounded-2xl bg-brand-soft text-brand"><Icon name="check" /></span>
              <p className="font-semibold">Belum ada notifikasi baru</p>
              <p className="text-sm text-ink-3">Pemberitahuan mengenai temuan dan versi baru akan muncul di sini setelah pemeriksaan dibuat.</p>
            </div>
          ) : (
            <ul className="space-y-1.5">
              {notes.map((n) => {
                const isNew = !demo.notifSeen.includes(n.id)
                return (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => choose(n)}
                      className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-brand-soft/70"
                    >
                      <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-brand-soft text-brand">
                        <Icon name={n.icon} size={16} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold">
                          {n.title}
                          {isNew && <span className="sr-only"> (Belum dibaca)</span>}
                        </span>
                        <span className="block text-xs text-ink-3">{n.body}</span>
                      </span>
                      {isNew && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand" aria-hidden="true" />}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
