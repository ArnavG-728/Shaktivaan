/**
 * React Hooks for the Store — bridges the data store + event bus into React.
 *
 * useStore(domain) — auto-subscribes to store changes, returns always-fresh data.
 * useDerivedStore(deps, computeFn, cacheKey) — memoised computed data with cache.
 * useActiveSession() — optimised for high-frequency active session writes.
 * useTheme() — theme state with toggle.
 */

'use client'
import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { store } from './store'
import { eventBus } from './events'
import { computeCache } from './computeCache'

// Map store domain names → { getter, events, default }
// Defaults MUST match what the SSR guard returns to prevent hydration mismatch.
const DOMAIN_CONFIG = {
  sessions: {
    get: () => store.sessions.getAll(),
    events: ['session:saved', 'session:deleted', 'session:updated'],
    default: [],
  },
  plans: {
    get: () => store.plans.getAll(),
    events: ['plan:saved', 'plan:deleted'],
    default: [],
  },
  customExercises: {
    get: () => store.customExercises.getAll(),
    events: ['exercise:saved', 'exercise:deleted'],
    default: [],
  },
  allExercises: {
    get: () => store.customExercises.getAllMerged(),
    events: ['exercise:saved', 'exercise:deleted'],
    default: [],
  },
  bodyweight: {
    get: () => store.bodyweight.getAll(),
    events: ['bodyweight:added', 'bodyweight:deleted'],
    default: [],
  },
}

/**
 * useStore — subscribe to a store domain and auto-update on changes.
 *
 * @param {'sessions'|'plans'|'customExercises'|'allExercises'|'bodyweight'} domain
 * @returns {*} — the current data for that domain
 *
 * @example
 *   const sessions = useStore('sessions')
 *   // sessions updates automatically when any component saves/deletes a session
 */
export function useStore(domain) {
  const config = DOMAIN_CONFIG[domain]
  if (!config) {
    throw new Error(`[useStore] Unknown domain: "${domain}". Valid: ${Object.keys(DOMAIN_CONFIG).join(', ')}`)
  }

  // Initialize with static default to prevent hydration mismatch.
  // The real data is loaded in useEffect (client-only).
  const [data, setData] = useState(config.default)

  useEffect(() => {
    // Hydrate from store on mount (client-only)
    setData(config.get())

    // Subscribe to all relevant events
    const unsubscribes = config.events.map(event =>
      eventBus.on(event, () => setData(config.get()))
    )

    return () => unsubscribes.forEach(unsub => unsub())
  }, [domain])

  return data
}

/**
 * useDerivedStore — compute and cache derived data that depends on a store domain.
 *
 * Uses the ComputeCache for cross-render caching. The computation only runs
 * when the underlying data changes, not on every render.
 *
 * @param {string} cacheKey — unique key for this computation
 * @param {string[]} dependencies — domain names this depends on (e.g. ['sessions'])
 * @param {Function} computeFn — function that receives current data and returns derived value
 * @returns {*}
 *
 * @example
 *   const prs = useDerivedStore('prs', ['sessions'], () => computePRs(store.sessions.getAll()))
 */
export function useDerivedStore(cacheKey, dependencies, computeFn) {
  // Subscribe to all dependency events to trigger re-render
  const eventNames = dependencies.flatMap(d => DOMAIN_CONFIG[d]?.events || [])

  const [, forceUpdate] = useState(0)

  useEffect(() => {
    const unsubscribes = eventNames.map(event =>
      eventBus.on(event, () => forceUpdate(n => n + 1))
    )
    return () => unsubscribes.forEach(unsub => unsub())
  }, [cacheKey])

  // Use computation cache — only recomputes if dependency versions changed
  return computeCache.get(cacheKey, dependencies, computeFn)
}

/**
 * useActiveSession — optimised hook for the in-progress workout session.
 *
 * Reads from cache, writes are debounced (300ms) through the write queue.
 *
 * @returns {[Object|null, Function, Function]} — [activeSession, save, clear]
 */
export function useActiveSession() {
  // Initialize null for SSR, hydrate in useEffect
  const [session, setSession] = useState(null)

  useEffect(() => {
    // Hydrate from store on mount
    setSession(store.activeSession.get())

    const unsub = eventBus.on('activeSession:changed', (data) => {
      setSession(data)
    })
    return unsub
  }, [])

  const save = useCallback((data) => {
    store.activeSession.save(data)
    setSession(data)
  }, [])

  const clear = useCallback(() => {
    store.activeSession.clear()
    setSession(null)
  }, [])

  return [session, save, clear]
}

/**
 * useTheme — theme state with toggle function.
 *
 * @returns {{ theme: string, toggleTheme: Function }}
 */
export function useTheme() {
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    // Hydrate theme on mount
    setTheme(store.settings.getTheme())
    const unsub = eventBus.on('theme:changed', (newTheme) => {
      setTheme(newTheme)
    })
    return unsub
  }, [])

  const toggleTheme = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark'
    store.settings.setTheme(next)
  }, [theme])

  return { theme, toggleTheme }
}

/**
 * useStoreInit — call once at the root of the app to initialise the store.
 * Must be in a client component.
 */
export function useStoreInit() {
  const initialised = useRef(false)

  useEffect(() => {
    if (!initialised.current) {
      store.init()
      initialised.current = true
    }
  }, [])
}

/**
 * useStoreEvent — subscribe to a specific event bus event.
 *
 * @param {string} event
 * @param {Function} callback
 */
export function useStoreEvent(event, callback) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    const unsub = eventBus.on(event, (...args) => callbackRef.current(...args))
    return unsub
  }, [event])
}
