'use client'
import { useState, useMemo, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { EXERCISES, MUSCLE_GROUPS, MUSCLE_ACCENTS } from '../../data/exercises'

function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2) }

/* ─── Filter icon (funnel) SVG ─────────────────────────────────────────── */
function FilterIcon({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" style={{ display: 'block', flexShrink: 0 }}>
      <path d="M3 4.5h14M5.5 9.5h9M8 14.5h4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

const EMG_OPTS = ['HIGH EMG', 'STRETCH-LOADED', 'CONSTANT TENSION']
const TYPE_OPTS = ['compound', 'isolation', 'CUSTOM']
const EMG_COLOR = { 'HIGH EMG': 'var(--green)', 'STRETCH-LOADED': 'var(--gold)', 'CONSTANT TENSION': 'var(--blue)' }
const EMG_DIM   = { 'HIGH EMG': 'var(--green-dim)', 'STRETCH-LOADED': 'var(--gold-dim)', 'CONSTANT TENSION': 'var(--blue-dim)' }
const TYPE_COLOR = { compound: 'var(--orange)', isolation: 'var(--purple)', CUSTOM: 'var(--green)' }
const TYPE_DIM   = { compound: 'var(--orange-dim)', isolation: 'var(--purple-dim)' }

/* ─── Filter Drawer ─────────────────────────────────────────────────────── */
function FilterDrawer({ muscles, types, emgs, setMuscles, setTypes, setEmgs, onClose }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const drawerRef = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (drawerRef.current && !drawerRef.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const toggle = (set, val) => set(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val])
  const clearAll = () => { setMuscles([]); setTypes([]); setEmgs([]) }

  const Section = ({ title, opts, active, onToggle, colorFn }) => (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text5)', letterSpacing: '0.12em', marginBottom: 8 }}>{title}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {opts.map(opt => {
          const color = colorFn ? colorFn(opt) : 'var(--gold)'
          const isOn = active.includes(opt)
          return (
            <button key={opt} onClick={() => onToggle(opt)} style={{
              fontFamily: 'var(--font-mono)', fontSize: 10, padding: '5px 10px',
              borderRadius: 'var(--radius-sm)', background: isOn ? color : 'var(--bg3)',
              color: isOn ? '#000' : 'var(--text4)', border: `1px solid ${isOn ? color : 'var(--border)'}`,
              cursor: 'pointer', transition: 'all 0.15s', fontWeight: isOn ? 700 : 400,
            }}>
              {opt.toUpperCase()}
            </button>
          )
        })}
      </div>
    </div>
  )

  if (!mounted) return null

  return createPortal(
    <>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99, backdropFilter: 'blur(2px)' }} />
      <div ref={drawerRef} style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'var(--bg2)', borderTop: '1px solid var(--border2)',
        borderRadius: '16px 16px 0 0', padding: '0 20px 32px', zIndex: 100,
        maxWidth: 640, margin: '0 auto', animation: 'slideUp 0.25s ease',
      }}>
        <div style={{ margin: '12px auto 18px', width: 36, height: 4, background: 'var(--border2)', borderRadius: 2 }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FilterIcon size={16} color="var(--text)" />
            <span style={{ fontFamily: 'var(--font-head)', fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>FILTERS</span>
          </div>
          <button onClick={clearAll} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text5)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
            CLEAR ALL
          </button>
        </div>

        <Section title="MUSCLE GROUP" opts={MUSCLE_GROUPS.filter(g => g !== 'All')} active={muscles}
          onToggle={v => toggle(setMuscles, v)} colorFn={v => MUSCLE_ACCENTS[v] || 'var(--gold)'} />
        <Section title="EXERCISE TYPE" opts={TYPE_OPTS} active={types}
          onToggle={v => toggle(setTypes, v)} colorFn={v => TYPE_COLOR[v]} />
        <Section title="EMG / TENSION TYPE" opts={EMG_OPTS} active={emgs}
          onToggle={v => toggle(setEmgs, v)} colorFn={v => EMG_COLOR[v]} />

        <button onClick={onClose} style={{
          width: '100%', marginTop: 8, padding: '13px', borderRadius: 'var(--radius-sm)',
          background: 'var(--gold)', color: '#000', fontFamily: 'var(--font-head)',
          fontSize: 15, fontWeight: 800, border: 'none', cursor: 'pointer',
        }}>
          SHOW {' '}RESULTS
        </button>
      </div>
      <style>{`@keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }`}</style>
    </>,
    document.body
  )
}

