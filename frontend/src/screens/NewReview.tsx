import { useMemo } from 'react'
import { slotMeta } from '../data/review'
import { stepEyebrow } from '../data/screens'
import { useDemo, useReviewFlow } from '../state/DemoStore'
import { UploadSlot } from '../components/upload/UploadSlot'
import { Button } from '../components/ui/Button'
import { GlassPanel } from '../components/ui/Glass'
import { Icon } from '../components/ui/Icon'
import { Callout } from '../components/ui/States'

export function NewReview({ onNavigate: _onNavigate }: { onNavigate: (id: string) => void }) {
  const { slots, readyCount, allReady, addFile, removeFile, reset } = useReviewFlow()
  const { startReview, textConfirmed, setTextConfirmed } = useDemo()
  const slotHandlers = useMemo(
    () => ({
      sop: {
        onFile: (n: string, sz: number, lm?: number) => addFile('sop', n, sz, { lastModified: lm }),
        onRemove: () => removeFile('sop'),
      },
      template: {
        onFile: (n: string, sz: number, lm?: number) => addFile('template', n, sz, { lastModified: lm }),
        onRemove: () => removeFile('template'),
      },
      report: {
        onFile: (n: string, sz: number, lm?: number) => addFile('report', n, sz, { lastModified: lm }),
        onRemove: () => removeFile('report'),
      },
    }),
    [addFile, removeFile],
  )
  const missing = slotMeta.filter((m) => slots[m.id].status !== 'ready').map((m) => m.title)
  const uploading = Object.values(slots).some((s) => s.status === 'uploading')
  const invalidCount = Object.values(slots).filter((s) => s.status === 'invalid').length
  const anyFile = Object.values(slots).some((s) => s.file)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="eyebrow mb-2">{stepEyebrow('new', 'Pemeriksaan baru')}</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Unggah Dokumen</h1>
          <p className="mt-1.5 text-ink-2">Tambahkan dokumen SOP, template laporan, dan laporan insiden. Ketiga dokumen wajib tersedia sebelum pemeriksaan dapat dimulai.</p>
        </div>
        {anyFile && (
          <div className="flex gap-2">
            <Button variant="ghost" onClick={reset}>Hapus semua</Button>
          </div>
        )}
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-12">
        <div className="space-y-4 xl:col-span-8">
          {slotMeta.map((m) => (
            <UploadSlot
              key={m.id}
              meta={m}
              slot={slots[m.id]}
              onFile={slotHandlers[m.id].onFile}
              onRemove={slotHandlers[m.id].onRemove}
            />
          ))}
        </div>

        <aside className="space-y-4 xl:sticky xl:top-5 xl:col-span-4" aria-label="Pengaturan pemeriksaan">
          <GlassPanel variant="glass-strong" className="p-5">
            <p className="eyebrow mb-1">Pengaturan pemeriksaan</p>
            <h2 className="text-lg font-semibold tracking-tight">Insiden TI T1</h2>
            <p className="mt-1 text-sm text-ink-3">Laporan akan diperiksa terhadap SOP dan template, dengan penilaian yang disajikan secara terpisah untuk masing-masing dimensi.</p>

            <ul className="mt-4 space-y-2">
              {slotMeta.map((m) => {
                const s = slots[m.id]
                const tone = s.status === 'ready' ? 'text-ok' : s.status === 'invalid' ? 'text-missing' : 'text-ink-3'
                const label = { ready: 'Siap', uploading: 'Mengunggah…', invalid: 'Perlu file valid', empty: 'Belum ada' }[s.status]
                return (
                  <li key={m.id} className="glass-inset flex items-center gap-3 px-3 py-2.5 text-sm">
                    <Icon name={s.status === 'ready' ? 'check' : s.status === 'invalid' ? 'alert' : 'clock'} size={17} className={tone} />
                    <span className="flex-1 font-medium">{m.title}</span>
                    <span className={`text-xs font-semibold ${tone}`}>{label}</span>
                  </li>
                )
              })}
            </ul>

            <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-navy/10 bg-paper/70 p-3 text-sm">
              <input type="checkbox" checked={textConfirmed} onChange={(e) => setTextConfirmed(e.target.checked)} className="mt-0.5 size-4 shrink-0 accent-[var(--color-brand)]" />
              <span><span className="font-semibold">Saya mengonfirmasi file ini berisi teks yang dapat dipilih</span><span className="block text-xs text-ink-3">Bukan hasil pindaian (scan) atau hanya berisi gambar.</span></span>
            </label>

            <div className="mt-4">
              {allReady && !textConfirmed ? <Callout tone="warning">Konfirmasikan bahwa file berisi teks yang dapat dipilih untuk melanjutkan.</Callout> : allReady ? <Callout tone="success">Ketiga dokumen telah siap diperiksa.</Callout>
                : invalidCount ? <Callout tone="error">Ganti file yang tidak valid untuk melanjutkan.</Callout>
                : <Callout tone="info">{readyCount} dari 3 dokumen siap. Masih diperlukan: {missing.join(', ')}.</Callout>}
            </div>

            <Button className="mt-4 w-full" icon="spark" disabled={!allReady || uploading || !textConfirmed} onClick={startReview}>Mulai Pemeriksaan AI</Button>
          </GlassPanel>

          <GlassPanel className="p-5">
            <p className="eyebrow mb-3">Ketentuan format dokumen</p>
            <ul className="space-y-2.5 text-sm text-ink-2">
              <li className="flex gap-2.5"><Icon name="check" size={17} className="mt-0.5 shrink-0 text-ok" /><span>File <strong>PDF</strong> atau <strong>DOCX</strong> berbasis teks (maksimal 20 MB per dokumen).</span></li>
              <li className="flex gap-2.5"><Icon name="check" size={17} className="mt-0.5 shrink-0 text-ok" /><span>Setiap slot memerlukan dokumen tersendiri untuk <strong>SOP</strong>, <strong>Template</strong>, dan <strong>Laporan Insiden</strong>.</span></li>
              <li className="flex gap-2.5"><Icon name="alert" size={17} className="mt-0.5 shrink-0 text-missing" /><span><strong>Dokumen hasil pindaian (scan) dan gambar saja belum didukung.</strong> Versi ini belum menyertakan fitur OCR.</span></li>
            </ul>
          </GlassPanel>
        </aside>
      </div>
    </div>
  )
}
