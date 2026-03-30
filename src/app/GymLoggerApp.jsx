'use client'
import { useState, useEffect, useRef } from 'react'
import MyPlan from './plan/MyPlanClient'
import ExerciseList from './exercises/ExerciseListClient'
import TrackProgress from './progress/TrackProgressClient'
import LogSession from './log/LogSessionClient'
import Science from './science/ScienceClient'
import Tools from './tools/ToolsClient'

const TABS = [
  { id: 'plan',      label: 'My Plan',       icon: '📋', accent: '--gold' },
  { id: 'exercises', label: 'Exercise List',  icon: '🏋', accent: '--blue' },
  { id: 'progress',  label: 'Track Progress', icon: '📈', accent: '--green' },
  { id: 'log',       label: 'Log Session',    icon: '⚡', accent: '--red' },
  { id: 'tools',     label: 'Tools',          icon: '🛠️', accent: '--teal' },
  { id: 'science',   label: 'Science',        icon: '🔬', accent: '--purple' },
]

function computeStreak(sessions) {
  if (!sessions || sessions.length === 0) return 0
  const today = new Date(); today.setHours(0,0,0,0)
  const sorted = [...sessions].sort((a, b) => new Date(b.date) - new Date(a.date))
  let streak = 0, check = today
  for (const s of sorted) {
    const d = new Date(s.date); d.setHours(0,0,0,0)
    const diff = (check - d) / 86400000
    if (diff <= 1) { streak++; check = d }
    else break
  }
  return streak
}

export default function GymLoggerApp() {
  const [tab, setTab] = useState('plan')
  const [sessions, setSessions] = useState([])
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    try {
      setSessions(JSON.parse(localStorage.getItem('gymlogger_sessions') || '[]'))
      const saved = localStorage.getItem('gymlogger_theme') || 'dark'
      setTheme(saved)
      document.documentElement.dataset.theme = saved === 'light' ? 'light' : ''
    } catch {}
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.dataset.theme = next === 'light' ? 'light' : ''
    try { localStorage.setItem('gymlogger_theme', next) } catch {}
  }

  const touchStartX = useRef(null)
  const touchEndX = useRef(null)

  const onTouchStart = (e) => {
    touchEndX.current = null
    touchStartX.current = e.targetTouches[0].clientX
  }

  const onTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX
  }

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return
    const distance = touchStartX.current - touchEndX.current
    
    // Swipe left (next tab)
    if (distance > 60) {
      const currentIndex = TABS.findIndex(t => t.id === tab)
      if (currentIndex < TABS.length - 1) setTab(TABS[currentIndex + 1].id)
    }
    // Swipe right (prev tab)
    else if (distance < -60) {
      const currentIndex = TABS.findIndex(t => t.id === tab)
      if (currentIndex > 0) setTab(TABS[currentIndex - 1].id)
    }
  }

  const streak = computeStreak(sessions)
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
              {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase()} · YOUR SCIENCE BACKED GYM LOGGER
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

      <main 
        className="page-content"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div key={tab} className="tab-content">
          {tab === 'plan'      && <MyPlan />}
          {tab === 'exercises' && <ExerciseList />}
          {tab === 'progress'  && <TrackProgress />}
          {tab === 'log'       && <LogSession onSessionSaved={() => {
            try { setSessions(JSON.parse(localStorage.getItem('gymlogger_sessions') || '[]')) } catch {}
          }} />}
          {tab === 'tools'     && <Tools />}
          {tab === 'science'   && <Science />}
        </div>
      </main>
    </div>
  )
}
