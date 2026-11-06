import { useEffect, useState } from 'react'
import type { Finding, ReviewData } from '../data/review'
import { STATUS_META, type FindingStatus } from '../data/status'
import { stepEyebrow } from '../data/screens'
import { useDemo, useHumanReview, useViewedReview } from '../state/DemoStore'
import { NoReviewState } from '../components/review/NoReviewState'
import { VersionSwitcher } from '../components/ui/VersionSwitcher'
import { EvidenceViewer } from '../components/review/EvidenceViewer'
import { Button } from '../components/ui/Button'
import { GlassPanel } from '../components/ui/Glass'
import { Icon } from '../components/ui/Icon'
import { SeverityBadge } from '../components/ui/SeverityBadge'
import { Callout, EmptyState } from '../components/ui/States'
import { StatusBadge, Tag } from '../components/ui/StatusBadge'

const options: { id: FindingStatus; hint: string }[] = [
  { id: 'fulfilled', hint: 'Bukti yang tersedia telah memenuhi persyaratan.' },
  { id: 'partial', hint: 'Sebagian persyaratan terpenuhi, namun belum lengkap.' },
  { id: 'not_found', hint: 'Tidak ditemukan bukti yang dapat diterima.' },
  { id: 'needs_review', hint: 'Masih belum jelas. Memerlukan informasi tambahan.' },
]

const defaultReasons = [
  'Notifikasi internal (09:18 UTC) sudah jelas, namun pembaruan komunikasi nasabah tidak mencantumkan waktu, saluran, maupun cakupan penerima, sehingga kepatuhan terhadap batas waktu SOP 6.1 tidak dapat dipastikan dari laporan saja.',
  'Apakah penyebutan satu kalimat dapat dianggap sebagai catatan komunikasi nasabah yang sah memerlukan penilaian profesional peninjau.',
  'Bukti komunikasi nasabah yang sebenarnya berada di luar ketiga dokumen yang diunggah.',
]

function reasonsFor(finding: Finding): string[] {
  if (finding.id === 'F-06') return defaultReasons
  return [
    `Pemeriksaan terhadap ${finding.requirement.ref} menghasilkan status awal "${STATUS_META[finding.status].label}": ${finding.summary}`,
    'Peninjau manual dapat memverifikasi bukti pendukung tambahan atau mencatat keputusan audit independen tanpa mengubah hasil asli AI.',
    finding.recommendation,
  ]
}

export function HumanReview({ onNavigate }: { onNavigate: (id: string) => void }) {
  const demo = useDemo()
  const d = useViewedReview()
  if (!d) return <NoReviewState screen="Tinjauan manual" />
  const needsReview = d.findings.filter((f) => f.status === 'needs_review')
  if (needsReview.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="eyebrow mb-2">{stepEyebrow('human', 'Tinjauan manual')}</p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Tidak ada temuan yang menunggu tinjauan manual</h1>
            <p className="mt-1.5 text-ink-2">Seluruh temuan pada {d.id} ({d.version}) telah memiliki klasifikasi AI yang tegas.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2"><Tag>{d.id}</Tag><Tag tone="neutral">{d.version}</Tag></div>
          <div className="w-full"><VersionSwitcher /></div>
        </div>
        <GlassPanel variant="glass-strong">
          <EmptyState
            icon="check"
            title="Tidak ada temuan berstatus Perlu Ditinjau Manual"
            body="Versi laporan ini tidak memiliki temuan ambigu yang mewajibkan keputusan peninjau manual. Anda tetap dapat memeriksa rincian bukti atau kembali ke ringkasan hasil pemeriksaan."
            action={
              <div className="mt-2 flex flex-wrap justify-center gap-2">
                <Button icon="arrow" onClick={() => onNavigate('result')}>Kembali ke hasil pemeriksaan</Button>
                <Button variant="glass" icon="search" onClick={() => onNavigate('findings')}>Lihat temuan &amp; bukti</Button>
              </div>
            }
          />
        </GlassPanel>
      </div>
    )
  }
  return <HumanBody key={`${d.id}-${d.version}`} d={d} initialFocus={demo.focusFinding} onNavigate={onNavigate} />
}

