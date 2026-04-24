'use client'
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import ExerciseSelectorModal from '../../components/ExerciseSelectorModal'
import { EXERCISES } from '../../data/exercises'

function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2) }

const RPE_LABELS = {
  6: 'Very Easy', 7: 'Easy', 7.5: 'Moderate',
  8: 'Hard', 8.5: 'Very Hard', 9: 'Near Limit', 10: 'Max Effort',
}
const RPE_VALUES = [6, 7, 7.5, 8, 8.5, 9, 10]

function parseRest(restStr) {
  if (!restStr || restStr === '—') return 90
  if (restStr.includes('min')) return Math.round(parseFloat(restStr) * 60)
  return parseInt(restStr) || 90
}

function playBeep(freq = 880, duration = 0.18, vol = 0.4) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.frequency.value = freq; osc.type = 'sine'
    gain.gain.setValueAtTime(vol, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + duration)
  } catch { }
}

function vibrateIfAvailable(pattern = [100, 50, 100]) {
  try { navigator.vibrate?.(pattern) } catch { }
}

function GlobalRestTimer({ endsAt, onSkip, onAdd15 }) {
  const [now, setNow] = useState(Date.now())
  const [beeped, setBeeped] = useState(false)
  const isRunning = endsAt && endsAt > now

  useEffect(() => {
    if (!endsAt) return
    setBeeped(false)
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [endsAt])

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!endsAt || endsAt < now) {
    if (endsAt && !beeped) {
      setBeeped(true)
      playBeep(880, 0.2); setTimeout(() => playBeep(1100, 0.3), 220)
      vibrateIfAvailable([150, 80, 150])
      onSkip()
    }
    return null
  }

  const remaining = Math.max(0, Math.ceil((endsAt - now) / 1000))
  const initialSeconds = 90
  const pct = Math.max(0, (remaining / initialSeconds) * 100)
  const urgent = remaining <= 10

  if (remaining === 11 && !beeped) playBeep(440, 0.1, 0.2)
  if (!mounted) return null

  return createPortal(
    <div className="dynamic-island-timer" style={{
      position: 'fixed', bottom: 85, left: '50%', transform: 'translateX(-50%)',
      width: 'fit-content', minWidth: 260, zIndex: 9999,
      background: urgent ? 'rgba(229,83,75,0.2)' : 'rgba(10,10,10,0.85)',
      backdropFilter: 'blur(24px)', border: `1px solid ${urgent ? 'var(--red)' : 'var(--border2)'}`,
      boxShadow: '0 12px 40px rgba(0,0,0,0.6)', borderRadius: 40,
      padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 14,
      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    }}>
      <div style={{ position: 'relative', width: 32, height: 32 }}>
        <svg viewBox="0 0 44 44" style={{ transform: 'rotate(-90deg)', width: 32, height: 32 }}>
          <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
          <circle cx="22" cy="22" r="18" fill="none" stroke={urgent ? 'var(--red)' : 'var(--green)'} strokeWidth="4"
            strokeDasharray={`${2 * Math.PI * 18}`} strokeDashoffset={`${2 * Math.PI * 18 * (1 - pct / 100)}`}
            strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s linear' }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 9, color: urgent ? '#fff' : 'var(--green)', fontWeight: 600 }}>
          {remaining}
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#fff', fontWeight: 500 }}>
          {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text5)', letterSpacing: '0.05em' }}>RESTING</div>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: 10, color: 'var(--blue)' }} onClick={onAdd15}>+15s</button>
        <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: 10, color: 'var(--text4)' }} onClick={onSkip}>Skip</button>
      </div>
    </div>,
    document.body
  )
}

