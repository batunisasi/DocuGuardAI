import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Icon } from './Icon'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'glass' | 'ghost' | 'danger'
  icon?: string
  children?: ReactNode
}

const styles = {
  primary: 'text-[#FFFEFA] bg-brand shadow-[0_10px_22px_-10px_rgb(23_76_74/0.55),inset_0_1px_0_rgb(255_254_250/0.25)] hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-[0_14px_26px_-10px_rgb(18_61_59/0.65),inset_0_1px_0_rgb(255_254_250/0.3)]',
  glass: 'text-ink bg-paper/75 border border-border backdrop-blur hover:-translate-y-0.5 hover:bg-paper hover:border-sage/45',
  ghost: 'text-ink-2 hover:bg-brand-soft/75',
  danger: 'text-[#FFFEFA] bg-missing shadow-[0_10px_22px_-10px_rgb(166_58_53/0.5),inset_0_1px_0_rgb(255_254_250/0.25)] hover:-translate-y-0.5 hover:bg-sev-critical hover:shadow-[0_14px_26px_-10px_rgb(140_38_34/0.6),inset_0_1px_0_rgb(255_254_250/0.3)]',
}

export function Button({ variant = 'primary', icon, children, className = '', ...rest }: Props) {
  return (
    <button {...rest}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-control px-4 text-sm font-semibold transition duration-200 active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}>
      {icon && <Icon name={icon} size={18} />}
      {children}
    </button>
  )
}
