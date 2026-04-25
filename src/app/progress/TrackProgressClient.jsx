'use client'
import { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { store } from '../../lib/store'
import { useStore } from '../../lib/useStore'
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
  return sets.filter(s => s.done).reduce((sum, s) => sum + (parseFloat(s.weight) || 0) * (parseFloat(s.reps) || 0), 0)
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

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

function fmtDur(ms) {
  if (!ms) return '–'
  const m = Math.round(ms / 60000)
  if (m >= 60) return `${Math.floor(m / 60)}h ${m % 60}m`
  return `${m}m`
}

function groupSets(sets) {
  const groups = []
  for (const s of sets || []) {
    let g = groups.find(g => g.name === s.exerciseName)
    if (!g) { g = { name: s.exerciseName, sets: [] }; groups.push(g) }
    g.sets.push(s)
  }
  return groups
}

function getAccent(dayLabel = '') {
  if (!dayLabel) return 'var(--gold)'
  if (dayLabel.toLowerCase().includes('push')) return 'var(--red)'
  if (dayLabel.toLowerCase().includes('pull')) return 'var(--blue)'
  if (dayLabel.toLowerCase().includes('leg')) return 'var(--green)'
  return 'var(--gold)'
}

function buildWeekStrip(sessions) {
  const today = new Date()
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (6 - i))
    const iso = d.toISOString().split('T')[0]
    return {
      day: DAYS[d.getDay()],
      session: sessions.find(s => s.date?.split('T')[0] === iso) || null,
    }
  })
}

function Pill({ children, color }) {
  const colorMap = {
    green: { bg: 'rgba(74,222,128,0.1)', text: 'var(--green)' },
    gold: { bg: 'rgba(232,184,75,0.1)', text: 'var(--gold)' },
    blue: { bg: 'rgba(96,165,250,0.1)', text: 'var(--blue)' },
    red: { bg: 'rgba(229,83,75,0.1)', text: 'var(--red)' },
  }
  const { bg, text } = colorMap[color] || colorMap.gold
  return (
    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.06em', padding: '2px 7px', borderRadius: 3, background: bg, color: text, textTransform: 'uppercase' }}>
      {children}
    </span>
  )
}

