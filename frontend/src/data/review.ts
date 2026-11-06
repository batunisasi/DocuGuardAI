import type { FindingStatus, Severity } from './status'

export type SlotId = 'sop' | 'template' | 'report'

export const slotMeta: { id: SlotId; n: number; title: string; hint: string; sample: { name: string; size: number } }[] = [
  { id: 'sop', n: 1, title: 'Dokumen SOP', hint: 'Standar Operasional Prosedur (SOP) yang wajib dipatuhi oleh laporan.', sample: { name: 'SOP-IT-INC-004_v3.2.pdf', size: 482_000 } },
  { id: 'template', n: 2, title: 'Template Laporan Insiden', hint: 'Template yang bagian-bagiannya wajib dilengkapi dalam laporan.', sample: { name: 'TPL-INC-T1_v2.0.docx', size: 96_400 } },
  { id: 'report', n: 3, title: 'Laporan Insiden', hint: 'Laporan yang akan diperiksa (Insiden TI T1).', sample: { name: 'INC-2026-014_Incident-Report.docx', size: 214_800 } },
]

/** The AI processing stages — all simulated in this prototype. */
export const stages = [
  { id: 'validate', label: 'Validasi dokumen', active: 'Memeriksa format file dari ketiga dokumen', done: 'Ketiga file lolos validasi format. Konten berbasis teks diasumsikan valid; isi dokumen tidak diperiksa secara langsung dalam demo ini.' },
  { id: 'extract', label: 'Ekstraksi teks', active: 'Mengekstrak teks dari ketiga dokumen', done: 'Ekstraksi teks berhasil disimulasikan untuk SOP, template, dan laporan' },
  { id: 'sop', label: 'Identifikasi persyaratan SOP', active: 'Menemukan persyaratan wajib dalam dokumen SOP', done: '6 persyaratan SOP teridentifikasi' },
  { id: 'template', label: 'Analisis kelengkapan template', active: 'Memetakan isi laporan ke bagian-bagian template', done: '8 bagian template berhasil dipetakan (1 tidak berlaku)' },
  { id: 'evidence', label: 'Validasi bukti', active: 'Mencocokkan setiap temuan dengan kutipan teks laporan', done: 'Kutipan bukti berhasil ditautkan ke temuan' },
  { id: 'classify', label: 'Klasifikasi temuan', active: 'Menetapkan status pemenuhan dan tingkat keparahan', done: '6 temuan berhasil diklasifikasikan' },
  { id: 'result', label: 'Penyusunan hasil pemeriksaan', active: 'Menyiapkan hasil pemeriksaan untuk peninjau manual', done: 'Hasil pemeriksaan siap ditinjau' },
] as const

export const REVIEW_ID = 'INC-2026-014'
export const REVIEW_TITLE = 'Latensi API core banking dan gangguan layanan sebagian'
export const DOMAIN = 'Insiden TI T1'
export type VersionId = 'V1' | 'V2'

export type DocInfo = { role: string; name: string; meta: string }

export type Evidence = {
  id: string
  docRole: 'Laporan Insiden' | 'SOP' | 'Template'
  docName: string
  excerpt: string
  /** Only set when a section reference is available. Page numbers are never invented. */
  location: string | null
  addedInVersion?: VersionId
}

export type Finding = {
  id: string
  title: string
  summary: string
  status: FindingStatus
  /** Independent of status: there is no fixed mapping between the two. */
  severity: Severity
  sopRef: string
  templateSection: string
  requirement: { ref: string; text: string }
  evidence: Evidence[]
  explanation: string
  recommendation: string
}

export type ReviewData = {
  id: string; title: string; version: VersionId; domain: string; checkedAt: string
  docs: DocInfo[]
  summary: string
  findings: Finding[]
  sopAssessment: { ref: string; label: string; status: FindingStatus }[]
  templateAssessment: { ref: string; label: string; status: FindingStatus }[]
  recommendations: { id: string; findingId: string; text: string; detail: string }[]
}

/** Reviewer-supplied root cause revision (the V1 -> V2 scenario). */
export type Revision = { statement: string; evidence: string }

export const EMPTY_REVISION: Revision = { statement: '', evidence: '' }

export const SAMPLE_REVISION: Revision = {
  statement: 'Akar masalah terkonfirmasi: pengaturan idle-timeout pada load balancer lebih rendah dibandingkan waktu respons API saat beban puncak, sehingga koneksi terputus secara paksa.',
  evidence: 'Catatan perubahan CHG-24-0611 menunjukkan pengaturan idle timeout diturunkan saat pemeliharaan. Log load balancer mencatat pemutusan koneksi mulai pukul 09:05 UTC.',
}

