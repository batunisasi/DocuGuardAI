// Finding categories — mirrors the legend in the product spec.
export type FindingStatus = 'fulfilled' | 'partial' | 'not_found' | 'na' | 'needs_review'

export const STATUS_META: Record<FindingStatus, { label: string; fg: string; bg: string }> = {
  fulfilled: { label: 'Terpenuhi', fg: 'var(--color-ok)', bg: 'var(--color-ok-soft)' },
  partial: { label: 'Terpenuhi Sebagian', fg: 'var(--color-partial)', bg: 'var(--color-partial-soft)' },
  not_found: { label: 'Tidak Ditemukan', fg: 'var(--color-missing)', bg: 'var(--color-missing-soft)' },
  na: { label: 'Tidak Berlaku', fg: 'var(--color-na)', bg: 'var(--color-na-soft)' },
  needs_review: { label: 'Perlu Ditinjau Manual', fg: 'var(--color-review)', bg: 'var(--color-review-soft)' },
}

export type ReviewState = 'awaiting_human' | 'human_reviewed' | 'processing' | 'rejected_file'

export const REVIEW_STATE_META: Record<ReviewState, { text: string; cls: string }> = {
  awaiting_human: { text: 'Menunggu tinjauan manual', cls: 'bg-review-soft text-review' },
  human_reviewed: { text: 'Telah ditinjau manual', cls: 'bg-ok-soft text-ok' },
  processing: { text: 'Sedang diproses', cls: 'bg-brand-soft text-brand' },
  rejected_file: { text: 'File ditolak', cls: 'bg-missing-soft text-missing' },
}

// Finding severity — a SEPARATE dimension from compliance status. Never merge the two.
export type Severity = 'information' | 'minor' | 'major' | 'critical'

export const SEVERITY_META: Record<Severity, { label: string; level: 1 | 2 | 3 | 4; hint: string }> = {
  information: { label: 'Informasional', level: 1, hint: 'Tidak memerlukan tindakan' },
  minor: { label: 'Rendah', level: 2, hint: 'Celah kecil, dampak rendah' },
  major: { label: 'Tinggi', level: 3, hint: 'Celah signifikan yang perlu diperbaiki' },
  critical: { label: 'Kritis', level: 4, hint: 'Menghambat persetujuan laporan' },
}
