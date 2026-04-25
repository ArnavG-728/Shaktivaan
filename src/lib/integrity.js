/**
 * Data Integrity — Backup, validation, corruption detection, schema migration.
 *
 * Ensures data resilience for a localStorage-only app:
 * - Auto-backup on every session save (rotating 3 snapshots)
 * - Corruption detection on read (validates data shape)
 * - Full export/import with conflict resolution
 * - Versioned schema with automatic migration
 */

import { eventBus } from './events'

// Current schema version — increment when data format changes
const SCHEMA_VERSION = 1
const VERSION_KEY = 'gymlogger_schema_version'
const BACKUP_KEYS = ['gymlogger_backup_1', 'gymlogger_backup_2', 'gymlogger_backup_3']

// ── Validators ──────────────────────────────────────────────────────────────

/**
 * Validate a session object has the required shape.
 */
function isValidSession(s) {
  return (
    s &&
    typeof s === 'object' &&
    typeof s.id === 'string' &&
    typeof s.date === 'string' &&
    Array.isArray(s.sets)
  )
}

/**
 * Validate a plan object.
 */
function isValidPlan(p) {
  return (
    p &&
    typeof p === 'object' &&
    typeof p.id === 'string' &&
    typeof p.name === 'string' &&
    Array.isArray(p.days)
  )
}

/**
 * Validate a custom exercise.
 */
function isValidExercise(e) {
  return (
    e &&
    typeof e === 'object' &&
    typeof e.id === 'string' &&
    typeof e.name === 'string' &&
    typeof e.muscleGroup === 'string'
  )
}

/**
 * Validate a bodyweight entry.
 */
function isValidBodyweight(b) {
  return (
    b &&
    typeof b === 'object' &&
    typeof b.date === 'string' &&
    typeof b.weight === 'number' &&
    !isNaN(b.weight)
  )
}

/**
 * Validate an active session snapshot.
 */
function isValidActiveSession(a) {
  return (
    a &&
    typeof a === 'object' &&
    typeof a.phase === 'string' &&
    Array.isArray(a.sessionSets)
  )
}

// Map of domain → validator
const VALIDATORS = {
  gymlogger_sessions:          { validate: isValidSession,       isArray: true },
  gymlogger_plans:             { validate: isValidPlan,          isArray: true },
  gymlogger_custom_exercises:  { validate: isValidExercise,      isArray: true },
  gymlogger_bodyweight:        { validate: isValidBodyweight,    isArray: true },
  gymlogger_active_session:    { validate: isValidActiveSession, isArray: false },
}

// ── Safe Read/Write ──────────────────────────────────────────────────────────

/**
 * Safely read and validate data from localStorage.
 * Returns validated data, or fallback if corrupt.
 *
 * @param {string} key
 * @param {*} fallback — default value if key missing or data corrupt
 * @returns {*}
 */
export function safeRead(key, fallback) {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback

    const parsed = JSON.parse(raw)
    const validator = VALIDATORS[key]

    if (!validator) return parsed // no validator, return as-is

    if (validator.isArray) {
      if (!Array.isArray(parsed)) {
        console.warn(`[Integrity] ${key} is not an array. Using fallback.`)
        return fallback
      }
      // Filter out invalid items (keep valid ones, discard corrupt)
      const valid = parsed.filter(item => validator.validate(item))
      if (valid.length < parsed.length) {
        console.warn(`[Integrity] ${key}: filtered ${parsed.length - valid.length} corrupt items`)
      }
      return valid
    }

    // Single object validation
    if (!validator.validate(parsed)) {
      console.warn(`[Integrity] ${key} failed validation. Using fallback.`)
      return fallback
    }
    return parsed
  } catch (err) {
    console.error(`[Integrity] Error reading ${key}:`, err)
    // Attempt to recover from backup
    const recovered = recoverFromBackup(key)
    if (recovered !== null) {
      console.info(`[Integrity] Recovered ${key} from backup`)
      return recovered
    }
    return fallback
  }
}

// ── Backup System ────────────────────────────────────────────────────────────

/**
 * Create a full backup of all app data.
 * Rotates through 3 backup slots (oldest gets overwritten).
 */
export function createBackup() {
  if (typeof window === 'undefined') return
  try {
    const snapshot = {
      version: SCHEMA_VERSION,
      timestamp: new Date().toISOString(),
      data: {}
    }

    const keysToBackup = [
      'gymlogger_sessions',
      'gymlogger_plans',
      'gymlogger_custom_exercises',
      'gymlogger_bodyweight',
      'gymlogger_theme',
    ]

    for (const key of keysToBackup) {
      const raw = localStorage.getItem(key)
      if (raw !== null) snapshot.data[key] = raw
    }

    // Rotate backups: 3 → deleted, 2 → 3, 1 → 2, new → 1
    try { localStorage.setItem(BACKUP_KEYS[2], localStorage.getItem(BACKUP_KEYS[1]) || '') } catch {}
    try { localStorage.setItem(BACKUP_KEYS[1], localStorage.getItem(BACKUP_KEYS[0]) || '') } catch {}
    try { localStorage.setItem(BACKUP_KEYS[0], JSON.stringify(snapshot)) } catch {}

  } catch (err) {
    console.error('[Integrity] Backup failed:', err)
  }
}

