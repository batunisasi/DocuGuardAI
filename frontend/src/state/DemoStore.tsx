import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { buildV1, buildV2, EMPTY_REVISION, nextReviewId, REVIEW_ID, REVIEW_TITLE, slotMeta, stages, type DocInfo, type ReviewData, type Revision, type SlotId, type VersionId } from '../data/review'
import { sampleRecords, type HistoryRecord } from '../data/history'
import { isScreen } from '../data/screens'
import type { FindingStatus } from '../data/status'
import { extOf, formatSize, validateFile } from '../lib/validateFile'

/* ------------------------------------------------------------------
   DemoStore: the single source of truth for the whole prototype.
   - `cases` holds every review created in the demo (never silently deleted).
   - Human review records belong to one specific version of one case.
   - The URL hash mirrors the current screen / review / version.
   - State is persisted in localStorage; Reset demo clears it.
   ------------------------------------------------------------------ */

const STORAGE_KEY = 'docuguard-demo-state-v3-id'

export type Slot = {
  file: { name: string; size: number; lastModified?: number } | null
  status: 'empty' | 'uploading' | 'ready' | 'invalid'
  progress: number
  error?: string
  code?: string
}
export type Processing = { mode: 'initial' | 'recheck' | null; status: 'idle' | 'running' | 'failed' | 'done'; step: number; failDemo: boolean }
export type HumanEvent = { id: number; by: 'ai' | 'human'; label: string; detail?: string; at: string }
export type FindingHumanRecord = {
  status: 'pending' | 'draft' | 'reviewed'
  determination: FindingStatus | null
  notes: string
  reviewer: string
  at: string | null
  events: HumanEvent[]
}
/** The reviewer record is stored separately from the AI assessment, which is never modified. */
export type HumanState = FindingHumanRecord & {
  byFinding?: Record<string, FindingHumanRecord>
}
export type Case = {
  id: string
  title: string
  reviews: Partial<Record<VersionId, ReviewData>>
  /** Human review record per version (with optional per-finding granularity). */
  hr: Partial<Record<VersionId, HumanState>>
  revision: Revision
}
export type Toast = { id: number; tone: 'success' | 'info' | 'warning' | 'error'; text: string }
export type Visited = { findings: boolean; human: boolean; history: boolean; compare: boolean }

type State = {
  active: string
  slots: Record<SlotId, Slot>
  textConfirmed: boolean
  slotsConsumed: boolean
  processing: Processing
  cases: Case[]
  currentId: string | null
  viewVersion: VersionId
  sampleTarget: { id: string; version: string } | null
  focusFinding: string | null
  visited: Visited
  notifSeen: string[]
  toast: Toast | null
  unsaved: boolean
  resetOpen: boolean
  revisionOpen: boolean
}

const blank: Slot = { file: null, status: 'empty', progress: 0 }
const INITIAL_SLOT_PROGRESS: Record<SlotId, number> = { sop: 0, template: 0, report: 0 }
const EMPTY_REVIEWS: Partial<Record<VersionId, ReviewData>> = {}
const reviewer = 'Ummu Diana'

/** Demo clock: fixed demo date, real time of day. */
export const demoNow = () => `9 Jun 2026, ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`

let toastId = 1
const toast = (tone: Toast['tone'], text: string): Toast => ({ id: toastId++, tone, text })

const newHuman = (label: string, detail: string): HumanState => ({
  status: 'pending', determination: null, notes: '', reviewer, at: null,
  events: [{ id: 0, by: 'ai', label, detail, at: demoNow() }],
})
const pendingHuman = (): HumanState => ({ status: 'pending', determination: null, notes: '', reviewer, at: null, events: [] })
const pushEvent = (hr: FindingHumanRecord, label: string, detail?: string): HumanEvent[] => [...hr.events, { id: hr.events.length, by: 'human', label: detail ? `${label}` : label, detail, at: demoNow() }]

const initialState = (): State => ({
  active: 'dashboard',
  slots: { sop: blank, template: blank, report: blank },
  textConfirmed: false,
  slotsConsumed: false,
  processing: { mode: null, status: 'idle', step: 0, failDemo: false },
  cases: [],
  currentId: null,
  viewVersion: 'V1',
  sampleTarget: null,
  focusFinding: null,
  visited: { findings: false, human: false, history: false, compare: false },
  notifSeen: [],
  toast: null,
  unsaved: false,
  resetOpen: false,
  revisionOpen: false,
})

/* ---- validation & persistence ---- */
const VALID_STATUSES = new Set<FindingStatus>(['fulfilled', 'partial', 'not_found', 'na', 'needs_review'])
const isObj = (v: unknown): v is Record<string, unknown> => Boolean(v) && typeof v === 'object' && !Array.isArray(v)

function sanitizeSlot(raw: unknown): Slot {
  if (!isObj(raw)) return blank
  const status = raw.status
  // An interrupted upload cannot resume across page reloads
  if (status !== 'ready' && status !== 'invalid') return blank
  if (!isObj(raw.file) || typeof raw.file.name !== 'string' || typeof raw.file.size !== 'number') return blank
  return {
    file: {
      name: raw.file.name,
      size: raw.file.size,
      ...(typeof raw.file.lastModified === 'number' ? { lastModified: raw.file.lastModified } : {}),
    },
    status,
    progress: status === 'ready' ? 100 : 0,
    ...(typeof raw.error === 'string' ? { error: raw.error } : {}),
    ...(typeof raw.code === 'string' ? { code: raw.code } : {}),
  }
}