export const V1_ROOT_CAUSE_TEXT = 'Hipotesis: konfigurasi timeout pada load balancer kemungkinan menyebabkan kegagalan permintaan layanan. Konfirmasi akhir masih menunggu verifikasi.'

// ---- Demonstration findings for INC-2026-014 (fictional; not extracted from uploaded files) ----

function findingsFor(report: string): Finding[] {
  const rep = (id: string, excerpt: string, location: string | null): Evidence =>
    ({ id, docRole: 'Laporan Insiden', docName: report, excerpt, location })
  return [
    {
      id: 'F-01', title: 'Waktu deteksi dan pemulihan layanan', summary: 'Waktu deteksi dan waktu pemulihan layanan telah tercatat.',
      status: 'fulfilled', severity: 'information', sopRef: 'SOP 4.2', templateSection: '2 · Linimasa insiden',
      requirement: { ref: 'SOP 4.2', text: 'Laporan wajib mencantumkan waktu saat insiden terdeteksi dan waktu saat layanan berhasil dipulihkan.' },
      evidence: [rep('E-01a', 'Deteksi pada pukul 09:12 UTC dan pemulihan layanan pada pukul 10:03 UTC.', 'Bagian Linimasa Insiden')],
      explanation: 'Waktu deteksi dan waktu pemulihan layanan keduanya telah dicantumkan dan diberi label secara jelas sesuai persyaratan SOP 4.2.',
      recommendation: 'Tidak memerlukan tindakan lebih lanjut.',
    },
    {
      id: 'F-02', title: 'Ringkasan dampak bisnis', summary: 'Durasi gangguan layanan telah dicantumkan.',
      status: 'fulfilled', severity: 'minor', sopRef: 'SOP 4.3', templateSection: '3 · Dampak bisnis',
      requirement: { ref: 'SOP 4.3', text: 'Laporan wajib merangkum dampak bisnis, termasuk total durasi gangguan layanan.' },
      evidence: [rep('E-02a', 'Gangguan layanan berlangsung selama kurang lebih 51 menit.', 'Bagian Dampak Bisnis')],
      explanation: 'Laporan telah menyebutkan durasi berlangsungnya gangguan sehingga persyaratan terpenuhi. Jumlah nasabah terdampak belum disebutkan, namun tidak diwajibkan secara mutlak oleh SOP.',
      recommendation: 'Opsional: tambahkan jumlah nasabah atau pengguna yang terdampak jika datanya tersedia.',
    },
    {
      id: 'F-03', title: 'Akar masalah', summary: 'Penyebab masih berupa hipotesis dan belum mendapatkan konfirmasi akhir.',
      status: 'partial', severity: 'major', sopRef: 'SOP 5.1', templateSection: '4 · Analisis akar masalah',
      requirement: { ref: 'SOP 5.1', text: 'Akar masalah wajib didokumentasikan dan didukung oleh bukti teknis seperti catatan log atau catatan perubahan (change record).' },
      evidence: [rep('E-03a', V1_ROOT_CAUSE_TEXT, 'Bagian Akar Masalah')],
      explanation: 'Akar masalah belum mendapatkan konfirmasi akhir. Laporan baru menyampaikan hipotesis terkait konfigurasi timeout pada load balancer tanpa menyertakan rujukan log atau catatan perubahan pendukung.',
      recommendation: 'Konfirmasikan akar masalah dan cantumkan rujukan catatan perubahan atau kutipan log pendukung.',
    },
    {
      id: 'F-04', title: 'Tindakan korektif', summary: 'Langkah-langkah yang dilakukan untuk memulihkan layanan telah dicantumkan.',
      status: 'fulfilled', severity: 'minor', sopRef: 'SOP 5.2', templateSection: '5 · Tindakan korektif',
      requirement: { ref: 'SOP 5.2', text: 'Laporan wajib mencantumkan daftar tindakan korektif yang diambil untuk memulihkan layanan.' },
      evidence: [rep('E-04a', 'Mulai ulang (restart) layanan telah dilakukan. Penyesuaian sementara konfigurasi timeout telah diterapkan.', 'Bagian Tindakan Korektif')],
      explanation: 'Langkah mulai ulang layanan dan penyesuaian sementara konfigurasi timeout telah dicantumkan dengan jelas sehingga memenuhi SOP 5.2.',
      recommendation: 'Tidak memerlukan tindakan lebih lanjut.',
    },
    {
      id: 'F-05', title: 'Tindakan pencegahan dan penanggung jawab', summary: 'Tidak ditemukan tindakan pencegahan maupun penanggung jawab yang ditugaskan.',
      status: 'not_found', severity: 'major', sopRef: 'SOP 5.3', templateSection: '6 · Tindakan pencegahan',
      requirement: { ref: 'SOP 5.3', text: 'Laporan wajib mencatat setidaknya satu tindakan pencegahan serta menetapkan penanggung jawab (PIC) yang akuntabel.' },
      evidence: [],
      explanation: 'Tidak ditemukan tindakan pencegahan maupun penanggung jawab yang ditetapkan. Bagian Tindakan Pencegahan kosong dan tidak ada bagian lain dalam laporan yang memenuhi persyaratan ini.',
      recommendation: 'Tambahkan setidaknya satu tindakan pencegahan, tetapkan nama penanggung jawab (PIC), dan cantumkan target tanggal penyelesaian.',
    },
    {
      id: 'F-06', title: 'Komunikasi pemangku kepentingan', summary: 'Notifikasi internal tercatat, namun pembaruan komunikasi kepada nasabah belum jelas.',
      status: 'needs_review', severity: 'major', sopRef: 'SOP 6.1', templateSection: '7 · Catatan komunikasi',
      requirement: { ref: 'SOP 6.1', text: 'Pemangku kepentingan, termasuk nasabah yang terdampak, wajib diberi tahu dalam batas waktu SOP dan catatan komunikasinya wajib didokumentasikan.' },
      evidence: [
        rep('E-06a', 'Notifikasi tim internal dikirimkan pada pukul 09:18 UTC.', 'Bagian Komunikasi'),
        rep('E-06b', 'Pembaruan komunikasi kepada nasabah telah diterbitkan.', null),
      ],
      explanation: 'Notifikasi internal pada pukul 09:18 UTC telah tercatat. Namun pembaruan komunikasi kepada nasabah disebutkan tanpa keterangan waktu, saluran komunikasi, maupun cakupan penerima, sehingga AI tidak dapat memastikan kepatuhannya terhadap SOP 6.1.',
      recommendation: 'Lampirkan rincian komunikasi nasabah beserta waktu pengiriman dan saluran yang digunakan agar peninjau dapat memverifikasinya terhadap SOP 6.1.',
    },
  ]
}

