'use client'
import { useState, useEffect, useMemo } from 'react'

// ── Plate Calculator ────────────────────────────────────────────────────────
const STANDARD_PLATES = [25, 20, 15, 10, 5, 2.5, 1.25]

function PlateCalculator() {
  const [target, setTarget] = useState('')
  const [barWeight, setBarWeight] = useState(20)
  const [unit, setUnit] = useState('kg')

  const plates = useMemo(() => {
    const t = parseFloat(target)
    if (!t || t <= barWeight) return null
    const sideLoad = (t - barWeight) / 2
    const result = []
    let remaining = sideLoad
    for (const p of STANDARD_PLATES) {
      const count = Math.floor(remaining / p)
      if (count > 0) { result.push({ plate: p, count }); remaining = Math.round((remaining - count * p) * 1000) / 1000 }
    }
    return { result, sideLoad, loadable: t - remaining * 2 }
  }, [target, barWeight])

  return (
    <div className="dash-panel">
      <div className="dash-panel-title">🏋️ Plate Calculator</div>
      <div className="dash-panel-sub">Enter target weight — see exactly what plates to load each side.</div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 120 }}>
          <div className="form-label">TARGET WEIGHT ({unit})</div>
          <input
            className="form-input"
            type="number" step="0.5" min="0"
            value={target}
            onChange={e => setTarget(e.target.value)}
            placeholder="e.g. 100"
          />
        </div>
        <div style={{ minWidth: 100 }}>
          <div className="form-label">BAR WEIGHT</div>
          <select className="form-select" value={barWeight} onChange={e => setBarWeight(Number(e.target.value))}>
            <option value={20}>Olympic 20kg</option>
            <option value={15}>Women's 15kg</option>
            <option value={10}>10kg bar</option>
            <option value={0}>No bar</option>
          </select>
        </div>
      </div>

      {plates && (
        <div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text4)', marginRight: 4 }}>EACH SIDE:</div>
            {plates.result.length === 0 ? (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text5)' }}>bar only / no plates needed</span>
            ) : (
              plates.result.map(({ plate, count }) => (
                <div key={plate} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  padding: '6px 10px', borderRadius: 'var(--radius-sm)',
                  background: plate >= 20 ? 'var(--red-dim)' : plate >= 10 ? 'var(--blue-dim)' : plate >= 5 ? 'var(--green-dim)' : 'var(--bg3)',
                  border: `1px solid ${plate >= 20 ? 'var(--red)' : plate >= 10 ? 'var(--blue)' : plate >= 5 ? 'var(--green)' : 'var(--border)'}`,
                  minWidth: 52,
                }}>
                  <div style={{ fontFamily: 'var(--font-head)', fontSize: 18, fontWeight: 900, color: 'var(--text)', lineHeight: 1 }}>{plate}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text4)', marginTop: 2 }}>×{count}</div>
                </div>
              ))
            )}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text4)' }}>
            Bar {barWeight}kg + {plates.sideLoad}kg/side = <span style={{ color: 'var(--gold)' }}>{parseFloat(target)}kg total</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Bodyweight Log ──────────────────────────────────────────────────────────