function SessionDetailModal({ session, onClose, onEditNote, onDeleteSession }) {
  const [mounted, setMounted] = useState(false)
  const [editingNote, setEditingNote] = useState(false)
  const [editNoteText, setEditNoteText] = useState(session?.sessionNote || '')

  useEffect(() => {
    setMounted(true)
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = 'auto' }
  }, [])

  if (!mounted || !session) return null

  const dateObj = new Date(session.date)
  const dayNum = dateObj.getDate()
  const mon = dateObj.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase()
  const dow = DAYS[dateObj.getDay()]
  const groups = groupSets(session.sets)
  const workingSets = (session.sets || []).filter(s => !s.isWarmup)

  const muscleCounts = {}
  let totalWorking = 0
  session.sets?.forEach(s => {
    if (s.isWarmup) return
    totalWorking++
    const name = s.exerciseName.toLowerCase()
    let m = 'Other'
    if (name.includes('chest') || name.includes('press') || name.includes('push') || name.includes('pec')) m = 'Chest'
    else if (name.includes('back') || name.includes('row') || name.includes('pull') || name.includes('lat')) m = 'Back'
    else if (name.includes('squat') || name.includes('leg') || name.includes('calf') || name.includes('rdl')) m = 'Legs'
    else if (name.includes('lateral') || name.includes('raise') || name.includes('delt')) m = 'Shoulders'
    else if (name.includes('bicep') || name.includes('curl')) m = 'Biceps'
    else if (name.includes('tricep') || name.includes('ext')) m = 'Triceps'
    else if (name.includes('core') || name.includes('crunch') || name.includes('abs')) m = 'Core'
    muscleCounts[m] = (muscleCounts[m] || 0) + 1
  })
  const mColors = { 'Chest': '#3b82f6', 'Back': '#10b981', 'Legs': '#f59e0b', 'Shoulders': '#8b5cf6', 'Biceps': '#ec4899', 'Triceps': '#a855f7', 'Core': '#eab308', 'Other': '#6b7280' }

  let currentAngle = 0
  const gradientStops = Object.entries(muscleCounts).map(([m, count]) => {
    const percentage = (count / totalWorking) * 100
    const color = mColors[m] || mColors.Other
    const stop = `${color} ${currentAngle}% ${currentAngle + percentage}%`
    currentAngle += percentage
    return stop
  }).join(', ')

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', flexDirection: 'column', background: 'var(--bg)', animation: 'slideUp 0.15s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 24, lineHeight: 1, padding: 0, color: 'var(--text3)', cursor: 'pointer', marginTop: -4 }}>×</button>
          <div>
            <div style={{ fontFamily: 'var(--font-head)', fontSize: 18, fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>{session.isRest ? 'REST DAY' : session.dayLabel || 'Session'}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text5)', letterSpacing: '0.04em', marginTop: 2 }}>{dow}, {dayNum} {mon} {dateObj.getFullYear()}</div>
          </div>
        </div>
        <button onClick={() => { onDeleteSession(session.id); onClose() }} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: 16 }} title="Delete Session">🗑️</button>
      </div>

      <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
        {!session.isRest && totalWorking > 0 && (
          <div style={{ display: 'flex', gap: 24, alignItems: 'center', marginBottom: 24, padding: 16, background: 'var(--bg2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: `conic-gradient(${gradientStops})`, flexShrink: 0, border: '4px solid var(--bg3)', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {Object.entries(muscleCounts).sort((a, b) => b[1] - a[1]).map(([m, count]) => (
                <div key={m} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: mColors[m] || mColors.Other }} />
                    <span style={{ color: 'var(--text4)', textTransform: 'uppercase' }}>{m}</span>
                  </div>
                  <div style={{ color: 'var(--text)', fontWeight: 'bold' }}>{Math.round((count / totalWorking) * 100)}%</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {editingNote ? (
          <div style={{ marginBottom: 24 }}>
            <textarea value={editNoteText} onChange={e => setEditNoteText(e.target.value)} className="form-input" style={{ width: '100%', minHeight: 60, fontSize: 12, padding: 8, marginBottom: 8 }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { onEditNote(session.id, editNoteText); setEditingNote(false) }} className="btn btn-outline" style={{ padding: '4px 10px', fontSize: 11 }}>Save</button>
              <button onClick={() => setEditingNote(false)} className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }}>Cancel</button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '12px 14px', background: 'rgba(96,165,250,0.05)', borderLeft: '2px solid var(--blue)', borderRadius: 6, marginBottom: 24 }}>
            <div style={{ fontSize: 13, flexShrink: 0 }}>💬</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text5)', letterSpacing: '0.1em' }}>SESSION NOTE</div>
                <button onClick={() => { setEditingNote(true); setEditNoteText(session.sessionNote || '') }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, color: 'var(--blue)' }}>Edit</button>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.6 }}>{session.sessionNote ? `"${session.sessionNote}"` : 'No note recorded.'}</div>
            </div>
          </div>
        )}

        {session.isRest ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 14, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text4)', letterSpacing: '0.08em' }}>
            🛌 Rest day logged — recovery in progress
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {groups.map((g, gi) => {
              const exTonnage = g.sets.filter(s => !s.isWarmup).reduce((sum, s) => sum + (parseFloat(s.weight) || 0) * (parseFloat(s.reps) || 0), 0)
              const maxExTonnage = Math.max(0, ...groups.map(gr => gr.sets.filter(s => !s.isWarmup).reduce((sum, s) => sum + (parseFloat(s.weight) || 0) * (parseFloat(s.reps) || 0), 0)))
              const isHighVol = exTonnage > 0 && exTonnage === maxExTonnage && groups.length > 1
              const exNotes = Array.from(new Set(g.sets.map(s => s.exNote).filter(Boolean)))

              return (
                <div key={gi} style={{ background: 'var(--bg)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden' }}>
                  <div style={{ padding: '10px 14px', background: 'var(--bg3)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--green)', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 'bold' }}>
                      {g.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {isHighVol && <span title="Highest Volume Exercise" style={{ fontSize: 12 }}>🏆</span>}
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text5)' }}>
                        VOL: {exTonnage > 1000 ? (exTonnage / 1000).toFixed(1) + 't' : Math.round(exTonnage) + 'kg'}
                      </div>
                    </div>
                  </div>
                  {exNotes.length > 0 && (
                    <div style={{ padding: '8px 14px', background: 'var(--gold-dim)', borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--gold)' }}>
                      {exNotes.map((note, ni) => (
                        <div key={ni}>→ {note}</div>
                      ))}
                    </div>
                  )}
                  <div style={{ padding: '8px 14px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '24px 1fr 1fr 1fr', gap: 8, marginBottom: 6, fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text5)', paddingBottom: 4, borderBottom: '1px dashed var(--border)' }}>
                      <div>SET</div>
                      <div>WEIGHT</div>
                      <div>REPS</div>
                      <div>RPE</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {g.sets.map((s, si) => (
                        <div key={si} style={{ display: 'grid', gridTemplateColumns: '24px 1fr 1fr 1fr', gap: 8, fontFamily: 'var(--font-mono)', fontSize: 11, color: s.isWarmup ? 'rgba(96,165,250,0.8)' : 'var(--text3)' }}>
                          <div style={{ color: 'var(--text5)' }}>{s.isWarmup ? 'W' : si + 1}</div>
                          <div>{s.isBodyweight && <span style={{ fontSize: 9, color: 'var(--text5)', marginRight: 2 }}>BW+</span>}{s.weight || 0}kg</div>
                          <div>{s.reps || 0}</div>
                          <div style={{ color: 'var(--text5)' }}>{s.rpe ? `@${s.rpe}` : '-'}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}

function SessionHistory({ pastSessions, onDeleteSession, onEditNote }) {
  const [openId, setOpenId] = useState(null)
  const [editingNoteId, setEditingNoteId] = useState(null)
  const [editNoteText, setEditNoteText] = useState('')

  const sorted = useMemo(() => {
    return [...(pastSessions || [])].sort((a, b) => {
      const dateA = new Date(a.date)
      const dateB = new Date(b.date)
      if (dateB - dateA !== 0) return dateB - dateA
      return (b.id || "").localeCompare(a.id || "")
    })
  }, [pastSessions])
  const weekStrip = useMemo(() => buildWeekStrip(pastSessions || []), [pastSessions])

  const totalWorkouts = sorted.filter(s => !s.isRest).length
  const totalTonnage = sorted.reduce((sum, s) => sum + (s.totalTonnage || 0), 0)
  const totalSets = sorted.reduce((sum, s) => sum + (s.sets?.length || 0), 0)

  const maxTonnage = Math.max(...weekStrip.map(d => d.session?.totalTonnage || 0), 1)

  if (!pastSessions || pastSessions.length === 0) return null

  const handleEditSubmit = (session) => {
    onEditNote(session.id, editNoteText)
    setEditingNoteId(null)
  }

  return (
    <div style={{ marginTop: 20, marginBottom: 40 }}>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20 }}>
        <div style={{ fontFamily: 'var(--font-head)', fontSize: 32, letterSpacing: '0.04em', color: 'var(--gold)', lineHeight: 1 }}>
          SESSION HISTORY
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text5)', letterSpacing: '0.12em', padding: '3px 8px', border: '1px solid var(--border)', borderRadius: 4, background: 'var(--bg3)' }}>
          {sorted.length} ENTRIES
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: 'var(--border)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', marginBottom: 20 }}>
        {[
          { val: totalWorkouts, lbl: 'WORKOUTS', color: 'var(--green)' },
          { val: totalTonnage > 1000 ? `${(totalTonnage / 1000).toFixed(1)}t` : `${Math.round(totalTonnage)}kg`, lbl: 'TONNAGE', color: 'var(--gold)' },
          { val: totalSets, lbl: 'SETS DONE', color: 'var(--blue)' },
        ].map(({ val, lbl, color }) => (
          <div key={lbl} style={{ background: 'var(--bg2)', padding: '12px 14px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-head)', fontSize: 26, letterSpacing: '0.04em', color, lineHeight: 1, marginBottom: 3 }}>{val}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text5)', letterSpacing: '0.1em' }}>{lbl}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 24, alignItems: 'flex-end' }}>
        {weekStrip.map((d, i) => {
          const hasSession = d.session && !d.session.isRest
          const isRest = d.session?.isRest
          const height = hasSession
            ? Math.max(18, Math.round((d.session.totalTonnage / maxTonnage) * 44))
            : isRest ? 6 : 4
          const color = hasSession ? getAccent(d.session.dayLabel) : isRest ? 'rgba(96,165,250,0.3)' : 'var(--bg4)'
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ width: '100%', height, background: color, borderRadius: 3, opacity: hasSession ? 1 : 0.5, transition: 'all 0.3s' }} />
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: hasSession ? color : 'var(--text5)', letterSpacing: '0.04em' }}>{d.day}</div>
            </div>
          )
        })}
      </div>

      <div className="history-scroll-container" style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 400, overflowY: 'auto', paddingRight: 4 }}>
        {sorted.map(session => {
          const isOpen = openId === session.id
          const dateObj = new Date(session.date)
          const dayNum = dateObj.getDate()
          const mon = dateObj.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase()
          const dow = DAYS[dateObj.getDay()]
          const accent = getAccent(session.dayLabel)
          const groups = groupSets(session.sets)
          const workingSets = (session.sets || []).filter(s => !s.isWarmup)

          const muscleCounts = {}
          let totalWorking = 0
          session.sets?.forEach(s => {
            if (s.isWarmup) return
            totalWorking++
            const name = s.exerciseName.toLowerCase()
            let m = 'Other'
            if (name.includes('chest') || name.includes('press') || name.includes('push') || name.includes('pec')) m = 'Chest'
            else if (name.includes('back') || name.includes('row') || name.includes('pull') || name.includes('lat')) m = 'Back'
            else if (name.includes('squat') || name.includes('leg') || name.includes('calf') || name.includes('rdl')) m = 'Legs'
            else if (name.includes('lateral') || name.includes('raise') || name.includes('delt')) m = 'Shoulders'
            else if (name.includes('bicep') || name.includes('curl')) m = 'Biceps'
            else if (name.includes('tricep') || name.includes('ext')) m = 'Triceps'
            else if (name.includes('core') || name.includes('crunch') || name.includes('abs')) m = 'Core'
            muscleCounts[m] = (muscleCounts[m] || 0) + 1
          })
          const mColors = { 'Chest': '#3b82f6', 'Back': '#10b981', 'Legs': '#f59e0b', 'Shoulders': '#8b5cf6', 'Biceps': '#ec4899', 'Triceps': '#a855f7', 'Core': '#eab308', 'Other': '#6b7280' }

          return (
            <div key={session.id} style={{ borderRadius: 10, border: `1px solid ${isOpen ? 'rgba(232,184,75,0.25)' : 'var(--border)'}`, overflow: 'hidden', background: 'var(--bg2)', transition: 'border-color 0.2s', flexShrink: 0 }}>
              <div
                onClick={() => setOpenId(id => id === session.id ? null : session.id)}
                style={{ display: 'grid', gridTemplateColumns: '56px 1fr auto', cursor: 'pointer', alignItems: 'stretch' }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '14px 8px', background: 'var(--bg3)', borderRight: '1px solid var(--border)', gap: 1 }}>
                  <div style={{ fontFamily: 'var(--font-head)', fontSize: 24, lineHeight: 1, color: accent }}>{dayNum}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.1em', color: 'var(--text5)' }}>{mon}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: 'var(--text5)', letterSpacing: '0.04em', marginTop: 2 }}>{dow}</div>
                </div>

                <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 5, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-head)', fontSize: 16, letterSpacing: '0.04em', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1 }}>
                    {session.isRest ? 'REST DAY' : session.dayLabel || 'Custom Session'}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, justifyContent: 'center' }}>
                    {session.isRest ? (
                      <div style={{ alignSelf: 'flex-start' }}><Pill color="blue">RECOVERY</Pill></div>
                    ) : (
                      <>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <Pill color="green">{workingSets.length} SETS</Pill>
                          <Pill color="gold">{fmtDur(session.duration)}</Pill>
                        </div>
                        {totalWorking > 0 && (
                          <div style={{ display: 'flex', height: 4, width: '100%', maxWidth: 120, borderRadius: 2, overflow: 'hidden' }}>
                            {Object.entries(muscleCounts).map(([m, count]) => (
                              <div key={m} style={{ width: `${(count / totalWorking) * 100}%`, background: mColors[m] || mColors.Other, height: '100%' }} title={`${m}: ${count} sets`} />
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', padding: '12px 14px', gap: 3 }}>
                  {session.isRest ? (
                    <div style={{ fontSize: 18 }}>🛌</div>
                  ) : (
                    <>
                      <div style={{ fontFamily: 'var(--font-head)', fontSize: 18, letterSpacing: '0.04em', color: 'var(--gold)', lineHeight: 1 }}>
                        {session.totalTonnage > 1000 ? (session.totalTonnage / 1000).toFixed(1) : Math.round(session.totalTonnage || 0)}
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text5)', marginLeft: 2 }}>{session.totalTonnage > 1000 ? 't' : 'kg'}</span>
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text5)', letterSpacing: '0.08em' }}>TONNAGE</div>
                    </>
                  )}
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text5)', marginTop: 4, transition: 'transform 0.2s, color 0.2s' }}>→</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {openId && (
        <SessionDetailModal
          session={sorted.find(s => s.id === openId)}
          onClose={() => setOpenId(null)}
          onEditNote={onEditNote}
          onDeleteSession={onDeleteSession}
        />
      )}
    </div>
  )
}