function SetLogger({ set, currentSetData, exerciseName, prevSet, accent, onUpdate, isWarmup, onToggleWarmup, onRemoveSet, onStartTimer, exNote }) {
  const [weight, setWeight] = useState(currentSetData?.weight ?? prevSet?.weight ?? '')
  const [reps, setReps] = useState(currentSetData?.reps ?? prevSet?.reps ?? '')
  const [rpe, setRpe] = useState(currentSetData?.rpe ?? null)
  const [done, setDone] = useState(currentSetData?.done ?? false)
  const [isBodyweight, setIsBodyweight] = useState(currentSetData?.isBodyweight ?? false)

  useEffect(() => {
    onUpdate({ setNum: set.n, exerciseName, weight, reps, rpe, done, isWarmup, isBodyweight, exNote })
  }, [weight, reps, rpe, done, isWarmup, isBodyweight, exNote])

  const handleDone = () => {
    if (!done) {
      setDone(true)
      if (!isWarmup && set.rest && set.rest !== '—') onStartTimer?.(parseRest(set.rest))
      playBeep(660, 0.15)
      vibrateIfAvailable([80])
    } else {
      setDone(false)
    }
  }

  return (
    <div style={{ borderLeft: isWarmup ? '2px solid var(--blue)' : 'none', paddingLeft: isWarmup ? 8 : 0, marginBottom: 2 }}>
      <div className="log-set-row" style={{ gridTemplateColumns: '24px 1fr 1fr 60px 40px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, justifyContent: 'center' }}>
          <button
            onClick={onToggleWarmup}
            title={isWarmup ? 'Warm-up set (click to make working set)' : 'Working set (click to make warm-up)'}
            style={{ fontFamily: 'var(--font-mono)', fontSize: 9, cursor: 'pointer', border: 'none', background: 'transparent', padding: 0, color: isWarmup ? 'var(--blue)' : 'var(--text5)', letterSpacing: '0.06em', textAlign: 'left', lineHeight: 1.2 }}>
            {isWarmup ? `W${set.n}` : `S${set.n}`}
          </button>
        </div>
        <div style={{ position: 'relative', display: 'flex', width: '100%' }}>
          {isBodyweight && <span style={{ position: 'absolute', left: 4, top: '50%', transform: 'translateY(-50%)', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text5)', pointerEvents: 'none' }}>+</span>}
          <input
            className={`log-input ${!weight && prevSet?.weight ? 'prev' : ''}`}
            style={{ paddingLeft: isBodyweight ? 14 : undefined, width: '100%' }}
            placeholder={prevSet?.weight ? String(prevSet.weight) : set.kg ? String(set.kg) : 'kg'}
            value={weight} onChange={e => setWeight(e.target.value)} type="number" step="0.5"
          />
        </div>
        <input
          className={`log-input ${!reps && prevSet?.reps ? 'prev' : ''}`}
          placeholder={prevSet?.reps ? String(prevSet.reps) : String(set.reps)}
          value={reps} onChange={e => setReps(e.target.value)} type="number"
        />
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text5)', textAlign: 'center' }}>
          {isWarmup ? '—' : (set.rest && set.rest !== '—' ? set.rest : '—')}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button className={`check-btn ${done ? 'done' : ''}`} onClick={handleDone}>{done ? '✓' : '○'}</button>
          {!done && onRemoveSet && (
            <button onClick={onRemoveSet} style={{ background: 'transparent', border: 'none', color: 'var(--red)', fontSize: 13, cursor: 'pointer', padding: '0 4px', lineHeight: 1 }}>×</button>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-start', paddingLeft: 32, marginTop: 4, marginBottom: 8 }}>
        <button onClick={() => setIsBodyweight(prev => !prev)} style={{ background: isBodyweight ? 'var(--green)' : 'var(--bg3)', border: 'none', color: isBodyweight ? '#000' : 'var(--text5)', fontSize: 9, fontFamily: 'var(--font-mono)', padding: '3px 8px', borderRadius: 4, cursor: 'pointer', fontWeight: isBodyweight ? 'bold' : 'normal' }}>
          {isBodyweight ? '✓ BW (+ADDED)' : '+ BODYWEIGHT'}
        </button>
      </div>

      {(prevSet?.weight || prevSet?.reps) && (
        <div style={{ marginLeft: 38, marginBottom: 2, fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text5)', letterSpacing: '0.04em' }}>
          ↳ prev: {prevSet.weight}kg × {prevSet.reps} {prevSet.rpe && `· RPE ${prevSet.rpe}`}
        </div>
      )}

      {done && !isWarmup && (
        <div style={{ marginLeft: 30, marginBottom: 6 }}>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6, alignItems: 'center' }}>
            {RPE_VALUES.map(r => (
              <button key={r} className={`rpe-btn ${rpe === r ? 'active' : ''}`} style={{ '--accent': accent }} onClick={() => setRpe(rpe === r ? null : r)}>{r}</button>
            ))}
            {rpe && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text4)', marginLeft: 4 }}>{RPE_LABELS[rpe] || ''}</span>}
          </div>
        </div>
      )}
    </div>
  )
}

function ExerciseLogger({ ex, sessionSets, prevSession, pastSessions, accent, onSetUpdate, onAddSet, onRemoveLastSet, onRemoveExercise, onStartTimer }) {
  const [open, setOpen] = useState(true)
  const [warmupSets, setWarmupSets] = useState({})

  // Find the most recent note for this exercise in past sessions
  const historicalNote = useMemo(() => {
    if (!pastSessions) return null
    for (const session of [...pastSessions].sort((a,b) => new Date(b.date) - new Date(a.date))) {
      if (!session.sets) continue
      const setWithNote = session.sets.find(s => s.exerciseName === ex.name && s.exNote)
      if (setWithNote) return setWithNote.exNote
    }
    return null
  }, [pastSessions, ex.name])

  const [exNote, setExNote] = useState('')
  const [showExNote, setShowExNote] = useState(false)

  const prevSetsForEx = prevSession?.sets?.filter(s => s.exerciseName === ex.name) || []
  const doneSets = sessionSets.filter(s => s.exerciseName === ex.name && s.done && !s.isWarmup).length
  const totalWorkingSets = ex.sets.length

  const toggleWarmup = (si) => setWarmupSets(prev => ({ ...prev, [si]: !prev[si] }))

  return (
    <div className={`ex-card ${open ? 'open' : ''}`} style={{ '--accent': accent, marginBottom: 10 }}>
      <div className="ex-head" onClick={() => setOpen(o => !o)}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
            {ex.badge === 'CUSTOM' ? (
              <span className="badge badge-custom">CUSTOM</span>
            ) : ex.badge ? (
              <span className={`badge badge-${ex.badge.toLowerCase().replace('/', '-')}`}>{ex.badge}</span>
            ) : null}
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--green)' }}>{doneSets}/{totalWorkingSets} SETS</span>
            {Object.values(warmupSets).some(Boolean) && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--blue)' }}>+ {Object.values(warmupSets).filter(Boolean).length} WARMUP</span>}
          </div>
          <div className="ex-name">{ex.name}</div>
          {ex.targets && <div className="ex-targets">{ex.targets}</div>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button onClick={e => { e.stopPropagation(); setShowExNote(n => !n) }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 14, color: exNote ? 'var(--gold)' : 'var(--text5)', padding: '4px' }} title="Exercise note">{exNote ? '📝' : '💬'}</button>
          <button onClick={e => { e.stopPropagation(); if (confirm(`Remove ${ex.name} from session?`)) onRemoveExercise(ex.id) }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 14, color: 'var(--red)', padding: '4px' }} title="Remove Exercise">🗑️</button>
          <div className="ex-toggle">▾</div>
        </div>
      </div>

      {showExNote && (
        <div style={{ padding: '0 16px 10px' }}>
          {historicalNote && (
            <div style={{ marginBottom: 6, padding: '6px 10px', background: 'var(--gold-dim)', borderLeft: '2px solid var(--gold)', borderRadius: 'var(--radius-xs)', fontSize: 11, color: 'var(--gold)', fontFamily: 'var(--font-mono)' }}>
              <span style={{ color: 'var(--text4)' }}>PREVIOUS NOTE:</span> {historicalNote}
            </div>
          )}
          <input value={exNote} onChange={e => setExNote(e.target.value)} placeholder="Exercise note (e.g. good chest stretch)" style={{ width: '100%', padding: '8px 12px', background: 'var(--bg3)', border: '1px solid var(--gold)', borderRadius: 'var(--radius-xs)', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: 13, outline: 'none' }} />
        </div>
      )}

      {open && (
        <div className="ex-body" style={{ paddingBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '24px 1fr 1fr 60px 40px', gap: 8, marginBottom: 8 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text5)' }}>#</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text5)' }}>KG</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text5)' }}>REPS</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text5)', textAlign: 'center' }}>REST</div>
            <div />
          </div>
          {ex.sets.map((set, si) => (
            <SetLogger
              key={`${ex.id}-${set.n}`} set={set} exerciseName={ex.name}
              currentSetData={sessionSets.find(s => s.exerciseName === ex.name && s.setNum === set.n)}
              prevSet={prevSetsForEx[si]} accent={accent}
              isWarmup={!!warmupSets[si]} onToggleWarmup={() => toggleWarmup(si)}
              onRemoveSet={si === ex.sets.length - 1 ? () => onRemoveLastSet(ex.id) : null}
              onUpdate={data => onSetUpdate({ ...data, isWarmup: !!warmupSets[si], exNote })}
              onStartTimer={onStartTimer}
              exNote={exNote}
            />
          ))}

          <div style={{ marginTop: 12 }}>
            <button onClick={() => onAddSet(ex.id)} style={{ padding: '4px 10px', background: 'var(--bg3)', border: '1px dashed var(--text5)', borderRadius: 'var(--radius-xs)', color: 'var(--text3)', fontFamily: 'var(--font-mono)', fontSize: 10, cursor: 'pointer' }}>+ Add Set</button>
          </div>

          {ex.prog && <div className="prog-note" style={{ marginTop: 14 }}>PROGRESSION: <span>{ex.prog}</span></div>}
          {ex.cues && <div className="prog-note">CUES: <span>{ex.cues.join(' · ')}</span></div>}
        </div>
      )}
    </div>
  )
}

