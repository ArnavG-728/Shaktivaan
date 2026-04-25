/**
 * Centralised Data Store — single source of truth for all app data.
 *
 * Wraps localStorage behind a clean API with:
 * - In-memory cache (read once, serve from memory)
 * - Validated writes through integrity module
 * - Event emission on all mutations
 * - Write queue integration for safe persistence
 * - Computation cache invalidation on data changes
 * - Auto-backup on session saves
 *
 * Usage:
 *   import { store } from '@/lib/store'
 *   const sessions = store.sessions.getAll()
 *   store.sessions.add(newSession)
 *   store.sessions.delete(id)
 */

import { eventBus } from './events'
import { writeQueue } from './writeQueue'
import { safeRead, createBackup, runMigrations } from './integrity'
import { computeCache } from './computeCache'
import { EXERCISES } from '../data/exercises'
import { PRELOADED_PLANS } from '../data/plans/index'

// ── In-Memory Cache ──────────────────────────────────────────────────────────

const cache = new Map()

function getCached(key, fallback) {
  if (typeof window === 'undefined') return fallback
  if (cache.has(key)) return cache.get(key)
  const value = safeRead(key, fallback)
  cache.set(key, value)
  return value
}

function setCached(key, value) {
  cache.set(key, value)
}

function clearCached(key) {
  cache.delete(key)
}

// ── Store Domains ────────────────────────────────────────────────────────────

/**
 * Sessions domain.
 */
const sessions = {
  KEY: 'gymlogger_sessions',

  getAll() {
    return getCached(this.KEY, [])
  },

  add(session) {
    const current = this.getAll()
    const updated = [...current, session]
    setCached(this.KEY, updated)
    writeQueue.enqueue({ key: this.KEY, data: updated })
    computeCache.invalidate('sessions')
    createBackup()
    eventBus.emit('session:saved', session)
  },

  delete(id) {
    const current = this.getAll()
    const updated = current.filter(s => s.id !== id)
    setCached(this.KEY, updated)
    writeQueue.enqueue({ key: this.KEY, data: updated })
    computeCache.invalidate('sessions')
    eventBus.emit('session:deleted', { id })
  },

  update(id, changes) {
    const current = this.getAll()
    const updated = current.map(s => s.id === id ? { ...s, ...changes } : s)
    setCached(this.KEY, updated)
    writeQueue.enqueue({ key: this.KEY, data: updated })
    computeCache.invalidate('sessions')
    eventBus.emit('session:updated', { id, changes })
  },

  /** Force refresh from localStorage (e.g. after import) */
  refresh() {
    clearCached(this.KEY)
    computeCache.invalidate('sessions')
    return this.getAll()
  },
}

/**
 * Plans domain.
 */
const plans = {
  KEY: 'gymlogger_plans',

  getAll() {
    return getCached(this.KEY, [])
  },

  /** Initialise plans — merge preloaded with stored. */
  init() {
    const stored = safeRead(this.KEY, null)

    if (stored && stored.length > 0) {
      // Merge: update preloaded plans but keep user's starred state
      const merged = stored.map(s => {
        const preloaded = PRELOADED_PLANS.find(p => p.id === s.id)
        return preloaded ? { ...preloaded, isStarred: s.isStarred } : s
      })

      // Add any new preloaded plans not yet in storage
      for (const p of PRELOADED_PLANS) {
        if (!merged.find(m => m.id === p.id)) {
          merged.push(p)
        }
      }

      setCached(this.KEY, merged)
      writeQueue.enqueue({ key: this.KEY, data: merged })
      return merged
    }

    // First run — use preloaded plans
    setCached(this.KEY, PRELOADED_PLANS)
    writeQueue.enqueue({ key: this.KEY, data: PRELOADED_PLANS })
    return PRELOADED_PLANS
  },

  save(planData) {
    const current = this.getAll()
    const existingIdx = current.findIndex(p => p.id === planData.id)
    const updated = existingIdx >= 0
      ? current.map(p => p.id === planData.id ? planData : p)
      : [...current, planData]

    setCached(this.KEY, updated)
    writeQueue.enqueue({ key: this.KEY, data: updated })
    computeCache.invalidate('plans')
    eventBus.emit('plan:saved', planData)
  },

  delete(id) {
    const current = this.getAll()
    const updated = current.filter(p => p.id !== id)
    setCached(this.KEY, updated)
    writeQueue.enqueue({ key: this.KEY, data: updated })
    computeCache.invalidate('plans')
    eventBus.emit('plan:deleted', { id })
  },

  setAll(plansArray) {
    setCached(this.KEY, plansArray)
    writeQueue.enqueue({ key: this.KEY, data: plansArray })
    computeCache.invalidate('plans')
  },

  refresh() {
    clearCached(this.KEY)
    computeCache.invalidate('plans')
    return this.getAll()
  },
}

