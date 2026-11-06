import { useDemo } from '../../state/DemoStore'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'

export function ResetDialog() {
  const { resetOpen, cancelReset, confirmReset, cases } = useDemo()
  if (!resetOpen) return null
  return (
    <Modal title="Reset demo" onClose={cancelReset}>
      <h2 className="text-xl font-semibold tracking-tight">Reset demo?</h2>
      <p className="mt-1.5 text-sm text-ink-2">Tindakan ini akan mengembalikan aplikasi ke kondisi awal dan menghapus secara permanen:</p>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-ink-2">
        <li>Data pemeriksaan saat ini{cases.length ? ` (${cases.length} dibuat dalam demo ini)` : ''}</li>
        <li>Riwayat versi, termasuk V1 dan V2</li>
        <li>Data keputusan tinjauan manual</li>
        <li>Catatan peninjau</li>
        <li>File demo yang telah diunggah</li>
      </ul>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <Button variant="danger" onClick={confirmReset}>Reset demo</Button>
        <Button variant="glass" onClick={cancelReset}>Batal</Button>
      </div>
    </Modal>
  )
}
