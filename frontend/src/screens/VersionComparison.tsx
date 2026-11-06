import type { ReviewData } from '../data/review'
import { stepEyebrow } from '../data/screens'
import { useDemo } from '../state/DemoStore'
import { NoReviewState } from '../components/review/NoReviewState'
import { EmptyState } from '../components/ui/States'
import { Button } from '../components/ui/Button'
import { GlassPanel } from '../components/ui/Glass'
import { Icon } from '../components/ui/Icon'
import { SeverityBadge } from '../components/ui/SeverityBadge'
import { STATUS_META } from '../data/status'
import { StatusBadge, Tag } from '../components/ui/StatusBadge'

type Change = 'improved' | 'unchanged' | 'attention'
const changeMeta: Record<Change, { label: string; cls: string; icon: string }> = {
  improved: { label: 'Membaik', cls: 'bg-ok-soft text-ok', icon: 'up' },
  unchanged: { label: 'Tidak berubah', cls: 'bg-na-soft text-na', icon: 'check' },
  attention: { label: 'Perlu perhatian', cls: 'bg-partial-soft text-partial', icon: 'alert' },
}

export function VersionComparison() {
  const demo = useDemo()
  const prev = demo.reviews.V1
  const curr = demo.reviews.V2
  if (!prev) return <NoReviewState screen="Perbandingan versi" />
  if (!curr) {
    return (
      <div className="mx-auto max-w-xl pt-6">
        <GlassPanel variant="glass-strong">
          <EmptyState icon="compare" title="Belum ada versi kedua untuk dibandingkan"
            body={`${prev.id} baru memiliki versi V1. Revisi bagian akar masalah dan periksa ulang untuk membuat V2, lalu bandingkan kedua versi di halaman ini.`}
            action={<div className="mt-2 flex flex-wrap justify-center gap-2"><Button icon="refresh" onClick={demo.openRevision}>Revisi akar masalah</Button><Button variant="glass" onClick={() => demo.navigate('result')}>Kembali ke hasil</Button></div>} />
        </GlassPanel>
      </div>
    )
  }
  return <ComparisonBody prev={prev} curr={curr} />
}