function PlanDaySelector({ plans, onSelect, onRestDay, initialPlanIdx = 0 }) {
  const [planIdx, setPlanIdx] = useState(initialPlanIdx)

  useEffect(() => {
    setPlanIdx(initialPlanIdx)
  }, [initialPlanIdx])
  const plan = plans[planIdx]
  const workoutDays = plan?.days.filter(d => !d.rest && d.exercises?.length > 0) || []

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <button className="btn btn-outline" style={{ flex: 1, borderColor: 'var(--blue)', color: 'var(--blue)' }} onClick={() => onSelect({ id: 'freestyle', name: 'Freestyle' }, { key: 'fs', label: 'Freestyle Workout', focus: 'Custom', exercises: [], accent: 'var(--blue)' })}>
          + Freestyle Workout
        </button>
        <button className="btn btn-outline" style={{ flex: 1, borderColor: 'var(--text4)' }} onClick={onRestDay}>
          🛌 Log Rest Day
        </button>
      </div>

      <div style={{ height: 1, background: 'var(--border)', margin: '20px 0' }} />

      <div className="form-group">
        <label className="form-label">Follow Plan</label>
        <select className="form-select" value={planIdx} onChange={e => setPlanIdx(Number(e.target.value))}>
          {plans.map((p, i) => <option key={p.id} value={i}>{p.name}</option>)}
        </select>
      </div>
      <div className="form-group">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {workoutDays.map(day => (
            <button key={day.key} className="btn btn-outline" style={{ justifyContent: 'flex-start', gap: 12, '--accent': day.accent || 'var(--gold)' }} onClick={() => onSelect(plan, day)}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: day.accent || 'var(--gold)', flexShrink: 0 }} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontFamily: 'var(--font-head)', fontSize: 16 }}>{day.label}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text5)', fontWeight: 400, letterSpacing: '0.06em' }}>{day.exercises.length} exercises · {day.focus}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function LogSession({ onSessionSaved }) {
  const [phase, setPhase] = useState('select') // select, recovery, active, done
  const [sessionMode, setSessionMode] = useState('live') // live, past
  const [sessionDate, setSessionDate] = useState(() => new Date().toISOString().split('T')[0])

  const [plans, setPlans] = useState([])
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [selectedDay, setSelectedDay] = useState(null)
  const [sessionSets, setSessionSets] = useState([])
  const [startTime, setStartTime] = useState(null)
  const [elapsed, setElapsed] = useState(0)
  const [sessionNote, setSessionNote] = useState('')
  const [allExercises, setAllExercises] = useState(EXERCISES)
  const [pickerOpen, setPickerOpen] = useState(false)

  const [prevSession, setPrevSession] = useState(null)
  const [pastSessions, setPastSessions] = useState([])
  const [recoverySession, setRecoverySession] = useState(null)
  const [activeTimer, setActiveTimer] = useState(null)

  const timerRef = useRef(null)

  const [initialPlanIdx, setInitialPlanIdx] = useState(0)

  // ── Persistence ──────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const storedPlans = JSON.parse(localStorage.getItem('gymlogger_plans') || '[]')
      setPlans(storedPlans)
      const customEx = JSON.parse(localStorage.getItem('gymlogger_custom_exercises') || '[]')
      setAllExercises([...EXERCISES, ...customEx].sort((a, b) => a.name.localeCompare(b.name)))
    } catch { }
  }, [])

  // Load active session on mount
  useEffect(() => {
    try {
      const storedSessions = JSON.parse(localStorage.getItem('gymlogger_sessions') || '[]')
      setPastSessions(storedSessions)
      
      const storedPlans = JSON.parse(localStorage.getItem('gymlogger_plans') || '[]')
      if (storedSessions.length > 0 && storedPlans.length > 0) {
        const sortedSessions = [...storedSessions].sort((a, b) => new Date(b.date) - new Date(a.date))
        const lastPlanId = sortedSessions[0]?.planId
        if (lastPlanId) {
          const idx = storedPlans.findIndex(p => p.id === lastPlanId)
          if (idx !== -1) setInitialPlanIdx(idx)
        }
      }

      const active = JSON.parse(localStorage.getItem('gymlogger_active_session'))
      if (active && active.phase === 'active' && active.sessionSets?.length > 0) {
        setRecoverySession(active)
        setPhase('recovery')
      }
    } catch { }
  }, [])

  const resumeSession = () => {
    if (!recoverySession) return
    const active = recoverySession
    setSessionMode(active.sessionMode || 'live')
    setSessionDate(active.sessionDate || new Date().toISOString().split('T')[0])
    setSelectedPlan(active.selectedPlan)
    setSelectedDay(active.selectedDay)
    setSessionSets(active.sessionSets || [])
    setStartTime(active.startTime || Date.now())
    setSessionNote(active.sessionNote || '')

    if (active.selectedPlan?.id !== 'freestyle') {
      const prev = pastSessions.filter(s => s.planId === active.selectedPlan.id && s.dayLabel === active.selectedDay.label).sort((a, b) => new Date(b.date) - new Date(a.date))[0]
      setPrevSession(prev || null)
    }
    setPhase('active')
  }

  const discardSession = () => {
    try { localStorage.removeItem('gymlogger_active_session') } catch { }
    setRecoverySession(null)
    setPhase('select')
  }

  // Save active session on change
  useEffect(() => {
    if (phase === 'active') {
      try { localStorage.setItem('gymlogger_active_session', JSON.stringify({ phase, sessionMode, sessionDate, selectedPlan, selectedDay, sessionSets, startTime, sessionNote })) } catch { }
    } else if (phase === 'done' || phase === 'select') {
      try { localStorage.removeItem('gymlogger_active_session') } catch { }
    }
  }, [phase, sessionMode, sessionDate, selectedPlan, selectedDay, sessionSets, startTime, sessionNote])

  // Timer run
  useEffect(() => {
    if (phase === 'active' && startTime && sessionMode === 'live') {
      timerRef.current = setInterval(() => setElapsed(Date.now() - startTime), 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [phase, startTime, sessionMode])

  // ── Actions ──────────────────────────────────────────────────────────────
  const handleSelectDay = useCallback((plan, day) => {
    setSelectedPlan(plan); setSelectedDay(day)
    try {
      const prev = JSON.parse(localStorage.getItem('gymlogger_sessions') || '[]').filter(s => s.planId === plan.id && s.dayLabel === day.label).sort((a, b) => new Date(b.date) - new Date(a.date))[0]
      setPrevSession(prev || null)
    } catch { }
    setPhase('active'); setStartTime(Date.now()); setSessionSets([]); setSessionNote('')
  }, [])

  const handleRestDay = useCallback(() => {
    let baseDate = new Date()
    if (sessionMode === 'past') {
      const [y, m, d] = sessionDate.split('-').map(Number)
      baseDate = new Date(y, m - 1, d, 12, 0, 0)
    }
    const session = { id: genId(), date: baseDate.toISOString(), planId: 'rest', dayLabel: 'Rest Day', isRest: true, duration: 0, totalTonnage: 0, sets: [], sessionNote: 'Taking a clear rest day.' }
    try {
      const existing = JSON.parse(localStorage.getItem('gymlogger_sessions') || '[]')
      localStorage.setItem('gymlogger_sessions', JSON.stringify([...existing, session]))
    } catch { }
    onSessionSaved?.()
    setPhase('done')
  }, [onSessionSaved])

  const handleCopyLastSession = useCallback(() => {
    if (!prevSession || !confirm('Copy all weights & reps from your last session?')) return
    setSelectedDay(d => ({ ...d, _copyKey: Date.now() }))
  }, [prevSession])

  const handleSetUpdate = useCallback((data) => {
    setSessionSets(prev => {
      const key = `${data.exerciseName}-${data.setNum}`
      const existing = prev.findIndex(s => s.exerciseName === data.exerciseName && s.setNum === data.setNum)
      if (existing >= 0) { const updated = [...prev]; updated[existing] = { ...data, key }; return updated }
      return [...prev, { ...data, key }]
    })
  }, [])

  const addExerciseToFreestyle = (exNames) => {
    if (!exNames || !exNames.length) return
    const newExs = exNames.map(exName => {
      const matched = allExercises.find(e => e.name === exName) || { name: exName }
      return {
        id: genId(), name: matched.name, badge: matched.badge, targets: matched.targets,
        cues: matched.cues, emgNote: matched.emgNote, prog: matched.prog, sciNote: matched.sciNote,
        sets: [{ n: 1, reps: matched.repRange || 8, rest: matched.restRange || '90s', kg: '' }]
      }
    })
    setSelectedDay(prev => ({ ...prev, exercises: [...prev.exercises, ...newExs] }))
  }

  const addSetToExercise = (exId) => {
    setSelectedDay(prev => {
      const idx = prev.exercises.findIndex(e => e.id === exId)
      if (idx < 0) return prev
      const exercises = prev.exercises.map((ex, i) => {
        if (i !== idx) return ex
        const lastSet = ex.sets[ex.sets.length - 1]
        return { ...ex, sets: [...ex.sets, { n: ex.sets.length + 1, reps: lastSet?.reps || 8, rest: lastSet?.rest || '90s', kg: lastSet?.kg || '' }] }
      })
      return { ...prev, exercises }
    })
  }

  const removeLastSetFromExercise = (exId) => {
    setSelectedDay(prev => {
      const idx = prev.exercises.findIndex(e => e.id === exId)
      if (idx < 0) return prev
      if (prev.exercises[idx].sets.length <= 1) return prev

      const lastSet = prev.exercises[idx].sets[prev.exercises[idx].sets.length - 1]
      const exercises = prev.exercises.map((ex, i) => {
        if (i !== idx) return ex
        return { ...ex, sets: ex.sets.slice(0, -1) }
      })
      setSessionSets(s => s.filter(set => !(set.exerciseName === prev.exercises[idx].name && set.setNum === lastSet.n)))
      return { ...prev, exercises }
    })
  }

  const removeExerciseFromSession = useCallback((exId) => {
    setSelectedDay(prev => {
      const idx = prev.exercises.findIndex(e => e.id === exId)
      if (idx < 0) return prev
      const removedExName = prev.exercises[idx].name
      setSessionSets(s => s.filter(set => set.exerciseName !== removedExName))
      return { ...prev, exercises: prev.exercises.filter(e => e.id !== exId) }
    })
  }, [])

  const handleFinish = useCallback(() => {
    const duration = Date.now() - startTime
    const doneSets = sessionSets.filter(s => s.done)
    const workingSets = doneSets.filter(s => !s.isWarmup)
    const totalTonnage = workingSets.reduce((sum, s) => sum + (parseFloat(s.weight) || 0) * (parseFloat(s.reps) || 0), 0)

    let baseDate = new Date()
    if (sessionMode === 'past') {
      const [y, m, d] = sessionDate.split('-').map(Number)
      baseDate = new Date(y, m - 1, d, 12, 0, 0)
    }

    const session = { id: genId(), date: baseDate.toISOString(), planId: selectedPlan.id, dayLabel: selectedDay.label, duration, totalTonnage, sets: doneSets, sessionNote }
    try {
      const existing = JSON.parse(localStorage.getItem('gymlogger_sessions') || '[]')
      localStorage.setItem('gymlogger_sessions', JSON.stringify([...existing, session]))
      localStorage.removeItem('gymlogger_active_session')
    } catch { }

    clearInterval(timerRef.current)
    setPhase('done')
    onSessionSaved?.()
  }, [sessionSets, startTime, selectedPlan, selectedDay, sessionNote, onSessionSaved])

  const formatElapsed = (ms) => {
    const m = Math.floor(ms / 60000); const s = Math.floor((ms % 60000) / 1000)
    return `${m}:${String(s).padStart(2, '0')}`
  }

  const doneSets = sessionSets.filter(s => s.done && !s.isWarmup).length
  const totalSets = selectedDay?.exercises.reduce((sum, ex) => sum + ex.sets.length, 0) || 0
  const accent = selectedDay?.accent || 'var(--red)'

  // ── Render ───────────────────────────────────────────────────────────────
  if (phase === 'done') {
    const isRest = !selectedDay
    const tonnage = sessionSets.filter(s => s.done && !s.isWarmup).reduce((sum, s) => sum + (parseFloat(s.weight) || 0) * (parseFloat(s.reps) || 0), 0)
    return (
      <div>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>{isRest ? '🛌' : '🏆'}</div>
          <div className="page-title" style={{ color: isRest ? 'var(--blue)' : 'var(--green)', textAlign: 'center', marginBottom: 8 }}>
            {isRest ? 'REST DAY RECHARGED' : 'SESSION COMPLETE'}
          </div>
          {!isRest && (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text4)', marginBottom: 24 }}>
              {selectedDay?.label} · {formatElapsed(elapsed)}
            </div>
          )}

          <div className="stats-grid" style={{ maxWidth: 440, margin: '0 auto 24px' }}>
            {isRest ? (
              <div className="stat-card" style={{ textAlign: 'center', gridColumn: 'span 2' }}>
                <div className="stat-card-label">RECOVERY</div>
                <div className="stat-card-value" style={{ color: 'var(--blue)', fontSize: 24 }}>Crucial for growth!</div>
              </div>
            ) : (
              <>
                <div className="stat-card" style={{ textAlign: 'center' }}>
                  <div className="stat-card-label">WORKING SETS</div>
                  <div className="stat-card-value" style={{ color: 'var(--green)' }}>{doneSets}</div>
                </div>
                <div className="stat-card" style={{ textAlign: 'center' }}>
                  <div className="stat-card-label">TONNAGE</div>
                  <div className="stat-card-value" style={{ color: 'var(--gold)' }}>{Math.round(tonnage)}</div>
                  <div className="stat-card-sub">kg moved</div>
                </div>
              </>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button className="btn btn-primary" style={{ background: isRest ? 'var(--blue)' : 'var(--green)' }} onClick={() => { setPhase('select'); setSessionSets([]); setSelectedDay(null); setSelectedPlan(null); setSessionNote('') }}>
              Back to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'recovery') {
    return (
      <div style={{ padding: '40px 16px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🏃‍♂️</div>
        <div className="page-title" style={{ color: 'var(--blue)', marginBottom: 16 }}>ACTIVE SESSION FOUND</div>
        <div style={{ color: 'var(--text3)', marginBottom: 32, fontSize: 14 }}>It looks like you closed the app during a session. Would you like to resume where you left off?</div>
        <div style={{ display: 'flex', gap: 12, flexDirection: 'column' }}>
          <button className="btn btn-primary" onClick={resumeSession}>Resume Active Session</button>
          <button className="btn btn-outline" style={{ borderColor: 'var(--red)', color: 'var(--red)' }} onClick={discardSession}>Discard Session</button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, gap: 12 }}>
        <div>
          <div className="page-title" style={{ color: 'var(--red)' }}>
            {phase === 'active' ? selectedDay?.label.toUpperCase() : 'LOG SESSION'}
          </div>
          <div className="page-subtitle">
            {phase === 'select' ? 'Choose a plan day or go off-script.' : `${selectedDay?.focus || 'Freestyle'} · ${selectedDay?.exercises.length || 0} exercises`}
          </div>
        </div>
        {phase === 'active' && (
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, color: 'var(--red)', lineHeight: 1 }}>{formatElapsed(elapsed)}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text5)', marginTop: 2 }}>{doneSets}/{Math.max(totalSets, doneSets)} SETS</div>
          </div>
        )}
      </div>

      {phase === 'select' && (
        <>
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, background: 'var(--bg2)', padding: 4, borderRadius: 8 }}>
            <button style={{ flex: 1, padding: 8, borderRadius: 6, border: 'none', background: sessionMode === 'live' ? 'var(--blue)' : 'transparent', color: sessionMode === 'live' ? '#fff' : 'var(--text4)', fontFamily: 'var(--font-head)', fontSize: 13, cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => setSessionMode('live')}>
              LIVE WORKOUT
            </button>
            <button style={{ flex: 1, padding: 8, borderRadius: 6, border: 'none', background: sessionMode === 'past' ? 'var(--gold)' : 'transparent', color: sessionMode === 'past' ? '#000' : 'var(--text4)', fontFamily: 'var(--font-head)', fontSize: 13, cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => setSessionMode('past')}>
              LOG PAST SESSION
            </button>
          </div>

          {sessionMode === 'past' && (
            <div className="form-group">
              <label className="form-label" style={{ color: 'var(--gold)' }}>SESSION DATE</label>
              <input type="date" className="form-input" value={sessionDate} onChange={e => setSessionDate(e.target.value)} max={new Date().toISOString().split('T')[0]} />
            </div>
          )}

          <PlanDaySelector plans={plans} onSelect={handleSelectDay} onRestDay={handleRestDay} initialPlanIdx={initialPlanIdx} />
        </>
      )}

      {phase === 'active' && selectedDay && (
        <>
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text5)', letterSpacing: '0.08em' }}>PROGRESS</span>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: accent }}>{doneSets}/{Math.max(totalSets, doneSets)} sets</span>
                {prevSession && (
                  <button onClick={handleCopyLastSession} style={{ fontFamily: 'var(--font-mono)', fontSize: 9, padding: '2px 8px', background: 'var(--gold-dim)', border: '1px solid var(--gold)', borderRadius: 'var(--radius-xs)', color: 'var(--gold)', cursor: 'pointer', letterSpacing: '0.05em' }}>
                    ↩ COPY LAST SESSION
                  </button>
                )}
              </div>
            </div>
            <div style={{ height: 3, background: 'var(--bg3)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: accent, width: `${totalSets > 0 ? (doneSets / totalSets) * 100 : 0}%`, transition: 'width 0.3s ease', borderRadius: 2 }} />
            </div>
          </div>

          {prevSession && (
            <div style={{ marginBottom: 14, padding: '8px 12px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text5)', letterSpacing: '0.08em', marginBottom: 2 }}>
                LAST SESSION — {new Date(prevSession.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)' }}>
                {prevSession.sets?.filter(s => s.done && !s.isWarmup).length || prevSession.sets?.filter(s => s.done).length} sets · {Math.round(prevSession.totalTonnage || 0)} kg tonnage
              </div>
            </div>
          )}

          {selectedDay.exercises.map(ex => (
            <ExerciseLogger
              key={`${ex.id}-${selectedDay._copyKey || 0}`} ex={ex} sessionSets={sessionSets} prevSession={prevSession} pastSessions={pastSessions} accent={accent}
              onSetUpdate={handleSetUpdate} onAddSet={addSetToExercise} onRemoveLastSet={removeLastSetFromExercise}
              onRemoveExercise={removeExerciseFromSession}
              onStartTimer={sessionMode === 'live' ? (sec) => setActiveTimer({ endsAt: Date.now() + sec * 1000 }) : undefined}
            />
          ))}

          {/* Add Exercise */}
          <div style={{ margin: '20px 0', padding: 12, border: '1px dashed var(--border2)', borderRadius: 'var(--radius)' }}>
            <button
              className="btn btn-outline" style={{ width: '100%', border: 'none', background: 'transparent', justifyContent: 'flex-start', color: 'var(--text4)' }}
              onClick={() => setPickerOpen(true)}
            >
              + Add Exercise...
            </button>
            {pickerOpen && (
              <ExerciseSelectorModal 
                allExercises={allExercises} 
                onSelect={(exName) => { addExerciseToFreestyle(exName); setPickerOpen(false) }} 
                onClose={() => setPickerOpen(false)} 
              />
            )}
          </div>

          {/* Session Note */}
          <div style={{ marginTop: 20 }}>
            <div className="form-label" style={{ marginBottom: 8, color: 'var(--text4)' }}>SESSION NOTE (optional)</div>
            <textarea
              className="form-input" style={{ width: '100%', minHeight: 80, resize: 'vertical' }}
              placeholder="How did today's session feel? Any overall fatigue or specific takeaways?"
              value={sessionNote} onChange={e => setSessionNote(e.target.value)}
            />
          </div>

          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
            <button className="btn btn-outline" onClick={() => { if (confirm('Cancel session? Progress will be lost.')) { setPhase('select'); setSessionSets([]); localStorage.removeItem('gymlogger_active_session'); clearInterval(timerRef.current) } }}>
              Cancel
            </button>
            <button className="btn btn-primary" style={{ flex: 1, background: 'var(--green)', justifyContent: 'center', fontSize: 16 }} onClick={handleFinish}>
              ✓ Finish Session
            </button>
          </div>

          {sessionMode === 'live' && activeTimer && (
            <GlobalRestTimer endsAt={activeTimer.endsAt} onSkip={() => setActiveTimer(null)} onAdd15={() => setActiveTimer(prev => ({ ...prev, endsAt: prev.endsAt + 15000 }))} />
          )}
        </>
      )}
    </div>
  )
}

