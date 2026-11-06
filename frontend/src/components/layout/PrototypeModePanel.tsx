import { useId } from 'react'
import { useDemo } from '../../state/DemoStore'
import { Icon } from '../ui/Icon'

export function usePrototypeProgress() {
  const demo = useDemo()
  const { reviews, visited, allReady, anyReviewed } = demo
  const steps = [
    { id: 'upload', label: 'Unggah tiga dokumen', done: allReady || Boolean(reviews.V1) },
    { id: 'v1', label: 'Jalankan simulasi pemeriksaan AI (V1)', done: Boolean(reviews.V1) },
    { id: 'findings', label: 'Periksa temuan dan bukti', done: visited.findings },
    { id: 'human', label: 'Catat keputusan tinjauan manual', done: anyReviewed },
    { id: 'v2', label: 'Revisi akar masalah dan periksa ulang (V2)', done: Boolean(reviews.V2) },
    { id: 'compare', label: 'Bandingkan V1 dan V2', done: Boolean(reviews.V2) && visited.compare },
  ]
  const doneCount = steps.filter((s) => s.done).length
  return { steps, doneCount, totalCount: steps.length }
}

type Props = {
  open: boolean
  onToggle: () => void
  onSelect: (id: string) => void
  onAfterAction?: () => void
  floating?: boolean
}

