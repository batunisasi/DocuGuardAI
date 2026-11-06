/** Decorative 3D glass shield — the single hero "object" of the dashboard. */
export function FloatingShield() {
  return (
    <div className="relative size-56 select-none" aria-hidden="true">
      <div className="absolute inset-6 rounded-full bg-brand/18 blur-3xl" />
      <svg viewBox="0 0 200 220" className="float absolute inset-0 drop-shadow-[0_26px_28px_rgba(23,76,74,0.28)]">
        <defs>
          <linearGradient id="sh1" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#477C76" /><stop offset=".55" stopColor="#174C4A" /><stop offset="1" stopColor="#123D3B" />
          </linearGradient>
          <linearGradient id="sh2" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#FFFEFA" stopOpacity=".65" /><stop offset=".55" stopColor="#FFFEFA" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="sh3" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#FFFEFA" stopOpacity=".5" /><stop offset="1" stopColor="#EAF1ED" stopOpacity=".15" />
          </linearGradient>
        </defs>
        <path d="M100 10l76 30v62c0 55-34 90-76 108-42-18-76-53-76-108V40z" fill="url(#sh1)" />
        <path d="M100 10l76 30v62c0 55-34 90-76 108z" fill="#263331" opacity=".16" />
        <path d="M100 10l76 30v62c0 55-34 90-76 108-42-18-76-53-76-108V40z" fill="url(#sh2)" />
        <path d="M100 30l58 23v49c0 42-26 70-58 85-32-15-58-43-58-85V53z" fill="url(#sh3)" stroke="#D5B77A" strokeOpacity=".55" strokeWidth="1.500" />
        <path d="M72 108l20 21 38-42" fill="none" stroke="#FFFEFA" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="float absolute -left-4 top-24 grid h-14 w-11 place-items-center rounded-xl border border-border bg-paper/70 shadow-float backdrop-blur-md" style={{ ['--r' as string]: '-10deg', animationDelay: '-2s' }}>
        <div className="space-y-1.5"><i className="block h-1 w-6 rounded bg-brand/60" /><i className="block h-1 w-6 rounded bg-brand/35" /><i className="block h-1 w-4 rounded bg-champagne/70" /></div>
      </div>
      <div className="float absolute -right-3 top-8 size-9 rounded-full border border-champagne/45 bg-gradient-to-br from-paper/85 to-champagne/35 shadow-float backdrop-blur-md" style={{ animationDelay: '-4s' }} />
    </div>
  )
}
