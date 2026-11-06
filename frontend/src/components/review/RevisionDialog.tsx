import { useState } from 'react'
import { SAMPLE_REVISION, V1_ROOT_CAUSE_TEXT } from '../../data/review'
import { useDemo } from '../../state/DemoStore'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { Callout } from '../ui/States'

const fieldCls = 'w-full resize-y rounded-xl border border-navy/15 bg-paper p-3 text-sm text-ink outline-none transition placeholder:text-ink-3 focus:border-brand focus:ring-2 focus:ring-brand/20'

/** Simulated report revision: edit the Root Cause section, then recheck to create V2. */
export function RevisionDialog() {
  const { revisionOpen, closeRevision, revision, setRevision, startRecheck, say, reviews } = useDemo()
  const [error, setError] = useState<string | null>(null)
  if (!revisionOpen) return null

  const v2Exists = !!reviews.V2
  const update = (k: 'statement' | 'evidence', v: string) => { setError(null); setRevision({ ...revision, [k]: v }) }
  const recheck = () => {
    if (!revision.statement.trim()) return setError('Tuliskan pernyataan akar masalah yang telah diperbarui.')
    if (!revision.evidence.trim()) return setError('Tambahkan bukti pendukung, seperti rujukan catatan perubahan (change record) atau log. Pemeriksaan ulang memerlukan bukti untuk menilai kepatuhan SOP 5.1.')
    startRecheck()
  }

  return (
    <Modal title="Revisi akar masalah" onClose={closeRevision} wide>
      <p className="eyebrow mb-1">Simulasi revisi laporan</p>
      <h2 className="text-xl font-semibold tracking-tight">Revisi bagian Akar Masalah</h2>
      <p className="mt-1 text-sm text-ink-3">Perbarui bagian laporan yang ditandai oleh SOP 5.1. Pemeriksaan ulang akan membuat versi V2 dan mempertahankan V1 tanpa perubahan.</p>

      <div className="mt-4 rounded-xl border border-navy/8 bg-canvas/70 p-3 text-sm">
        <p className="text-xs font-semibold tracking-wider text-ink-3 uppercase">Teks saat ini (V1)</p>
        <p className="mt-1 text-ink-2">{V1_ROOT_CAUSE_TEXT}</p>
      </div>

      <div className="mt-4 space-y-4">
        <div>
          <label htmlFor="rc-statement" className="mb-1.5 block text-sm font-semibold">Pernyataan akar masalah yang diperbarui</label>
          <textarea id="rc-statement" rows={3} className={fieldCls} value={revision.statement} onChange={(e) => update('statement', e.target.value)} placeholder="Tuliskan akar masalah yang telah terkonfirmasi." />
        </div>
        <div>
          <label htmlFor="rc-evidence" className="mb-1.5 block text-sm font-semibold">Bukti pendukung</label>
          <textarea id="rc-evidence" rows={3} className={fieldCls} value={revision.evidence} onChange={(e) => update('evidence', e.target.value)} placeholder="Cantumkan rujukan catatan perubahan, kutipan log, atau referensi pemantauan." />
        </div>
      </div>

      <div className="mt-4 space-y-3" aria-live="polite">
        {error && <Callout tone="error">{error}</Callout>}
        {v2Exists && <Callout tone="warning">Versi V2 sudah tersedia untuk pemeriksaan ini. Reset demo untuk menjalankan ulang simulasi revisi.</Callout>}
        <Callout tone="info">Aturan simulasi: setiap bukti pendukung yang Anda tambahkan akan mengubah status Akar Masalah menjadi Terpenuhi pada V2. Temuan lainnya tetap tidak berubah. Tidak ada dokumen yang dianalisis secara langsung.</Callout>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Button icon="refresh" onClick={recheck} disabled={v2Exists}>Periksa ulang sebagai V2</Button>
        <Button variant="glass" onClick={() => { setRevision(SAMPLE_REVISION); setError(null) }}>Gunakan contoh revisi</Button>
        <Button variant="ghost" onClick={() => { say('info', 'Draf revisi berhasil disimpan.'); closeRevision() }}>Simpan draf</Button>
        <Button variant="ghost" className="ml-auto" onClick={closeRevision}>Batal</Button>
      </div>
    </Modal>
  )
}