function BodyweightLog() {
  const [entries, setEntries] = useState([])
  const [weight, setWeight] = useState('')
  const [note, setNote] = useState('')

  useEffect(() => {
    try { setEntries(JSON.parse(localStorage.getItem('gymlogger_bodyweight') || '[]')) } catch {}
  }, [])

  const save = (data) => {
    localStorage.setItem('gymlogger_bodyweight', JSON.stringify(data))
    setEntries(data)
  }

  const addEntry = () => {
    const w = parseFloat(weight)
    if (!w) return
    const entry = { date: new Date().toISOString(), weight: w, note }
    const updated = [entry, ...entries]
    save(updated)
    setWeight(''); setNote('')
  }

  const deleteEntry = (i) => {
    const updated = entries.filter((_, idx) => idx !== i)
    save(updated)
  }

  const trend = useMemo(() => {
    if (entries.length < 2) return null
    const recent = entries.slice(0, 7).map(e => e.weight)
    const avg = recent.reduce((a, b) => a + b, 0) / recent.length
    const change = entries[0].weight - entries[Math.min(entries.length - 1, 29)].weight
    return { avg: avg.toFixed(1), change: change.toFixed(1) }
  }, [entries])

  const formatDate = (iso) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

  return (
    <div className="dash-panel">
      <div className="dash-panel-title">⚖️ Bodyweight Log</div>
      <div className="dash-panel-sub">Track your weight over time. Strength-to-bodyweight ratios in Track Progress.</div>

      {trend && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text4)' }}>
            7-DAY AVG <span style={{ color: 'var(--gold)' }}>{trend.avg} kg</span>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text4)' }}>
            CHANGE <span style={{ color: parseFloat(trend.change) < 0 ? 'var(--green)' : parseFloat(trend.change) > 0 ? 'var(--red)' : 'var(--text4)' }}>
              {parseFloat(trend.change) > 0 ? '+' : ''}{trend.change} kg
            </span>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        <input
          className="form-input" style={{ flex: '0 0 100px' }}
          type="number" step="0.1" placeholder="kg"
          value={weight} onChange={e => setWeight(e.target.value)}
        />
        <input
          className="form-input" style={{ flex: 1, minWidth: 120 }}
          placeholder="Note (optional)"
          value={note} onChange={e => setNote(e.target.value)}
        />
        <button className="btn btn-primary" onClick={addEntry} style={{ flexShrink: 0 }}>+ Log</button>
      </div>

      {entries.length === 0 ? (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text5)', padding: '12px 0' }}>No entries yet.</div>
      ) : (
        <div>
          {entries.slice(0, 20).map((e, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--bg3)' }}>
              <div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text4)', marginRight: 10 }}>{formatDate(e.date)}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700, color: 'var(--gold)' }}>{e.weight}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text5)', marginLeft: 3 }}>kg</span>
                {e.note && <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text4)', marginLeft: 10 }}>{e.note}</span>}
              </div>
              <button onClick={() => deleteEntry(i)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text5)', fontSize: 11, padding: '2px 6px' }}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Deload Reminder ─────────────────────────────────────────────────────────
function DeloadReminder({ sessions }) {
  const analysis = useMemo(() => {
    if (sessions.length < 3) return null
    const sorted = [...sessions].sort((a, b) => new Date(a.date) - new Date(b.date))

    // Find weeks of consecutive training
    const weekMs = 7 * 24 * 60 * 60 * 1000
    const now = new Date()
    let consecutiveWeeks = 0
    let weekStart = new Date(now - weekMs)
    for (let w = 0; w < 12; w++) {
      const inWeek = sessions.filter(s => {
        const d = new Date(s.date)
        return d >= new Date(now - (w + 1) * weekMs) && d < new Date(now - w * weekMs)
      })
      if (inWeek.length > 0) consecutiveWeeks++
      else break
    }

    // Tonnage trend (last 3 sessions vs prev 3)
    const recent3 = sorted.slice(-3).map(s => s.totalTonnage || 0)
    const prev3 = sorted.slice(-6, -3).map(s => s.totalTonnage || 0)
    const recentAvg = recent3.reduce((a, b) => a + b, 0) / recent3.length
    const prevAvg = prev3.length ? prev3.reduce((a, b) => a + b, 0) / prev3.length : recentAvg
    const tonnageDrop = prevAvg > 0 ? ((recentAvg - prevAvg) / prevAvg) * 100 : 0

    const needsDeload = consecutiveWeeks >= 4 || tonnageDrop < -15
    const reason = consecutiveWeeks >= 4
      ? `${consecutiveWeeks} consecutive training weeks — accumulated fatigue likely masking fitness`
      : `Tonnage dropped ${Math.abs(tonnageDrop.toFixed(0))}% over last 3 sessions — performance regression detected`

    return { consecutiveWeeks, tonnageDrop, needsDeload, reason, recentAvg, prevAvg }
  }, [sessions])

  if (!analysis) return (
    <div className="dash-panel">
      <div className="dash-panel-title">📉 Deload Reminder</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text5)', padding: '8px 0' }}>Log at least 3 sessions to activate deload tracking.</div>
    </div>
  )

  return (
    <div className="dash-panel" style={{ borderColor: analysis.needsDeload ? 'var(--red)' : 'var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <div className="dash-panel-title">📉 Deload Reminder</div>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 9, padding: '2px 8px',
          borderRadius: 'var(--radius-xs)',
          background: analysis.needsDeload ? 'var(--red-dim)' : 'var(--green-dim)',
          color: analysis.needsDeload ? 'var(--red)' : 'var(--green)',
          border: `1px solid ${analysis.needsDeload ? 'var(--red)' : 'var(--green)'}`,
        }}>
          {analysis.needsDeload ? 'DELOAD RECOMMENDED' : 'RECOVERY STATUS: OK'}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 10 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text4)' }}>
          TRAINING WEEKS <span style={{ color: analysis.consecutiveWeeks >= 4 ? 'var(--red)' : 'var(--green)' }}>{analysis.consecutiveWeeks}</span>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text4)' }}>
          TONNAGE TREND <span style={{ color: analysis.tonnageDrop < -10 ? 'var(--red)' : 'var(--green)' }}>
            {analysis.tonnageDrop > 0 ? '+' : ''}{analysis.tonnageDrop.toFixed(1)}%
          </span>
        </div>
      </div>

      {analysis.needsDeload && (
        <div style={{ padding: '10px 12px', background: 'var(--red-dim)', border: '1px solid var(--red)', borderRadius: 'var(--radius-sm)', fontSize: 12, color: 'var(--text3)', lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--red)' }}>Deload recommended:</strong> {analysis.reason}<br />
          <span style={{ color: 'var(--text4)', fontSize: 11 }}>
            Deload: 1 week at 50–60% of normal volume/intensity. Allows supercompensation and MRV to rise.
          </span>
        </div>
      )}
      {!analysis.needsDeload && (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text4)' }}>
          Continue training. Deload flag triggers at 4+ consecutive weeks or &gt;15% tonnage drop.
        </div>
      )}
    </div>
  )
}

