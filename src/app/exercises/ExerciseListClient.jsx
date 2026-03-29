'use client'
import { useState, useMemo } from 'react'
import { EXERCISES, MUSCLE_GROUPS, MUSCLE_ACCENTS } from '../../data/exercises'

const EMG_COLOR = {
  'HIGH EMG':        'var(--green)',
  'STRETCH-LOADED':  'var(--gold)',
  'CONSTANT TENSION':'var(--blue)',
}

const TYPE_COLOR = {
  compound:  'var(--orange)',
  isolation: 'var(--purple)',
}

function ExerciseCard({ ex, accent }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`ex-card ${open ? 'open' : ''}`} style={{ '--accent': accent }}>
      <div className="ex-head" onClick={() => setOpen(o => !o)}>
        <div style={{ flex: 1 }}>
          <div className="ex-badges" style={{ marginBottom: 5 }}>
            <span className="badge" style={{ background: 'rgba(0,0,0,0.4)', color: TYPE_COLOR[ex.type], border: `1px solid ${TYPE_COLOR[ex.type]}33` }}>
              {ex.type.toUpperCase()}
            </span>
            {ex.emgNote && (
              <span className="badge" style={{ background: 'rgba(0,0,0,0.4)', color: EMG_COLOR[ex.emgNote] || 'var(--text3)', border: `1px solid ${(EMG_COLOR[ex.emgNote] || 'var(--text3)')}33` }}>
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
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text5)', letterSpacing: '0.1em', marginBottom: 6 }}>
                TECHNIQUE CUES
              </div>
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

export default function ExerciseList() {
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')

  const accent = MUSCLE_ACCENTS[filter] || 'var(--blue)'

  const filtered = useMemo(() => {
    return EXERCISES.filter(ex => {
      const matchGroup = filter === 'All' || ex.muscleGroup === filter
      const matchSearch = !search || ex.name.toLowerCase().includes(search.toLowerCase()) ||
        ex.targets.toLowerCase().includes(search.toLowerCase())
      return matchGroup && matchSearch
    })
  }, [filter, search])

  // Group by muscle if showing 'All'
  const grouped = useMemo(() => {
    if (filter !== 'All') return { [filter]: filtered }
    return filtered.reduce((acc, ex) => {
      if (!acc[ex.muscleGroup]) acc[ex.muscleGroup] = []
      acc[ex.muscleGroup].push(ex)
      return acc
    }, {})
  }, [filter, filtered])

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div className="page-title" style={{ color: accent }}>EXERCISE LIBRARY</div>
        <div className="page-subtitle">
          {EXERCISES.length} exercises with EMG data, stretch-loading classification, and peer-reviewed science notes.
          Filter by muscle group or search by name.
        </div>
      </div>

      <input
        className="search-bar"
        placeholder="Search exercises (e.g. 'curl', 'squat', 'lateral')…"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <div className="filter-bar">
        {MUSCLE_GROUPS.map(g => (
          <button
            key={g}
            className={`filter-chip ${filter === g ? 'active' : ''}`}
            style={{ '--accent': MUSCLE_ACCENTS[g] || 'var(--gold)' }}
            onClick={() => setFilter(g)}
          >
            {g}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <div className="empty-title">No exercises found</div>
          <div className="empty-sub">Try a different search or filter.</div>
        </div>
      ) : (
        Object.entries(grouped).map(([group, exercises]) => (
          <div key={group} style={{ marginBottom: 24 }}>
            {filter === 'All' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{
                  fontFamily: 'var(--font-head)', fontSize: 20, fontWeight: 900,
                  color: MUSCLE_ACCENTS[group] || 'var(--gold)', letterSpacing: 0.5,
                }}>
                  {group.toUpperCase()}
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text5)',
                  letterSpacing: '0.08em',
                }}>
                  {exercises.length} exercises
                </div>
              </div>
            )}
            <div className="ex-list">
              {exercises.map(ex => (
                <ExerciseCard key={ex.id} ex={ex} accent={MUSCLE_ACCENTS[ex.muscleGroup] || 'var(--blue)'} />
              ))}
            </div>
          </div>
        ))
      )}

      {/* Science legend */}
      <div style={{ marginTop: 32, padding: '14px 16px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text5)', letterSpacing: '0.1em', marginBottom: 10 }}>
          EMG CLASSIFICATION LEGEND
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {Object.entries(EMG_COLOR).map(([k, color]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text4)' }}>{k}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text5)', lineHeight: 1.6 }}>
          Based on Maeo et al. (2021) — stretch-loaded exercises produce ~2× hypertrophy vs shortened-position training.
          Cable variants marked CONSTANT TENSION produce superior EMG throughout full ROM vs free weights.
        </div>
      </div>
    </div>
  )
}
