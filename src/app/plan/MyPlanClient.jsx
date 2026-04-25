'use client'
import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { PRELOADED_PLANS } from '../../data/plans/index'
import { EXERCISES, MUSCLE_ACCENTS, MUSCLE_GROUPS } from '../../data/exercises'
import ExerciseSelectorModal from '../../components/ExerciseSelectorModal'
import { store } from '../../lib/store'
import { useStore } from '../../lib/useStore'

function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2) }

const PLAN_TYPES = ['PPL', 'Upper/Lower', 'Full Body', 'Push/Pull', 'Bro Split', 'Custom']
const FOCUS_OPTS = ['STRENGTH', 'HYPERTROPHY', 'ENDURANCE', 'MIXED', 'RECOVERY']

function ExerciseAccordion({ ex, index, accent }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`ex-card ${open ? 'open' : ''}`} style={{ '--accent': accent }}>
      <div className="ex-head" onClick={() => setOpen(o => !o)}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div className="ex-num">EXERCISE {index + 1}</div>
            {ex.badge === 'CUSTOM' ? (
              <span className="badge badge-custom">CUSTOM</span>
            ) : ex.badge ? (
              <span className={`badge badge-${(ex.badge).toLowerCase().replace('/','-')}`}>{ex.badge}</span>
            ) : null}
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
              <tr><th>SET</th><th>WEIGHT</th><th>REPS</th><th>REST</th></tr>
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
          {ex.prog && <div className="prog-note">PROGRESSION: <span>{ex.prog}</span></div>}
          {ex.sciNote && (
            <div className="sci-box" style={{ borderLeftColor: accent }}>
              <div className="sci-label" style={{ color: accent }}>⚗ SCIENCE</div>
              <p>{ex.sciNote}</p>
            </div>
          )}
          {ex.cues && ex.cues.length > 0 && (
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
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const day = plan.days.find(d => d.key === dayKey)
  if (!day || !mounted) return null
  const accent = day.accent || 'var(--gold)'

  return createPortal(
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 680, '--accent': accent }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: accent, letterSpacing: '0.08em', marginBottom: 4 }}>{plan.name}</div>
            <div className="modal-title" style={{ color: accent, margin: 0 }}>{day.label.toUpperCase()} — {day.focus}</div>
          </div>
          <button className="btn btn-ghost" onClick={onClose} style={{ fontSize: 20, padding: '4px 8px' }}>✕</button>
        </div>
        
        {day.desc && <p style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.6, marginBottom: 10 }}>{day.desc}</p>}
        
        <div className="ex-list">
          {day.exercises.map((ex, i) => <ExerciseAccordion key={ex.id || i} ex={ex} index={i} accent={accent} />)}
        </div>
        
        {(!day.exercises || day.exercises.length === 0) && (
          <div className="empty-state" style={{ padding: '30px 0' }}>
            <div className="empty-icon">😴</div>
            <div className="empty-title">Rest Day</div>
            <div className="empty-sub">Recovery is part of the plan. Sleep well.</div>
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}

function PlanEditorExercise({ ex, index, onUpdate, onRemove }) {
  const [open, setOpen] = useState(false)

  const addSet = () => {
    const lastSet = ex.sets[ex.sets.length - 1] || { reps: '8-12', rest: '90s', lg: '' };
    onUpdate({ ...ex, sets: [...ex.sets, { n: ex.sets.length + 1, reps: lastSet.reps, rest: lastSet.rest, label: lastSet.label || '' }] })
  }

  const removeSet = (sIdx) => {
    const newSets = ex.sets.filter((_, i) => i !== sIdx).map((s, i) => ({ ...s, n: i + 1 }))
    onUpdate({ ...ex, sets: newSets })
  }

  const updateSet = (sIdx, field, val) => {
    const newSets = [...ex.sets]
    newSets[sIdx] = { ...newSets[sIdx], [field]: val }
    onUpdate({ ...ex, sets: newSets })
  }

  return (
    <div style={{ background: 'var(--bg2)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '12px 14px' }} onClick={() => setOpen(!open)}>
        <div style={{ fontFamily: 'var(--font-head)', fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>{index + 1}. {ex.name}</div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text4)' }}>{ex.sets.length} SETS</div>
          <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)', padding: '4px 8px' }} onClick={(e) => { e.stopPropagation(); onRemove() }}>✕</button>
          <div style={{ fontSize: 12, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', padding: '0 4px', color: 'var(--text5)' }}>▾</div>
        </div>
      </div>
      
      {open && (
        <div style={{ padding: '0 14px 14px', borderTop: '1px solid var(--border)' }}>
          <div style={{ marginTop: 12 }}>
            <table className="sets-table" style={{ width: '100%', marginBottom: 12 }}>
              <thead>
                <tr>
                  <th style={{ width: 40, textAlign: 'center' }}>SET</th>
                  <th>TARGET / WEIGHT</th>
                  <th>REPS</th>
                  <th>REST</th>
                  <th style={{ width: 30 }}></th>
                </tr>
              </thead>
              <tbody>
                {ex.sets.map((s, sIdx) => (
                  <tr key={sIdx}>
                    <td className="s-num" style={{ textAlign: 'center', paddingTop: 6 }}>{s.n}</td>
                    <td style={{ paddingTop: 6 }}><input className="form-input" style={{ width: '100%', padding: '6px', fontSize: 13 }} value={s.label || s.kg || ''} onChange={e => updateSet(sIdx, 'label', e.target.value)} placeholder="e.g. 20kg" /></td>
                    <td style={{ paddingTop: 6 }}><input className="form-input" style={{ width: '100%', padding: '6px', fontSize: 13 }} value={s.reps} onChange={e => updateSet(sIdx, 'reps', e.target.value)} placeholder="8-12" /></td>
                    <td style={{ paddingTop: 6 }}><input className="form-input" style={{ width: '100%', padding: '6px', fontSize: 13 }} value={s.rest} onChange={e => updateSet(sIdx, 'rest', e.target.value)} placeholder="90s" /></td>
                    <td style={{ paddingTop: 6, textAlign: 'right' }}><button className="btn btn-ghost" style={{ color: 'var(--red)', padding: '6px 4px' }} onClick={() => removeSet(sIdx)}>✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="btn btn-outline btn-sm" style={{ borderStyle: 'dashed', width: '100%' }} onClick={addSet}>+ Add Set</button>
          </div>
        </div>
      )}
    </div>
  )
}

function PlanEditor({ initialPlan, allExercises, onSave, onClose }) {
  const [plan, setPlan] = useState(() => initialPlan || { id: genId(), name: '', type: 'Custom', days: [] })
  const [pickerDayIdx, setPickerDayIdx] = useState(null)

  const updatePlan = (field, val) => setPlan(p => ({ ...p, [field]: val }))
  
  const addDay = () => setPlan(p => ({
    ...p, days: [...p.days, { key: genId(), label: `Day ${p.days.length + 1}`, focus: 'STRENGTH', accent: 'var(--gold)', rest: false, exercises: [] }]
  }))
  
  const updateDay = (dayIdx, field, val) => setPlan(p => {
    const days = [...p.days]
    days[dayIdx] = { ...days[dayIdx], [field]: val }
    return { ...p, days }
  })
  
  const removeDay = (dayIdx) => setPlan(p => ({ ...p, days: p.days.filter((_, i) => i !== dayIdx) }))

  const moveDay = (dayIdx, dir) => setPlan(p => {
    if (dayIdx + dir < 0 || dayIdx + dir >= p.days.length) return p
    const days = [...p.days]
    const temp = days[dayIdx]
    days[dayIdx] = days[dayIdx + dir]
    days[dayIdx + dir] = temp
    return { ...p, days }
  })

  // Exercise Management
  const addExercise = (dayIdx, exName) => {
    const matched = allExercises.find(e => e.name === exName) || { name: exName }
    const newEx = {
      id: genId(), name: matched.name, badge: matched.badge, targets: matched.targets, sciNote: matched.sciNote,
      cues: matched.cues, emgNote: matched.emgNote, prog: matched.prog,
      sets: Array.from({ length: 3 }, (_, i) => ({ n: i+1, reps: matched.repRange || '8-12', rest: matched.restRange || '90s', label: '' }))
    }
    
    setPlan(p => {
      const days = p.days.map((day, i) => {
        if (i !== dayIdx) return day
        return { ...day, exercises: [...(day.exercises || []), newEx] }
      })
      return { ...p, days }
    })
  }

  const updateExercise = (dayIdx, exIdx, updatedEx) => {
    setPlan(p => {
      const days = p.days.map((day, i) => {
        if (i !== dayIdx) return day
        const exercises = [...day.exercises]
        exercises[exIdx] = updatedEx
        return { ...day, exercises }
      })
      return { ...p, days }
    })
  }

  const removeExercise = (dayIdx, exIdx) => {
    setPlan(p => {
      const days = p.days.map((day, i) => {
        if (i !== dayIdx) return day
        const exercises = day.exercises.filter((_, j) => j !== exIdx)
        return { ...day, exercises }
      })
      return { ...p, days }
    })
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div className="page-title" style={{ color: 'var(--gold)' }}>{initialPlan ? 'EDIT PLAN' : 'BUILD PLAN'}</div>
          <div className="page-subtitle">Configure days, exercises, targets and rests.</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onSave(plan)} disabled={!plan.name.trim() || plan.days.length === 0}>Save Plan</button>
        </div>
      </div>

      <div className="card" style={{ padding: 20, marginBottom: 24, '--accent': 'var(--gold)' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 2, minWidth: 200 }}>
            <label className="form-label">Plan Name</label>
            <input className="form-input" value={plan.name} onChange={e => updatePlan('name', e.target.value)} placeholder="e.g. My Upper/Lower Split" />
          </div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <label className="form-label">Plan Type</label>
            <select className="form-select" value={plan.type} onChange={e => updatePlan('type', e.target.value)}>
              {PLAN_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontFamily: 'var(--font-head)', fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>TRAINING DAYS</div>
          <button className="btn btn-primary btn-sm" onClick={addDay}>+ Add Day</button>
        </div>

        {plan.days.length === 0 && (
          <div className="empty-state" style={{ padding: '30px 0' }}>
            <div className="empty-sub">No days added yet. Click "+ Add Day" to start building your routine.</div>
          </div>
        )}

        {plan.days.map((day, dIdx) => (
          <div key={day.key} className="card" style={{ padding: 16, marginBottom: 16, borderLeft: `3px solid ${day.accent || 'var(--gold)'}` }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-start', marginBottom: day.rest ? 0 : 16 }}>
              <div style={{ flex: 1, minWidth: 150 }}>
                <input className="form-input" value={day.label} onChange={e => updateDay(dIdx, 'label', e.target.value)} placeholder="Day Name (e.g. Push, Day 1)" style={{ fontFamily: 'var(--font-head)', fontSize: 18, fontWeight: 700 }} />
              </div>
              <div style={{ width: 140 }}>
                <select className="form-select" value={day.focus} onChange={e => updateDay(dIdx, 'focus', e.target.value)}>
                  {FOCUS_OPTS.map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, height: 42 }}>
                <input type="checkbox" checked={day.rest} onChange={e => updateDay(dIdx, 'rest', e.target.checked)} id={`rest-${dIdx}`} />
                <label htmlFor={`rest-${dIdx}`} style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)' }}>Rest Day</label>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button className="btn btn-ghost" onClick={() => moveDay(dIdx, -1)} disabled={dIdx === 0}>↑</button>
                <button className="btn btn-ghost" onClick={() => moveDay(dIdx, 1)} disabled={dIdx === plan.days.length - 1}>↓</button>
                <button className="btn btn-danger" style={{ padding: '8px 12px' }} onClick={() => removeDay(dIdx)}>✕</button>
              </div>
            </div>

            {!day.rest && (
              <div style={{ background: 'var(--bg)', padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                {(!day.exercises || day.exercises.length === 0) ? (
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text5)', textAlign: 'center', padding: '10px 0' }}>No exercises added.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                    {(day.exercises).map((ex, eIdx) => (
                      <PlanEditorExercise
                        key={ex.id || eIdx}
                        ex={ex}
                        index={eIdx}
                        onUpdate={(uEx) => updateExercise(dIdx, eIdx, uEx)}
                        onRemove={() => removeExercise(dIdx, eIdx)}
                      />
                    ))}
                  </div>
                )}
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button className="btn btn-outline" style={{ flex: 1, borderStyle: 'dashed', justifyContent: 'flex-start', color: 'var(--text4)' }} onClick={() => setPickerDayIdx(dIdx)}>
                    + Add Exercise to {day.label}...
                  </button>
                  {pickerDayIdx === dIdx && (
                    <ExerciseSelectorModal 
                      allExercises={allExercises} 
                      onSelect={(exName) => { addExercise(dIdx, exName); setPickerDayIdx(null) }} 
                      onClose={() => setPickerDayIdx(null)} 
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {plan.days.length > 0 && (
          <button className="btn btn-outline" style={{ width: '100%', borderStyle: 'dashed', padding: 14 }} onClick={addDay}>+ Add Another Day</button>
        )}
      </div>
    </div>
  )
}

export default function MyPlan() {
  const plans = useStore('plans')
  const [allExercises, setAllExercises] = useState(EXERCISES)
  
  const [editingPlan, setEditingPlan] = useState(null) // null | Plan object
  const [viewDetail, setViewDetail] = useState(null) // { planId, dayKey }

  useEffect(() => {
    setAllExercises(store.customExercises.getAllMerged())
  }, [])

  const deletePlan = (id) => {
    if (!confirm('Delete this plan entirely?')) return
    store.plans.delete(id)
  }

  const handleSavePlan = (planData) => {
    store.plans.save(planData)
    setEditingPlan(null)
  }

  const toggleStar = (id) => {
    const plan = plans.find(p => p.id === id)
    if (plan) store.plans.save({ ...plan, isStarred: !plan.isStarred })
  }

  const sortedPlans = [...plans].sort((a, b) => {
    if (a.isStarred && !b.isStarred) return -1
    if (!a.isStarred && b.isStarred) return 1
    return 0
  })

  if (editingPlan) {
    return <PlanEditor initialPlan={editingPlan.id ? editingPlan : null} allExercises={allExercises} onSave={handleSavePlan} onClose={() => setEditingPlan(null)} />
  }

  const viewingPlan = viewDetail ? plans.find(p => p.id === viewDetail.planId) : null

  return (
    <div>
      <div className="section-header" style={{ marginBottom: 20 }}>
        <div>
          <div className="page-title" style={{ '--accent': 'var(--gold)', color: 'var(--gold)' }}>MY PLANS</div>
          <div className="page-subtitle">Scientific training programmes. Built around progressive overload and evidence-based targets.</div>
        </div>
        <button className="btn btn-primary" onClick={() => setEditingPlan({})} style={{ background: 'var(--gold)', flexShrink: 0 }}>
          + New Plan
        </button>
      </div>

      {plans.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <div className="empty-title">No plans yet</div>
          <div className="empty-sub">Create your first training plan to get started.</div>
          <button className="btn btn-primary" onClick={() => setEditingPlan({})}>Create Plan</button>
        </div>
      ) : (
        sortedPlans.map(plan => (
          <div key={plan.id} className="plan-card">
            <div className="plan-card-header">
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button 
                    className="btn btn-ghost" 
                    onClick={() => toggleStar(plan.id)}
                    style={{ color: plan.isStarred ? 'var(--gold)' : 'var(--text4)', padding: 0, fontSize: 22 }}
                    title={plan.isStarred ? 'Unpin Plan' : 'Pin Plan'}
                  >
                    {plan.isStarred ? '★' : '☆'}
                  </button>
                  <div className="plan-card-name" style={{ margin: 0 }}>{plan.name}</div>
                </div>
                <div className="plan-card-type">{plan.type} · {plan.days.filter(d => !d.rest && d.exercises?.length > 0).length} training days</div>
                {plan.description && <p style={{ fontSize: 13, color: 'var(--text3)', marginTop: 8, lineHeight: 1.5 }}>{plan.description}</p>}
              </div>
              <div className="plan-actions" style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                <button className="btn btn-outline btn-sm" onClick={() => setEditingPlan(plan)}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => deletePlan(plan.id)}>Delete</button>
              </div>
            </div>

            <div className="plan-days">
              {plan.days.map(day => (
                <button key={day.key} className={`plan-day-chip ${day.rest || (!day.exercises || day.exercises.length === 0) ? 'rest' : ''}`} style={{ '--accent': day.accent || 'var(--gold)' }} onClick={() => !day.rest && day.exercises?.length > 0 && setViewDetail({ planId: plan.id, dayKey: day.key })}>
                  <div className="plan-day-label" style={{ color: day.accent || 'var(--text4)' }}>{day.focus || 'REST'}</div>
                  <div className="plan-day-name">{day.label}</div>
                  <div className="plan-day-count">{day.rest || !day.exercises?.length ? 'Rest' : `${day.exercises.length} exercises`}</div>
                </button>
              ))}
            </div>

            {/* Weekly volume summary */}
            {plan.days.some(d => d.vol) && (
              <div style={{ padding: '0 18px 16px' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text5)', letterSpacing: '0.1em', marginBottom: 6 }}>WEEKLY VOLUME</div>
                <div className="vol-row">
                  {Object.entries(plan.days.reduce((acc, day) => {
                    (day.vol || []).forEach(v => { acc[v.k] = (acc[v.k] || 0) + (parseInt(v.v) || 0) })
                    return acc
                  }, {})).map(([k, v]) => (
                    <div key={k} className="vol-chip">{k} <span style={{ color: MUSCLE_ACCENTS[k] || 'var(--gold)' }}>{v} sets</span></div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))
      )}

      {viewDetail && viewingPlan && <DayDetailModal plan={viewingPlan} dayKey={viewDetail.dayKey} onClose={() => setViewDetail(null)} />}
    </div>
  )
}