function isValidReviewData(raw: unknown): raw is ReviewData {
  if (!isObj(raw)) return false
  if (typeof raw.id !== 'string' || typeof raw.title !== 'string') return false
  if (raw.version !== 'V1' && raw.version !== 'V2') return false
  if (!Array.isArray(raw.docs) || raw.docs.length < 3 || !raw.docs.every((d) => isObj(d) && typeof d.name === 'string' && typeof d.role === 'string')) return false
  if (!Array.isArray(raw.findings) || raw.findings.length === 0) return false
  const validFindings = raw.findings.every((f) =>
    isObj(f) &&
    typeof f.id === 'string' &&
    typeof f.title === 'string' &&
    VALID_STATUSES.has(f.status as FindingStatus) &&
    isObj(f.requirement) &&
    typeof f.requirement.ref === 'string' &&
    typeof f.requirement.text === 'string' &&
    Array.isArray(f.evidence),
  )
  if (!validFindings) return false
  if (!Array.isArray(raw.sopAssessment) || !Array.isArray(raw.templateAssessment) || !Array.isArray(raw.recommendations)) return false
  return true
}

function sanitizeHumanRecord(raw: unknown): FindingHumanRecord {
  if (!isObj(raw)) return pendingHuman()
  const status = raw.status === 'pending' || raw.status === 'draft' || raw.status === 'reviewed' ? raw.status : 'pending'
  const determination = VALID_STATUSES.has(raw.determination as FindingStatus) ? (raw.determination as FindingStatus) : null
  const notes = typeof raw.notes === 'string' ? raw.notes : ''
  const rev = typeof raw.reviewer === 'string' && raw.reviewer.trim() ? raw.reviewer : reviewer
  const at = typeof raw.at === 'string' ? raw.at : null
  const events: HumanEvent[] = Array.isArray(raw.events)
    ? raw.events
        .filter((e): e is HumanEvent => isObj(e) && (e.by === 'ai' || e.by === 'human') && typeof e.label === 'string' && typeof e.at === 'string')
        .map((e, idx) => ({ id: typeof e.id === 'number' ? e.id : idx, by: e.by, label: e.label, ...(typeof e.detail === 'string' ? { detail: e.detail } : {}), at: e.at }))
    : []
  return { status, determination, notes, reviewer: rev, at, events }
}

function sanitizeHumanState(raw: unknown): HumanState {
  const base = sanitizeHumanRecord(raw)
  if (!isObj(raw) || !isObj(raw.byFinding)) return base
  const byFinding: Record<string, FindingHumanRecord> = {}
  for (const [k, v] of Object.entries(raw.byFinding)) {
    if (typeof k === 'string' && isObj(v)) byFinding[k] = sanitizeHumanRecord(v)
  }
  return Object.keys(byFinding).length > 0 ? { ...base, byFinding } : base
}

function sanitizeCase(raw: unknown): Case | null {
  if (!isObj(raw) || typeof raw.id !== 'string' || typeof raw.title !== 'string') return null
  if (!isObj(raw.reviews)) return null
  const reviews: Partial<Record<VersionId, ReviewData>> = {}
  if (isValidReviewData(raw.reviews.V1)) reviews.V1 = raw.reviews.V1
  if (isValidReviewData(raw.reviews.V2)) reviews.V2 = raw.reviews.V2
  if (!reviews.V1 && !reviews.V2) return null

  const hr: Partial<Record<VersionId, HumanState>> = {}
  if (isObj(raw.hr)) {
    if (raw.hr.V1) hr.V1 = sanitizeHumanState(raw.hr.V1)
    if (raw.hr.V2) hr.V2 = sanitizeHumanState(raw.hr.V2)
  }
  if (reviews.V1 && !hr.V1) hr.V1 = newHuman('Penilaian AI dibuat: Perlu Ditinjau Manual', 'Hasil pemeriksaan tahap awal (simulasi V1)')
  if (reviews.V2 && !hr.V2) hr.V2 = newHuman('Penilaian AI dibuat: Perlu Ditinjau Manual', 'Hasil pemeriksaan ulang (simulasi V2). Tinjauan manual untuk V2 masih menunggu.')

  const revision: Revision = isObj(raw.revision) && typeof raw.revision.statement === 'string' && typeof raw.revision.evidence === 'string'
    ? { statement: raw.revision.statement, evidence: raw.revision.evidence }
    : EMPTY_REVISION

  return { id: raw.id, title: raw.title, reviews, hr, revision }
}