const sopBase = [
  { ref: '4.2', label: 'Mencatat waktu deteksi dan pemulihan layanan', findingId: 'F-01' },
  { ref: '4.3', label: 'Merangkum dampak bisnis', findingId: 'F-02' },
  { ref: '5.1', label: 'Mendokumentasikan akar masalah beserta bukti', findingId: 'F-03' },
  { ref: '5.2', label: 'Mencantumkan tindakan korektif yang diambil', findingId: 'F-04' },
  { ref: '5.3', label: 'Menetapkan tindakan pencegahan dan penanggung jawab', findingId: 'F-05' },
  { ref: '6.1', label: 'Mencatat komunikasi pemangku kepentingan', findingId: 'F-06' },
]
const templateBase: { ref: string; label: string; findingId?: string; status?: FindingStatus }[] = [
  { ref: '1', label: 'Metadata insiden', status: 'fulfilled' },
  { ref: '2', label: 'Linimasa insiden', findingId: 'F-01' },
  { ref: '3', label: 'Dampak bisnis', findingId: 'F-02' },
  { ref: '4', label: 'Analisis akar masalah', findingId: 'F-03' },
  { ref: '5', label: 'Tindakan korektif', findingId: 'F-04' },
  { ref: '6', label: 'Tindakan pencegahan', findingId: 'F-05' },
  { ref: '7', label: 'Catatan komunikasi', findingId: 'F-06' },
  { ref: '8', label: 'Keterlibatan pihak ketiga', status: 'na' },
]
const recsV1 = [
  { id: 'R-1', findingId: 'F-05', text: 'Tambahkan tindakan pencegahan beserta nama penanggung jawab dan target penyelesaian.', detail: 'SOP 5.3 mewajibkan setiap insiden tingkat Tinggi ditutup dengan penanggung jawab yang akuntabel.' },
  { id: 'R-2', findingId: 'F-03', text: 'Konfirmasikan akar masalah dan lengkapi dengan bukti pendukung.', detail: 'Cantumkan rujukan catatan perubahan atau kutipan log yang mengonfirmasi hipotesis timeout pada load balancer.' },
  { id: 'R-3', findingId: 'F-06', text: 'Perjelas catatan komunikasi kepada nasabah.', detail: 'Tambahkan waktu pengiriman dan saluran komunikasi agar peninjau dapat memeriksa kepatuhannya terhadap batas waktu SOP 6.1.' },
]

