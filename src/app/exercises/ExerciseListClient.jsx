'use client'
import { useState, useMemo, useRef, useEffect } from 'react'
import { EXERCISES, MUSCLE_GROUPS, MUSCLE_ACCENTS } from '../../data/exercises'

/* ─── Filter icon (funnel) SVG ─────────────────────────────────────────── */
function FilterIcon({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" style={{ display: 'block', flexShrink: 0 }}>
      <path d="M3 4.5h14M5.5 9.5h9M8 14.5h4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

const EMG_OPTS = ['HIGH EMG', 'STRETCH-LOADED', 'CONSTANT TENSION']
const TYPE_OPTS = ['compound', 'isolation']
const EMG_COLOR = { 'HIGH EMG': 'var(--green)', 'STRETCH-LOADED': 'var(--gold)', 'CONSTANT TENSION': 'var(--blue)' }
const EMG_DIM   = { 'HIGH EMG': 'var(--green-dim)', 'STRETCH-LOADED': 'var(--gold-dim)', 'CONSTANT TENSION': 'var(--blue-dim)' }
const TYPE_COLOR = { compound: 'var(--orange)', isolation: 'var(--purple)' }
const TYPE_DIM   = { compound: 'var(--orange-dim)', isolation: 'var(--purple-dim)' }

/* ─── Filter Drawer ─────────────────────────────────────────────────────── */
function FilterDrawer({ muscles, types, emgs, setMuscles, setTypes, setEmgs, onClose }) {
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
              borderRadius: 'var(--radius-sm)',
              background: isOn ? color : 'var(--bg3)',
              color: isOn ? '#000' : 'var(--text4)',
              border: `1px solid ${isOn ? color : 'var(--border)'}`,
              cursor: 'pointer', transition: 'all 0.15s',
              fontWeight: isOn ? 700 : 400,
            }}>
              {opt.toUpperCase()}
            </button>
          )
        })}
      </div>
    </div>
  )

  return (
    <>
      {/* Backdrop */}
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99, backdropFilter: 'blur(2px)' }} />
      {/* Drawer */}
      <div ref={drawerRef} style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'var(--bg2)', borderTop: '1px solid var(--border2)',
        borderRadius: '16px 16px 0 0',
        padding: '0 20px 32px', zIndex: 100,
        maxWidth: 640, margin: '0 auto',
        animation: 'slideUp 0.25s ease',
      }}>
        {/* Handle */}
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
    </>
  )
}

/* ─── Active filter pill ────────────────────────────────────────────────── */
function Pill({ label, color, onRemove }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 8px', borderRadius: 20,
      background: color + '22', border: `1px solid ${color}55`,
      fontFamily: 'var(--font-mono)', fontSize: 10, color: color,
    }}>
      {label.toUpperCase()}
      <button onClick={onRemove} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: color, fontSize: 12, lineHeight: 1, padding: 0,
      }}>✕</button>
    </div>
  )
}

/* ─── Exercise Card ──────────────────────────────────────────────────────── */
function ExerciseCard({ ex, accent }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`ex-card ${open ? 'open' : ''}`} style={{ '--accent': accent }}>
      <div className="ex-head" onClick={() => setOpen(o => !o)}>
        <div style={{ flex: 1 }}>
          <div className="ex-badges" style={{ marginBottom: 5 }}>
            <span className="badge" style={{ background: TYPE_DIM[ex.type] || 'var(--bg3)', color: TYPE_COLOR[ex.type], border: `1px solid ${TYPE_COLOR[ex.type]}` , borderWidth: 0, outlineOffset: 0 }}>
              {ex.type?.toUpperCase()}
            </span>
            {ex.emgNote && (
              <span className="badge" style={{ background: EMG_DIM[ex.emgNote] || 'var(--bg3)', color: EMG_COLOR[ex.emgNote] || 'var(--text3)', border: 'none' }}>
                {ex.emgNote}
              </span>
            )}
          </div>
          <div className="ex-name">{ex.name}</div>
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
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: accent }}>{ex.repRange}</div>
            </div>
            <div style={{ padding: '8px 12px', background: 'var(--bg)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text5)', letterSpacing: '0.1em', marginBottom: 4 }}>REST</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: accent }}>{ex.restRange || '60–90s'}</div>
            </div>
          </div>
          <div className="sci-box" style={{ borderLeftColor: accent }}>
            <div className="sci-label" style={{ color: accent }}>⚗ SCIENCE</div>
            <p>{ex.sciNote}</p>
          </div>
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
        </div>
      )}
    </div>
  )
}