export default function TrackProgress() {
  const sessions = useStore('sessions')
  const [activeEx, setActiveEx] = useState('')
  const [expandSession, setExpandSession] = useState(null)

  const handleDeleteSession = (id) => {
    if (!confirm('Are you sure you want to delete this session? This action cannot be undone.')) return
    store.sessions.delete(id)
  }

  const handleEditNote = (id, newNote) => {
    store.sessions.update(id, { sessionNote: newNote })
  }

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
        const best = Math.max(...sets.map(set => epley(parseFloat(set.weight) || 0, parseFloat(set.reps) || 0)))
        return { date: formatDate(s.date), '1RM': best }
      })
  }, [activeEx, sessions])

  // Weekly volume by muscle group (last 4 weeks)
  const weeklyVolume = useMemo(() => {
    if (sessions.length === 0) return []
    const now = new Date()
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000)
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
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000)
    const thisWeekSessions = sessions.filter(s => new Date(s.date) >= weekAgo)
    const totalTonnage = sessions.reduce((sum, s) => sum + (s.totalTonnage || 0), 0)
    const allSets = sessions.flatMap(s => s.sets?.filter(set => set.done) || [])
    const allOneRMs = allSets.map(s => epley(parseFloat(s.weight) || 0, parseFloat(s.reps) || 0)).filter(Boolean)
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
        const rm = epley(parseFloat(set.weight) || 0, parseFloat(set.reps) || 0)
        if (!records[set.exerciseName] || rm > records[set.exerciseName].value) {
          records[set.exerciseName] = { value: rm, date: s.date, weight: set.weight, reps: set.reps }
        }
      })
    })
    return Object.entries(records).sort((a, b) => b[1].value - a[1].value).slice(0, 10)
  }, [sessions])

  const sortedSessions = useMemo(() =>
    [...sessions].sort((a, b) => new Date(b.date) - new Date(a.date)), [sessions])

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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {Object.entries(MEV).map(([muscle, mev]) => (
              <div key={muscle} style={{ padding: '8px 10px', background: 'var(--bg3)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text6)', letterSpacing: '0.08em', marginBottom: 3 }}>{muscle.toUpperCase()}</div>
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

      <SessionHistory pastSessions={sessions} onDeleteSession={handleDeleteSession} onEditNote={handleEditNote} />

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
                {name.split(' ').slice(0, 3).join(' ')}
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
              <Bar dataKey="sets" name="Sets" radius={[3, 3, 0, 0]}>
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
                padding: '10px 0', borderBottom: i < prs.length - 1 ? '1px solid var(--bg3)' : 'none',
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

    </div>
  )
}
