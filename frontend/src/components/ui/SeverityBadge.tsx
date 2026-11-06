import { SEVERITY_META, type Severity } from '../../data/status'

const tone: Record<Severity, string> = {
  information: 'border-border bg-paper text-sev-info',
  minor: 'border-champagne/65 bg-sev-minor-soft text-sev-minor',
  major: 'border-partial/45 bg-sev-major-soft text-sev-major',
  critical: 'border-missing/45 bg-sev-critical-soft text-sev-critical',
}

/** Severity uses rectangular framing, signal bars, and dedicated semantic severity tokens so it remains orthogonal to compliance status pills. */
export function SeverityBadge({ severity }: { severity: Severity }) {
  const m = SEVERITY_META[severity]
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-semibold ${tone[severity]}`}>
      <svg width="14" height="12" viewBox="0 0 14 12" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={i * 3.6} y={9 - i * 3} width="2.4" height={3 + i * 3} rx="0.8" fill="currentColor" opacity={i < m.level ? 1 : 0.22} />
        ))}
      </svg>
      <span className="sr-only">Tingkat keparahan: </span>{m.label}
    </span>
  )
}
