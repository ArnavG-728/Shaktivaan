'use client'
import { useState, useMemo, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { EXERCISES, MUSCLE_GROUPS, MUSCLE_ACCENTS } from '../data/exercises'

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
const TYPE_COLOR = { compound: 'var(--orange)', isolation: 'var(--purple)', CUSTOM: 'var(--green)' }

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

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, backdropFilter: 'blur(2px)' }} />
      <div ref={drawerRef} style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'var(--bg2)', borderTop: '1px solid var(--border2)',
        borderRadius: '16px 16px 0 0', padding: '0 20px 32px', zIndex: 1001,
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
          APPLY FILTERS
        </button>
      </div>
      <style>{`@keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }`}</style>
    </>
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

export default function ExerciseSelectorModal({ allExercises = EXERCISES, onSelect, onClose }) {
  const [mounted, setMounted] = useState(false)
  const [search, setSearch] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedExs, setSelectedExs] = useState([])
  
  const [activeMuscles, setActiveMuscles] = useState([])
  const [activeTypes, setActiveTypes] = useState([])
  const [activeEmgs, setActiveEmgs] = useState([])

  useEffect(() => setMounted(true), [])

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

  if (!mounted) return null

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', flexDirection: 'column', background: 'var(--bg)', animation: 'slideUp 0.15s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg2)' }}>
        <div style={{ fontFamily: 'var(--font-head)', fontSize: 18, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 24, lineHeight: 1, padding: 0, color: 'var(--text3)', cursor: 'pointer', marginTop: -4 }}>×</button>
          ADD EXERCISE
        </div>
      </div>
      
      <div style={{ padding: '16px 20px', flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
          <input className="search-bar" style={{ flex: 1, marginBottom: 0 }} placeholder="Search exercises..." value={search} onChange={e => setSearch(e.target.value)} autoFocus />
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

        <div className="ex-list" style={{ paddingBottom: 80 }}>
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
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {grouped[group].map((ex, i) => {
                    const color = MUSCLE_ACCENTS[ex.muscleGroup] || 'var(--gold)'
                    const isSelected = selectedExs.includes(ex.name)
                    return (
                      <div key={ex.id || i} onClick={() => setSelectedExs(prev => prev.includes(ex.name) ? prev.filter(n => n !== ex.name) : [...prev, ex.name])} style={{ background: isSelected ? 'var(--bg3)' : 'var(--bg2)', padding: '12px 16px', borderRadius: 'var(--radius)', borderLeft: `3px solid ${color}`, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ color: 'var(--text)', fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{ex.name}</div>
                          <div style={{ color: 'var(--text5)', fontSize: 12 }}>{ex.targets}</div>
                        </div>
                        <div style={{ width: 20, height: 20, borderRadius: '50%', border: `1px solid ${isSelected ? color : 'var(--text5)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isSelected ? color : 'transparent' }}>
                          {isSelected && <span style={{ color: '#000', fontSize: 12, fontWeight: 'bold' }}>✓</span>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px 20px', background: 'var(--bg2)', borderTop: '1px solid var(--border)', zIndex: 10 }}>
        <button onClick={() => selectedExs.length > 0 ? onSelect(selectedExs) : onClose()} style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius)', background: selectedExs.length > 0 ? 'var(--gold)' : 'var(--bg3)', color: selectedExs.length > 0 ? '#000' : 'var(--text4)', border: 'none', fontFamily: 'var(--font-head)', fontSize: 16, cursor: 'pointer', fontWeight: 800 }}>
          {selectedExs.length > 0 ? `ADD ${selectedExs.length} EXERCISE${selectedExs.length > 1 ? 'S' : ''}` : 'CANCEL'}
        </button>
      </div>
      
      {drawerOpen && <FilterDrawer muscles={activeMuscles} types={activeTypes} emgs={activeEmgs} setMuscles={setActiveMuscles} setTypes={setActiveTypes} setEmgs={setActiveEmgs} onClose={() => setDrawerOpen(false)} />}
    </div>,
    document.body
  )
}