function ComparisonBody({ prev, curr }: { prev: ReviewData; curr: ReviewData }) {
  const { openRecord: onOpenResult, navigate: onNavigate, hrFor } = useDemo()
  const hr = hrFor('V2')
  const rows = prev.findings.map((f, i) => {
    const g = curr.findings[i]
    const change: Change = f.status !== g.status ? 'improved' : g.status === 'fulfilled' || g.status === 'na' ? 'unchanged' : 'attention'
    const added = g.evidence.filter((e) => e.addedInVersion === 'V2')
    return { prev: f, curr: g, change, added }
  })
  const improved = rows.filter((r) => r.change === 'improved')
  const unchanged = rows.filter((r) => r.change === 'unchanged')
  const unresolved = rows.filter((r) => r.change === 'attention')

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="eyebrow mb-2">{stepEyebrow('compare', 'Perbandingan versi')}</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{curr.id}: V1 ke V2</h1>
          <p className="mt-1.5 text-ink-2">{curr.title}. Membandingkan perubahan pada laporan hasil revisi untuk setiap temuan. Data demonstrasi simulasi.</p>
        </div>
        <div className="flex gap-2"><Button variant="glass" onClick={() => onNavigate('history')}>Kembali ke riwayat</Button><Button variant="glass" onClick={() => onOpenResult(curr.id, 'V1')}>Buka hasil V1</Button><Button icon="arrow" onClick={() => onOpenResult(curr.id, 'V2')}>Buka hasil terbaru (V2)</Button></div>
      </div>

      {/* Version pair */}
      <div className="grid items-stretch gap-3 md:grid-cols-[1fr_auto_1fr]">
        {[{ d: prev, tag: 'Versi sebelumnya', latest: false }, null, { d: curr, tag: 'Versi saat ini', latest: true }].map((x) =>
          x === null ? (
            <div key="arrow" className="hidden items-center justify-center md:flex"><span className="grid size-11 place-items-center rounded-full bg-brand text-white shadow-float"><Icon name="arrow" /></span></div>
          ) : (
            <GlassPanel key={x.d.version} variant={x.latest ? 'glass-strong' : 'glass'} className={`p-5 ${x.latest ? 'ring-1 ring-brand/30' : ''}`}>
              <div className="flex flex-wrap items-center gap-2"><p className="eyebrow">{x.tag}</p>{x.latest && <Tag>Terbaru</Tag>}</div>
              <p className="mt-1 text-2xl font-semibold tracking-tight">{x.d.version}</p>
              <p className="text-sm text-ink-2">{x.d.docs[2].name}</p>
              <p className="mt-0.5 text-xs text-ink-3">Diperiksa {x.d.checkedAt} · {x.d.docs[2].meta}</p>
              <p className="mt-3 text-sm font-medium">{x.d.findings.filter((f) => f.status === 'fulfilled').length} dari {x.d.findings.length} temuan terpenuhi</p>
            </GlassPanel>
          ))}
      </div>

      {/* Outcome groups */}
      <div className="grid gap-4 md:grid-cols-3" aria-label="Ringkasan perubahan">
        {([['improved', improved], ['unchanged', unchanged], ['attention', unresolved]] as const).map(([c, list]) => (
          <section key={c} className="surface p-5">
            <div className="flex items-center justify-between gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${changeMeta[c].cls}`}><Icon name={changeMeta[c].icon} size={14} />{changeMeta[c].label}</span>
              <span className="text-3xl font-semibold tracking-tight">{list.length}</span>
            </div>
            <ul className="mt-3 space-y-1.5 text-sm text-ink-2">{list.map((r) => <li key={r.prev.id}>{r.prev.title}</li>)}</ul>
            {c === 'unchanged' && <p className="mt-3 text-xs text-ink-3">Sudah terpenuhi pada V1 dan tetap terpenuhi pada V2.</p>}
            {c === 'attention' && <p className="mt-3 text-xs text-ink-3">Belum terselesaikan pada kedua versi. Tidak ada perubahan pada temuan ini.</p>}
          </section>
        ))}
      </div>

      {/* Evidence change */}
      {improved.map((r) => (
        <GlassPanel key={r.prev.id} variant="glass-strong" className="p-5 sm:p-7" aria-label={`Perubahan bukti untuk ${r.prev.title}`}>
          <p className="eyebrow mb-1">Perubahan bukti yang relevan</p>
          <h2 className="text-lg font-semibold tracking-tight">{r.prev.title}</h2>
          <p className="mt-1 text-sm text-ink-2">Berubah dari <strong>{STATUS_META[r.prev.status].label}</strong> menjadi <strong>{STATUS_META[r.curr.status].label}</strong> karena bukti pendukung telah ditambahkan ke dalam laporan.</p>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <figure className="surface m-0 !rounded-2xl p-4">
              <figcaption className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wider text-ink-3 uppercase">V1 · {r.prev.evidence[0].location}<StatusBadge status={r.prev.status} /></figcaption>
              <blockquote className="m-0 border-l-[3px] border-navy/20 pl-3.5 text-ink-2">{r.prev.evidence[0].excerpt}</blockquote>
              <p className="mt-3 text-xs text-ink-3">Tidak ada rujukan log atau catatan perubahan pendukung yang dicantumkan.</p>
            </figure>
            <figure className="surface m-0 !rounded-2xl !border-brand/35 p-4">
              <figcaption className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wider text-ink-3 uppercase">V2 · {r.added[0]?.location}<StatusBadge status={r.curr.status} /></figcaption>
              {r.added.map((e) => (
                <blockquote key={e.id} className="mt-3 mb-0 rounded-r-lg border-l-[3px] border-brand bg-mint/50 py-2 pr-3 pl-3.5 text-ink">
                  <span className="mb-1 flex items-center gap-1.5 text-xs font-semibold tracking-wider text-brand uppercase"><Icon name="plus" size={12} />Ditambahkan di V2</span>{e.excerpt}
                </blockquote>
              ))}
            </figure>
          </div>
          <p className="mt-3 text-xs text-ink-3">Dokumen sumber untuk V2: {r.added[0]?.docName}. Kutipan di atas merupakan data simulasi.</p>
        </GlassPanel>
      ))}

      {/* Full table */}
      <section className="surface overflow-hidden" aria-labelledby="cmp-h">
        <div className="p-5 pb-3 sm:p-6 sm:pb-3"><p className="eyebrow mb-1">Semua temuan</p><h2 id="cmp-h" className="text-lg font-semibold tracking-tight">Status pada setiap versi</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead><tr className="border-y border-navy/8 bg-canvas/70 text-xs text-ink-3">
              {['Temuan', 'V1 · sebelumnya', 'V2 · saat ini', 'Perubahan', 'Tingkat Keparahan'].map((h) => <th key={h} scope="col" className="px-5 py-2.5 font-semibold first:sm:pl-6">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-navy/5">
              {rows.map((r) => (
                <tr key={r.prev.id} className={r.change === 'improved' ? 'bg-ok-soft/40' : ''}>
                  <td className="px-5 py-3.5 sm:pl-6"><p className="font-semibold">{r.prev.title}</p><p className="text-xs text-ink-3">{r.prev.id} · {r.prev.sopRef}</p></td>
                  <td className="px-5 py-3.5"><StatusBadge status={r.prev.status} /></td>
                  <td className="px-5 py-3.5"><StatusBadge status={r.curr.status} /></td>
                  <td className="px-5 py-3.5"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${changeMeta[r.change].cls}`}><Icon name={changeMeta[r.change].icon} size={13} />{changeMeta[r.change].label}</span></td>
                  <td className="px-5 py-3.5"><SeverityBadge severity={r.curr.severity} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="border-t border-navy/8 px-5 py-3 text-xs text-ink-3">Tingkat keparahan ditampilkan secara terpisah dan tidak berubah mengikuti status pemenuhan. Perbandingan ini merupakan simulasi demonstrasi.</p>
      </section>

      <GlassPanel className="p-5 sm:p-6">
        <h2 className="text-lg font-semibold tracking-tight">Masih perlu diselesaikan pada V2</h2>
        <ul className="mt-3 grid gap-3 md:grid-cols-2">
          {unresolved.map((r) => (
            <li key={r.prev.id} className="surface !rounded-2xl p-4">
              <div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{r.prev.title}</p><StatusBadge status={r.curr.status} /></div>
              <p className="mt-1.5 text-sm text-ink-2">{r.curr.recommendation}</p>
              <p className="mt-2 text-xs text-ink-3">Tidak ada bukti baru yang ditambahkan pada V2.{r.curr.status === 'needs_review' && hr.status !== 'pending' && <> Tinjauan manual: {hr.status === 'reviewed' ? 'selesai ditinjau' : 'catatan disimpan'}. Status AI tetap tidak berubah.</>}</p>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button icon="arrow" onClick={() => onOpenResult(curr.id, 'V2')}>Buka hasil terbaru (V2)</Button>
          <Button variant="glass" icon="user" onClick={() => onNavigate('human')}>Tinjauan manual</Button>
        </div>
      </GlassPanel>
    </div>
  )
}
