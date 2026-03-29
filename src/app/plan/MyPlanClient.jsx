'use client'
import { useState, useEffect, useCallback } from 'react'
import { DEFAULT_PPL_PLAN } from '../../data/defaultPlan'
import { EXERCISES, MUSCLE_ACCENTS } from '../../data/exercises'

function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2) }

const DAY_TYPES = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
const PLAN_TYPES = ['PPL', 'Upper/Lower', 'Full Body', 'Push/Pull', 'Custom']
const FOCUS_COLORS = { STRENGTH: 'var(--gold)', HYPERTROPHY: 'var(--blue)', RECOVERY: 'var(--text5)', MIXED: 'var(--green)' }

function ExerciseAccordion({ ex, index, accent }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`ex-card ${open ? 'open' : ''}`} style={{ '--accent': accent }}>
      <div className="ex-head" onClick={() => setOpen(o => !o)}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div className="ex-num">EXERCISE {index + 1}</div>
            <span className={`badge badge-${(ex.badge || 'strength').toLowerCase().replace('/','-')}`}>{ex.badge || 'STRENGTH'}</span>
            {ex.emgNote && <span className="badge badge-emg">{ex.emgNote}</span>}
          </div>
          <div className="ex-name">{ex.name}</div>
          <div className="ex-targets">{ex.targets}</div>
        </div>
        <div className="ex-toggle">▾</div>
      </div>
      {open && (
        <div className="ex-body">
          <table className="sets-table">
            <thead>
              <tr>
                <th>SET</th><th>WEIGHT</th><th>REPS</th><th>REST</th>
              </tr>
            </thead>
            <tbody>
              {ex.sets.map(s => (
                <tr key={s.n}>
                  <td className="s-num">{s.n}</td>
                  <td className="s-weight">{s.label || (s.kg ? `${s.kg} kg` : 'BW')}</td>
                  <td className="s-reps">{s.reps}</td>
                  <td className="s-rest">{s.rest}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="prog-note">PROGRESSION: <span>{ex.prog}</span></div>
          <div className="sci-box" style={{ borderLeftColor: accent }}>
            <div className="sci-label" style={{ color: accent }}>⚗ SCIENCE</div>
            <p>{ex.sciNote}</p>
          </div>
          {ex.cues && (
            <div className="prog-note" style={{ marginTop: 8 }}>
              CUES: <span>{ex.cues.join(' · ')}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function DayDetailModal({ plan, dayKey, onClose }) {
  const day = plan.days.find(d => d.key === dayKey)
  if (!day) return null
  const accent = day.accent || 'var(--gold)'
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 680, '--accent': accent }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: accent, letterSpacing: '0.08em', marginBottom: 4 }}>
              {plan.name}
            </div>
            <div className="modal-title" style={{ color: accent, margin: 0 }}>
              {day.label.toUpperCase()} — {day.focus}
            </div>
          </div>
          <button className="btn btn-ghost" onClick={onClose} style={{ fontSize: 20, padding: '4px 8px' }}>✕</button>
        </div>
        {day.desc && <p style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.6, marginBottom: 10 }}>{day.desc}</p>}
        {day.vol && (
          <div className="vol-row">
            {day.vol.map((v, i) => (
              <div key={i} className="vol-chip">{v.k} <span style={{ color: accent }}>{v.v}</span></div>
            ))}
          </div>
        )}
        {day.tip && (
          <div className="tip-box" dangerouslySetInnerHTML={{ __html: day.tip }} style={{ marginBottom: 14 }} />
        )}
        <div className="ex-list">
          {day.exercises.map((ex, i) => (
            <ExerciseAccordion key={ex.id || i} ex={ex} index={i} accent={accent} />
          ))}
        </div>
        {day.exercises.length === 0 && (
          <div className="empty-state" style={{ padding: '30px 0' }}>
            <div className="empty-icon">😴</div>
            <div className="empty-title">Rest Day</div>
            <div className="empty-sub">Recovery is part of the plan. Sleep well.</div>
          </div>
        )}
      </div>
    </div>
  )
}

function CreatePlanModal({ onSave, onClose }) {
  const [name, setName] = useState('')
  const [type, setType] = useState('PPL')

  function handleSave() {
    if (!name.trim()) return
    const days = Array.from({ length: 7 }, (_, i) => ({
      key: `day${i}`, label: DAY_TYPES[i], focus: 'STRENGTH',
      accent: 'var(--gold)', exercises: [], rest: false,
    }))
    onSave({ id: genId(), name: name.trim(), type, days })
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">Create New Plan</div>
        <div className="form-group">
          <label className="form-label">Plan Name</label>
          <input className="form-input" value={name} onChange={e => setName(e.target.value)}
            placeholder="e.g. My Strength Block" autoFocus />
        </div>
        <div className="form-group">
          <label className="form-label">Programme Type</label>
          <select className="form-select" value={type} onChange={e => setType(e.target.value)}>
            {PLAN_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={!name.trim()}>Create Plan</button>
        </div>
      </div>
    </div>
  )
}

export default function MyPlan() {
  const [plans, setPlans] = useState([])
  const [showCreate, setShowCreate] = useState(false)
  const [viewDetail, setViewDetail] = useState(null) // { planId, dayKey }

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('gymlogger_plans') || 'null')
      if (stored && stored.length > 0) {
        setPlans(stored)
      } else {
        setPlans([DEFAULT_PPL_PLAN])
        localStorage.setItem('gymlogger_plans', JSON.stringify([DEFAULT_PPL_PLAN]))
      }
    } catch {
      setPlans([DEFAULT_PPL_PLAN])
    }
  }, [])

  const savePlans = useCallback((updated) => {
    setPlans(updated)
    localStorage.setItem('gymlogger_plans', JSON.stringify(updated))
  }, [])

  const deletePlan = (id) => {
    if (!confirm('Delete this plan?')) return
    savePlans(plans.filter(p => p.id !== id))
  }

  const viewingPlan = viewDetail ? plans.find(p => p.id === viewDetail.planId) : null

  return (
    <div>
      <div className="section-header" style={{ marginBottom: 20 }}>
        <div>
          <div className="page-title" style={{ '--accent': 'var(--gold)', color: 'var(--gold)' }}>MY PLANS</div>
          <div className="page-subtitle">
            Scientific training programmes. Each day is built around stretch-mediated hypertrophy,
            progressive overload, and evidence-based volume targets.
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}
          style={{ background: 'var(--gold)', flexShrink: 0 }}>
          + New Plan
        </button>
      </div>

      {plans.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <div className="empty-title">No plans yet</div>
          <div className="empty-sub">Create your first training plan to get started.</div>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>Create Plan</button>
        </div>
      ) : (
        plans.map(plan => (
          <div key={plan.id} className="plan-card">
            <div className="plan-card-header">
              <div>
                <div className="plan-card-name">{plan.name}</div>
                <div className="plan-card-type">{plan.type} · {plan.days.filter(d => !d.rest && d.exercises?.length > 0).length} training days/week</div>
              </div>
              <div className="plan-actions">
                {plan.id !== 'default-ppl' && (
                  <button className="btn btn-danger btn-sm" onClick={() => deletePlan(plan.id)}>Delete</button>
                )}
              </div>
            </div>

            <div className="plan-days">
              {plan.days.map(day => (
                <button
                  key={day.key}
                  className={`plan-day-chip ${day.rest || (!day.exercises || day.exercises.length === 0) ? 'rest' : ''}`}
                  style={{ '--accent': day.accent || 'var(--gold)' }}
                  onClick={() => !day.rest && day.exercises?.length > 0 && setViewDetail({ planId: plan.id, dayKey: day.key })}
                >
                  <div className="plan-day-label" style={{ color: day.accent || 'var(--text4)' }}>
                    {day.focus || 'REST'}
                  </div>
                  <div className="plan-day-name">{day.label}</div>
                  <div className="plan-day-count">
                    {day.rest || !day.exercises?.length ? 'Rest' : `${day.exercises.length} exercises`}
                  </div>
                </button>
              ))}
            </div>

            {/* Weekly volume summary */}
            {plan.days.some(d => d.vol) && (
              <div style={{ padding: '0 18px 16px' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text5)', letterSpacing: '0.1em', marginBottom: 6 }}>
                  WEEKLY VOLUME
                </div>
                <div className="vol-row">
                  {Object.entries(
                    plan.days.reduce((acc, day) => {
                      (day.vol || []).forEach(v => {
                        const num = parseInt(v.v) || 0
                        acc[v.k] = (acc[v.k] || 0) + num
                      })
                      return acc
                    }, {})
                  ).map(([k, v]) => (
                    <div key={k} className="vol-chip">
                      {k} <span style={{ color: MUSCLE_ACCENTS[k] || 'var(--gold)' }}>{v} sets</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))
      )}

      {showCreate && (
        <CreatePlanModal
          onSave={plan => { savePlans([...plans, plan]); setShowCreate(false) }}
          onClose={() => setShowCreate(false)}
        />
      )}

      {viewDetail && viewingPlan && (
        <DayDetailModal
          plan={viewingPlan}
          dayKey={viewDetail.dayKey}
          onClose={() => setViewDetail(null)}
        />
      )}
    </div>
  )
}
