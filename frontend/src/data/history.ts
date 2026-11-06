import type { ReviewState } from './status'

export type ReviewTarget = { id: string; version: 'V1' | 'V2' | string }

export type HistoryRecord = {
  key: string
  id: string
  title: string
  report: string
  version: string
  date: string
  status: ReviewState
  latest: boolean
}

/** Static sample history (dummy data). INC-2026-014 versions are added from shared state. Reviews created in this demo (starting with INC-2026-014) are added from shared state and are the only ones with detailed findings. */
export const sampleRecords: HistoryRecord[] = [
  { key: '013-v2', id: 'INC-2026-013', title: 'Kedaluwarsa sertifikat gateway VPN', report: 'INC-2026-013_VPN-Cert-Expiry_rev2.docx', version: 'V2', date: '8 Jun 2026, 16:05', status: 'human_reviewed', latest: true },
  { key: '013-v1', id: 'INC-2026-013', title: 'Kedaluwarsa sertifikat gateway VPN', report: 'INC-2026-013_VPN-Cert-Expiry.docx', version: 'V1', date: '8 Jun 2026, 14:20', status: 'human_reviewed', latest: false },
  { key: '012-v1', id: 'INC-2026-012', title: 'Kegagalan batch job penggajian', report: 'INC-2026-012_Payroll-Batch.pdf', version: 'V1', date: '8 Jun 2026, 10:32', status: 'awaiting_human', latest: true },
  { key: '011-v3', id: 'INC-2026-011', title: 'Penumpukan antrean email relay', report: 'INC-2026-011_Mail-Relay_rev3.docx', version: 'V3', date: '7 Jun 2026, 15:48', status: 'human_reviewed', latest: true },
  { key: '011-v2', id: 'INC-2026-011', title: 'Penumpukan antrean email relay', report: 'INC-2026-011_Mail-Relay_rev2.docx', version: 'V2', date: '7 Jun 2026, 11:10', status: 'human_reviewed', latest: false },
  { key: '011-v1', id: 'INC-2026-011', title: 'Penumpukan antrean email relay', report: 'INC-2026-011_Mail-Relay.docx', version: 'V1', date: '6 Jun 2026, 17:25', status: 'human_reviewed', latest: false },
  { key: '010-v1', id: 'INC-2026-010', title: 'Keterlambatan ETL data warehouse', report: 'INC-2026-010_ETL-Delay_scanned.pdf', version: 'V1', date: '6 Jun 2026, 09:03', status: 'rejected_file', latest: true },
]