function load(): State {
  const base = initialState()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return base
    const saved = JSON.parse(raw) as unknown
    if (!isObj(saved)) return base

    const rawSlots = isObj(saved.slots) ? saved.slots : {}
    const slots: Record<SlotId, Slot> = {
      sop: sanitizeSlot(rawSlots.sop),
      template: sanitizeSlot(rawSlots.template),
      report: sanitizeSlot(rawSlots.report),
    }

    const cases: Case[] = Array.isArray(saved.cases)
      ? saved.cases.map(sanitizeCase).filter((c): c is Case => c !== null)
      : []

    const active = typeof saved.active === 'string' && isScreen(saved.active) ? saved.active : base.active
    const currentId = typeof saved.currentId === 'string' && cases.some((c) => c.id === saved.currentId)
      ? saved.currentId
      : (cases[cases.length - 1]?.id ?? null)
    const curCase = cases.find((c) => c.id === currentId) ?? null
    const savedVer = saved.viewVersion === 'V1' || saved.viewVersion === 'V2' ? saved.viewVersion : 'V1'
    const viewVersion: VersionId = curCase && curCase.reviews[savedVer] ? savedVer : (latestOf(curCase) ?? 'V1')

    const visited: Visited = isObj(saved.visited)
      ? {
          findings: Boolean(saved.visited.findings),
          human: Boolean(saved.visited.human),
          history: Boolean(saved.visited.history),
          compare: Boolean(saved.visited.compare),
        }
      : base.visited

    const notifSeen = Array.isArray(saved.notifSeen)
      ? saved.notifSeen.filter((x): x is string => typeof x === 'string')
      : []

    // Safe recovery for interrupted processing on browser reload: never resume an orphaned timer
    const wasRunning = isObj(saved.processing) && saved.processing.status === 'running'
    const recoveryToast = wasRunning
      ? toast('info', 'Pemrosesan sebelumnya terhenti karena halaman dimuat ulang. Silakan mulai kembali pemeriksaan.')
      : null

    return {
      ...base,
      active,
      slots,
      textConfirmed: typeof saved.textConfirmed === 'boolean' ? saved.textConfirmed : false,
      slotsConsumed: typeof saved.slotsConsumed === 'boolean' ? saved.slotsConsumed : false,
      processing: base.processing,
      cases,
      currentId,
      viewVersion,
      sampleTarget: null,
      focusFinding: typeof saved.focusFinding === 'string' ? saved.focusFinding : null,
      visited,
      notifSeen,
      toast: recoveryToast,
      unsaved: false,
      resetOpen: false,
      revisionOpen: false,
    }
  } catch {
    return base
  }
}

function persist(s: State) {
  try {
    const { toast: _t, unsaved: _u, resetOpen: _r, revisionOpen: _v, sampleTarget: _st, processing: _p, ...rest } = s
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...rest, processing: s.processing.status === 'running' ? { ...s.processing, status: 'running' } : initialState().processing }))
  } catch { /* storage unavailable: demo still works without persistence */ }
}

