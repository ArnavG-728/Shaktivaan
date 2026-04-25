/**
 * Event Bus — Lightweight pub/sub system for cross-component communication.
 *
 * Instead of prop-drilling or polling localStorage, components subscribe
 * to domain events and react when data changes anywhere in the app.
 *
 * Events:
 *   session:saved, session:deleted, session:updated
 *   plan:saved, plan:deleted
 *   exercise:saved, exercise:deleted
 *   bodyweight:added, bodyweight:deleted
 *   theme:changed
 *   activeSession:changed
 *   store:error, store:quota-warning
 */

class EventBus {
  constructor() {
    /** @type {Map<string, Set<Function>>} */
    this._listeners = new Map()
    this._history = []        // last 50 events for debugging
    this._maxHistory = 50
  }

  /**
   * Subscribe to an event. Returns an unsubscribe function.
   * @param {string} event
   * @param {Function} callback
   * @returns {Function} unsubscribe
   */
  on(event, callback) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set())
    }
    this._listeners.get(event).add(callback)

    // Return cleanup function (call in useEffect cleanup)
    return () => {
      const set = this._listeners.get(event)
      if (set) {
        set.delete(callback)
        if (set.size === 0) this._listeners.delete(event)
      }
    }
  }

  /**
   * Subscribe to an event — fires only once, then auto-unsubscribes.
   * @param {string} event
   * @param {Function} callback
   * @returns {Function} unsubscribe (in case you want to cancel before it fires)
   */
  once(event, callback) {
    const unsub = this.on(event, (...args) => {
      unsub()
      callback(...args)
    })
    return unsub
  }

  /**
   * Emit an event to all subscribers.
   * @param {string} event
   * @param {*} [payload]
   */
  emit(event, payload) {
    // Record for debugging
    this._history.push({ event, payload, time: Date.now() })
    if (this._history.length > this._maxHistory) {
      this._history.shift()
    }

    const listeners = this._listeners.get(event)
    if (!listeners || listeners.size === 0) return

    // Iterate a snapshot so listeners can safely unsubscribe during emit
    for (const fn of [...listeners]) {
      try {
        fn(payload)
      } catch (err) {
        console.error(`[EventBus] Error in listener for "${event}":`, err)
      }
    }
  }

  /**
   * Remove all listeners for an event, or all listeners entirely.
   * @param {string} [event] — if omitted, clears everything
   */
  off(event) {
    if (event) {
      this._listeners.delete(event)
    } else {
      this._listeners.clear()
    }
  }

  /**
   * Get the last N events for debugging.
   * @param {number} [n=10]
   */
  getHistory(n = 10) {
    return this._history.slice(-n)
  }

  /**
   * Get the count of active listeners (for diagnostics).
   */
  get listenerCount() {
    let count = 0
    for (const set of this._listeners.values()) count += set.size
    return count
  }
}

// Singleton — shared across the entire app
export const eventBus = new EventBus()
