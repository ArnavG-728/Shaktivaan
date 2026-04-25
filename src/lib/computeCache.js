/**
 * Computation Cache — Memoised derived data computations.
 *
 * Expensive computations (1RM, PRs, weekly volume, streak) are cached
 * and only recomputed when their source data changes.
 *
 * Each cache entry has a version number that's bumped when source data changes.
 * If the version matches on read, the cached value is returned instantly.
 */

// ── Core Cache ──────────────────────────────────────────────────────────────

class ComputeCache {
  constructor() {
    this._cache = new Map()        // key → { value, version, computedAt }
    this._versions = new Map()     // domain → version counter
  }

  /**
   * Invalidate a domain, causing all computations that depend on it
   * to recompute on next access.
   * @param {string} domain — e.g. 'sessions', 'plans'
   */
  invalidate(domain) {
    const current = this._versions.get(domain) || 0
    this._versions.set(domain, current + 1)
  }

  /**
   * Get a cached computation, or compute and cache it.
   *
   * @param {string} key — unique cache key (e.g. 'streak', 'prs', '1rm:Bench Press')
   * @param {string[]} dependencies — domains this depends on (e.g. ['sessions'])
   * @param {Function} computeFn — function to compute the value
   * @returns {*} — the computed (or cached) value
   */
  get(key, dependencies, computeFn) {
    const currentVersion = this._getDependencyVersion(dependencies)
    const cached = this._cache.get(key)

    if (cached && cached.version === currentVersion) {
      return cached.value
    }

    // Recompute
    const value = computeFn()
    this._cache.set(key, {
      value,
      version: currentVersion,
      computedAt: Date.now(),
    })
    return value
  }

  /**
   * Combined version hash for multiple dependencies.
   */
  _getDependencyVersion(deps) {
    return deps.map(d => this._versions.get(d) || 0).join(':')
  }

  /**
   * Clear all cached values.
   */
  clear() {
    this._cache.clear()
  }

  /**
   * Get cache diagnostics.
   */
  get stats() {
    return {
      entries: this._cache.size,
      domains: Object.fromEntries(this._versions),
    }
  }
}

// Singleton
export const computeCache = new ComputeCache()


// ── Pre-built Computation Functions ──────────────────────────────────────────

/**
 * Compute the workout streak (consecutive days).
 * @param {Array} sessions
 * @returns {number}
 */
export function computeStreak(sessions) {
  if (!sessions || sessions.length === 0) return 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const sorted = [...sessions].sort((a, b) => new Date(b.date) - new Date(a.date))
  let streak = 0
  let check = today
  for (const s of sorted) {
    const d = new Date(s.date)
    d.setHours(0, 0, 0, 0)
    const diff = (check - d) / 86400000
    if (diff <= 1) { streak++; check = d }
    else break
  }
  return streak
}

/**
 * Epley formula: estimated 1RM.
 * @param {number} weight
 * @param {number} reps
 * @returns {number}
 */
export function epley(weight, reps) {
  if (!weight || !reps || reps === 0) return 0
  return Math.round(weight * (1 + Number(reps) / 30))
}

/**
 * Compute personal records per exercise.
 * @param {Array} sessions
 * @returns {Array} — sorted by highest 1RM descending
 */
export function computePRs(sessions) {
  const records = {}
  sessions.forEach(s => {
    s.sets?.filter(set => set.done).forEach(set => {
      const rm = epley(parseFloat(set.weight) || 0, parseFloat(set.reps) || 0)
      if (!records[set.exerciseName] || rm > records[set.exerciseName].value) {
        records[set.exerciseName] = { value: rm, date: s.date, weight: set.weight, reps: set.reps }
      }
    })
  })
  return Object.entries(records).sort((a, b) => b[1].value - a[1].value).slice(0, 10)
}

/**
 * Pre-classify exercise → muscle group mapping.
 * Uses EXERCISE_MUSCLES static map + keyword fallback.
 *
 * @param {string} exerciseName
 * @param {Object} [staticMap] — the EXERCISE_MUSCLES constant
 * @returns {string} — muscle group name
 */
export function classifyMuscle(exerciseName, staticMap = {}) {
  if (staticMap[exerciseName]) return staticMap[exerciseName]

  const name = exerciseName.toLowerCase()
  if (name.includes('chest') || name.includes('bench') || name.includes('pec') || name.includes('fly')) return 'Chest'
  if (name.includes('back') || name.includes('row') || name.includes('pull') || name.includes('lat') || name.includes('deadlift')) return 'Back'
  if (name.includes('squat') || name.includes('leg press') || name.includes('leg ext')) return 'Quads'
  if (name.includes('rdl') || name.includes('hamstring') || name.includes('leg curl') || name.includes('romanian')) return 'Hamstrings'
  if (name.includes('shoulder') || name.includes('ohp') || name.includes('lateral') || name.includes('raise') || name.includes('delt') || name.includes('press') && name.includes('overhead')) return 'Shoulders'
  if (name.includes('bicep') || name.includes('curl') && !name.includes('leg')) return 'Biceps'
  if (name.includes('tricep') || name.includes('pushdown') || name.includes('skullcrusher') || name.includes('extension') && !name.includes('leg')) return 'Triceps'
  if (name.includes('glute') || name.includes('hip thrust')) return 'Glutes'
  if (name.includes('calf') || name.includes('calves')) return 'Calves'
  if (name.includes('core') || name.includes('crunch') || name.includes('abs') || name.includes('plank')) return 'Core'
  return 'Other'
}

/**
 * Compute weekly volume by muscle group.
 * @param {Array} sessions
 * @param {Object} exerciseMuscleMap
 * @returns {Object} — { muscle: setCount }
 */
export function computeWeeklyVolume(sessions, exerciseMuscleMap = {}) {
  const now = new Date()
  const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000)
  const recentSets = sessions
    .filter(s => new Date(s.date) >= weekAgo)
    .flatMap(s => s.sets?.filter(set => set.done) || [])

  const setsPerMuscle = {}
  recentSets.forEach(set => {
    const muscle = classifyMuscle(set.exerciseName, exerciseMuscleMap)
    setsPerMuscle[muscle] = (setsPerMuscle[muscle] || 0) + 1
  })

  return setsPerMuscle
}

/**
 * Get trend direction for a series of values.
 * @param {number[]} values
 * @returns {'up'|'down'|'flat'}
 */
export function getTrend(values) {
  if (values.length < 2) return 'flat'
  const first = values[0]
  const last = values[values.length - 1]
  if (last > first * 1.03) return 'up'
  if (last < first * 0.97) return 'down'
  return 'flat'
}
