/**
 * Write Queue — Serial, debounced, retry-capable write system.
 *
 * All localStorage writes go through this queue to prevent:
 * - Race conditions from concurrent writes
 * - Data loss from quota exceeded errors
 * - Excessive write frequency from rapid UI updates
 *
 * Features:
 * - FIFO serial execution
 * - Exponential backoff retry (3 attempts: 100ms → 400ms → 1600ms)
 * - Debounced writes for high-frequency domains (active session)
 * - Flush on beforeunload to prevent data loss
 * - Error reporting through event bus
 */

import { eventBus } from './events'
import { debounce } from './throttle'

class WriteQueue {
  constructor() {
    this._queue = []
    this._processing = false
    this._debouncedWriters = new Map()  // domain → debounced flush
    this._pendingWrites = new Map()      // domain → latest data (for debounced)
    this._retryDelays = [100, 400, 1600] // exponential backoff

    // Flush pending writes before page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.flushSync())
    }
  }

  /**
   * Enqueue a write operation.
   *
   * @param {Object} options
   * @param {string} options.key — localStorage key
   * @param {*} options.data — data to write (will be JSON.stringify'd)
   * @param {'immediate'|'debounced'} [options.mode='immediate']
   * @param {number} [options.debounceMs=300] — only used when mode is 'debounced'
   * @param {Function} [options.onSuccess] — called on successful write
   * @param {Function} [options.onError] — called on permanent failure
   */
  enqueue({ key, data, mode = 'immediate', debounceMs = 300, onSuccess, onError }) {
    if (mode === 'debounced') {
      this._enqueueDebouncedWrite(key, data, debounceMs, onSuccess, onError)
    } else {
      this._queue.push({ key, data, onSuccess, onError, attempt: 0 })
      this._process()
    }
  }

  /**
   * For debounced writes: store the latest data and schedule a flush.
   */
  _enqueueDebouncedWrite(key, data, debounceMs, onSuccess, onError) {
    this._pendingWrites.set(key, { data, onSuccess, onError })

    if (!this._debouncedWriters.has(key)) {
      const debouncedFn = debounce(() => {
        const pending = this._pendingWrites.get(key)
        if (pending) {
          this._pendingWrites.delete(key)
          this._queue.push({
            key,
            data: pending.data,
            onSuccess: pending.onSuccess,
            onError: pending.onError,
            attempt: 0,
          })
          this._process()
        }
      }, debounceMs)

      this._debouncedWriters.set(key, debouncedFn)
    }

    this._debouncedWriters.get(key)()
  }

  /**
   * Process the queue serially.
   */
  async _process() {
    if (this._processing) return
    this._processing = true

    while (this._queue.length > 0) {
      const item = this._queue.shift()
      const success = await this._executeWrite(item)

      if (!success && item.attempt < this._retryDelays.length) {
        // Retry with backoff
        const delay = this._retryDelays[item.attempt]
        item.attempt++
        await this._sleep(delay)
        this._queue.unshift(item) // re-add to front of queue
      } else if (!success) {
        // Permanent failure after all retries
        const error = new Error(`Failed to write to localStorage key "${item.key}" after ${item.attempt} attempts`)
        console.error('[WriteQueue]', error.message)
        eventBus.emit('store:error', { key: item.key, error: error.message })
        item.onError?.(error)
      }
    }

    this._processing = false
  }

  /**
   * Execute a single write operation.
   * @returns {boolean} success
   */
  _executeWrite(item) {
    try {
      const serialised = JSON.stringify(item.data)
      localStorage.setItem(item.key, serialised)

      // Check storage quota after write
      this._checkQuota()

      item.onSuccess?.()
      return true
    } catch (err) {
      if (err.name === 'QuotaExceededError' || err.code === 22) {
        eventBus.emit('store:quota-warning', {
          key: item.key,
          message: 'localStorage quota exceeded. Consider exporting and clearing old data.',
        })
      }
      return false
    }
  }

  /**
   * Check localStorage usage and warn if approaching limit.
   */
  _checkQuota() {
    try {
      let totalBytes = 0
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        totalBytes += (localStorage.getItem(key) || '').length * 2 // UTF-16
      }
      const totalMB = totalBytes / (1024 * 1024)
      // Warn at 4MB (most browsers have 5-10MB limit)
      if (totalMB > 4) {
        eventBus.emit('store:quota-warning', {
          usedMB: totalMB.toFixed(2),
          message: `Storage usage: ${totalMB.toFixed(2)}MB. Consider exporting old sessions.`,
        })
      }
    } catch { /* quota check is best-effort */ }
  }

  /**
   * Synchronous flush — used on beforeunload when async isn't possible.
   * Writes all pending debounced data immediately.
   */
  flushSync() {
    // Flush all debounced pending writes
    for (const [key, pending] of this._pendingWrites.entries()) {
      try {
        localStorage.setItem(key, JSON.stringify(pending.data))
      } catch { /* best effort on unload */ }
    }
    this._pendingWrites.clear()

    // Process remaining queue items synchronously
    for (const item of this._queue) {
      try {
        localStorage.setItem(item.key, JSON.stringify(item.data))
      } catch { /* best effort on unload */ }
    }
    this._queue = []
  }

  /**
   * Delete a localStorage key (also queued, but immediate).
   * @param {string} key
   */
  remove(key) {
    try {
      localStorage.removeItem(key)
    } catch { /* silent */ }
  }

  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Get queue diagnostics.
   */
  get stats() {
    return {
      queueLength: this._queue.length,
      pendingDebounced: this._pendingWrites.size,
      isProcessing: this._processing,
    }
  }
}

// Singleton
export const writeQueue = new WriteQueue()
