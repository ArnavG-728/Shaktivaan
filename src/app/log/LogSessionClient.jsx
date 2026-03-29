'use client'
import { useState, useEffect, useRef, useCallback } from 'react'

function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2) }

const RPE_LABELS = {
  6: 'Very Easy', 7: 'Easy', 7.5: 'Moderate',
  8: 'Hard', 8.5: 'Very Hard', 9: 'Near Limit', 10: 'Max Effort',
}
const RPE_VALUES = [6, 7, 7.5, 8, 8.5, 9, 10]

// Parse rest string like "90s", "2 min", "2.5 min" into seconds
function parseRest(restStr) {
  if (!restStr || restStr === '—') return 90
  if (restStr.includes('min')) {
    return Math.round(parseFloat(restStr) * 60)
  }
  return parseInt(restStr) || 90
}

function RestTimer({ seconds, onDone }) {
  const [remaining, setRemaining] = useState(seconds)
  const [running, setRunning] = useState(true)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) { clearInterval(intervalRef.current); onDone?.(); return 0 }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [running])

  const toggle = () => setRunning(r => !r)
  const reset = () => { clearInterval(intervalRef.current); setRemaining(seconds); setRunning(true) }

  const pct = ((seconds - remaining) / seconds) * 100

  return (
    <div className="rest-timer">
      <div style={{ position: 'relative', width: 44, height: 44, flexShrink: 0 }}>
        <svg viewBox="0 0 44 44" style={{ transform: 'rotate(-90deg)', width: 44, height: 44 }}>
          <circle cx="22" cy="22" r="18" fill="none" stroke="var(--bg3)" strokeWidth="3" />
          <circle cx="22" cy="22" r="18" fill="none" stroke="var(--red)" strokeWidth="3"
            strokeDasharray={`${2 * Math.PI * 18}`}
            strokeDashoffset={`${2 * Math.PI * 18 * (1 - pct/100)}`}
            strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s linear' }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-mono)', fontSize: 10, color: remaining > 0 ? 'var(--red)' : 'var(--green)' }}>
          {remaining > 0 ? remaining : '✓'}
        </div>
      </div>
      <div>
        <div className="rest-timer-label">REST TIMER</div>
        <div className="rest-timer-count">{Math.floor(remaining/60)}:{String(remaining%60).padStart(2,'0')}</div>
      </div>
      <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
        <button className="btn btn-ghost btn-sm" onClick={toggle}>{running ? '⏸' : '▶'}</button>
        <button className="btn btn-ghost btn-sm" onClick={reset}>↺</button>
      </div>
    </div>
  )
}

function SetLogger({ set, exerciseName, prevSet, accent, onUpdate }) {
  const [weight, setWeight] = useState(prevSet?.weight || '')
  const [reps, setReps] = useState(prevSet?.reps || '')
  const [rpe, setRpe] = useState(null)
  const [done, setDone] = useState(false)
  const [showTimer, setShowTimer] = useState(false)

  useEffect(() => {
    onUpdate({ setNum: set.n, exerciseName, weight, reps, rpe, done })
  }, [weight, reps, rpe, done])

  const handleDone = () => {
    if (!done) {
      setDone(true)
      setShowTimer(true)
    } else {
      setDone(false)
      setShowTimer(false)
    }
  }

  return (
    <div>
      <div className="log-set-row">
        <div className="log-set-num">S{set.n}</div>
        <input
          className={`log-input ${!weight && prevSet?.weight ? 'prev' : ''}`}
          placeholder={prevSet?.weight ? String(prevSet.weight) : set.kg ? String(set.kg) : 'kg'}
          value={weight}
          onChange={e => setWeight(e.target.value)}
          type="number"
          step="0.5"
        />
        <input
          className={`log-input ${!reps && prevSet?.reps ? 'prev' : ''}`}
          placeholder={prevSet?.reps ? String(prevSet.reps) : String(set.reps)}
          value={reps}
          onChange={e => setReps(e.target.value)}
          type="number"
        />
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text5)', textAlign: 'center' }}>
          {set.rest && set.rest !== '—' ? set.rest : '—'}
        </div>
        <button className={`check-btn ${done ? 'done' : ''}`} onClick={handleDone}>
          {done ? '✓' : '○'}
        </button>
      </div>
      {done && (
        <div style={{ marginLeft: 30, marginBottom: 6 }}>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
            {RPE_VALUES.map(r => (
              <button key={r}
                className={`rpe-btn ${rpe === r ? 'active' : ''}`}
                style={{ '--accent': accent }}
                onClick={() => setRpe(rpe === r ? null : r)}
              >
                {r}
              </button>
            ))}
            {rpe && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text4)', alignSelf: 'center', marginLeft: 4 }}>
              {RPE_LABELS[rpe] || ''}
            </span>}
          </div>
          {showTimer && set.rest && set.rest !== '—' && (
            <RestTimer
              seconds={parseRest(set.rest)}
              onDone={() => setShowTimer(false)}
            />
          )}
        </div>
      )}
    </div>
  )
}