/**
 * Custom Exercises domain.
 */
const customExercises = {
  KEY: 'gymlogger_custom_exercises',

  getAll() {
    return getCached(this.KEY, [])
  },

  /** Get all exercises (built-in + custom), sorted. */
  getAllMerged() {
    const custom = this.getAll()
    return [...EXERCISES, ...custom].sort((a, b) => a.name.localeCompare(b.name))
  },

  save(exercise) {
    const current = this.getAll()
    const existingIdx = current.findIndex(e => e.id === exercise.id)
    const updated = existingIdx >= 0
      ? current.map(e => e.id === exercise.id ? exercise : e)
      : [...current, exercise]

    setCached(this.KEY, updated)
    writeQueue.enqueue({ key: this.KEY, data: updated })
    computeCache.invalidate('exercises')
    eventBus.emit('exercise:saved', exercise)
  },

  delete(id) {
    const current = this.getAll()
    const updated = current.filter(e => e.id !== id)
    setCached(this.KEY, updated)
    writeQueue.enqueue({ key: this.KEY, data: updated })
    computeCache.invalidate('exercises')
    eventBus.emit('exercise:deleted', { id })
  },

  refresh() {
    clearCached(this.KEY)
    computeCache.invalidate('exercises')
    return this.getAll()
  },
}

/**
 * Active Session domain (the in-progress workout).
 * Uses debounced writes since this updates very frequently.
 */
const activeSession = {
  KEY: 'gymlogger_active_session',

  get() {
    return getCached(this.KEY, null)
  },

  save(data) {
    setCached(this.KEY, data)
    writeQueue.enqueue({
      key: this.KEY,
      data,
      mode: 'debounced',
      debounceMs: 300,
    })
    eventBus.emit('activeSession:changed', data)
  },

  clear() {
    setCached(this.KEY, null)
    writeQueue.remove(this.KEY)
    eventBus.emit('activeSession:changed', null)
  },

  refresh() {
    clearCached(this.KEY)
    return this.get()
  },
}

/**
 * Bodyweight domain.
 */
const bodyweight = {
  KEY: 'gymlogger_bodyweight',

  getAll() {
    return getCached(this.KEY, [])
  },

  add(entry) {
    const current = this.getAll()
    const updated = [entry, ...current]
    setCached(this.KEY, updated)
    writeQueue.enqueue({ key: this.KEY, data: updated })
    computeCache.invalidate('bodyweight')
    eventBus.emit('bodyweight:added', entry)
  },

  delete(index) {
    const current = this.getAll()
    const updated = current.filter((_, i) => i !== index)
    setCached(this.KEY, updated)
    writeQueue.enqueue({ key: this.KEY, data: updated })
    computeCache.invalidate('bodyweight')
    eventBus.emit('bodyweight:deleted', { index })
  },

  refresh() {
    clearCached(this.KEY)
    computeCache.invalidate('bodyweight')
    return this.getAll()
  },
}

/**
 * Settings domain (theme, preferences).
 */
const settings = {
  THEME_KEY: 'gymlogger_theme',

  getTheme() {
    if (cache.has(this.THEME_KEY)) return cache.get(this.THEME_KEY)
    try {
      const val = localStorage.getItem(this.THEME_KEY) || 'dark'
      cache.set(this.THEME_KEY, val)
      return val
    } catch { return 'dark' }
  },

  setTheme(theme) {
    cache.set(this.THEME_KEY, theme)
    try { localStorage.setItem(this.THEME_KEY, theme) } catch {}
    document.documentElement.dataset.theme = theme === 'light' ? 'light' : ''
    eventBus.emit('theme:changed', theme)
  },
}

// ── Store Initialisation ─────────────────────────────────────────────────────

/**
 * Initialise the store — call once on app mount.
 * Runs migrations, initialises plans, warms the cache.
 */
function init() {
  if (typeof window === 'undefined') return // SSR guard

  runMigrations()

  // Warm the cache by reading all domains
  sessions.getAll()
  plans.init()
  customExercises.getAll()
  bodyweight.getAll()
  settings.getTheme()

  // Set theme on document
  const theme = settings.getTheme()
  document.documentElement.dataset.theme = theme === 'light' ? 'light' : ''
}

// ── Public API ───────────────────────────────────────────────────────────────

export const store = {
  sessions,
  plans,
  customExercises,
  activeSession,
  bodyweight,
  settings,
  init,

  /** Force-refresh all domains from localStorage */
  refreshAll() {
    cache.clear()
    computeCache.clear()
    sessions.getAll()
    plans.getAll()
    customExercises.getAll()
    bodyweight.getAll()
    settings.getTheme()
  },
}