// ── Superset Builder ────────────────────────────────────────────────────────
function SupersetBuilder({ plans }) {
  const [planIdx, setPlanIdx] = useState(0)
  const [dayIdx, setDayIdx] = useState(0)
  const [pairs, setPairs] = useState([]) // [{a, b}]
  const [exA, setExA] = useState('')
  const [exB, setExB] = useState('')

  const plan = plans[planIdx]
  const workoutDays = plan?.days.filter(d => !d.rest && d.exercises?.length > 0) || []
  const day = workoutDays[dayIdx]
  const exercises = day?.exercises || []

  const addPair = () => {
    if (!exA || !exB || exA === exB) return
    if (pairs.find(p => (p.a === exA && p.b === exB) || (p.a === exB && p.b === exA))) return
    setPairs(prev => {
      const updated = [...prev, { a: exA, b: exB }]
      savePairs(updated)
      return updated
    })
    setExA(''); setExB('')
  }

  const removePair = (i) => setPairs(prev => { const u = prev.filter((_, idx) => idx !== i); savePairs(u); return u })

  const savePairs = (p) => {
    try { localStorage.setItem(`gymlogger_supersets_${plan?.id}_${day?.key}`, JSON.stringify(p)) } catch {}
  }

  useEffect(() => {
    if (!plan || !day) return
    try {
      const saved = JSON.parse(localStorage.getItem(`gymlogger_supersets_${plan.id}_${day.key}`) || '[]')
      setPairs(saved)
    } catch {}
    setExA(''); setExB('')
  }, [planIdx, dayIdx])

  if (plans.length === 0) return (
    <div className="dash-panel">
      <div className="dash-panel-title">🔗 Superset Builder</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text5)' }}>Create a plan first to configure supersets.</div>
    </div>
  )

  return (
    <div className="dash-panel">
      <div className="dash-panel-title">🔗 Superset Builder</div>
      <div className="dash-panel-sub">Pair exercises to superset. Saves per plan day. Use during logging to alternate.</div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <select className="form-select" style={{ flex: 1 }} value={planIdx} onChange={e => setPlanIdx(Number(e.target.value))}>
          {plans.map((p, i) => <option key={p.id} value={i}>{p.name}</option>)}
        </select>
        <select className="form-select" style={{ flex: 1 }} value={dayIdx} onChange={e => setDayIdx(Number(e.target.value))}>
          {workoutDays.map((d, i) => <option key={d.key} value={i}>{d.label}</option>)}
        </select>
      </div>

      {exercises.length >= 2 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 14 }}>
          <div style={{ flex: 1, minWidth: 140 }}>
            <div className="form-label">EXERCISE A</div>
            <select className="form-select" value={exA} onChange={e => setExA(e.target.value)}>
              <option value="">Select…</option>
              {exercises.map(ex => <option key={ex.id} value={ex.name}>{ex.name}</option>)}
            </select>
          </div>
          <div style={{ fontFamily: 'var(--font-head)', fontSize: 22, color: 'var(--text5)', paddingBottom: 8 }}>+</div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <div className="form-label">EXERCISE B</div>
            <select className="form-select" value={exB} onChange={e => setExB(e.target.value)}>
              <option value="">Select…</option>
              {exercises.map(ex => <option key={ex.id} value={ex.name}>{ex.name}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" onClick={addPair} disabled={!exA || !exB || exA === exB}>Pair</button>
        </div>
      )}

      {pairs.length === 0 ? (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text5)' }}>No supersets configured for {day?.label}.</div>
      ) : (
        <div>
          {pairs.map((pair, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--bg3)' }}>
              <span className="badge badge-compound" style={{ flexShrink: 0 }}>SS {i + 1}</span>
              <div style={{ flex: 1, fontFamily: 'var(--font-head)', fontSize: 14, color: 'var(--text)' }}>
                {pair.a} <span style={{ color: 'var(--text5)' }}>⟷</span> {pair.b}
              </div>
              <button onClick={() => removePair(i)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text5)', fontSize: 12, padding: '2px 6px' }}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── CSV Export ──────────────────────────────────────────────────────────────
function ExportCSV({ sessions, bodyweightEntries }) {
  const exportSessions = () => {
    if (sessions.length === 0) return alert('No sessions to export.')
    const rows = [['Date', 'Day', 'Exercise', 'Set', 'Type', 'Weight(kg)', 'Reps', 'RPE', 'Note', 'Duration(min)', 'Tonnage(kg)']]
    sessions.forEach(session => {
      session.sets?.filter(s => s.done).forEach(set => {
        rows.push([
          new Date(session.date).toLocaleDateString('en-GB'),
          session.dayLabel || '',
          set.exerciseName || '',
          set.setNum || '',
          set.isWarmup ? 'warmup' : 'working',
          set.weight || '',
          set.reps || '',
          set.rpe || '',
          (set.note || '').replace(/,/g, ';'),
          session.duration ? (session.duration / 60000).toFixed(1) : '',
          session.totalTonnage ? Math.round(session.totalTonnage) : '',
        ])
      })
    })
    downloadCSV(rows, 'shaktivaan_sessions.csv')
  }

  const exportBodyweight = () => {
    if (bodyweightEntries.length === 0) return alert('No bodyweight entries to export.')
    const rows = [['Date', 'Weight(kg)', 'Note']]
    bodyweightEntries.forEach(e => {
      rows.push([new Date(e.date).toLocaleDateString('en-GB'), e.weight, (e.note || '').replace(/,/g, ';')])
    })
    downloadCSV(rows, 'shaktivaan_bodyweight.csv')
  }

  const downloadCSV = (rows, filename) => {
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = filename; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="dash-panel">
      <div className="dash-panel-title">📤 Export Data</div>
      <div className="dash-panel-sub">Download your data as CSV — use in Excel, Google Sheets, or any analysis tool.</div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button className="btn btn-outline" onClick={exportSessions}>
          ⬇ Sessions CSV <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text5)', marginLeft: 4 }}>({sessions.length} sessions)</span>
        </button>
        <button className="btn btn-outline" onClick={exportBodyweight}>
          ⬇ Bodyweight CSV <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text5)', marginLeft: 4 }}>({bodyweightEntries.length} entries)</span>
        </button>
      </div>
    </div>
  )
}

// ── Main Tools Client ────────────────────────────────────────────────────────
export default function ToolsClient() {
  const [sessions, setSessions] = useState([])
  const [plans, setPlans] = useState([])
  const [bodyweightEntries, setBodyweightEntries] = useState([])

  useEffect(() => {
    try {
      setSessions(JSON.parse(localStorage.getItem('gymlogger_sessions') || '[]'))
      setPlans(JSON.parse(localStorage.getItem('gymlogger_plans') || '[]'))
      setBodyweightEntries(JSON.parse(localStorage.getItem('gymlogger_bodyweight') || '[]'))
    } catch {}
  }, [])

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div className="page-title" style={{ color: 'var(--teal)' }}>TOOLS</div>
        <div className="page-subtitle">Plate calculator, bodyweight tracker, deload monitor, supersets, and data export.</div>
      </div>

      <PlateCalculator />
      <DeloadReminder sessions={sessions} />
      <BodyweightLog />
      <SupersetBuilder plans={plans} />
      <ExportCSV sessions={sessions} bodyweightEntries={bodyweightEntries} />
    </div>
  )
}
