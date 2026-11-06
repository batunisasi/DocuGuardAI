import { useEffect, useRef, useState } from 'react'
import type { ReviewData } from '../data/review'
import { stepEyebrow } from '../data/screens'
import { useDemo, useHumanReview, useViewedReview } from '../state/DemoStore'
import { NoReviewState } from '../components/review/NoReviewState'
import { VersionSwitcher } from '../components/ui/VersionSwitcher'
import { EvidenceViewer } from '../components/review/EvidenceViewer'
import { Button } from '../components/ui/Button'
import { FilterChips } from '../components/ui/FilterChips'
import { GlassPanel } from '../components/ui/Glass'
import { Icon } from '../components/ui/Icon'
import { SeverityBadge } from '../components/ui/SeverityBadge'
import { Callout } from '../components/ui/States'
import { StatusBadge, Tag } from '../components/ui/StatusBadge'

type Filter = 'all' | 'attention' | 'fulfilled'

export function FindingsEvidence({ onNavigate }: { onNavigate: (id: string) => void }) {
  const demo = useDemo()
  const d = useViewedReview()
  if (!d) return <NoReviewState screen="Temuan dan jejak bukti" />
  return <FindingsBody key={`${d.id}-${d.version}-${demo.focusFinding ?? ''}`} d={d} focus={demo.focusFinding} onNavigate={onNavigate} />
}