function assemble(id: string, title: string, version: VersionId, docs: DocInfo[], checkedAt: string, findings: Finding[], summary: string, recommendations: ReviewData['recommendations']): ReviewData {
  const st = (id?: string): FindingStatus => findings.find((f) => f.id === id)?.status ?? 'not_found'
  return {
    id, title, version, domain: DOMAIN, checkedAt, docs, summary, findings, recommendations,
    sopAssessment: sopBase.map((r) => ({ ref: r.ref, label: r.label, status: st(r.findingId) })),
    templateAssessment: templateBase.map((r) => ({ ref: r.ref, label: r.label, status: r.status ?? st(r.findingId) })),
  }
}

/** V1: the initial simulated review. */
export function buildV1(docs: DocInfo[], checkedAt: string, id: string = REVIEW_ID, title: string = REVIEW_TITLE): ReviewData {
  return assemble(id, title, 'V1', docs, checkedAt, findingsFor(docs[2].name),
    'Laporan telah mencatat waktu deteksi dan pemulihan layanan, durasi dampak selama 51 menit, serta tindakan korektif. Tiga poin memerlukan perhatian: akar masalah masih berupa hipotesis, tindakan pencegahan beserta penanggung jawab belum dicantumkan, serta catatan komunikasi nasabah belum jelas dan perlu ditinjau manual.',
    recsV1)
}

/** V2: created by a simulated recheck. Only Root Cause changes; every other finding is carried over untouched. */
export function buildV2(v1: ReviewData, rev: Revision, checkedAt: string): ReviewData {
  const base = v1.docs[2].name
  const name = base.replace(/(\.\w+)$/, '_rev2$1')
  const docs = v1.docs.map((d, i) => (i === 2 || d.role === 'Laporan' || d.role === 'Report' ? { ...d, name, meta: 'Laporan hasil revisi (simulasi)' } : d))
  const findings = v1.findings.map((f): Finding => {
    const evidence = f.evidence.map((e) => ({ ...e, docName: name }))
    if (f.id !== 'F-03') return { ...f, evidence }
    return {
      ...f,
      status: 'fulfilled',
      summary: 'Bukti pendukung telah ditambahkan pada analisis akar masalah.',
      evidence: [
        { id: 'E-03b', docRole: 'Laporan Insiden', docName: name, excerpt: rev.statement.trim(), location: 'Bagian Akar Masalah (revisi)', addedInVersion: 'V2' },
        { id: 'E-03c', docRole: 'Laporan Insiden', docName: name, excerpt: rev.evidence.trim(), location: 'Bagian Akar Masalah (revisi)', addedInVersion: 'V2' },
      ],
      explanation: 'Hasil simulasi: bukti pendukung telah ditambahkan pada bagian Akar Masalah di V2, sehingga persyaratan SOP 5.1 kini berstatus Terpenuhi. Seluruh temuan lainnya tidak berubah.',
      recommendation: 'Tidak memerlukan tindakan lebih lanjut untuk persyaratan ini.',
    }
  })
  return assemble(v1.id, v1.title, 'V2', docs, checkedAt, findings,
    'Pada V2, akar masalah telah didukung oleh bukti yang ditambahkan saat revisi sehingga berstatus Terpenuhi. Dua poin masih perlu diselesaikan: tindakan pencegahan beserta penanggung jawab belum dicantumkan, dan catatan komunikasi nasabah masih perlu ditinjau manual.',
    recsV1.filter((r) => r.id !== 'R-2'))
}

/** The first review in the demo is the INC-2026-014 scenario; later independent reviews get the next free ID. */
export function nextReviewId(existing: string[]): string {
  if (!existing.includes(REVIEW_ID)) return REVIEW_ID
  const max = Math.max(...existing.map((i) => Number(i.match(/(\d+)$/)?.[1] ?? 0)))
  return `INC-2026-${String(max + 1).padStart(3, '0')}`
}
