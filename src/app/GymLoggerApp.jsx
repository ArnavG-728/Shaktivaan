'use client'
import { useState, useEffect } from 'react'
import MyPlan from './plan/MyPlanClient'
import ExerciseList from './exercises/ExerciseListClient'
import TrackProgress from './progress/TrackProgressClient'
import LogSession from './log/LogSessionClient'
import Science from './science/ScienceClient'
import Tools from './tools/ToolsClient'
import { useStoreInit, useStore, useTheme, useDerivedStore } from '../lib/useStore'
import { computeStreak } from '../lib/computeCache'
import { store } from '../lib/store'

const TABS = [
  { id: 'plan',      label: 'My Plan',       icon: '📋', accent: '--gold' },
  { id: 'exercises', label: 'Exercise List',  icon: '🏋', accent: '--blue' },
  { id: 'progress',  label: 'Track Progress', icon: '📈', accent: '--green' },
  { id: 'log',       label: 'Log Session',    icon: '⚡', accent: '--red' },
  { id: 'tools',     label: 'Tools',          icon: '🛠️', accent: '--teal' },
  { id: 'science',   label: 'Science',        icon: '🔬', accent: '--purple' },
]

export default function GymLoggerApp() {
  // Initialise the centralised store on mount (runs migrations, warms caches)
  useStoreInit()

  const [tab, setTab] = useState('plan')

  // Reactive data from the store — auto-updates when sessions change anywhere
  const sessions = useStore('sessions')

  // Theme with toggle — syncs across components via event bus
  const { theme, toggleTheme } = useTheme()

  // Defer date rendering to client to prevent hydration mismatch
  const [dateStr, setDateStr] = useState('')
  useEffect(() => {
    setDateStr(new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase())
  }, [])

  // Cached computations — only recomputed when sessions data actually changes
  const streak = useDerivedStore('streak', ['sessions'], () => computeStreak(store.sessions.getAll()))

  const totalSessions = sessions.length
  const thisWeek = sessions.filter(s => {
    const d = new Date(s.date)
    const now = new Date()
    const weekAgo = new Date(now - 7*24*60*60*1000)
    return d >= weekAgo
  }).length

  const currentTab = TABS.find(t => t.id === tab)
  const accentVar = currentTab?.accent || '--gold'

  return (
    <div className="app-shell" style={{ '--accent': `var(${accentVar})` }}>
      <header className="global-header" style={{ '--accent': `var(${accentVar})` }}>
        <div className="header-accent" />
        <div className="global-header-top">
          <div>
            <h1>SHAKTIVAAN</h1>
            <div className="header-date">
              {dateStr} · YOUR SCIENCE BACKED GYM LOGGER
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {streak > 0 && (
              <div className="streak-badge">🔥 {streak} DAY STREAK</div>
            )}
            <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
        <div className="header-stats">
          <div className="header-stat">
            <div className="stat-label">TOTAL SESSIONS</div>
            <div className="stat-value">{totalSessions}</div>
          </div>
          <div className="header-stat">
            <div className="stat-label">THIS WEEK</div>
            <div className="stat-value">{thisWeek}</div>
          </div>
          <div className="header-stat">
            <div className="stat-label">ACTIVE PLAN</div>
            <div className="stat-value">PPL × 2</div>
          </div>
        </div>
      </header>

      <nav className="nav-tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`nav-tab ${tab === t.id ? 'active' : ''}`}
            style={{ '--tab-accent': `var(${t.accent})` }}
            onClick={() => setTab(t.id)}
          >
            <span className="nav-tab-icon">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>

      <main className="page-content">
        <div key={tab} className="tab-content">
          {tab === 'plan'      && <MyPlan />}
          {tab === 'exercises' && <ExerciseList />}
          {tab === 'progress'  && <TrackProgress />}
          {tab === 'log'       && <LogSession />}
          {tab === 'tools'     && <Tools />}
          {tab === 'science'   && <Science />}
        </div>
      </main>
    </div>
  )
}