function HumanBody({ d, initialFocus, onNavigate }: { d: ReviewData; initialFocus: string | null; onNavigate: (id: string) => void }) {
  const demo = useDemo()
  // Queue prioritizes findings with 'needs_review', followed by other open findings so reviewers can inspect and record determinations across multiple items.
  const needsReviewFindings = d.findings.filter((f) => f.status === 'needs_review')
  const openFindings = d.findings.filter((f) => f.status !== 'needs_review' && f.status !== 'fulfilled' && f.status !== 'na')
  const queue = [...needsReviewFindings, ...openFindings]

  const defaultFinding = queue.find((f) => f.id === initialFocus) ?? needsReviewFindings[0] ?? queue[0] ?? d.findings[0]
  const [selectedId, setSelectedId] = useState<string>(defaultFinding?.id ?? '')

  useEffect(() => {
    if (initialFocus && queue.some((f) => f.id === initialFocus)) {
      setSelectedId(initialFocus)
    }
  }, [initialFocus]) // eslint-disable-line react-hooks/exhaustive-deps

  const finding = queue.find((f) => f.id === selectedId) ?? defaultFinding
  const hr = useHumanReview(finding?.id)
  const [notes, setNotes] = useState(hr.notes)
  const [decision, setDecision] = useState<FindingStatus | null>(hr.determination)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [evId, setEvId] = useState<string | null>(null)

  // Sync form state whenever the selected finding or its stored human review record changes
  useEffect(() => {
    setNotes(hr.notes)
    setDecision(hr.determination)
    setError(null)
    setSaved(false)
    setEvId(null)
  }, [finding?.id, hr.notes, hr.determination, hr.status])

  if (!finding) {
    return <NoReviewState screen="Tinjauan manual" />
  }

  const prev = d.version === 'V2' ? demo.hrForFinding('V1', finding.id) : null
  const locked = hr.status === 'reviewed'
  const dirty = !locked && (notes !== hr.notes || decision !== hr.determination)

  // Warn before leaving with unsaved notes (see UnsavedDialog).
  const { registerGuard, withGuard } = demo
  useEffect(() => {
    registerGuard({
      dirty,
      save: () => hr.saveDraft(notes, decision),
      discard: () => {
        setNotes(hr.notes)
        setDecision(hr.determination)
        setError(null)
      },
    })
    return () => registerGuard(null)
  }, [dirty, notes, decision, hr.notes, hr.determination, hr.saveDraft, registerGuard])

  const selectFinding = (id: string) => {
    if (id === finding.id) return
    withGuard(() => {
      setSelectedId(id)
    })
  }

  const save = () => { setError(null); hr.saveDraft(notes, decision); setSaved(true) }
  const submit = () => {
    if (!decision) return setError('Pilih keputusan penilaian Anda sebelum menandai temuan ini selesai ditinjau.')
    if (!notes.trim()) return setError('Tambahkan catatan peninjau yang menjelaskan dasar keputusan Anda.')
    setError(null); setSaved(false); hr.markReviewed(notes.trim(), decision)
  }
  const reopen = () => { hr.reopen(); setSaved(false) }

  const statusChip = {
    pending: { t: 'Menunggu tinjauan', c: 'bg-review-soft text-review' },
    draft: { t: 'Catatan disimpan, belum ditandai selesai', c: 'bg-partial-soft text-partial' },
    reviewed: { t: 'Telah ditinjau manual', c: 'bg-ok-soft text-ok' },
  }[hr.status]

  const findingReasons = reasonsFor(finding)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="eyebrow mb-2">{stepEyebrow('human', 'Tinjauan manual')}</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{finding.title}</h1>
          <p className="mt-1.5 text-ink-2">AI tidak dapat memastikan status temuan ini secara otomatis. Periksa bukti yang tersedia, lalu catat keputusan penilaian Anda.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2"><Tag>{d.id}</Tag><Tag tone="neutral">{d.version}</Tag><span className={`rounded-full px-3 py-1.5 text-sm font-semibold ${statusChip.c}`}>{statusChip.t}</span></div>
        <div className="w-full"><VersionSwitcher /></div>
      </div>

      {queue.length > 1 && (
        <GlassPanel className="p-4 sm:p-5" aria-label="Antrean temuan untuk tinjauan manual">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="eyebrow">Antrean tinjauan manual ({needsReviewFindings.length} wajib · {openFindings.length} temuan terbuka lainnya)</p>
              <p className="text-xs text-ink-3">Pilih temuan untuk memeriksa bukti dan mencatat keputusan peninjau secara terpisah.</p>
            </div>
            <span className="rounded-full bg-navy/6 px-2.5 py-1 text-xs font-semibold text-ink-2">
              {needsReviewFindings.filter((f) => demo.hrForFinding(d.version, f.id).status === 'reviewed').length} / {needsReviewFindings.length} wajib selesai
            </span>
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Pilih temuan untuk ditinjau">
            {queue.map((f) => {
              const fRec = demo.hrForFinding(d.version, f.id)
              const active = f.id === finding.id
              const badgeTone = fRec.status === 'reviewed' ? 'bg-ok-soft text-ok' : fRec.status === 'draft' ? 'bg-partial-soft text-partial' : 'bg-navy/8 text-ink-3'
              const badgeLabel = fRec.status === 'reviewed' ? 'Telah ditinjau' : fRec.status === 'draft' ? 'Draf' : f.status === 'needs_review' ? 'Wajib ditinjau' : 'Terbuka'
              return (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => selectFinding(f.id)}
                  className={`flex min-h-10 items-center gap-2.5 rounded-xl border px-3.5 py-2 text-left text-xs font-semibold transition ${
                    active
                      ? 'border-brand bg-brand text-white shadow-sm'
                      : 'border-navy/10 bg-paper/85 text-ink hover:border-brand/40 hover:bg-paper'
                  }`}
                >
                  <span>{f.id} · {f.title}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${active ? 'bg-white/20 text-white' : badgeTone}`}>
                    {badgeLabel}
                  </span>
                </button>
              )
            })}
          </div>
        </GlassPanel>
      )}

      {prev && (
        <>
          {hr.status === 'pending' && <Callout tone="warning">Tinjauan manual untuk {d.version} masih menunggu. {prev.status === 'reviewed' ? 'Keputusan tinjauan V1' : 'Catatan draf V1'} yang ditampilkan di bawah ini hanya sebagai konteks historis dan tidak secara otomatis menyetujui {d.version}. Diperlukan tindakan tinjauan tersendiri untuk versi ini.</Callout>}
          {prev.status !== 'pending' && (
            <section className="surface p-5" aria-label="Tinjauan manual versi sebelumnya (historis, hanya baca)">
              <div className="flex flex-wrap items-center gap-2"><p className="eyebrow">Konteks historis · Tinjauan manual V1 ({finding.id})</p><Tag tone="neutral">Hanya baca</Tag>{prev.determination && <StatusBadge status={prev.determination} />}<span className="text-xs text-ink-3">{prev.status === 'reviewed' ? `Tercatat ${prev.at}` : 'Catatan draf, belum ditandai selesai'}</span></div>
              <blockquote className="mt-3 mb-0 border-l-[3px] border-sage pl-3.5 text-sm text-ink-2">{prev.notes || 'Tidak ada catatan yang ditulis.'}</blockquote>
            </section>
          )}
        </>
      )}

      {/* AI vs human, deliberately separate */}
      <div className="grid gap-4 md:grid-cols-2" aria-label="Penilaian AI dan keputusan peninjau">
        <GlassPanel className="p-5">
          <p className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-wider text-ink-3 uppercase"><Icon name="spark" size={15} />Penilaian AI · simulasi · tidak berubah</p>
          <div className="flex flex-wrap items-center gap-2"><StatusBadge status={finding.status} /><SeverityBadge severity={finding.severity} /></div>
          <p className="mt-3 text-sm text-ink-3">Hasil penilaian AI dan kutipan bukti merupakan data simulasi demonstrasi dan tetap seperti semula. Keputusan peninjau dicatat berdampingan tanpa menimpa hasil AI.</p>
        </GlassPanel>
        <section className={`surface p-5 ${hr.status === 'reviewed' ? '!border-brand/40 ring-1 ring-brand/25' : 'border-dashed'}`}>
          <p className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-wider text-ink-3 uppercase"><Icon name="user" size={15} />Keputusan peninjau · manual ({finding.id})</p>
          {hr.status === 'reviewed' && hr.determination ? (
            <>
              <div className="flex flex-wrap items-center gap-2"><StatusBadge status={hr.determination} /><span className="rounded-md bg-brand px-2 py-0.5 text-xs font-semibold text-white">Dicatat oleh {hr.reviewer}</span></div>
              <p className="mt-3 text-sm text-ink-3">{hr.at}</p>
            </>
          ) : <p className="text-sm text-ink-3">Belum ada keputusan yang dicatat. Sebelum peninjau memberikan keputusan, temuan ini tetap berstatus <strong className="text-ink">{STATUS_META[finding.status].label}</strong>.</p>}
        </section>
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-12">
        <div className="space-y-5 xl:col-span-7">
          <section className="surface p-5 sm:p-6">
            <p className="eyebrow mb-1">Persyaratan yang ditinjau</p>
            <p className="text-lg font-semibold tracking-tight">{finding.requirement.ref}</p>
            <p className="mt-1 text-ink-2">{finding.requirement.text}</p>
          </section>

          <GlassPanel variant="glass-strong" className="p-5 sm:p-6">
            <EvidenceViewer finding={finding} sopDoc={d.docs[0].name} evidenceId={evId} onSelect={setEvId} />
          </GlassPanel>

          <div className="grid gap-5 md:grid-cols-2">
            <section className="surface p-5">
              <p className="eyebrow mb-2">Penjelasan AI mengenai ambiguitas</p>
              <p className="text-sm leading-relaxed text-ink-2">{finding.explanation}</p>
            </section>
            <section className="surface p-5">
              <p className="eyebrow mb-2">Mengapa tinjauan manual diperlukan</p>
              <ul className="space-y-2 text-sm text-ink-2">
                {findingReasons.map((r) => <li key={r} className="flex gap-2"><Icon name="info" size={16} className="mt-0.5 shrink-0 text-review" />{r}</li>)}
              </ul>
            </section>
          </div>
        </div>

        <aside className="space-y-5 xl:sticky xl:top-5 xl:col-span-5" aria-label="Panel peninjau">
          <GlassPanel variant="glass-strong" className="p-5 sm:p-6">
            <h2 className="text-lg font-semibold tracking-tight">Keputusan peninjau · {finding.id}</h2>
            <p className="mt-0.5 text-sm text-ink-3">Meninjau sebagai {hr.reviewer}. Keputusan Anda bersifat independen dari penilaian AI.</p>

            <fieldset disabled={locked} className="mt-4 min-w-0 border-0 p-0">
              <legend className="mb-2 text-sm font-semibold">Penilaian Anda</legend>
              <div className="space-y-2">
                {options.map((o) => (
                  <label key={o.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${decision === o.id ? 'border-brand/60 bg-brand-soft/70' : 'border-navy/10 bg-paper hover:border-brand/30'} ${locked ? 'cursor-default opacity-80' : ''}`}>
                    <input type="radio" name="determination" checked={decision === o.id} onChange={() => setDecision(o.id)} className="mt-1 size-4 accent-[var(--color-brand)]" />
                    <span><span className="block text-sm font-semibold">{STATUS_META[o.id].label}</span><span className="block text-xs text-ink-3">{o.hint}</span></span>
                  </label>
                ))}
              </div>

              <label htmlFor="notes" className="mt-4 mb-1.5 block text-sm font-semibold">Catatan peninjau</label>
              <textarea id="notes" rows={5} value={notes} onChange={(e) => { setNotes(e.target.value); setSaved(false) }} maxLength={600}
                placeholder="Jelaskan apa yang telah Anda periksa dan alasan pengambilan keputusan ini."
                aria-describedby="notes-help" aria-invalid={!!error && !notes.trim()}
                className="w-full resize-y rounded-xl border border-navy/15 bg-paper p-3 text-sm text-ink outline-none transition placeholder:text-ink-3 focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:bg-canvas" />
              <p id="notes-help" className="mt-1 text-right text-xs text-ink-3">{notes.length} / 600</p>
            </fieldset>

            <div className="mt-3 space-y-3" aria-live="polite">
              {error && <Callout tone="error">{error}</Callout>}
              {dirty && !error && <Callout tone="warning">Terdapat perubahan yang belum disimpan. Simpan catatan atau tandai selesai ditinjau agar tidak hilang.</Callout>}
              {saved && !error && hr.status === 'draft' && <Callout tone="warning">Catatan berhasil disimpan. Temuan ini belum ditandai selesai ditinjau.</Callout>}
              {locked && <Callout tone="success">Tinjauan dicatat oleh {hr.reviewer} pada {hr.at}. Penilaian AI tidak berubah.</Callout>}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {locked ? <Button variant="glass" icon="refresh" onClick={reopen}>Edit tinjauan</Button> : (
                <>
                  <Button icon="check" onClick={submit}>Tandai selesai ditinjau</Button>
                  <Button variant="glass" onClick={save}>Simpan catatan tinjauan</Button>
                </>
              )}
            </div>
          </GlassPanel>

          <section className="surface p-5" aria-label="Aktivitas tinjauan">
            <p className="eyebrow mb-3">Aktivitas ({finding.id})</p>
            <ol className="space-y-3">
              {hr.events.map((e) => (
                <li key={e.id} className="flex gap-3 text-sm">
                  <span className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full ${e.by === 'ai' ? 'bg-navy/8 text-ink-3' : 'bg-brand text-white'}`}><Icon name={e.by === 'ai' ? 'spark' : 'user'} size={13} /></span>
                  <div><p className="font-semibold">{e.label}</p><p className="text-xs text-ink-3">{e.by === 'ai' ? 'AI (simulasi)' : hr.reviewer} · {e.at}{e.detail ? ` · ${e.detail}` : ''}</p></div>
                </li>
              ))}
            </ol>
          </section>

          <GlassPanel className="p-5">
            <p className="eyebrow mb-1">Langkah berikutnya</p>
            {demo.reviews.V2
              ? <><p className="text-sm text-ink-2">Versi V2 telah tersedia. Bandingkan dengan V1 untuk melihat perubahan hasil revisi.</p><Button className="mt-3" variant="glass" icon="compare" onClick={() => onNavigate('compare')}>Bandingkan V1 dan V2</Button></>
              : <><p className="text-sm text-ink-2">Akar Masalah baru terpenuhi sebagian. Revisi bagian tersebut dengan bukti pendukung lalu periksa ulang untuk membuat V2.</p><Button className="mt-3" icon="refresh" onClick={demo.openRevision}>Revisi akar masalah</Button></>}
          </GlassPanel>

          <div className="flex flex-wrap gap-2">
            <Button variant="glass" onClick={() => onNavigate('findings')}>Kembali ke jejak bukti</Button>
            <Button variant="ghost" onClick={() => onNavigate('result')}>Buka hasil pemeriksaan</Button>
          </div>
        </aside>
      </div>
    </div>
  )
}