/* ─── Main Page ─────────────────────────────────────────────────────────── */
export default function ExerciseList() {
  const [search, setSearch] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [activeMuscles, setActiveMuscles] = useState([])
  const [activeTypes, setActiveTypes] = useState([])
  const [activeEmgs, setActiveEmgs] = useState([])

  const totalActive = activeMuscles.length + activeTypes.length + activeEmgs.length

  const filtered = useMemo(() => {
    return EXERCISES.filter(ex => {
      const matchMuscle = activeMuscles.length === 0 || activeMuscles.includes(ex.muscleGroup)
      const matchType = activeTypes.length === 0 || activeTypes.includes(ex.type)
      const matchEmg = activeEmgs.length === 0 || activeEmgs.includes(ex.emgNote)
      const matchSearch = !search ||
        ex.name.toLowerCase().includes(search.toLowerCase()) ||
        ex.targets.toLowerCase().includes(search.toLowerCase())
      return matchMuscle && matchType && matchEmg && matchSearch
    })
  }, [activeMuscles, activeTypes, activeEmgs, search])

  // Group by muscle when no muscle filter active
  const grouped = useMemo(() => {
    if (activeMuscles.length === 1) return { [activeMuscles[0]]: filtered }
    return filtered.reduce((acc, ex) => {
      if (!acc[ex.muscleGroup]) acc[ex.muscleGroup] = []
      acc[ex.muscleGroup].push(ex)
      return acc
    }, {})
  }, [activeMuscles, filtered])

  // Active pills data
  const pills = [
    ...activeMuscles.map(v => ({ label: v, color: MUSCLE_ACCENTS[v] || 'var(--gold)', removeFrom: setActiveMuscles })),
    ...activeTypes.map(v => ({ label: v, color: TYPE_COLOR[v], removeFrom: setActiveTypes })),
    ...activeEmgs.map(v => ({ label: v, color: EMG_COLOR[v], removeFrom: setActiveEmgs })),
  ]

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div className="page-title" style={{ color: 'var(--blue)' }}>EXERCISE LIBRARY</div>
        <div className="page-subtitle">
          {EXERCISES.length} exercises · EMG classification · stretch-loading science
        </div>
      </div>

      {/* Search + Filter row */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
        <input
          className="search-bar"
          style={{ flex: 1, marginBottom: 0 }}
          placeholder="Search exercises…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button
          onClick={() => setDrawerOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '0 14px', height: 42, borderRadius: 'var(--radius-sm)',
            background: totalActive > 0 ? 'var(--gold)' : 'var(--bg2)',
            border: `1px solid ${totalActive > 0 ? 'var(--gold)' : 'var(--border)'}`,
            color: totalActive > 0 ? '#000' : 'var(--text3)',
            cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s',
            fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: totalActive > 0 ? 700 : 400,
          }}
        >
          <FilterIcon size={15} color={totalActive > 0 ? '#000' : 'var(--text3)'} />
          Filter
          {totalActive > 0 && (
            <span style={{
              minWidth: 18, height: 18, borderRadius: 9,
              background: '#000', color: 'var(--gold)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 800, marginLeft: 2,
            }}>{totalActive}</span>
          )}
        </button>
      </div>

      {/* Active filter pills */}
      {pills.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
          {pills.map((p, i) => (
            <Pill key={i} label={p.label} color={p.color}
              onRemove={() => p.removeFrom(prev => prev.filter(v => v !== p.label))} />
          ))}
          {totalActive > 1 && (
            <button onClick={() => { setActiveMuscles([]); setActiveTypes([]); setActiveEmgs([]) }}
              style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text5)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: '0 4px' }}>
              clear all
            </button>
          )}
        </div>
      )}

      {/* Results count */}
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text5)', letterSpacing: '0.08em', marginBottom: 14 }}>
        {filtered.length} of {EXERCISES.length} exercises
      </div>

      {/* Exercise list */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <div className="empty-title">No exercises found</div>
          <div className="empty-sub">Try adjusting your filters or search.</div>
          <button className="btn btn-outline" onClick={() => { setActiveMuscles([]); setActiveTypes([]); setActiveEmgs([]); setSearch('') }}>
            Reset all
          </button>
        </div>
      ) : (
        Object.entries(grouped).map(([group, exercises]) => (
          <div key={group} style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ fontFamily: 'var(--font-head)', fontSize: 20, fontWeight: 900, color: MUSCLE_ACCENTS[group] || 'var(--gold)', letterSpacing: 0.5 }}>
                {group.toUpperCase()}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text5)', letterSpacing: '0.08em' }}>
                {exercises.length}
              </div>
            </div>
            <div className="ex-list">
              {exercises.map(ex => (
                <ExerciseCard key={ex.id} ex={ex} accent={MUSCLE_ACCENTS[ex.muscleGroup] || 'var(--blue)'} />
              ))}
            </div>
          </div>
        ))
      )}

      {/* Filter drawer */}
      {drawerOpen && (
        <FilterDrawer
          muscles={activeMuscles} types={activeTypes} emgs={activeEmgs}
          setMuscles={setActiveMuscles} setTypes={setActiveTypes} setEmgs={setActiveEmgs}
          onClose={() => setDrawerOpen(false)}
        />
      )}

      {/* Legend */}
      <div style={{ marginTop: 32, padding: '14px 16px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text5)', letterSpacing: '0.1em', marginBottom: 10 }}>LEGEND</div>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 6 }}>
          {Object.entries(EMG_COLOR).map(([k, c]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text4)' }}>{k}</span>
            </div>
          ))}
          {Object.entries(TYPE_COLOR).map(([k, c]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: c }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text4)' }}>{k.toUpperCase()}</span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text5)', lineHeight: 1.6 }}>
          STRETCH-LOADED = ~2× hypertrophy at lengthened positions (Maeo et al. 2021). CONSTANT TENSION = cable maintains load through full ROM (Calatayud et al. 2015).
        </div>
      </div>
    </div>
  )
}

