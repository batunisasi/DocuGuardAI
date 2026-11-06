/** Single source for the eight screens: order, contextual group, labels and icons. */
export const SCREENS = [
  { n: 1, id: 'dashboard', label: 'Dasbor', short: 'Dasbor', icon: 'grid', group: 'workspace' },
  { n: 2, id: 'new', label: 'Pemeriksaan Baru', short: 'Pemeriksaan Baru', icon: 'upload', group: 'workspace' },
  { n: 3, id: 'processing', label: 'Pemrosesan AI', short: 'Pemrosesan AI', icon: 'spark', group: 'prototype' },
  { n: 4, id: 'result', label: 'Hasil Pemeriksaan', short: 'Hasil Pemeriksaan', icon: 'shield', group: 'case' },
  { n: 5, id: 'findings', label: 'Temuan & Bukti', short: 'Jejak Bukti', icon: 'search', group: 'case' },
  { n: 6, id: 'human', label: 'Tinjauan Manual', short: 'Tinjauan Manual', icon: 'user', group: 'case' },
  { n: 7, id: 'history', label: 'Riwayat Pemeriksaan', short: 'Riwayat', icon: 'history', group: 'workspace' },
  { n: 8, id: 'compare', label: 'Perbandingan Versi', short: 'Perbandingan', icon: 'compare', group: 'case' },
] as const

export type ScreenId = (typeof SCREENS)[number]['id']
export const isScreen = (id: string): id is ScreenId => SCREENS.some((s) => s.id === id)

/** Group A — Ruang Kerja (global application destinations) */
export const WORKSPACE_NAV = [
  { id: 'dashboard', label: 'Dasbor', icon: 'grid' },
  { id: 'new', label: 'Pemeriksaan Baru', icon: 'upload' },
  { id: 'history', label: 'Riwayat Pemeriksaan', icon: 'history' },
] as const

/** Group B — Kasus Aktif (contextual destinations for the active incident) */
export const CASE_NAV = [
  { id: 'result', label: 'Hasil Pemeriksaan', icon: 'shield' },
  { id: 'findings', label: 'Temuan & Bukti', icon: 'search' },
  { id: 'human', label: 'Tinjauan Manual', icon: 'user' },
  { id: 'compare', label: 'Perbandingan Versi', icon: 'compare' },
] as const

/** Contextual eyebrow aligned with the two-group navigation structure. */
export function stepEyebrow(id: ScreenId, text: string) {
  const s = SCREENS.find((x) => x.id === id)
  const prefix = s?.group === 'case' ? 'Kasus Aktif' : s?.group === 'prototype' ? 'Pemrosesan AI' : 'Ruang Kerja'
  return `${prefix} · ${text}`
}