export function PrototypeModePanel({ open, onToggle, onSelect, onAfterAction, floating = false }: Props) {
  const panelId = useId()
  const demo = useDemo()
  const { reviews, visited, allReady, anyReviewed, processing } = demo
  const { steps, doneCount, totalCount } = usePrototypeProgress()
  const pct = Math.round((doneCount / totalCount) * 100)

  const next = !reviews.V1
    ? {
        label: allReady ? 'Mulai Pemeriksaan AI' : 'Unggah Dokumen',
        run: () => (allReady ? demo.startReview() : onSelect('new')),
      }
    : !visited.findings
      ? { label: 'Periksa Temuan & Bukti', run: () => onSelect('findings') }
      : !anyReviewed
        ? { label: 'Catat Tinjauan Manual', run: () => onSelect('human') }
        : !reviews.V2
          ? { label: 'Revisi Akar Masalah (V2)', run: () => demo.openRevision() }
          : !visited.compare
            ? { label: 'Bandingkan V1 dan V2', run: () => onSelect('compare') }
            : { label: 'Buka Riwayat Pemeriksaan', run: () => onSelect('history') }

  const handleLoadCase = () => {
    demo.loadDemoReview()
    if (demo.active === 'new' || demo.active === 'history' || demo.active === 'processing' || demo.sampleTarget) {
      onSelect('result')
    }
    onAfterAction?.()
  }

  const handleLoadSampleDocs = () => {
    demo.withGuard(() => {
      demo.loadSamples()
      onSelect('new')
      onAfterAction?.()
    })
  }

  const handleSimulateUploadError = (kind: 'format' | 'scanned') => {
    demo.withGuard(() => {
      demo.addDemoFile(kind)
      onSelect('new')
      onAfterAction?.()
    })
  }

  return (
    <section
      aria-label="Mode Prototype"
      className={`rounded-2xl border border-white/14 bg-white/[0.06] text-xs text-white/80 transition-colors ${
        floating ? 'shadow-[0_28px_56px_-20px_rgb(18_61_59/0.65),inset_0_1px_0_rgb(255_254_250/0.18)]' : ''
      }`}
      style={floating ? { background: 'var(--sidebar-bg)' } : undefined}
    >
      {/* Header / Toggle Bar */}
      <div className="flex items-center gap-1.5 p-2.5">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={panelId}
          title={open ? 'Ciutkan Mode Prototype' : 'Perluas Mode Prototype'}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-xl px-1.5 py-1 text-left transition hover:bg-white/8"
        >
          <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-champagne/18 text-champagne">
            <Icon name="spark" size={15} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5 font-semibold text-[#FFFEFA]">
              <span className="truncate">Mode Prototype</span>
              <span
                className="rounded-full bg-white/12 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-champagne"
                title={`Progres panduan demo: ${doneCount} dari ${totalCount} langkah selesai`}
              >
                {doneCount}/{totalCount}
              </span>
            </span>
            <span className="mt-1 block h-1 w-full overflow-hidden rounded-full bg-white/12" aria-hidden="true">
              <span
                className="block h-full rounded-full bg-champagne transition-[width] duration-300"
                style={{ width: `${pct}%` }}
              />
            </span>
          </span>
          <Icon
            name="chevron-down"
            size={16}
            className={`shrink-0 text-white/65 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </button>

        <button
          type="button"
          onClick={() => {
            demo.requestReset()
            onAfterAction?.()
          }}
          aria-label="Reset data demo"
          title="Reset data demo ke kondisi awal"
          className="grid size-8 shrink-0 place-items-center rounded-xl border border-white/12 bg-white/8 text-white/75 transition hover:border-champagne/40 hover:bg-white/16 hover:text-[#FFFEFA]"
        >
          <Icon name="refresh" size={14} />
        </button>
      </div>

      {/* Collapsible Content */}
      {open && (
        <div
          id={panelId}
          className="max-h-[46vh] space-y-3.5 overflow-y-auto border-t border-white/10 px-3 pt-3 pb-3.5"
        >
          <p className="leading-relaxed text-white/65">
            Kontrol panduan dan simulasi prototipe. Seluruh hasil AI pada ruang kerja ini merupakan data demonstrasi.
          </p>

          {/* 1. Demo Walkthrough Progress & Checklist */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] font-semibold tracking-wider text-white/50 uppercase">
              <span>Progres panduan demo</span>
              <span className="tabular-nums text-champagne">{pct}% selesai</span>
            </div>
            <ol className="space-y-1">
              {steps.map((st, i) => (
                <li
                  key={st.id}
                  className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-[11px] leading-snug ${
                    st.done ? 'bg-white/10 font-medium text-[#FFFEFA]' : 'bg-white/[0.03] text-white/65'
                  }`}
                >
                  <span
                    className={`grid size-4 shrink-0 place-items-center rounded-full text-[9px] font-semibold ${
                      st.done ? 'bg-champagne text-[#123D3B]' : 'bg-white/12 text-white/60'
                    }`}
                  >
                    {st.done ? <Icon name="check" size={10} /> : i + 1}
                  </span>
                  <span className="flex-1">{st.label}</span>
                </li>
              ))}
            </ol>
            <button
              type="button"
              onClick={() => {
                next.run()
                onAfterAction?.()
              }}
              title={`Lanjutkan panduan demo: ${next.label}`}
              className="flex min-h-9 w-full items-center justify-between gap-2 rounded-xl border border-champagne/40 bg-champagne/18 px-3 py-1.5 text-left text-xs font-semibold text-[#FFFEFA] transition hover:bg-champagne/28"
            >
              <span className="truncate">Langkah berikutnya: {next.label}</span>
              <Icon name="arrow" size={14} className="shrink-0 text-champagne" />
            </button>
          </div>

          {/* 2. Demonstration Shortcuts */}
          <div className="space-y-1.5 border-t border-white/10 pt-3">
            <p className="text-[10px] font-semibold tracking-wider text-white/50 uppercase">Pintasan demonstrasi</p>
            <div className="grid gap-1.5">
              <button
                type="button"
                onClick={handleLoadCase}
                title="Muat langsung kasus contoh INC-2026-014 (V1) untuk menjelajahi hasil pemeriksaan"
                className="flex min-h-8 w-full items-center gap-2 rounded-xl border border-white/12 bg-white/8 px-2.5 py-1.5 text-left font-medium text-[#FFFEFA] transition hover:border-champagne/35 hover:bg-white/14"
              >
                <Icon name="shield" size={14} className="shrink-0 text-champagne" />
                <span className="flex-1 truncate">Muat kasus contoh (INC-2026-014)</span>
              </button>
              <button
                type="button"
                onClick={handleLoadSampleDocs}
                title="Isi otomatis ketiga slot unggahan dengan dokumen contoh"
                className="flex min-h-8 w-full items-center gap-2 rounded-xl border border-white/12 bg-white/8 px-2.5 py-1.5 text-left font-medium text-[#FFFEFA] transition hover:border-champagne/35 hover:bg-white/14"
              >
                <Icon name="file" size={14} className="shrink-0 text-champagne" />
                <span className="flex-1 truncate">Isi 3 dokumen unggahan contoh</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onSelect('processing')
                  onAfterAction?.()
                }}
                title="Buka layar tahapan Pemrosesan AI"
                className="flex min-h-8 w-full items-center gap-2 rounded-xl border border-white/12 bg-white/8 px-2.5 py-1.5 text-left font-medium text-[#FFFEFA] transition hover:border-champagne/35 hover:bg-white/14"
              >
                <Icon name="spark" size={14} className="shrink-0 text-champagne" />
                <span className="flex-1 truncate">Buka layar Pemrosesan AI</span>
                {processing.status === 'running' && (
                  <span className="rounded-full bg-champagne/20 px-1.5 py-0.5 text-[9px] font-semibold text-champagne">
                    Aktif
                  </span>
                )}
              </button>
              {reviews.V1 && !reviews.V2 && (
                <button
                  type="button"
                  onClick={() => {
                    demo.openRevision()
                    onAfterAction?.()
                  }}
                  title="Buka dialog revisi akar masalah untuk membuat versi V2"
                  className="flex min-h-8 w-full items-center gap-2 rounded-xl border border-white/12 bg-white/8 px-2.5 py-1.5 text-left font-medium text-[#FFFEFA] transition hover:border-champagne/35 hover:bg-white/14"
                >
                  <Icon name="refresh" size={14} className="shrink-0 text-champagne" />
                  <span className="flex-1 truncate">Simulasi revisi &amp; buat V2</span>
                </button>
              )}
            </div>
          </div>

          {/* 3. File Upload Error Simulator Controls */}
          <div className="space-y-1.5 border-t border-white/10 pt-3">
            <p className="text-[10px] font-semibold tracking-wider text-white/50 uppercase">
              Simulator kendala unggahan
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => handleSimulateUploadError('format')}
                title="Simulasikan unggahan file dengan format tidak didukung (.txt)"
                className="flex min-h-8 items-center justify-center gap-1.5 rounded-xl border border-white/12 bg-white/8 px-2 py-1.5 text-[11px] font-medium text-white/85 transition hover:border-champagne/35 hover:bg-white/14 hover:text-[#FFFEFA]"
              >
                <Icon name="alert" size={13} className="shrink-0 text-champagne" />
                <span className="truncate">Format salah</span>
              </button>
              <button
                type="button"
                onClick={() => handleSimulateUploadError('scanned')}
                title="Simulasikan unggahan file PDF hasil pindaian (scan gambar tanpa teks)"
                className="flex min-h-8 items-center justify-center gap-1.5 rounded-xl border border-white/12 bg-white/8 px-2 py-1.5 text-[11px] font-medium text-white/85 transition hover:border-champagne/35 hover:bg-white/14 hover:text-[#FFFEFA]"
              >
                <Icon name="alert" size={13} className="shrink-0 text-champagne" />
                <span className="truncate">File pindaian</span>
              </button>
            </div>

            <label
              title="Hentikan pemrosesan AI pada tahap ekstraksi teks untuk menguji tampilan gagal dan coba ulang"
              className="mt-1.5 flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-2.5 py-2 text-[11px] text-white/80 transition hover:bg-white/8"
            >
              <input
                type="checkbox"
                checked={processing.failDemo}
                onChange={(e) => demo.setFailDemo(e.target.checked)}
                className="size-3.5 shrink-0 accent-[#D5B77A]"
              />
              <span className="flex-1">Simulasikan gagal ekstraksi AI</span>
            </label>
          </div>

          {/* 4. Full Demo Reset */}
          <div className="border-t border-white/10 pt-2.5">
            <button
              type="button"
              onClick={() => {
                demo.requestReset()
                onAfterAction?.()
              }}
              title="Kembalikan seluruh data simulasi ke kondisi awal"
              className="flex min-h-8 w-full items-center justify-center gap-1.5 rounded-xl border border-white/18 bg-white/10 px-3 py-1.5 text-xs font-semibold text-[#FFFEFA] transition hover:bg-white/18"
            >
              <Icon name="refresh" size={14} />
              <span>Reset demo</span>
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
