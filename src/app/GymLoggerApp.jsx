'use client'
import { useState, useEffect } from 'react'
import MyPlan from './plan/MyPlanClient'
import ExerciseList from './exercises/ExerciseListClient'
import TrackProgress from './progress/TrackProgressClient'
import LogSession from './log/LogSessionClient'

const TABS = [
  { id: 'plan',      label: 'My Plan',       icon: '📋', accent: '--gold' },
  { id: 'exercises', label: 'Exercise List',  icon: '🏋', accent: '--blue' },
  { id: 'progress',  label: 'Track Progress', icon: '📈', accent: '--green' },
  { id: 'log',       label: 'Log Session',    icon: '⚡', accent: '--red' },
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

  useEffect(() => {
    try {
      setSessions(JSON.parse(localStorage.getItem('gymlogger_sessions') || '[]'))
    } catch {}
  }, [])

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
      <header className="global-header">
        <div className="global-header-top">
          <h1>GYMLOGGER <span>PRO</span></h1>
          {streak > 0 && (
            <div className="streak-badge">🔥 {streak} DAY STREAK</div>
          )}
        </div>
        <div className="header-stats">
          <div className="header-stat">SESSIONS <span>{totalSessions}</span></div>
          <div className="header-stat">THIS WEEK <span>{thisWeek}</span></div>
          <div className="header-stat">PLAN <span>PPL × 2</span></div>
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
        {tab === 'plan'      && <MyPlan />}
        {tab === 'exercises' && <ExerciseList />}
        {tab === 'progress'  && <TrackProgress />}
        {tab === 'log'       && <LogSession onSessionSaved={() => {
          try { setSessions(JSON.parse(localStorage.getItem('gymlogger_sessions') || '[]')) } catch {}
        }} />}
      </main>
    </div>
  )
}