/* ---- hash routing: #/screen?c=<review id>&v=<version> ---- */
type Route = { screen: string; c?: string; v?: string }
const CASE_SCREENS = ['result', 'findings', 'human', 'compare']
function parseHash(): Route | null {
  const m = window.location.hash.match(/^#\/([a-z]+)(?:\?(.*))?$/)
  if (!m || !isScreen(m[1])) return null
  const q = new URLSearchParams(m[2] ?? '')
  return { screen: m[1], c: q.get('c') ?? undefined, v: q.get('v') ?? undefined }
}
function resolveSampleTarget(id?: string, version?: string): { id: string; version: string } | null {
  if (!id) return null
  const sr = sampleRecords.find((x) => x.id === id && (!version || x.version === version)) ?? sampleRecords.find((x) => x.id === id)
  return sr ? { id: sr.id, version: sr.version } : null
}
const buildHash = (screen: string, c: string | null, v: string, sample?: { id: string; version: string } | null) => {
  if (screen === 'result' && sample) {
    return `#/result?c=${encodeURIComponent(sample.id)}&v=${encodeURIComponent(sample.version)}`
  }
  return `#/${screen}${CASE_SCREENS.includes(screen) && c ? `?c=${encodeURIComponent(c)}&v=${encodeURIComponent(v)}` : ''}`
}

const docMeta = (name: string, size: number) => `${extOf(name).toUpperCase()} · ${formatSize(size)}`
const docsFromSlots = (slots: Record<SlotId, Slot>): DocInfo[] =>
  slotMeta.map((m, i) => {
    const f = slots[m.id].file ?? m.sample
    return { role: ['SOP', 'Template', 'Laporan'][i], name: f.name, meta: docMeta(f.name, f.size) }
  })
const latestOf = (c?: Case | null): VersionId | null => (c?.reviews.V2 ? 'V2' : c?.reviews.V1 ? 'V1' : null)
const mapCase = (s: State, id: string | null, fn: (c: Case) => Case): State => ({ ...s, cases: s.cases.map((c) => (c.id === id ? fn(c) : c)) })

type Guard = { dirty: boolean; save: () => void; discard: () => void } | null

export type Demo = ReturnType<typeof useDemoValue>['demoValue']
const DemoContext = createContext<Demo | null>(null)
const UploadProgressContext = createContext<Record<SlotId, number>>(INITIAL_SLOT_PROGRESS)

function useDemoValue() {
  const [state, setState] = useState<State>(() => {
    const s = load()
    const r = parseHash()
    if (r) {
      const c = r.c ? s.cases.find((x) => x.id === r.c) : undefined
      const sr = !c && r.screen === 'result' ? resolveSampleTarget(r.c, r.v) : null
      return {
        ...s,
        active: r.screen,
        sampleTarget: sr,
        currentId: c ? c.id : s.currentId,
        viewVersion: c && r.v && c.reviews[r.v as VersionId] ? (r.v as VersionId) : (c ? latestOf(c) ?? 'V1' : s.viewVersion),
      }
    }
    return s
  })
  const [slotProgress, setSlotProgress] = useState<Record<SlotId, number>>(() => ({
    sop: state.slots.sop.progress,
    template: state.slots.template.progress,
    report: state.slots.report.progress,
  }))
  const timers = useRef<Partial<Record<SlotId, number>>>({})
  const guard = useRef<Guard>(null)
  const pending = useRef<(() => void) | null>(null)
  const ref = useRef(state)
  ref.current = state

  const patch = useCallback((p: Partial<State>) => setState((s) => ({ ...s, ...p })), [])
  const stopUpload = (id: SlotId) => { window.clearInterval(timers.current[id]); delete timers.current[id] }
  const stopAll = () => (Object.keys(timers.current) as SlotId[]).forEach(stopUpload)
  const say = useCallback((tone: Toast['tone'], text: string) => patch({ toast: toast(tone, text) }), [patch])
  const dismissToast = useCallback(() => patch({ toast: null }), [patch])

  /* ---- unsaved-changes protection (shared by navigation, version switch, new review, reset, revision) ---- */
  const withGuard = useCallback((run: () => void) => {
    if (guard.current?.dirty) { pending.current = run; patch({ unsaved: true }); return }
    run()
  }, [patch])
  const registerGuard = useCallback((g: Guard) => { guard.current = g }, [])
  const resolveUnsaved = useCallback((choice: 'save' | 'discard' | 'cancel') => {
    const run = pending.current
    pending.current = null
    patch({ unsaved: false })
    if (choice === 'cancel' || !run) return
    if (choice === 'save') guard.current?.save()
    else guard.current?.discard()
    run()
  }, [patch])

  /* ---- navigation ---- */
  const applyScreen = useCallback((id: string, extra?: { c?: string; v?: string }) => {
    window.scrollTo({ top: 0 })
    if (id === 'new' && ref.current.slotsConsumed) {
      setSlotProgress(INITIAL_SLOT_PROGRESS)
    }
    setState((s) => {
      const c = extra?.c ? s.cases.find((x) => x.id === extra.c) : undefined
      const sr = !c && id === 'result' ? resolveSampleTarget(extra?.c, extra?.v) : null
      const v = c && extra?.v && c.reviews[extra.v as VersionId] ? (extra.v as VersionId) : null
      let next: State = {
        ...s,
        active: id,
        sampleTarget: sr,
        currentId: c ? c.id : s.currentId,
        viewVersion: v ?? (c ? latestOf(c) ?? 'V1' : s.viewVersion),
        visited: { ...s.visited, ...(id in s.visited ? { [id]: true } : {}) } as Visited,
        // Leaving a finished or failed processing run resets it so it does not redirect or show stale failure on the next visit.
        // Active in-session runs ('running') continue in the background.
        processing: s.active === 'processing' && id !== 'processing' && (s.processing.status === 'done' || s.processing.status === 'failed') ? { ...s.processing, status: 'idle' } : s.processing,
      }
      // Entering New Review after a review consumed the uploads starts a clean upload form.
      if (id === 'new' && s.slotsConsumed) next = { ...next, slots: { sop: blank, template: blank, report: blank }, textConfirmed: false, slotsConsumed: false }
      return next
    })
  }, [])
  const go = useCallback((id: string) => applyScreen(id), [applyScreen])
  const navigate = useCallback((id: string) => { if (id === 'human' && ref.current.active === 'human') return; withGuard(() => { patch({ focusFinding: null }); applyScreen(id) }) }, [withGuard, applyScreen, patch])

  // state -> URL (push on screen or viewed record change, replace on initial sync)
  const firstSync = useRef(true)
  useEffect(() => {
    const want = buildHash(state.active, state.currentId, state.viewVersion, state.sampleTarget)
    if (window.location.hash === want) { firstSync.current = false; return }
    const prev = parseHash()
    const effC = state.active === 'result' && state.sampleTarget ? state.sampleTarget.id : state.currentId
    const effV = state.active === 'result' && state.sampleTarget ? state.sampleTarget.version : state.viewVersion
    const routeChanged = prev?.screen !== state.active || (Boolean(prev?.c) && (prev?.c !== effC || prev?.v !== effV))
    if (firstSync.current || !routeChanged) window.history.replaceState(null, '', want)
    else window.history.pushState(null, '', want)
    firstSync.current = false
  }, [state.active, state.currentId, state.viewVersion, state.sampleTarget])

  // URL -> state (browser Back / Forward / manual edit)
  useEffect(() => {
    const onHash = () => {
      const r = parseHash()
      const s = ref.current
      if (!r) return
      const effC = s.active === 'result' && s.sampleTarget ? s.sampleTarget.id : s.currentId
      const effV = s.active === 'result' && s.sampleTarget ? s.sampleTarget.version : s.viewVersion
      const same = r.screen === s.active && (!CASE_SCREENS.includes(r.screen) || (r.c === effC && r.v === effV))
      if (same) return
      if (guard.current?.dirty && s.active === 'human' && (r.screen !== 'human' || r.c !== s.currentId || r.v !== s.viewVersion)) {
        // keep the user on Human Review and ask first
        window.history.replaceState(null, '', buildHash(s.active, s.currentId, s.viewVersion, s.sampleTarget))
        pending.current = () => applyScreen(r.screen, { c: r.c, v: r.v })
        patch({ unsaved: true })
        return
      }
      applyScreen(r.screen, { c: r.c, v: r.v })
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [applyScreen, patch])

  // persistence
  useEffect(() => { persist(state) }, [state])

  /* ---- opening reviews ---- */
  const showCase = useCallback((id: string, version: VersionId | undefined, screen: string, extra: Partial<State> = {}) => {
    withGuard(() => {
      const c = ref.current.cases.find((x) => x.id === id)
      if (!c) { say('error', `${id} tidak memiliki rincian pemeriksaan dalam demo ini.`); return }
      const v = version && c.reviews[version] ? version : latestOf(c) ?? 'V1'
      setState((s) => ({ ...s, currentId: id, viewVersion: v, sampleTarget: null, ...extra }))
      applyScreen(screen, { c: id, v })
    })
  }, [withGuard, say, applyScreen])
  const openRecord = useCallback((id: string, version: string) => {
    if (ref.current.cases.some((c) => c.id === id)) { showCase(id, version as VersionId, 'result'); return }
    withGuard(() => applyScreen('result', { c: id, v: version }))
  }, [showCase, withGuard, applyScreen])
  const openCompare = useCallback((id: string) => showCase(id, 'V2', 'compare'), [showCase])
  const openHuman = useCallback((id: string, version: VersionId, findingId?: string) => showCase(id, version, 'human', { focusFinding: findingId ?? null }), [showCase])
  const openFinding = useCallback((id: string, version: VersionId, findingId: string) => showCase(id, version, 'findings', { focusFinding: findingId }), [showCase])
  const selectVersion = useCallback((v: VersionId) => withGuard(() => patch({ viewVersion: v, sampleTarget: null })), [withGuard, patch])

  /* ---- uploads ---- */
  const addFile = useCallback((id: SlotId, name: string, size: number, opts: { lastModified?: number; declaredScanned?: boolean } = {}) => {
    stopUpload(id)
    const set = (slot: Slot) => setState((s) => ({ ...s, slots: { ...s.slots, [id]: slot } }))
    const file = { name, size, lastModified: opts.lastModified }
    const v = validateFile(name, size, { declaredScanned: opts.declaredScanned })
    if (!v.ok) {
      setSlotProgress((prev) => (prev[id] === 0 ? prev : { ...prev, [id]: 0 }))
      set({ file, status: 'invalid', progress: 0, error: v.message, code: v.code })
      return
    }
    // Potential duplicate: same name and size (and modified time when known) already used for another role.
    const other = (Object.keys(ref.current.slots) as SlotId[]).find((k) => {
      const f = ref.current.slots[k].file
      return k !== id && f && ref.current.slots[k].status !== 'invalid' && f.name.toLowerCase() === name.toLowerCase() && f.size === size && (f.lastModified === undefined || opts.lastModified === undefined || f.lastModified === opts.lastModified)
    })
    if (other) {
      const role = slotMeta.find((m) => m.id === other)?.title ?? other
      setSlotProgress((prev) => (prev[id] === 0 ? prev : { ...prev, [id]: 0 }))
      set({ file, status: 'invalid', progress: 0, code: 'duplicate', error: `File ini tampak sama dengan file pada slot ${role} (nama dan ukuran sama). Setiap peran dokumen memerlukan file tersendiri. Ganti file ini dengan dokumen yang sesuai. Isi dokumen tidak dibandingkan secara langsung (pemeriksaan berdasarkan nama dan ukuran file).` })
      return
    }
    setSlotProgress((prev) => (prev[id] === 0 ? prev : { ...prev, [id]: 0 }))
    set({ file, status: 'uploading', progress: 0 })
    let p = 0 // simulated upload progress (separated into UploadProgressContext to avoid full-tree re-renders)
    timers.current[id] = window.setInterval(() => {
      p = Math.min(100, p + 10 + Math.random() * 14)
      if (p >= 100) {
        stopUpload(id)
        setSlotProgress((prev) => (prev[id] === 100 ? prev : { ...prev, [id]: 100 }))
        set({ file, status: 'ready', progress: 100 })
      } else {
        setSlotProgress((prev) => (prev[id] === p ? prev : { ...prev, [id]: p }))
      }
    }, 140)
  }, [])
  const removeFile = useCallback((id: SlotId) => {
    const cur = ref.current.slots[id]
    stopUpload(id)
    setSlotProgress((prev) => (prev[id] === 0 ? prev : { ...prev, [id]: 0 }))
    setState((s) => ({ ...s, slots: { ...s.slots, [id]: blank } }))
    const title = slotMeta.find((m) => m.id === id)?.title ?? id
    if (cur.status === 'uploading') say('info', `Unggahan dibatalkan untuk ${cur.file?.name}. Pilih kembali file ${title} untuk mencoba lagi.`)
    else if (cur.file) say('warning', `${title} dihapus. Unggah file pengganti sebelum memulai pemeriksaan.`)
  }, [say])
  const loadSamples = useCallback(() => {
    stopAll()
    setSlotProgress({ sop: 100, template: 100, report: 100 })
    setState((s) => ({ ...s, slots: Object.fromEntries(slotMeta.map((m) => [m.id, { file: m.sample, status: 'ready', progress: 100 } as Slot])) as Record<SlotId, Slot>, toast: toast('info', 'Dokumen contoh berhasil dimuat (file simulasi).') }))
  }, [])
  const clearUploads = useCallback(() => {
    stopAll()
    setSlotProgress(INITIAL_SLOT_PROGRESS)
    setState((s) => ({ ...s, slots: { sop: blank, template: blank, report: blank }, textConfirmed: false }))
  }, [])
  const setTextConfirmed = useCallback((b: boolean) => patch({ textConfirmed: b }), [patch])
  /** Demo helpers to preview the error states without needing a real bad file. */
  const addDemoFile = useCallback((kind: 'scanned' | 'format') =>
    kind === 'scanned' ? addFile('report', 'incident-report-image-only.pdf', 120_000, { declaredScanned: true }) : addFile('report', 'incident-notes.txt', 120_000), [addFile])

  /* ---- processing simulation ---- */
  const beginProcessing = (s: State, mode: 'initial' | 'recheck'): State => ({
    ...s, active: 'processing', sampleTarget: null,
    processing: { mode, status: 'running', step: 0, failDemo: false },
  })
  const startReview = useCallback(() => withGuard(() => {
    const s = ref.current
    if (!Object.values(s.slots).every((x) => x.status === 'ready') || !s.textConfirmed) return
    window.scrollTo({ top: 0 })
    setState((p) => ({ ...beginProcessing(p, 'initial'), toast: toast('info', 'Simulasi pemeriksaan AI dimulai. Pemeriksaan sebelumnya tetap tersimpan.') }))
  }), [withGuard])
  const startRecheck = useCallback(() => {
    const s = ref.current
    const c = s.cases.find((x) => x.id === s.currentId)
    if (!c?.reviews.V1 || c.reviews.V2) return false
    if (!c.revision.statement.trim() || !c.revision.evidence.trim()) return false
    withGuard(() => {
      window.scrollTo({ top: 0 })
      setState((p) => ({ ...beginProcessing(p, 'recheck'), revisionOpen: false, toast: toast('info', 'Simulasi pemeriksaan ulang dimulai. Membuat versi V2.') }))
    })
    return true
  }, [withGuard])
  const setFailDemo = useCallback((b: boolean) => setState((s) => ({ ...s, processing: { ...s.processing, failDemo: b } })), [])
  const retryProcessing = useCallback(() => setState((s) => ({ ...s, processing: { ...s.processing, failDemo: false, status: 'running' } })), [])

  const finalize = useCallback(() => setState((s) => {
    // If the user stayed on the processing screen, show 'done' briefly before redirecting;
    // if they navigated to another screen in-session, complete cleanly to 'idle' without forcing a redirect later.
    const nextStatus: Processing['status'] = s.active === 'processing' ? 'done' : 'idle'
    const done = { ...s.processing, step: stages.length, status: nextStatus }
    const cur = s.cases.find((c) => c.id === s.currentId)
    if (s.processing.mode === 'recheck' && cur?.reviews.V1) {
      const V2 = buildV2(cur.reviews.V1, cur.revision, demoNow())
      return {
        ...mapCase(s, cur.id, (c) => ({ ...c, reviews: { ...c.reviews, V2 }, hr: { ...c.hr, V2: newHuman('Penilaian AI dibuat: Perlu Ditinjau Manual', 'Hasil pemeriksaan ulang (simulasi V2). Tinjauan manual untuk V2 masih menunggu.') } })),
        processing: done, viewVersion: 'V2', toast: toast('success', 'V2 berhasil dibuat. Data V1 beserta catatan tinjauan manualnya tetap tersimpan.'),
      }
    }
    // A new independent review: never overwrites earlier ones.
    const id = nextReviewId([...s.cases.map((c) => c.id), ...sampleRecords.map((r) => r.id)])
    const docs = docsFromSlots(s.slots)
    const title = id === REVIEW_ID ? REVIEW_TITLE : `Pemeriksaan demo untuk ${docs[2].name}`
    const V1 = buildV1(docs, demoNow(), id, title)
    const c: Case = { id, title, reviews: { V1 }, hr: { V1: newHuman('Penilaian AI dibuat: Perlu Ditinjau Manual', 'Hasil pemeriksaan tahap awal (simulasi V1)') }, revision: EMPTY_REVISION }
    return { ...s, cases: [...s.cases, c], currentId: id, viewVersion: 'V1', processing: done, slotsConsumed: true, toast: toast('success', `Pemeriksaan ${id} berhasil dibuat (simulasi).`) }
  }), [])
  const skipProcessing = useCallback(() => finalize(), [finalize])

  useEffect(() => {
    const p = state.processing
    if (p.status !== 'running') return
    const t = window.setTimeout(() => {
      if (p.failDemo && p.step === 1) { setState((s) => ({ ...s, processing: { ...s.processing, status: 'failed' } })); return }
      if (p.step + 1 >= stages.length) finalize()
      else setState((s) => ({ ...s, processing: { ...s.processing, step: s.processing.step + 1 } }))
    }, 1000 + (p.step % 3) * 200)
    return () => window.clearTimeout(t)
  }, [state.processing, finalize])

  /** Jump straight to the INC-2026-014 demo review (V1) so any screen can be demonstrated. */
  const loadDemoReview = useCallback(() => {
    const existing = ref.current.cases.find((c) => c.id === REVIEW_ID)
    if (existing) { showCase(REVIEW_ID, latestOf(existing) ?? 'V1', 'result'); say('info', `${REVIEW_ID} sudah dimuat.`); return }
    withGuard(() => {
      stopAll()
      setSlotProgress({ sop: 100, template: 100, report: 100 })
      setState((s) => {
        const slots = Object.fromEntries(slotMeta.map((m) => [m.id, { file: m.sample, status: 'ready', progress: 100 } as Slot])) as Record<SlotId, Slot>
        const V1 = buildV1(docsFromSlots(slots), demoNow())
        const c: Case = { id: REVIEW_ID, title: REVIEW_TITLE, reviews: { V1 }, hr: { V1: newHuman('Penilaian AI dibuat: Perlu Ditinjau Manual', 'Hasil pemeriksaan tahap awal (simulasi V1)') }, revision: EMPTY_REVISION }
        return { ...s, slots, cases: [...s.cases, c], currentId: REVIEW_ID, viewVersion: 'V1', sampleTarget: null, processing: { mode: null, status: 'idle', step: 0, failDemo: false }, toast: toast('info', `Contoh pemeriksaan ${REVIEW_ID} (V1) berhasil dimuat.`) }
      })
    })
  }, [showCase, say, withGuard])

  /* ---- human review (per version & per finding of the current case) ---- */
  const resolveFindingRecord = (hrState: HumanState, fid: string, primaryId?: string): FindingHumanRecord => {
    if (hrState.byFinding?.[fid]) return hrState.byFinding[fid]
    if (!primaryId || fid === primaryId) {
      return { status: hrState.status, determination: hrState.determination, notes: hrState.notes, reviewer: hrState.reviewer, at: hrState.at, events: hrState.events }
    }
    return newHuman('Penilaian AI dibuat', `Menunggu tinjauan manual untuk ${fid}`)
  }

  const editHr = (s: State, findingId: string | undefined, fn: (h: FindingHumanRecord, fid: string) => FindingHumanRecord, t: Toast): State => ({
    ...mapCase(s, s.currentId, (c) => {
      const rev = c.reviews[s.viewVersion]
      const reqIds = rev?.findings.filter((f) => f.status === 'needs_review').map((f) => f.id) ?? []
      const primaryId = reqIds[0] ?? rev?.findings[0]?.id ?? 'F-06'
      const fid = findingId ?? primaryId
      const curHr = c.hr[s.viewVersion] ?? pendingHuman()
      const curRec = resolveFindingRecord(curHr, fid, primaryId)
      const nextRec = fn(curRec, fid)
      const nextByFinding: Record<string, FindingHumanRecord> = { ...(curHr.byFinding ?? {}) }
      if (primaryId && !nextByFinding[primaryId] && fid !== primaryId) {
        nextByFinding[primaryId] = resolveFindingRecord(curHr, primaryId, primaryId)
      }
      nextByFinding[fid] = nextRec

      const checkIds = reqIds.length > 0 ? reqIds : [fid]
      const allReqReviewed = checkIds.every((id) => (nextByFinding[id] ?? resolveFindingRecord(curHr, id, primaryId)).status === 'reviewed')
      const anyTouched = Object.values(nextByFinding).some((r) => r.status === 'draft' || r.status === 'reviewed')
      const aggStatus: HumanState['status'] = allReqReviewed ? 'reviewed' : anyTouched ? 'draft' : 'pending'

      return {
        ...c,
        hr: {
          ...c.hr,
          [s.viewVersion]: {
            ...nextRec,
            status: aggStatus,
            byFinding: nextByFinding,
          },
        },
      }
    }),
    toast: t,
  })

  const saveDraft = useCallback((notes: string, determination: FindingStatus | null, findingId?: string) =>
    setState((s) => editHr(s, findingId, (h, fid) => ({ ...h, status: 'draft', notes, determination, events: pushEvent(h, `Catatan tinjauan disimpan (${fid})`, 'Belum ditandai selesai ditinjau') }), toast('success', 'Catatan peninjau berhasil disimpan.'))), [])
  const markReviewed = useCallback((notes: string, determination: FindingStatus, findingId?: string) =>
    setState((s) => editHr(s, findingId, (h, fid) => ({ ...h, status: 'reviewed', notes, determination, at: demoNow(), events: pushEvent(h, `Ditandai selesai ditinjau (${fid})`, `Keputusan peninjau tercatat pada ${s.viewVersion}`) }), toast('success', `Tinjauan manual untuk ${s.viewVersion} berhasil disimpan. Penilaian AI tidak berubah.`))), [])
  const reopen = useCallback((findingId?: string) =>
    setState((s) => editHr(s, findingId, (h, fid) => ({ ...h, status: 'draft', at: null, events: pushEvent(h, `Tinjauan dibuka kembali untuk diedit (${fid})`) }), toast('info', 'Tinjauan dibuka kembali untuk diedit.'))), [])

  /* ---- revision ---- */
  const setRevision = useCallback((r: Revision) => setState((s) => mapCase(s, s.currentId, (c) => ({ ...c, revision: r }))), [])
  const openRevision = useCallback(() => withGuard(() => patch({ revisionOpen: true })), [withGuard, patch])
  const closeRevision = useCallback(() => patch({ revisionOpen: false }), [patch])

  /* ---- notifications ---- */
  const markNotifsSeen = useCallback((ids: string[]) => setState((s) => ({ ...s, notifSeen: [...new Set([...s.notifSeen, ...ids])] })), [])

  /* ---- reset (explicit confirmation required) ---- */
  const requestReset = useCallback(() => withGuard(() => patch({ resetOpen: true })), [withGuard, patch])
  const cancelReset = useCallback(() => patch({ resetOpen: false }), [patch])
  const confirmReset = useCallback(() => {
    stopAll(); guard.current = null; pending.current = null
    setSlotProgress(INITIAL_SLOT_PROGRESS)
    try { localStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
    window.scrollTo({ top: 0 })
    setState((s) => ({
      ...initialState(),
      active: s.active === 'history' ? 'history' : 'dashboard',
      toast: toast('info', 'Demo berhasil direset ke kondisi awal.'),
    }))
  }, [])

  useEffect(() => () => stopAll(), [])

  /* ---- derived ---- */
  const current = useMemo(() => state.cases.find((c) => c.id === state.currentId) ?? null, [state.cases, state.currentId])
  const reviews = current?.reviews ?? EMPTY_REVIEWS
  const latestVersion = useMemo(() => latestOf(current), [current])
  const hrFor = useCallback((v: VersionId): HumanState => current?.hr[v] ?? pendingHuman(), [current])
  const hrForFinding = useCallback((v: VersionId, findingId?: string): FindingHumanRecord => {
    const h = current?.hr[v] ?? pendingHuman()
    const rev = current?.reviews[v]
    const primaryId = rev?.findings.find((f) => f.status === 'needs_review')?.id ?? rev?.findings[0]?.id ?? 'F-06'
    const fid = findingId ?? primaryId
    return resolveFindingRecord(h, fid, primaryId)
  }, [current])
  const hr = useMemo(() => hrFor(state.viewVersion), [hrFor, state.viewVersion])
  const anyReviewed = useMemo(() => (current ? Object.values(current.hr).some((h) => h?.status === 'reviewed') : false), [current])
  const allReady = useMemo(() => Object.values(state.slots).every((s) => s.status === 'ready'), [state.slots])
  const readyCount = useMemo(() => Object.values(state.slots).filter((s) => s.status === 'ready').length, [state.slots])

  const history = useMemo<HistoryRecord[]>(() => {
    const live: HistoryRecord[] = [...state.cases].reverse().flatMap((c) => {
      const latest = latestOf(c)
      return (['V2', 'V1'] as const).flatMap((v) => {
        const rev = c.reviews[v]
        if (!rev) return []
        return [{
          key: `${c.id}-${v}`, id: c.id, title: c.title, report: rev.docs[2]?.name ?? 'Laporan', version: v, date: rev.checkedAt,
          status: c.hr[v]?.status === 'reviewed' ? ('human_reviewed' as const) : ('awaiting_human' as const), latest: v === latest,
        }]
      })
    })
    return [...live, ...sampleRecords]
  }, [state.cases])

  const demoValue = useMemo(() => ({
    ...state, current, reviews, revision: current?.revision ?? EMPTY_REVISION, latestVersion, history, hr, hrFor, hrForFinding, anyReviewed,
    allReady,
    readyCount,
    navigate, go, registerGuard, resolveUnsaved, withGuard, openRecord, openCompare, openHuman, openFinding, selectVersion,
    addFile, removeFile, loadSamples, clearUploads, addDemoFile, setTextConfirmed,
    startReview, startRecheck, setFailDemo, retryProcessing, skipProcessing, loadDemoReview,
    saveDraft, markReviewed, reopen,
    setRevision, openRevision, closeRevision, markNotifsSeen,
    requestReset, cancelReset, confirmReset,
    say, dismissToast,
  }), [
    state, current, reviews, latestVersion, history, hr, hrFor, hrForFinding, anyReviewed, allReady, readyCount,
    navigate, go, registerGuard, resolveUnsaved, withGuard, openRecord, openCompare, openHuman, openFinding, selectVersion,
    addFile, removeFile, loadSamples, clearUploads, addDemoFile, setTextConfirmed,
    startReview, startRecheck, setFailDemo, retryProcessing, skipProcessing, loadDemoReview,
    saveDraft, markReviewed, reopen,
    setRevision, openRevision, closeRevision, markNotifsSeen,
    requestReset, cancelReset, confirmReset,
    say, dismissToast,
  ])

  return { demoValue, slotProgress }
}

export function DemoProvider({ children }: { children: ReactNode }) {
  const { demoValue, slotProgress } = useDemoValue()
  return (
    <DemoContext.Provider value={demoValue}>
      <UploadProgressContext.Provider value={slotProgress}>
        {children}
      </UploadProgressContext.Provider>
    </DemoContext.Provider>
  )
}

export function useDemo() {
  const c = useContext(DemoContext)
  if (!c) throw new Error('useDemo must be used inside DemoProvider')
  return c
}

/** Convenience slices (kept so screens stay readable). Merges live upload progress from UploadProgressContext. */
export function useReviewFlow() {
  const d = useDemo()
  const slotProgress = useContext(UploadProgressContext)
  const sop = useMemo(
    () => (d.slots.sop.status === 'uploading' ? { ...d.slots.sop, progress: slotProgress.sop } : d.slots.sop),
    [d.slots.sop, slotProgress.sop],
  )
  const template = useMemo(
    () => (d.slots.template.status === 'uploading' ? { ...d.slots.template, progress: slotProgress.template } : d.slots.template),
    [d.slots.template, slotProgress.template],
  )
  const report = useMemo(
    () => (d.slots.report.status === 'uploading' ? { ...d.slots.report, progress: slotProgress.report } : d.slots.report),
    [d.slots.report, slotProgress.report],
  )
  const slots = useMemo<Record<SlotId, Slot>>(() => ({ sop, template, report }), [sop, template, report])
  return { slots, readyCount: d.readyCount, allReady: d.allReady, addFile: d.addFile, removeFile: d.removeFile, loadSamples: d.loadSamples, reset: d.clearUploads }
}
/** The human review record of the version (and optional finding) currently being viewed. */
export function useHumanReview(findingId?: string) {
  const d = useDemo()
  const rec = findingId ? d.hrForFinding(d.viewVersion, findingId) : d.hr
  const saveDraft = useCallback((notes: string, determination: FindingStatus | null) => d.saveDraft(notes, determination, findingId), [d.saveDraft, findingId])
  const markReviewed = useCallback((notes: string, determination: FindingStatus) => d.markReviewed(notes, determination, findingId), [d.markReviewed, findingId])
  const reopen = useCallback(() => d.reopen(findingId), [d.reopen, findingId])
  return { ...rec, versionStatus: d.hr.status, forFinding: (fid: string) => d.hrForFinding(d.viewVersion, fid), saveDraft, markReviewed, reopen }
}
/** The review for the version being viewed, or null when none exists yet. */
export function useViewedReview() {
  const d = useDemo()
  return d.reviews[d.viewVersion] ?? (d.latestVersion ? d.reviews[d.latestVersion] ?? null : null)
}