function ExerciseLogger({ ex, sessionSets, prevSession, accent, onSetUpdate }) {
  const [open, setOpen] = useState(true)
  const prevSetsForEx = prevSession?.sets?.filter(s => s.exerciseName === ex.name) || []

  const doneSets = sessionSets.filter(s => s.exerciseName === ex.name && s.done).length

  return (
    <div className={`ex-card ${open ? 'open' : ''}`} style={{ '--accent': accent, marginBottom: 10 }}>
      <div className="ex-head" onClick={() => setOpen(o => !o)}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
            <span className={`badge badge-${(ex.badge || 'strength').toLowerCase()}`}>{ex.badge}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--green)' }}>
              {doneSets}/{ex.sets.length} SETS
            </span>
          </div>
          <div className="ex-name">{ex.name}</div>
          <div className="ex-targets">{ex.targets}</div>
        </div>
        <div className="ex-toggle">▾</div>
      </div>
      {open && (
        <div className="ex-body">
          <div style={{ display: 'grid', gridTemplateColumns: '30px 1fr 1fr 80px 36px', gap: 8, marginBottom: 8 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text5)' }}>#</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text5)' }}>KG</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text5)' }}>REPS</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text5)', textAlign: 'center' }}>REST</div>
            <div />
          </div>
          {ex.sets.map((set, si) => (
            <SetLogger
              key={`${ex.id}-${set.n}`}
              set={set}
              exerciseName={ex.name}
              prevSet={prevSetsForEx[si]}
              accent={accent}
              onUpdate={data => onSetUpdate(data)}
            />
          ))}
          {ex.prog && (
            <div className="prog-note" style={{ marginTop: 10 }}>
              PROGRESSION: <span>{ex.prog}</span>
            </div>
          )}
          {ex.cues && (
            <div className="prog-note">
              CUES: <span>{ex.cues.join(' · ')}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function PlanDaySelector({ plans, onSelect }) {
  const [planIdx, setPlanIdx] = useState(0)
  const plan = plans[planIdx]
  const workoutDays = plan?.days.filter(d => !d.rest && d.exercises?.length > 0) || []

  return (
    <div>
      <div className="form-group">
        <label className="form-label">Select Plan</label>
        <select className="form-select" value={planIdx} onChange={e => setPlanIdx(Number(e.target.value))}>
          {plans.map((p, i) => <option key={p.id} value={i}>{p.name}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Select Day</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {workoutDays.map(day => (
            <button key={day.key}
              className="btn btn-outline"
              style={{ justifyContent: 'flex-start', gap: 12, '--accent': day.accent || 'var(--gold)' }}
              onClick={() => onSelect(plan, day)}
            >
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: day.accent || 'var(--gold)', flexShrink: 0 }} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontFamily: 'var(--font-head)', fontSize: 16 }}>{day.label}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text5)', fontWeight: 400, letterSpacing: '0.06em' }}>
                  {day.exercises.length} exercises · {day.focus}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function LogSession({ onSessionSaved }) {
  const [phase, setPhase] = useState('select') // select | active | done
  const [plans, setPlans] = useState([])
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [selectedDay, setSelectedDay] = useState(null)
  const [sessionSets, setSessionSets] = useState([])
  const [startTime, setStartTime] = useState(null)
  const [elapsed, setElapsed] = useState(0)
  const [prevSession, setPrevSession] = useState(null)
  const timerRef = useRef(null)

  useEffect(() => {
    try {
      const p = JSON.parse(localStorage.getItem('gymlogger_plans') || '[]')
      setPlans(p)
    } catch {}
  }, [])

  useEffect(() => {
    if (phase === 'active') {
      const start = Date.now()
      setStartTime(start)
      timerRef.current = setInterval(() => setElapsed(Date.now() - start), 1000)
      return () => clearInterval(timerRef.current)
    }
  }, [phase])

  const handleSelectDay = useCallback((plan, day) => {
    setSelectedPlan(plan)
    setSelectedDay(day)
    // Find previous session for this day
    try {
      const allSessions = JSON.parse(localStorage.getItem('gymlogger_sessions') || '[]')
      const prev = allSessions.filter(s => s.planId === plan.id && s.dayLabel === day.label)
        .sort((a, b) => new Date(b.date) - new Date(a.date))[0]
      setPrevSession(prev || null)
    } catch {}
    setPhase('active')
  }, [])

  const handleSetUpdate = useCallback((data) => {
    setSessionSets(prev => {
      const key = `${data.exerciseName}-${data.setNum}`
      const existing = prev.findIndex(s => s.exerciseName === data.exerciseName && s.setNum === data.setNum)
      if (existing >= 0) {
        const updated = [...prev]
        updated[existing] = { ...data, key }
        return updated
      }
      return [...prev, { ...data, key }]
    })
  }, [])

  const handleFinish = useCallback(() => {
    const duration = Date.now() - startTime
    const doneSets = sessionSets.filter(s => s.done)
    const totalTonnage = doneSets.reduce((sum, s) =>
      sum + (parseFloat(s.weight)||0) * (parseFloat(s.reps)||0), 0)

    const session = {
      id: genId(),
      date: new Date().toISOString(),
      planId: selectedPlan.id,
      dayLabel: selectedDay.label,
      duration,
      totalTonnage,
      sets: doneSets,
    }

    try {
      const existing = JSON.parse(localStorage.getItem('gymlogger_sessions') || '[]')
      localStorage.setItem('gymlogger_sessions', JSON.stringify([...existing, session]))
    } catch {}

    clearInterval(timerRef.current)
    setPhase('done')
    onSessionSaved?.()
  }, [sessionSets, startTime, selectedPlan, selectedDay, onSessionSaved])

  const formatElapsed = (ms) => {
    const m = Math.floor(ms / 60000)
    const s = Math.floor((ms % 60000) / 1000)
    return `${m}:${String(s).padStart(2,'0')}`
  }

  const doneSets = sessionSets.filter(s => s.done).length
  const totalSets = selectedDay?.exercises.reduce((sum, ex) => sum + ex.sets.length, 0) || 0
  const accent = selectedDay?.accent || 'var(--red)'

  if (phase === 'done') {
    const tonnage = sessionSets.filter(s => s.done)
      .reduce((sum, s) => sum + (parseFloat(s.weight)||0) * (parseFloat(s.reps)||0), 0)
    return (
      <div>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🏆</div>
          <div className="page-title" style={{ color: 'var(--green)', textAlign: 'center', marginBottom: 8 }}>SESSION COMPLETE</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text4)', marginBottom: 24 }}>
            {selectedDay?.label} · {formatElapsed(elapsed)}
          </div>
          <div className="stats-grid" style={{ maxWidth: 400, margin: '0 auto 24px' }}>
            <div className="stat-card" style={{ textAlign: 'center' }}>
              <div className="stat-card-label">SETS DONE</div>
              <div className="stat-card-value" style={{ color: 'var(--green)' }}>{doneSets}</div>
            </div>
            <div className="stat-card" style={{ textAlign: 'center' }}>
              <div className="stat-card-label">TONNAGE</div>
              <div className="stat-card-value" style={{ color: 'var(--gold)' }}>{Math.round(tonnage)}</div>
              <div className="stat-card-sub">kg moved</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button className="btn btn-primary" style={{ background: 'var(--green)' }}
              onClick={() => { setPhase('select'); setSessionSets([]); setSelectedDay(null); setSelectedPlan(null) }}>
              Log Another
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, gap: 12 }}>
        <div>
          <div className="page-title" style={{ color: 'var(--red)' }}>
            {phase === 'active' ? selectedDay?.label.toUpperCase() || 'LOG SESSION' : 'LOG SESSION'}
          </div>
          <div className="page-subtitle">
            {phase === 'select'
              ? 'Choose a plan day to start your session. Previous performance shown as ghost text.'
              : `${selectedDay?.focus} · ${selectedDay?.exercises.length} exercises`}
          </div>
        </div>
        {phase === 'active' && (
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, color: 'var(--red)', lineHeight: 1 }}>
              {formatElapsed(elapsed)}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text5)', marginTop: 2 }}>
              {doneSets}/{totalSets} SETS
            </div>
          </div>
        )}
      </div>

      {phase === 'select' && (
        plans.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <div className="empty-title">No plans yet</div>
            <div className="empty-sub">Create a plan first in the My Plan tab.</div>
          </div>
        ) : (
          <PlanDaySelector plans={plans} onSelect={handleSelectDay} />
        )
      )}

      {phase === 'active' && selectedDay && (
        <>
          {/* Day tip */}
          {selectedDay.tip && (
            <div className="tip-box" dangerouslySetInnerHTML={{ __html: selectedDay.tip }} style={{ marginBottom: 16 }} />
          )}

          {/* Progress bar */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text5)', letterSpacing: '0.08em' }}>PROGRESS</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: accent }}>{doneSets}/{totalSets} sets</span>
            </div>
            <div style={{ height: 3, background: 'var(--bg3)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: accent, width: `${totalSets > 0 ? (doneSets/totalSets)*100 : 0}%`, transition: 'width 0.3s ease', borderRadius: 2 }} />
            </div>
          </div>

          {/* Prev session note */}
          {prevSession && (
            <div style={{ marginBottom: 14, padding: '8px 12px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text5)', letterSpacing: '0.08em', marginBottom: 3 }}>
                LAST SESSION — {new Date(prevSession.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)' }}>
                {prevSession.sets?.filter(s => s.done).length} sets · {Math.round(prevSession.totalTonnage || 0)} kg tonnage
                {prevSession.duration && ` · ${Math.floor(prevSession.duration/60000)}min`}
              </div>
            </div>
          )}

          {/* Exercise loggers */}
          {selectedDay.exercises.map(ex => (
            <ExerciseLogger
              key={ex.id}
              ex={ex}
              sessionSets={sessionSets}
              prevSession={prevSession}
              accent={accent}
              onSetUpdate={handleSetUpdate}
            />
          ))}

          {/* Finish button */}
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
            <button className="btn btn-outline" onClick={() => { if (confirm('Cancel this session?')) { setPhase('select'); setSessionSets([]); clearInterval(timerRef.current) } }}>
              Cancel
            </button>
            <button className="btn btn-primary" style={{ flex: 1, background: 'var(--green)', justifyContent: 'center', fontSize: 16 }} onClick={handleFinish}>
              ✓ Finish Session ({doneSets} sets)
            </button>
          </div>
        </>
      )}
    </div>
  )
}
