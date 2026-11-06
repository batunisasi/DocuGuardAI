import { useEffect, useState } from 'react'
import { user } from '../data/dashboard'
import { useDemo } from '../state/DemoStore'
import { REVIEW_STATE_META as stateLabel, STATUS_META, type FindingStatus } from '../data/status'
import { useTypewriter } from '../hooks/useTypewriter'
import { Button } from '../components/ui/Button'
import { GlassPanel, SectionHeader } from '../components/ui/Glass'
import { Icon } from '../components/ui/Icon'
import { FloatingShield } from '../components/ui/FloatingShield'
import { ScoreRing } from '../components/ui/ScoreRing'
import { Callout, EmptyState, Skeleton } from '../components/ui/States'
import { StatusBadge, Tag } from '../components/ui/StatusBadge'

// Type the headline only the first time the dashboard loads in a session.
let headlinePlayed = false

function TypedHeadline({ text }: { text: string }) {
  const [first] = useState(() => !headlinePlayed)
  const { typed, done } = useTypewriter(text, { speed: 55, enabled: first })
  useEffect(() => { if (done) headlinePlayed = true }, [done])
  return (
    <h1 aria-label={text} className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
      <span aria-hidden="true">
        {typed}
        <span className="invisible">{text.slice(typed.length)}</span>
        <span className="caret" aria-hidden="true" />
      </span>
    </h1>
  )
}

const statusOrder: FindingStatus[] = ['fulfilled', 'partial', 'not_found', 'needs_review', 'na']