function Pill({ label, color, onRemove }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: 20,
      background: color + '22', border: `1px solid ${color}55`, fontFamily: 'var(--font-mono)', fontSize: 10, color: color,
    }}>
      {label.toUpperCase()}
      <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', color: color, fontSize: 12, lineHeight: 1, padding: 0 }}>✕</button>
    </div>
  )
}

/* ─── Exercise Card ──────────────────────────────────────────────────────── */
function ExerciseCard({ ex, accent, onEdit, onDelete, pastSessions }) {
  const [open, setOpen] = useState(false)

  const historicalNote = useMemo(() => {
    if (!pastSessions || !pastSessions.length) return null
    for (const session of [...pastSessions].sort((a, b) => new Date(b.date) - new Date(a.date))) {
      if (!session.sets) continue
      const setWithNote = session.sets.find(s => s.exerciseName === ex.name && s.exNote)
      if (setWithNote) return setWithNote.exNote
    }
    return null
  }, [pastSessions, ex.name])
  return (
    <div className={`ex-card ${open ? 'open' : ''}`} style={{ '--accent': accent }}>
      <div className="ex-head" onClick={() => setOpen(o => !o)}>
        <div style={{ flex: 1 }}>
          <div className="ex-badges" style={{ marginBottom: 5 }}>
            {ex.badge === 'CUSTOM' && (
              <span className="badge badge-custom">CUSTOM</span>
            )}
            {ex.type && (
              <span className="badge" style={{ background: TYPE_DIM[ex.type] || 'var(--bg3)', color: TYPE_COLOR[ex.type], border: `1px solid ${TYPE_COLOR[ex.type]}`, borderWidth: 0 }}>
                {ex.type.toUpperCase()}
              </span>
            )}
            {ex.emgNote && <span className="badge" style={{ background: EMG_DIM[ex.emgNote] || 'var(--bg3)', color: EMG_COLOR[ex.emgNote] || 'var(--text3)', border: 'none' }}>{ex.emgNote}</span>}
          </div>
          <div className="ex-name" style={{ color: ex.badge === 'CUSTOM' ? 'var(--purple)' : 'var(--text)' }}>
            {ex.name}
          </div>
          <div className="ex-targets">{ex.targets}</div>
          {ex.secondary && <div className="ex-targets" style={{ color: 'var(--text5)', marginTop: 2 }}>Also: {ex.secondary}</div>}
        </div>
        <div className="ex-toggle">▾</div>
      </div>
      {open && (
        <div className="ex-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
            <div style={{ padding: '8px 12px', background: 'var(--bg)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text5)', letterSpacing: '0.1em', marginBottom: 4 }}>REP RANGE</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: accent }}>{ex.repRange || '8–12'}</div>
            </div>
            <div style={{ padding: '8px 12px', background: 'var(--bg)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text5)', letterSpacing: '0.1em', marginBottom: 4 }}>REST</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: accent }}>{ex.restRange || '60–90s'}</div>
            </div>
          </div>
          {historicalNote && (
            <div style={{ marginBottom: 12, padding: '8px 12px', background: 'var(--bg)', borderLeft: `2px solid ${accent}`, borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text5)', letterSpacing: '0.1em', marginBottom: 4 }}>RECENT PERSONAL NOTE</div>
              <div style={{ fontSize: 12, color: 'var(--text3)', fontStyle: 'italic' }}>"{historicalNote}"</div>
            </div>
          )}
          {ex.sciNote && (
            <div className="sci-box" style={{ borderLeftColor: accent }}>
              <div className="sci-label" style={{ color: accent }}>⚗ SCIENCE</div>
              <p>{ex.sciNote}</p>
            </div>
          )}
          {ex.cues && ex.cues.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text5)', letterSpacing: '0.1em', marginBottom: 6 }}>TECHNIQUE CUES</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {ex.cues.map((cue, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <span style={{ color: accent, fontFamily: 'var(--font-mono)', fontSize: 10, flexShrink: 0, marginTop: 1 }}>→</span>
                    <span style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.5 }}>{cue}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {ex.badge === 'CUSTOM' && (
            <div style={{ display: 'flex', gap: 10, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
              <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={(e) => { e.stopPropagation(); onEdit(ex) }}>Edit</button>
              <button className="btn btn-danger btn-sm" style={{ flex: 1 }} onClick={(e) => { e.stopPropagation(); onDelete(ex.id) }}>Delete</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function CreateCustomModal({ initialData, onSave, onClose }) {
  const [name, setName] = useState(initialData?.name || '')
  const [muscleGroup, setMuscleGroup] = useState(initialData?.muscleGroup || 'Chest')
  const [targets, setTargets] = useState(initialData?.targets || '')
  const [cues, setCues] = useState(initialData?.cues?.join(', ') || '')
  const [repRange, setRepRange] = useState(initialData?.repRange || '8-12')
  const [restRange, setRestRange] = useState(initialData?.restRange || '90s')
  const [type, setType] = useState(initialData?.type || 'isolation')
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  function handleSave() {
    if (!name.trim()) return
    onSave({
      id: initialData?.id || genId(), name: name.trim(), muscleGroup, targets: targets.trim(),
      badge: 'CUSTOM', cues: cues ? cues.split(',').map(c => c.trim()).filter(Boolean) : [],
      repRange, restRange, type
    })
  }

  if (!mounted) return null

  return createPortal(
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ '--accent': MUSCLE_ACCENTS[muscleGroup] || 'var(--purple)' }}>
        <div className="modal-title" style={{ color: 'var(--accent)' }}>{initialData ? 'Edit' : 'Create'} Custom Exercise</div>
        <div className="form-group">
          <label className="form-label">Exercise Name</label>
          <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. My Custom Row" autoFocus />
        </div>
        <div className="form-group">
          <label className="form-label">Primary Muscle Group</label>
          <select className="form-select" value={muscleGroup} onChange={e => setMuscleGroup(e.target.value)}>
            {MUSCLE_GROUPS.filter(g => g !== 'All').map(g => <option key={g}>{g}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Specific Target Muscles (optional)</label>
          <input className="form-input" value={targets} onChange={e => setTargets(e.target.value)} placeholder="e.g. Lats, Rear Delts" />
        </div>
        <div className="form-group">
          <label className="form-label">Form Cues (comma separated)</label>
          <input className="form-input" value={cues} onChange={e => setCues(e.target.value)} placeholder="e.g. pull to hip, slow negative" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Rep Range</label>
            <input className="form-input" value={repRange} onChange={e => setRepRange(e.target.value)} placeholder="e.g. 8-12" />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Rest Range</label>
            <input className="form-input" value={restRange} onChange={e => setRestRange(e.target.value)} placeholder="e.g. 90s, 2-3 min" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Exercise Type</label>
          <select className="form-select" value={type} onChange={e => setType(e.target.value)}>
            <option value="compound">Compound</option>
            <option value="isolation">Isolation</option>
          </select>
        </div>
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={!name.trim()}>Save Exercise</button>
        </div>
      </div>
    </div>,
    document.body
  )
}

/* ─── Main Page ─────────────────────────────────────────────────────────── */
export default function ExerciseList() {
  const [allExercises, setAllExercises] = useState([...EXERCISES])
  
  const [pastSessions, setPastSessions] = useState([])

  useEffect(() => {
    try {
      const customEx = JSON.parse(localStorage.getItem('gymlogger_custom_exercises') || '[]')
      setAllExercises([...EXERCISES, ...customEx].sort((a,b) => a.name.localeCompare(b.name)))
      setPastSessions(JSON.parse(localStorage.getItem('gymlogger_sessions') || '[]'))
    } catch {}
  }, [])

  const [search, setSearch] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingEx, setEditingEx] = useState(null) // null | false | Exercise Object
  
  const [activeMuscles, setActiveMuscles] = useState([])
  const [activeTypes, setActiveTypes] = useState([])
  const [activeEmgs, setActiveEmgs] = useState([])

  const handleSaveCustom = async (newEx) => {
    const isEdit = allExercises.some(e => e.id === newEx.id)
    const customOnly = allExercises.filter(e => e.badge === 'CUSTOM')
    
    let updatedCustom
    if (isEdit) updatedCustom = customOnly.map(c => c.id === newEx.id ? newEx : c)
    else updatedCustom = [...customOnly, newEx]
    
    // Optimistic UI update
    setAllExercises(prev => {
      const builtins = prev.filter(e => e.badge !== 'CUSTOM')
      return [...builtins, ...updatedCustom].sort((a,b) => a.name.localeCompare(b.name))
    })
    
    setEditingEx(null)

    // Save directly to localStorage!
    try {
      localStorage.setItem('gymlogger_custom_exercises', JSON.stringify(updatedCustom))
    } catch {}
  }

  const handleDeleteCustom = async (exId) => {
    if (!confirm('Permanently delete this custom exercise?')) return
    const customOnly = allExercises.filter(e => e.badge === 'CUSTOM' && e.id !== exId)
    
    // Optimistic UI update
    setAllExercises(prev => prev.filter(e => e.id !== exId))
    
    // Save directly to localStorage!
    try {
      localStorage.setItem('gymlogger_custom_exercises', JSON.stringify(customOnly))
    } catch {}
  }

  const totalActive = activeMuscles.length + activeTypes.length + activeEmgs.length

  const filtered = useMemo(() => {
    return allExercises.filter(ex => {
      const matchMuscle = activeMuscles.length === 0 || activeMuscles.includes(ex.muscleGroup)
      const matchType = activeTypes.length === 0 
        ? true 
        : (activeTypes.includes(ex.type) || (activeTypes.includes('CUSTOM') && ex.badge === 'CUSTOM'))
      const matchEmg = activeEmgs.length === 0 || activeEmgs.includes(ex.emgNote)
      const matchSearch = !search || ex.name.toLowerCase().includes(search.toLowerCase()) || (ex.targets && ex.targets.toLowerCase().includes(search.toLowerCase()))
      return matchMuscle && matchType && matchEmg && matchSearch
    })
  }, [allExercises, activeMuscles, activeTypes, activeEmgs, search])

  const grouped = useMemo(() => {
    if (activeMuscles.length === 1) return { [activeMuscles[0]]: filtered }
    return filtered.reduce((acc, ex) => {
      if (!acc[ex.muscleGroup]) acc[ex.muscleGroup] = []
      acc[ex.muscleGroup].push(ex)
      return acc
    }, {})
  }, [activeMuscles, filtered])

  const pills = [
    ...activeMuscles.map(v => ({ label: v, color: MUSCLE_ACCENTS[v] || 'var(--gold)', removeFrom: setActiveMuscles })),
    ...activeTypes.map(v => ({ label: v, color: TYPE_COLOR[v], removeFrom: setActiveTypes })),
    ...activeEmgs.map(v => ({ label: v, color: EMG_COLOR[v], removeFrom: setActiveEmgs })),
  ]

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="page-title" style={{ color: 'var(--blue)' }}>EXERCISE LIBRARY</div>
          <div className="page-subtitle">{allExercises.length} exercises · EMG classification · stretch-loading science</div>
        </div>
        <button className="btn btn-outline" style={{ flexShrink: 0, padding: '6px 10px', fontSize: 11, borderColor: 'var(--purple)', color: 'var(--purple)' }} onClick={() => setEditingEx(false)}>
          + Custom
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
        <input className="search-bar" style={{ flex: 1, marginBottom: 0 }} placeholder="Search exercises（including Custom）…" value={search} onChange={e => setSearch(e.target.value)} />
        <button onClick={() => setDrawerOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 14px', height: 42, borderRadius: 'var(--radius-sm)', background: totalActive > 0 ? 'var(--gold)' : 'var(--bg2)', border: `1px solid ${totalActive > 0 ? 'var(--gold)' : 'var(--border)'}`, color: totalActive > 0 ? '#000' : 'var(--text3)', cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: totalActive > 0 ? 700 : 400 }}>
          <FilterIcon size={15} color={totalActive > 0 ? '#000' : 'var(--text3)'} />
          {totalActive > 0 ? `FILTERS (${totalActive})` : 'FILTER'}
        </button>
      </div>

      {pills.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {pills.map((p, i) => <Pill key={i} label={p.label} color={p.color} onRemove={() => p.removeFrom(prev => prev.filter(v => v !== p.label))} />)}
        </div>
      )}

      {editingEx !== null && <CreateCustomModal initialData={editingEx || null} onSave={handleSaveCustom} onClose={() => setEditingEx(null)} />}
      {drawerOpen && <FilterDrawer muscles={activeMuscles} types={activeTypes} emgs={activeEmgs} setMuscles={setActiveMuscles} setTypes={setActiveTypes} setEmgs={setActiveEmgs} onClose={() => setDrawerOpen(false)} />}

      <div className="ex-list">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <div className="empty-title">No matches found</div>
            <div className="empty-sub">Try a different search or clear filters.</div>
          </div>
        ) : (
          Object.keys(grouped).sort((a,b) => a.localeCompare(b)).map(group => (
            <div key={group} style={{ marginBottom: 24 }}>
              <div className="section-header" style={{ marginBottom: 12, paddingBottom: 6, borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500, color: MUSCLE_ACCENTS[group] || 'var(--text3)', letterSpacing: '0.15em' }}>
                  {group.toUpperCase()}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text5)' }}>{grouped[group].length} EXC</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {grouped[group].map((ex, i) => (
                  <ExerciseCard key={ex.id || i} ex={ex} accent={MUSCLE_ACCENTS[ex.muscleGroup] || 'var(--gold)'} onEdit={setEditingEx} onDelete={handleDeleteCustom} pastSessions={pastSessions} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ textAlign: 'center', marginTop: 20, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text5)' }}>
        {filtered.length} of {allExercises.length} exercises
      </div>
    </div>
  )
}