/**
 * Attempt to recover a specific key from the most recent valid backup.
 * @param {string} key
 * @returns {*|null}
 */
function recoverFromBackup(key) {
  for (const backupKey of BACKUP_KEYS) {
    try {
      const raw = localStorage.getItem(backupKey)
      if (!raw) continue

      const snapshot = JSON.parse(raw)
      if (snapshot?.data?.[key]) {
        const data = JSON.parse(snapshot.data[key])
        return data
      }
    } catch { continue }
  }
  return null
}

// ── Full Export / Import ──────────────────────────────────────────────────────

/**
 * Export all app data as a JSON object (for download/backup).
 * @returns {Object}
 */
export function exportAllData() {
  const keysToExport = [
    'gymlogger_sessions',
    'gymlogger_plans',
    'gymlogger_custom_exercises',
    'gymlogger_bodyweight',
    'gymlogger_theme',
    'gymlogger_schema_version',
  ]

  const exportData = {
    exportVersion: SCHEMA_VERSION,
    exportDate: new Date().toISOString(),
    app: 'Shaktivaan',
    data: {},
  }

  for (const key of keysToExport) {
    try {
      const raw = localStorage.getItem(key)
      if (raw !== null) exportData.data[key] = JSON.parse(raw)
    } catch { /* skip corrupt keys */ }
  }

  return exportData
}

/**
 * Import app data from an exported JSON object.
 * @param {Object} importData — the exported data object
 * @param {'merge'|'replace'} [mode='merge'] — merge adds new items; replace overwrites
 * @returns {{ success: boolean, stats: Object }}
 */
export function importAllData(importData, mode = 'merge') {
  const stats = { imported: 0, skipped: 0, errors: 0 }

  try {
    if (!importData?.data || typeof importData.data !== 'object') {
      return { success: false, stats: { ...stats, errors: 1 } }
    }

    for (const [key, value] of Object.entries(importData.data)) {
      try {
        if (mode === 'replace') {
          localStorage.setItem(key, JSON.stringify(value))
          stats.imported++
        } else {
          // Merge mode: for arrays, merge by ID; for non-arrays, only set if missing
          const existing = safeRead(key, null)

          if (Array.isArray(value) && Array.isArray(existing)) {
            const existingIds = new Set(existing.map(item => item.id))
            const newItems = value.filter(item => item.id && !existingIds.has(item.id))
            if (newItems.length > 0) {
              const merged = [...existing, ...newItems]
              localStorage.setItem(key, JSON.stringify(merged))
              stats.imported += newItems.length
            }
            stats.skipped += value.length - (newItems?.length || 0)
          } else if (!existing) {
            localStorage.setItem(key, JSON.stringify(value))
            stats.imported++
          } else {
            stats.skipped++
          }
        }
      } catch {
        stats.errors++
      }
    }

    return { success: true, stats }
  } catch (err) {
    return { success: false, stats: { ...stats, errors: stats.errors + 1 } }
  }
}

// ── Schema Migration ─────────────────────────────────────────────────────────

/**
 * Run schema migrations if needed.
 * Call this on app startup.
 */
export function runMigrations() {
  if (typeof window === 'undefined') return
  try {
    const currentVersion = parseInt(localStorage.getItem(VERSION_KEY) || '0', 10)

    if (currentVersion < SCHEMA_VERSION) {
      // Future migrations go here:
      // if (currentVersion < 2) migrateV1toV2()
      // if (currentVersion < 3) migrateV2toV3()

      localStorage.setItem(VERSION_KEY, String(SCHEMA_VERSION))
      console.info(`[Integrity] Schema migrated from v${currentVersion} to v${SCHEMA_VERSION}`)
    }
  } catch (err) {
    console.error('[Integrity] Migration error:', err)
  }
}

// ── Storage Usage Stats ──────────────────────────────────────────────────────

/**
 * Get storage usage breakdown.
 * @returns {{ total: string, breakdown: Object[] }}
 */
export function getStorageStats() {
  try {
    const breakdown = []
    let totalBytes = 0

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      const size = ((localStorage.getItem(key) || '').length * 2) // UTF-16 = 2 bytes/char
      totalBytes += size
      if (key.startsWith('gymlogger_')) {
        breakdown.push({ key, sizeKB: (size / 1024).toFixed(1) })
      }
    }

    breakdown.sort((a, b) => parseFloat(b.sizeKB) - parseFloat(a.sizeKB))

    return {
      totalMB: (totalBytes / (1024 * 1024)).toFixed(2),
      breakdown,
    }
  } catch {
    return { totalMB: '0', breakdown: [] }
  }
}
