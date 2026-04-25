/**
 * Throttle & Debounce utilities.
 *
 * Used throughout the app to prevent excessive renders, localStorage writes,
 * search filtering, and timer ticking.
 */

/**
 * Debounce — delays execution until `wait` ms after the last call.
 * Perfect for search inputs, auto-save, and form updates.
 *
 * @param {Function} fn — function to debounce
 * @param {number} wait — milliseconds to wait
 * @param {Object} [options]
 * @param {boolean} [options.leading=false] — fire on the leading edge
 * @param {boolean} [options.trailing=true] — fire on the trailing edge
 * @returns {{ call: Function, cancel: Function, flush: Function }}
 */
export function debounce(fn, wait, { leading = false, trailing = true } = {}) {
  let timeoutId = null
  let lastArgs = null
  let lastThis = null
  let lastCallTime = 0

  function invoke() {
    const args = lastArgs
    const thisArg = lastThis
    lastArgs = null
    lastThis = null
    fn.apply(thisArg, args)
  }

  function debounced(...args) {
    lastArgs = args
    lastThis = this
    lastCallTime = Date.now()

    const shouldCallLeading = leading && timeoutId === null

    clearTimeout(timeoutId)

    timeoutId = setTimeout(() => {
      timeoutId = null
      if (trailing && lastArgs) invoke()
    }, wait)

    if (shouldCallLeading) invoke()
  }

  debounced.cancel = () => {
    clearTimeout(timeoutId)
    timeoutId = null
    lastArgs = null
    lastThis = null
  }

  debounced.flush = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
      timeoutId = null
      if (lastArgs) invoke()
    }
  }

  return debounced
}

/**
 * Throttle — ensures function executes at most once per `limit` ms.
 * Perfect for scroll handlers, resize events, and timer ticks.
 *
 * @param {Function} fn
 * @param {number} limit — minimum ms between executions
 * @returns {Function}
 */
export function throttle(fn, limit) {
  let lastRan = 0
  let timeoutId = null

  function throttled(...args) {
    const now = Date.now()
    const remaining = limit - (now - lastRan)

    if (remaining <= 0) {
      clearTimeout(timeoutId)
      timeoutId = null
      lastRan = now
      fn.apply(this, args)
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastRan = Date.now()
        timeoutId = null
        fn.apply(this, args)
      }, remaining)
    }
  }

  throttled.cancel = () => {
    clearTimeout(timeoutId)
    timeoutId = null
  }

  return throttled
}

/**
 * Rate limiter — allows N calls per window of time.
 * Used to prevent excessive beep sounds, vibrations, etc.
 *
 * @param {number} maxCalls — maximum number of calls allowed
 * @param {number} windowMs — time window in milliseconds
 * @returns {Function} — returns true if allowed, false if rate-limited
 */
export function rateLimiter(maxCalls, windowMs) {
  const calls = []

  return function isAllowed() {
    const now = Date.now()
    // Remove expired entries
    while (calls.length > 0 && calls[0] <= now - windowMs) {
      calls.shift()
    }
    if (calls.length < maxCalls) {
      calls.push(now)
      return true
    }
    return false
  }
}

/**
 * Pooled AudioContext — reuses a single AudioContext instance.
 * Browsers limit the number of AudioContexts (typically 6).
 *
 * @returns {{ play: Function, resume: Function }}
 */
export function createAudioPool() {
  let ctx = null
  const limiter = rateLimiter(5, 1000) // max 5 beeps per second

  function getContext() {
    if (!ctx || ctx.state === 'closed') {
      try {
        ctx = new (window.AudioContext || window.webkitAudioContext)()
      } catch {
        return null
      }
    }
    // Resume if suspended (autoplay policy)
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {})
    }
    return ctx
  }

  return {
    play(freq = 880, duration = 0.18, vol = 0.4) {
      if (!limiter()) return // rate-limited
      const audioCtx = getContext()
      if (!audioCtx) return

      try {
        const osc = audioCtx.createOscillator()
        const gain = audioCtx.createGain()
        osc.connect(gain)
        gain.connect(audioCtx.destination)
        osc.frequency.value = freq
        osc.type = 'sine'
        gain.gain.setValueAtTime(vol, audioCtx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration)
        osc.start(audioCtx.currentTime)
        osc.stop(audioCtx.currentTime + duration)
      } catch { /* silent fail on audio errors */ }
    },

    resume() {
      const audioCtx = getContext()
      if (audioCtx?.state === 'suspended') {
        audioCtx.resume().catch(() => {})
      }
    },
  }
}

// Singleton audio pool
export const audioPool = createAudioPool()
