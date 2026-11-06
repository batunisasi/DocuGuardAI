import { useId } from 'react'

export function LogoMark({ size = 36 }: { size?: number }) {
  const rawId = useId()
  const gradId = `lm-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#477C76" /><stop offset="1" stopColor="#174C4A" /></linearGradient>
      </defs>
      <path d="M24 3l17 6.5V22c0 11-7 19.5-17 23C14 41.500 7 33 7 22V9.500z" fill={`url(#${gradId})`} />
      <path d="M24 3l17 6.5V22c0 11-7 19.500-17 23z" fill="#FFFEFA" opacity=".12" />
      <path d="M24 4.2l15.8 6V22c0 10.2-6.5 18.2-15.8 21.6-9.3-3.4-15.8-11.4-15.8-21.6V10.2z" fill="none" stroke="#D5B77A" strokeOpacity=".45" strokeWidth="1" />
      <path d="M16 24.500l6 6 11-12" fill="none" stroke="#FFFEFA" strokeWidth="3.200" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Wordmark({ light = false }: { light?: boolean }) {
  return (
    <div className="leading-none">
      <p className={`text-[15px] font-semibold tracking-tight ${light ? 'text-[#FFFEFA]' : 'text-ink'}`}>
        DocuGuard <span className={light ? 'text-champagne' : 'text-brand'}>AI</span>
      </p>
      <p className={`mt-1 text-[10px] font-medium tracking-[0.14em] uppercase ${light ? 'text-[#FFFEFA]/60' : 'text-ink-3'}`}>
        Periksa. Verifikasi. Tingkatkan.
      </p>
    </div>
  )
}