function FindingsBody({ d, focus, onNavigate }: { d: ReviewData; focus: string | null; onNavigate: (id: string) => void }) {
  const hr = useHumanReview()
  const demo = useDemo()
  const [panelOpen, setPanelOpen] = useState(true)
  const firstOpen = d.findings.find((f) => f.id === focus)?.id ?? d.findings.find((f) => f.status !== 'fulfilled')?.id ?? d.findings[0]?.id ?? ''
  const [open, setOpen] = useState<Set<string>>(new Set(firstOpen ? [firstOpen] : []))
  const [selected, setSelected] = useState({ findingId: firstOpen, evidenceId: d.findings.find((f) => f.id === firstOpen)?.evidence[0]?.id ?? null })
  const [filter, setFilter] = useState<Filter>('all')
  const panel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!focus) return
    const el = document.getElementById(`finding-${focus}`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [focus])

  const attention = d.findings.filter((f) => f.status !== 'fulfilled' && f.status !== 'na')
  const shown = filter === 'all' ? d.findings : filter === 'attention' ? attention : d.findings.filter((f) => f.status === 'fulfilled')
  const current = d.findings.find((f) => f.id === selected.findingId) ?? d.findings[0]

  const toggle = (id: string) => {
    setOpen((p) => {
      const n = new Set(p)
      if (n.has(id)) {
        n.delete(id)
      } else {
        n.add(id)
        const target = d.findings.find((x) => x.id === id)
        setSelected({ findingId: id, evidenceId: target?.evidence[0]?.id ?? null })
      }
      return n
    })
  }
  const inspect = (fid: string, eid: string | null) => {
    setSelected({ findingId: fid, evidenceId: eid })
    setPanelOpen(true)
    if (window.innerWidth < 1280) panel.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="eyebrow mb-2">{stepEyebrow('findings', 'Temuan dan jejak bukti')}</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Mengapa AI mengambil kesimpulan ini</h1>
          <p className="mt-1.5 text-ink-2">Setiap temuan menampilkan persyaratan, bukti yang ditemukan dalam laporan, serta penalaran AI agar peninjau dapat memverifikasinya.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2"><Tag>{d.id}</Tag><Tag tone="neutral">{d.version}</Tag><Button variant="glass" onClick={() => onNavigate('result')}>Kembali ke hasil</Button></div>
        <div className="w-full"><VersionSwitcher /></div>
      </div>

      <Callout tone="info"><strong>Status Pemenuhan dan Tingkat Keparahan adalah dua dimensi terpisah.</strong> Status Pemenuhan menunjukkan apakah persyaratan telah dipenuhi, sedangkan Tingkat Keparahan menunjukkan besarnya dampak apabila terdapat celah. Kutipan bukti dan penalaran AI pada halaman ini merupakan data demonstrasi simulasi (tidak diekstrak langsung dari file yang diunggah).</Callout>

      <div className="grid items-start gap-5 xl:grid-cols-12">
        <section className="space-y-3 xl:col-span-7" aria-label="Daftar temuan">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <FilterChips<Filter> label="Filter temuan" value={filter} onChange={setFilter} options={[
              { id: 'all', label: 'Semua', count: d.findings.length },
              { id: 'attention', label: 'Perlu perhatian', count: attention.length },
              { id: 'fulfilled', label: 'Terpenuhi', count: d.findings.length - attention.length },
            ]} />
            <div className="flex gap-1">
              <Button variant="ghost" className="!min-h-9 !px-3" onClick={() => setOpen(new Set(d.findings.map((f) => f.id)))}>Perluas semua</Button>
              <Button variant="ghost" className="!min-h-9 !px-3" onClick={() => setOpen(new Set())}>Ciutkan semua</Button>
            </div>
          </div>

          {shown.map((f) => {
            const isOpen = open.has(f.id)
            const isSel = selected.findingId === f.id
            const reviewable = f.status === 'needs_review'
            const fHr = hr.forFinding(f.id)
            return (
              <article key={f.id} id={`finding-${f.id}`} className={`surface overflow-hidden transition-shadow ${isSel ? 'ring-2 ring-brand/35' : ''}`}>
                <h2 className="m-0">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`${f.id}-body`}
                    onClick={() => toggle(f.id)}
                    className="flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-brand-soft/50 sm:px-5"
                  >
                    <span className="mt-0.5 w-11 shrink-0 text-xs font-semibold text-ink-3">{f.id}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold leading-snug text-ink">{f.title}</span>
                      <span className="mt-0.5 block text-xs font-normal text-ink-3">
                        {f.sopRef} · Template Bag. {f.templateSection}
                      </span>
                      <span className="mt-2 flex flex-wrap items-center gap-1.5">
                        <StatusBadge status={f.status} />
                        <SeverityBadge severity={f.severity} />
                      </span>
                    </span>
                    <Icon name="arrow" size={18} className={`mt-1 shrink-0 text-ink-3 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                  </button>
                </h2>
                {isOpen && (
                  <div id={`${f.id}-body`} className="space-y-4 border-t border-navy/8 p-4 sm:p-5">
                    <Field label="Persyaratan"><span className="text-ink-2"><strong className="text-ink">{f.requirement.ref}.</strong> {f.requirement.text}</span></Field>
                    <Field label="Bukti dalam laporan">
                      {f.evidence.length === 0 ? <span className="text-missing">Bukti Tidak Ditemukan. Tidak ada kutipan dalam laporan yang sesuai dengan persyaratan ini.</span> : (
                        <ul className="space-y-2">
                          {f.evidence.map((e) => (
                            <li key={e.id}>
                              <button type="button" onClick={() => inspect(f.id, e.id)} className={`w-full rounded-xl border p-3 text-left transition hover:border-brand/50 hover:bg-brand-soft/50 ${isSel && selected.evidenceId === e.id ? 'border-brand/60 bg-brand-soft/60' : 'border-navy/10 bg-paper'}`}>
                                <span className="line-clamp-2 text-sm text-ink">“{e.excerpt}”</span>
                                <span className="mt-1.5 flex flex-wrap items-center gap-x-3 text-xs text-ink-3"><span>{e.docName}</span><span>{e.location ?? 'Lokasi tidak tersedia'}</span>{e.addedInVersion && <Tag>Ditambahkan di {e.addedInVersion}</Tag>}<span className="ml-auto font-semibold text-brand">Periksa</span></span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </Field>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Penjelasan AI">{f.explanation}</Field>
                      <Field label="Rekomendasi">{f.recommendation}</Field>
                    </div>
                    <dl className="grid gap-3 border-t border-navy/8 pt-3 text-xs sm:grid-cols-3">
                      <div><dt className="font-semibold text-ink-3">Status Pemenuhan</dt><dd className="mt-1"><StatusBadge status={f.status} /></dd></div>
                      <div><dt className="font-semibold text-ink-3">Tingkat Keparahan</dt><dd className="mt-1"><SeverityBadge severity={f.severity} /></dd></div>
                      <div><dt className="font-semibold text-ink-3">Sumber bukti</dt><dd className="mt-1 font-semibold break-words text-ink">{f.evidence.length ? [...new Set(f.evidence.map((e) => e.docName))].join(', ') : 'Bukti Tidak Ditemukan'}</dd></div>
                    </dl>
                    {f.id === 'F-03' && f.status === 'partial' && !demo.reviews.V2 && (
                      <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-brand-soft p-3.5">
                        <Icon name="refresh" className="text-brand" />
                        <p className="flex-1 text-sm font-medium text-brand">Tambahkan bukti pendukung pada akar masalah, lalu periksa ulang untuk membuat versi V2.</p>
                        <Button onClick={demo.openRevision} className="!min-h-9">Revisi akar masalah</Button>
                      </div>
                    )}
                    {reviewable && (
                      <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-review-soft p-3.5">
                        <Icon name="user" className="text-review" />
                        <p className="flex-1 text-sm font-medium text-review">{fHr.status === 'reviewed' ? 'Peninjau telah mencatat keputusan. Status AI di atas tetap tidak berubah.' : 'Temuan ini memerlukan keputusan peninjau manual.'}</p>
                        <Button onClick={() => demo.openHuman(d.id, d.version, f.id)} className="!min-h-9">{fHr.status === 'reviewed' ? 'Lihat tinjauan' : 'Buka tinjauan manual'}</Button>
                      </div>
                    )}
                  </div>
                )}
              </article>
            )
          })}
        </section>

        <div ref={panel} className="scroll-mt-5 xl:sticky xl:top-5 xl:col-span-5">
          {panelOpen ? (
            <GlassPanel variant="glass-strong" className="p-5 sm:p-6" aria-label="Detail bukti">
              <div className="mb-3 flex justify-end"><Button variant="ghost" icon="close" className="!min-h-9 !px-3" onClick={() => setPanelOpen(false)}>Tutup panel</Button></div>
              <EvidenceViewer finding={current} sopDoc={d.docs[0].name} evidenceId={selected.evidenceId} onSelect={(id) => setSelected((s) => ({ ...s, evidenceId: id }))} />
            </GlassPanel>
          ) : (
            <GlassPanel className="p-5 text-center"><p className="mb-3 text-sm text-ink-3">Panel detail bukti sedang ditutup.</p><Button variant="glass" icon="search" onClick={() => setPanelOpen(true)}>Buka detail bukti</Button></GlassPanel>
          )}
        </div>
      </div>

      <GlassPanel className="flex flex-wrap items-center justify-between gap-4 p-5">
        <p className="text-sm text-ink-2"><strong className="text-ink">{attention.length} temuan</strong> belum terpenuhi. {d.findings.filter((f) => f.status === 'needs_review').length} memerlukan keputusan peninjau manual.</p>
        <Button icon="arrow" onClick={() => onNavigate('human')}>Lanjutkan ke tinjauan manual</Button>
      </GlassPanel>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><p className="mb-1 text-xs font-semibold tracking-wider text-ink-3 uppercase">{label}</p><div className="text-sm leading-relaxed text-ink">{children}</div></div>
}
