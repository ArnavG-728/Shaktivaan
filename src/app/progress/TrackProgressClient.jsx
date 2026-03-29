'use client'
import { useState, useEffect, useMemo } from 'react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell
} from 'recharts'

// Epley formula: 1RM = weight × (1 + reps/30)
function epley(weight, reps) {
  if (!weight || !reps || reps === 0) return 0
  return Math.round(weight * (1 + Number(reps) / 30))
}

function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function formatDuration(ms) {
  const m = Math.floor(ms / 60000)
  return `${m}min`
}

function computeTonnage(sets) {
  return sets.filter(s => s.done).reduce((sum, s) => sum + (parseFloat(s.weight)||0) * (parseFloat(s.reps)||0), 0)
}

function getTrend(values) {
  if (values.length < 2) return 'flat'
  const first = values[0], last = values[values.length - 1]
  if (last > first * 1.03) return 'up'
  if (last < first * 0.97) return 'down'
  return 'flat'
}

const MEV = { Chest: 10, Back: 10, Shoulders: 10, Biceps: 8, Triceps: 8, Quads: 10, Hamstrings: 8, Glutes: 6, Calves: 6, Core: 6 }
const MAV = { Chest: 20, Back: 20, Shoulders: 20, Biceps: 18, Triceps: 18, Quads: 20, Hamstrings: 16, Glutes: 16, Calves: 12, Core: 16 }

const MUSCLE_COLORS = {
  Chest: '#e5534b', Back: '#4e9eed', Shoulders: '#d4b44a', Biceps: '#9b72cf',
  Triceps: '#e5934b', Quads: '#3db88a', Hamstrings: '#3dbdb8', Glutes: '#e5534b',
  Calves: '#3db88a', Core: '#9b72cf'
}

const EXERCISE_MUSCLES = {
  'Incline Dumbbell Press': 'Chest', 'Flat Barbell Bench Press': 'Chest',
  'Incline Machine Press': 'Chest', 'Cable Chest Flyes (Low Pulley)': 'Chest',
  'Weighted Dips': 'Chest',
  'Conventional Deadlift': 'Back', 'Weighted Pull-Ups (Wide Grip)': 'Back',
  'Barbell Bent-Over Row (Pronated)': 'Back', 'Wide Grip Lat Pulldown': 'Back',
  'One-Arm Dumbbell Row': 'Back', 'Seated Cable Row (V-Bar)': 'Back',
  'Face Pulls (Rope, Eye Level)': 'Shoulders',
  'Barbell Overhead Press': 'Shoulders', 'Cable Lateral Raises': 'Shoulders',
  'Cable Front Raise (Single Arm)': 'Shoulders', 'Machine Shoulder Press': 'Shoulders',
  'Reverse Pec Deck / Cable Reverse Fly': 'Shoulders',
  'EZ Bar Bicep Curl': 'Biceps', 'Incline DB Curl (45° Bench)': 'Biceps',
  'Hammer Curl': 'Biceps', 'Cable Curl (Supinated, Standing)': 'Biceps',
  'EZ Bar Skullcrusher': 'Triceps', 'Overhead DB Tricep Extension': 'Triceps',
  'Rope Tricep Pushdown': 'Triceps',
  'Barbell Back Squat': 'Quads', 'Leg Press (Feet Low, Narrow)': 'Quads',
  'Leg Extension': 'Quads', 'Bulgarian Split Squat': 'Quads',
  'Romanian Deadlift': 'Hamstrings', 'Lying Leg Curl': 'Hamstrings',
  'Seated Leg Curl': 'Hamstrings',
  'Barbell Hip Thrust': 'Glutes',
  'Standing Calf Raises': 'Calves', 'Seated Calf Raises': 'Calves',
  'Cable Crunch (Kneeling)': 'Core', 'Hanging Leg Raise': 'Core',
  'Ab Wheel Rollout': 'Core',
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 6, padding: '8px 12px' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text4)', marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: p.color }}>
          {p.name}: {p.value}{p.unit || ''}
        </div>
      ))}
    </div>
  )
}