export function Dashboard({ onNavigate }: { onNavigate: (id: string) => void }) {
  const demo = useDemo()
  const { reviews, latestVersion, history, current } = demo
  const latestHr = latestVersion ? demo.hrFor(latestVersion) : null
  const caseId = current?.id ?? 'Pemeriksaan saat ini'
  const r = latestVersion ? (reviews[latestVersion] ?? null) : null
  const open = r ? r.findings.filter((f) => f.status !== 'fulfilled' && f.status !== 'na') : []
  const counts = r ? statusOrder.map((s) => ({ status: s, count: r.findings.filter((f) => f.status === s).length })).filter((c) => c.count) : []
  const awaiting = history.filter((h) => h.latest && h.status === 'awaiting_human').length
  const kpis = [
    { id: 'incidents', label: 'Insiden dalam riwayat', value: String(new Set(history.map((h) => h.id)).size), delta: `${history.length} versi pemeriksaan`, trend: 'flat', icon: 'file' },
    { id: 'awaiting', label: 'Menunggu tinjauan manual', value: String(awaiting), delta: 'Hanya versi terbaru', trend: awaiting ? 'warn' : 'flat', icon: 'user' },
    { id: 'open', label: `Temuan terbuka, ${caseId}`, value: r ? String(open.length) : '—', delta: r ? `${open.filter((f) => f.status === 'needs_review').length} perlu keputusan peninjau` : 'Belum ada pemeriksaan', trend: 'flat', icon: 'flag' },
    { id: 'versions', label: `Versi ${caseId}`, value: String(Object.keys(reviews).length), delta: reviews.V2 ? 'V1 dan V2 tersimpan' : reviews.V1 ? 'Hanya V1' : 'Belum ada', trend: reviews.V2 ? 'up' : 'flat', icon: 'history' },
  ]
  const sopApplicable = r ? r.sopAssessment.filter((i) => i.status !== 'na') : []
  const tplApplicable = r ? r.templateAssessment.filter((i) => i.status !== 'na') : []
  const sopTotal = sopApplicable.length, tplTotal = tplApplicable.length
  const sopMet = sopApplicable.filter((i) => i.status === 'fulfilled').length
  const tplMet = tplApplicable.filter((i) => i.status === 'fulfilled').length
  const [loading, setLoading] = useState(true)
  useEffect(() => { const t = setTimeout(() => setLoading(false), 700); return () => clearTimeout(t) }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">Selasa, 9 Juni 2026</p>
          <TypedHeadline text={`Selamat pagi, ${user.firstName}`} />
          <p className="mt-1.5 text-ink-2">{awaiting === 0 ? 'Tidak ada pemeriksaan yang menunggu tinjauan manual.' : `${awaiting} pemeriksaan sedang menunggu tinjauan manual.`}</p>
        </div>
        <Button icon="upload" onClick={() => onNavigate('new')} className="sm:hidden">Pemeriksaan baru</Button>
      </div>

      {/* Hero + attention queue */}
      <div className="grid gap-5 xl:grid-cols-12">
        <GlassPanel variant="glass-strong" sheen className="p-5 sm:p-7 xl:col-span-8" aria-labelledby="latest-h">
          {loading ? <HeroSkeleton /> : !r ? (
            <EmptyState icon="shield" title="Belum Ada Data Pemeriksaan" body="Unggah dokumen SOP, template, dan laporan insiden untuk menjalankan pemeriksaan tahap awal AI, atau muat kasus contoh INC-2026-014."
              action={<div className="mt-2 flex flex-wrap justify-center gap-2"><Button icon="upload" onClick={() => onNavigate('new')}>Mulai pemeriksaan baru</Button><Button variant="glass" onClick={demo.loadDemoReview}>Muat contoh pemeriksaan</Button></div>} />
          ) : (
            <>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="eyebrow mb-2">Pemeriksaan terbaru</p>
                  <h2 id="latest-h" className="text-2xl font-semibold tracking-tight">{r.id}</h2>
                  <p className="mt-1 text-ink-2">{r.title}</p>
                  <div className="mt-3 flex flex-wrap gap-2"><Tag>{r.version}</Tag><Tag tone="neutral">{r.domain}</Tag><Tag tone="neutral">{r.checkedAt}</Tag></div>
                </div>
                <div className="-mt-3 -mr-2 hidden shrink-0 sm:block"><FloatingShield /></div>
              </div>

              <div className="mt-6 grid gap-5 lg:grid-cols-[auto_1fr]">
                <div className="flex items-center gap-6 sm:gap-8">
                  <div className="space-y-2 text-center">
                    <ScoreRing value={(sopMet / sopTotal) * 100} display={`${sopMet}/${sopTotal}`} label="Persyaratan SOP terpenuhi" />
                    <p className="max-w-[9rem] text-xs text-ink-3">{r.docs[0].name}</p>
                  </div>
                  <div className="space-y-2 text-center">
                    <ScoreRing value={(tplMet / tplTotal) * 100} display={`${tplMet}/${tplTotal}`} label="Bagian template terpenuhi" from="#D5B77A" to="#477C76" />
                    <p className="max-w-[9rem] text-xs text-ink-3">{r.docs[1].name}</p>
                  </div>
                </div>

                <div className="surface p-4">
                  <p className="eyebrow mb-3">Temuan tahap awal</p>
                  <ul className="divide-y divide-navy/5">
                    {r.findings.map((f) => (
                      <li key={f.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                        <span className="font-medium text-ink">{f.title}</span><StatusBadge status={f.status} />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Button icon="arrow" onClick={() => onNavigate('result')}>Buka hasil pemeriksaan</Button>
                <Button variant="glass" onClick={() => onNavigate('history')}>Lihat riwayat</Button>
                <span className="text-xs text-ink-3">Kepatuhan SOP dan kelengkapan template dinilai secara terpisah.</span>
              </div>
            </>
          )}
        </GlassPanel>

        <GlassPanel className="p-5 sm:p-6 xl:col-span-4">
          <SectionHeader eyebrow="Antrean" title="Perlu perhatian Anda" />
          {loading ? <div className="space-y-3"><Skeleton className="h-14" /><Skeleton className="h-14" /><Skeleton className="h-14" /></div>
            : !r ? <p className="text-sm text-ink-3">Belum ada item untuk ditinjau. Buat pemeriksaan untuk melihat daftar temuan terbuka di sini.</p>
            : open.length === 0 ? <p className="text-sm text-ink-3">Seluruh temuan telah terpenuhi. Tidak ada yang memerlukan perhatian.</p> : (
            <ul className="space-y-2.5">
              {open.map((f) => (
                <li key={f.id}>
                  <button
                    type="button"
                    onClick={() => demo.openFinding(r.id, r.version, f.id)}
                    aria-label={`Buka temuan ${f.id} ${f.title} pada jejak bukti`}
                    className="surface lift flex w-full items-start gap-3 !rounded-2xl p-3 text-left transition hover:border-brand/40"
                  >
                    <span className="mt-1.5 size-2 shrink-0 rounded-full" style={{ background: STATUS_META[f.status].fg }} />
                    <div className="min-w-0 flex-1 text-sm">
                      <p className="font-medium text-ink">{f.title}</p>
                      <p className="mt-0.5 text-xs text-ink-3">{r.id} {r.version} · {STATUS_META[f.status].label}{f.status === 'needs_review' && latestHr?.status === 'reviewed' ? ' · Tinjauan manual tercatat' : ''}</p>
                    </div>
                    <Icon name="arrow" size={16} className="mt-1 shrink-0 text-ink-3" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </GlassPanel>
      </div>

      {/* KPI strip: one continuous glass band */}
      <GlassPanel className="grid grid-cols-2 lg:grid-cols-4 !rounded-[1.75rem]" aria-label="Metrik utama">
        {kpis.map((k, i) => (
          <div key={k.id} className={`p-5 ${i % 2 ? 'border-l border-navy/8' : ''} ${i > 1 ? 'border-t border-navy/8 lg:border-t-0' : ''} ${i > 0 ? 'lg:border-l lg:border-navy/8' : ''}`}>
            <div className="flex items-center gap-2 text-ink-3"><Icon name={k.icon} size={16} /><span className="text-xs font-semibold">{k.label}</span></div>
            {loading ? <Skeleton className="mt-3 h-9 w-20" /> : <p className="mt-2 text-3xl font-semibold tracking-tight">{k.value}</p>}
            <p className={`mt-1 text-xs font-semibold ${k.trend === 'up' ? 'text-ok' : k.trend === 'warn' ? 'text-partial' : 'text-ink-3'}`}>{k.delta}</p>
          </div>
        ))}
      </GlassPanel>

      {/* Operational Activity Table + Finding Category Distribution */}
      <div className="grid items-start gap-5 xl:grid-cols-12">
        <section className="surface overflow-hidden xl:col-span-8" aria-labelledby="recent-h">
          <div className="flex items-center justify-between p-5 pb-3 sm:p-6 sm:pb-3">
            <div><p className="eyebrow mb-1">Aktivitas</p><h2 id="recent-h" className="text-lg font-semibold tracking-tight">Pemeriksaan terbaru</h2></div>
            <Button variant="ghost" onClick={() => onNavigate('history')}>Lihat semua</Button>
          </div>
          {history.length === 0 ? <EmptyState title="Belum ada pemeriksaan" body="Unggah SOP, template, dan laporan insiden untuk memulai pemeriksaan pertama Anda." action={<Button onClick={() => onNavigate('new')}>Mulai pemeriksaan</Button>} /> : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead><tr className="border-y border-navy/8 bg-canvas/70 text-xs text-ink-3">
                  {['Laporan', 'Versi', 'Status', 'Waktu Pemeriksaan', ''].map((h, i) => <th key={i} scope="col" className="px-5 py-2.5 font-semibold sm:first:pl-6">{h || <span className="sr-only">Tindakan</span>}</th>)}
                </tr></thead>
                <tbody className="divide-y divide-navy/5">
                  {history.slice(0, 5).map((v) => (
                    <tr key={v.key} className="transition-colors hover:bg-brand-soft/70">
                      <td className="px-5 py-3.5 sm:pl-6"><p className="font-semibold">{v.id}</p><p className="text-xs text-ink-3">{v.title}</p></td>
                      <td className="px-5 py-3.5"><span className="inline-flex items-center gap-1.5"><Tag tone="neutral">{v.version}</Tag>{v.latest && <Tag>Terbaru</Tag>}</span></td>
                      <td className="px-5 py-3.5"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${stateLabel[v.status].cls}`}>{stateLabel[v.status].text}</span></td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-ink-3">{v.date}</td>
                      <td className="px-5 py-3.5 text-right"><Button variant="ghost" className="!min-h-9 !px-3" onClick={() => demo.openRecord(v.id, v.version)} aria-label={`Lihat hasil untuk ${v.id} ${v.version}`}>Lihat</Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <GlassPanel className="p-5 sm:p-6 xl:col-span-4">
          <SectionHeader eyebrow={r ? `${r.id} · ${r.version}` : 'Belum ada pemeriksaan'} title="Kategori temuan" />
          {!r ? <p className="text-sm text-ink-3">Kategori temuan akan ditampilkan setelah pemeriksaan selesai dibuat.</p> : (
            <>
              <div className="flex h-4 overflow-hidden rounded-full bg-navy/5" role="img" aria-label="Distribusi kategori temuan">
                {counts.map((d) => <div key={d.status} style={{ width: `${(d.count / r.findings.length) * 100}%`, background: STATUS_META[d.status].fg }} />)}
              </div>
              <ul className="mt-5 space-y-2.5">
                {counts.map((d) => (
                  <li key={d.status} className="flex items-center gap-3 text-sm">
                    <span className="size-2.5 rounded-full" style={{ background: STATUS_META[d.status].fg }} />
                    <span className="flex-1 font-medium text-ink-2">{STATUS_META[d.status].label}</span>
                    <span className="font-semibold tabular-nums">{d.count}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </GlassPanel>
      </div>

      <Callout tone="info">
        <strong>Ruang kerja demonstrasi.</strong> DocuGuard AI adalah pemeriksa tahap awal, bukan auditor akhir. Skor dan temuan yang ditampilkan merupakan data simulasi; cakupan saat ini mendukung file PDF dan DOCX berbasis teks (tanpa OCR).
      </Callout>
    </div>
  )
}

function HeroSkeleton() {
  return <div className="space-y-4" aria-busy="true" aria-label="Memuat pemeriksaan terbaru"><Skeleton className="h-4 w-28" /><Skeleton className="h-8 w-56" /><div className="flex gap-4"><Skeleton className="size-28 !rounded-full" /><Skeleton className="size-28 !rounded-full" /><Skeleton className="h-28 flex-1" /></div></div>
}
