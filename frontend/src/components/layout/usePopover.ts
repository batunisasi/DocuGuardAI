import { useEffect, useRef } from 'react'

/** Closes a popover on outside pointer interaction or Escape and returns focus to its trigger. */
export function usePopover(open: boolean, close: () => void) {
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const down = (e: PointerEvent) => {
      if (e.target instanceof Node && !root.current?.contains(e.target)) close()
    }
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        close()
        root.current?.querySelector<HTMLElement>('[data-trigger]')?.focus()
      }
    }
    document.addEventListener('pointerdown', down)
    document.addEventListener('keydown', key)
    return () => {
      document.removeEventListener('pointerdown', down)
      document.removeEventListener('keydown', key)
    }
  }, [open, close])
  return root
}