export default function TrackProgress() {
  const [sessions, setSessions] = useState([])
  const [activeEx, setActiveEx] = useState('')
  const [expandSession, setExpandSession] = useState(null)

  useEffect(() => {
    try {
      setSessions(JSON.parse(localStorage.getItem('gymlogger_sessions') || '[]'))
    } catch {}
  }, [])

  // All unique exercise names from history
  const exerciseNames = useMemo(() => {
    const names = new Set()
    sessions.forEach(s => s.sets?.forEach(set => set.exerciseName && names.add(set.exerciseName)))
    return Array.from(names)
  }, [sessions])

  useEffect(() => {
    if (!activeEx && exerciseNames.length > 0) setActiveEx(exerciseNames[0])
  }, [exerciseNames])

  // 1RM data per exercise over time
  const oneRMData = useMemo(() => {
    if (!activeEx) return []
    return sessions
      .filter(s => s.sets?.some(set => set.exerciseName === activeEx && set.done))
      .map(s => {
        const sets = s.sets.filter(set => set.exerciseName === activeEx && set.done)
        const best = Math.max(...sets.map(set => epley(parseFloat(set.weight)||0, parseFloat(set.reps)||0)))
        return { date: formatDate(s.date), '1RM': best }
      })
  }, [activeEx, sessions])

  // Weekly volume by muscle group (last 4 weeks)
  const weeklyVolume = useMemo(() => {
    if (sessions.length === 0) return []
    const now = new Date()
    const weekAgo = new Date(now - 7*24*60*60*1000)
    const recentSets = sessions
      .filter(s => new Date(s.date) >= weekAgo)
      .flatMap(s => s.sets?.filter(set => set.done) || [])

    const setsPerMuscle = {}
    recentSets.forEach(set => {
      const muscle = EXERCISE_MUSCLES[set.exerciseName] || 'Other'
      setsPerMuscle[muscle] = (setsPerMuscle[muscle] || 0) + 1
    })

    return Object.entries(MEV)
      .map(([muscle, mev]) => ({
        muscle: muscle.slice(0, 4).toUpperCase(),
        fullName: muscle,
        sets: setsPerMuscle[muscle] || 0,
        mev, mav: MAV[muscle],
        color: MUSCLE_COLORS[muscle] || '#555',
      }))
      .filter(d => d.sets > 0 || sessions.length > 0)
  }, [sessions])

  // Weekly summary stats
  const stats = useMemo(() => {
    const now = new Date()
    const weekAgo = new Date(now - 7*24*60*60*1000)
    const thisWeekSessions = sessions.filter(s => new Date(s.date) >= weekAgo)
    const totalTonnage = sessions.reduce((sum, s) => sum + (s.totalTonnage || 0), 0)
    const allSets = sessions.flatMap(s => s.sets?.filter(set => set.done) || [])
    const allOneRMs = allSets.map(s => epley(parseFloat(s.weight)||0, parseFloat(s.reps)||0)).filter(Boolean)
    const bestOneRM = allOneRMs.length ? Math.max(...allOneRMs) : 0

    return {
      totalSessions: sessions.length,
      thisWeek: thisWeekSessions.length,
      totalTonnage: Math.round(totalTonnage / 1000) + 'T',
      bestOneRM,
    }
  }, [sessions])

  // Personal records per exercise
  const prs = useMemo(() => {
    const records = {}
    sessions.forEach(s => {
      s.sets?.filter(set => set.done).forEach(set => {
        const rm = epley(parseFloat(set.weight)||0, parseFloat(set.reps)||0)
        if (!records[set.exerciseName] || rm > records[set.exerciseName].value) {
          records[set.exerciseName] = { value: rm, date: s.date, weight: set.weight, reps: set.reps }
        }
      })
    })
    return Object.entries(records).sort((a,b) => b[1].value - a[1].value).slice(0,10)
  }, [sessions])

  const sortedSessions = useMemo(() =>
    [...sessions].sort((a,b) => new Date(b.date) - new Date(a.date)), [sessions])

  if (sessions.length === 0) {
    return (
      <div>
        <div style={{ marginBottom: 20 }}>
          <div className="page-title" style={{ color: 'var(--green)' }}>TRACK PROGRESS</div>
          <div className="page-subtitle">Log your first session to start seeing your progress data here.</div>
        </div>
        <div className="empty-state">
          <div className="empty-icon">📈</div>
          <div className="empty-title">No sessions logged yet</div>
          <div className="empty-sub">
            Go to <strong>Log Session</strong> to record your first workout.<br />
            Your 1RM trends, volume data, and personal records will appear here.
          </div>
        </div>
        <div className="dash-panel" style={{ marginTop: 20 }}>
          <div className="dash-panel-title">Volume Targets — Schoenfeld et al. (2017)</div>
          <div className="dash-panel-sub">MEV = Minimum Effective Volume (10 sets/muscle/week). MAV = Maximum Adaptive Volume (~20 sets).</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8 }}>
            {Object.entries(MEV).map(([muscle, mev]) => (
              <div key={muscle} style={{ padding: '8px 10px', background: 'var(--bg3)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text5)', letterSpacing: '0.08em', marginBottom: 3 }}>{muscle.toUpperCase()}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: MUSCLE_COLORS[muscle] }}>
                  MEV {mev} — MAV {MAV[muscle]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div className="page-title" style={{ color: 'var(--green)' }}>TRACK PROGRESS</div>
        <div className="page-subtitle">
          1RM estimates via Epley formula · Week volume vs MEV/MAV targets · Personal records
        </div>
      </div>

      {/* Stats row */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-label">TOTAL SESSIONS</div>
          <div className="stat-card-value" style={{ color: 'var(--green)' }}>{stats.totalSessions}</div>
          <div className="stat-card-sub">{stats.thisWeek} this week</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">TOTAL TONNAGE</div>
          <div className="stat-card-value" style={{ color: 'var(--blue)' }}>{stats.totalTonnage}</div>
          <div className="stat-card-sub">kg lifted all-time</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">BEST EST. 1RM</div>
          <div className="stat-card-value" style={{ color: 'var(--gold)' }}>{stats.bestOneRM || '—'}</div>
          <div className="stat-card-sub">{stats.bestOneRM ? 'kg (Epley)' : 'No data yet'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">PRs RECORDED</div>
          <div className="stat-card-value" style={{ color: 'var(--purple)' }}>{prs.length}</div>
          <div className="stat-card-sub">across {exerciseNames.length} exercises</div>
        </div>
      </div>

      {/* 1RM Strength Tracker */}
      {exerciseNames.length > 0 && (
        <div className="dash-panel">
          <div className="dash-panel-title">Strength Tracker — Estimated 1RM</div>
          <div className="dash-panel-sub">Epley formula: 1RM = weight × (1 + reps/30)</div>
          <div className="filter-bar" style={{ marginBottom: 12 }}>
            {exerciseNames.map(name => (
              <button key={name}
                className={`filter-chip ${activeEx === name ? 'active' : ''}`}
                style={{ '--accent': 'var(--green)', fontSize: 11 }}
                onClick={() => setActiveEx(name)}
              >
                {name.split(' ').slice(0,3).join(' ')}
              </button>
            ))}
          </div>
          {oneRMData.length >= 2 ? (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={oneRMData} margin={{ left: -20, right: 10, top: 5, bottom: 0 }}>
                <XAxis dataKey="date" tick={{ fill: 'var(--text5)', fontSize: 9, fontFamily: 'DM Mono' }} />
                <YAxis tick={{ fill: 'var(--text5)', fontSize: 9, fontFamily: 'DM Mono' }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="1RM" stroke="var(--green)" strokeWidth={2}
                  dot={{ fill: 'var(--green)', r: 3 }} name="Est. 1RM" unit="kg" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ padding: '20px 0', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text5)' }}>
              Log at least 2 sessions with this exercise to see the trend
            </div>
          )}
          {/* Trend indicator */}
          {oneRMData.length >= 2 && (() => {
            const trend = getTrend(oneRMData.map(d => d['1RM']))
            return (
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className={`trend-${trend}`} style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                  {trend === 'up' ? '↑ IMPROVING' : trend === 'down' ? '↓ REGRESSING' : '→ PLATEAU'}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text5)' }}>
                  over {oneRMData.length} sessions
                </span>
              </div>
            )
          })()}
        </div>
      )}

      {/* Weekly Volume Chart */}
      {weeklyVolume.length > 0 && (
        <div className="dash-panel">
          <div className="dash-panel-title">Weekly Volume vs Targets</div>
          <div className="dash-panel-sub">
            Green zone = MEV–MAV range (Schoenfeld et al., 2017). Below MEV = insufficient stimulus. Above MAV = diminishing returns.
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyVolume} margin={{ left: -20, right: 10, top: 5, bottom: 0 }}>
              <XAxis dataKey="muscle" tick={{ fill: 'var(--text5)', fontSize: 9, fontFamily: 'DM Mono' }} />
              <YAxis tick={{ fill: 'var(--text5)', fontSize: 9, fontFamily: 'DM Mono' }} />
              <Tooltip content={<CustomTooltip />} formatter={(v, n, p) => [v + ' sets', p.payload.fullName]} />
              <Bar dataKey="sets" name="Sets" radius={[3,3,0,0]}>
                {weeklyVolume.map((entry, i) => (
                  <Cell key={i}
                    fill={entry.sets >= entry.mev && entry.sets <= entry.mav
                      ? entry.color
                      : entry.sets < entry.mev ? 'var(--text5)' : 'var(--red)'}
                  />
                ))}
              </Bar>
              <ReferenceLine y={10} stroke="var(--green)" strokeDasharray="3 3" strokeOpacity={0.5} label={{ value: 'MEV', fill: 'var(--green)', fontSize: 8 }} />
              <ReferenceLine y={20} stroke="var(--red)" strokeDasharray="3 3" strokeOpacity={0.5} label={{ value: 'MAV', fill: 'var(--red)', fontSize: 8 }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Personal Records */}
      {prs.length > 0 && (
        <div className="dash-panel">
          <div className="dash-panel-title">Personal Records</div>
          <div className="dash-panel-sub">Best estimated 1RM per exercise. Epley formula.</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {prs.map(([name, pr], i) => (
              <div key={name} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 0', borderBottom: i < prs.length-1 ? '1px solid var(--bg3)' : 'none',
                gap: 12,
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-head)', fontSize: 15, fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {name}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text5)', marginTop: 2 }}>
                    {pr.weight}kg × {pr.reps} reps · {formatDate(pr.date)}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  {i === 0 && <span className="pr-badge">⭐ PR</span>}
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 500, color: 'var(--gold)' }}>
                    {pr.value}<span style={{ fontSize: 10, color: 'var(--text4)', marginLeft: 2 }}>kg</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Session History */}
      <div className="dash-panel">
        <div className="dash-panel-title">Session History</div>
        <div className="dash-panel-sub">{sessions.length} total sessions logged</div>
        <div>
          {sortedSessions.slice(0, 20).map((session, i) => (
            <div key={session.id}>
              <div
                className="session-item"
                onClick={() => setExpandSession(expandSession === session.id ? null : session.id)}
              >
                <div style={{ flex: 1 }}>
                  <div className="session-date">{formatDate(session.date)}</div>
                  <div className="session-label">{session.dayLabel || 'Workout'}</div>
                  <div className="session-meta">
                    {session.sets?.filter(s => s.done).length || 0} sets completed
                    {session.duration && ` · ${formatDuration(session.duration)}`}
                  </div>
                </div>
                <div>
                  <div className="session-tonnage">{Math.round(session.totalTonnage || 0)} kg</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text5)', textAlign: 'right', marginTop: 2 }}>tonnage</div>
                </div>
                <div style={{ color: 'var(--text5)', fontSize: 12 }}>{expandSession === session.id ? '▴' : '▾'}</div>
              </div>
              {expandSession === session.id && session.sets && (
                <div style={{ padding: '10px 16px 14px', background: 'var(--bg3)', borderBottom: '1px solid var(--border)' }}>
                  {Object.entries(
                    session.sets.filter(s => s.done).reduce((acc, s) => {
                      if (!acc[s.exerciseName]) acc[s.exerciseName] = []
                      acc[s.exerciseName].push(s)
                      return acc
                    }, {})
                  ).map(([exName, sets]) => (
                    <div key={exName} style={{ marginBottom: 10 }}>
                      <div style={{ fontFamily: 'var(--font-head)', fontSize: 13, fontWeight: 700, color: 'var(--text2)', marginBottom: 4 }}>
                        {exName}
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {sets.map((s, si) => (
                          <div key={si} style={{
                            fontFamily: 'var(--font-mono)', fontSize: 10, padding: '3px 8px',
                            background: 'var(--bg2)', borderRadius: 'var(--radius-xs)',
                            color: 'var(--text3)',
                          }}>
                            {s.weight}kg × {s.reps}
                            <span style={{ color: 'var(--text5)', marginLeft: 4 }}>RPE {s.rpe || '?'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
