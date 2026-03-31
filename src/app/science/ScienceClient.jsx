'use client'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

const CONCEPTS = [
  {
    id: 'strength-vs-hypertrophy',
    title: 'STRENGTH vs HYPERTROPHY',
    accent: 'var(--gold)',
    icon: '⚡',
    summary: 'Two different adaptations — both require progressive overload, but via different mechanisms.',
    sections: [
      {
        label: 'Strength Training',
        color: 'var(--gold)',
        body: `Strength is primarily a **neural adaptation**. The motor cortex learns to recruit more motor units simultaneously and synchronise their firing. This is why beginners gain strength rapidly without gaining much muscle — their nervous system is optimising first.

**Key parameters:**
- Rep range: 1–5
- Rest: 3–5 min (full nervous system recovery)
- Intensity: 85–100% of 1RM
- Mechanism: maximal motor unit recruitment, rate coding, inter-muscular coordination

**Research:** [Schoenfeld et al. (2017)](https://pubmed.ncbi.nlm.nih.gov/27433992/) showed strength programmes (≤6 reps) and hypertrophy programmes (6–12 reps) produce similar muscle size when volume is equalised — but only the low-rep programme significantly improves 1RM expression.`,
      },
      {
        label: 'Hypertrophy Training',
        color: 'var(--blue)',
        body: `Hypertrophy is **structural change** in the muscle fibre itself — primarily myofibrillar protein accretion (bigger contractile proteins) and sarcoplasmic expansion.

**Key parameters:**
- Rep range: 6–30 (with 8–20 being optimal for most)
- Rest: 60–120s (maintains metabolic stress)
- Intensity: 60–85% of 1RM
- Mechanisms: mechanical tension, metabolic stress, muscle damage (secondary)

**Research:** [Schoenfeld (2010)](https://pubmed.ncbi.nlm.nih.gov/20847704/) — the seminal hypertrophy mechanism paper. Mechanical tension is the primary driver. Exercises with lengthened-position loading ([Maeo et al. 2021](https://pubmed.ncbi.nlm.nih.gov/33009197/)) produce ~2× more hypertrophy than shortened-position training at matched load — this is why full ROM and stretch-loaded exercises dominate this app.`,
      },
    ],
  },
  {
    id: 'progressive-overload',
    title: 'PROGRESSIVE OVERLOAD',
    accent: 'var(--green)',
    icon: '📈',
    summary: 'The single most important principle in training. Without it, the body has no reason to adapt.',
    sections: [
      {
        label: 'What It Is',
        color: 'var(--green)',
        body: `Progressive overload means increasing the **training stimulus over time** so the body must continuously adapt. Without it, you plateau.

**Forms of overload (in order of priority):**
1. **Load** — add weight to the bar (2.5 kg when you hit the target rep range)
2. **Volume** — add a set at the same weight
3. **Reps** — hit the top of the rep range before adding weight
4. **ROM** — greater range of motion increases the stretch stimulus
5. **Technique** — cleaner form creates more tension on the target muscle

**Research:** [Ralston et al. (2017)](https://pubmed.ncbi.nlm.nih.gov/28755103/) meta-analysis confirmed that progressive increases in load are the strongest predictor of hypertrophy and strength gains when volume is controlled. The body specifically adapts to the demands placed upon it (SAID principle — Specific Adaptations to Imposed Demands).`,
      },
    ],
  },
  {
    id: 'volume',
    title: 'VOLUME — MEV, MAV, MRV',
    accent: 'var(--blue)',
    icon: '📊',
    summary: 'How many sets per muscle per week — and the dose-response curve that governs growth.',
    sections: [
      {
        label: 'MEV — Minimum Effective Volume',
        color: 'var(--text3)',
        body: `MEV is the **lowest weekly set count** that produces measurable hypertrophy. Below MEV = maintenance only (or detraining).

**Approximate MEV by muscle (Israetel et al. / Renaissance Periodization):**
- Chest: ~10 sets/week
- Back: ~10 sets/week  
- Shoulders: ~10 sets/week
- Biceps / Triceps: ~8 sets/week
- Quads / Hamstrings: ~10 sets/week

These are the minimum thresholds. Most intermediate-advanced lifters should train above MEV.`,
      },
      {
        label: 'MAV — Maximum Adaptive Volume',
        color: 'var(--blue)',
        body: `MAV is the **sweet spot** — the range above MEV where more volume produces more growth. This ranges from ~10–20+ sets/week per muscle depending on training status.

**Research:** [Schoenfeld et al. (2017)](https://pubmed.ncbi.nlm.nih.gov/27433992/) meta-analysis: a dose-response relationship exists between weekly sets and hypertrophy up to approximately 20+ sets/muscle/week for advanced trainees.

The Track Progress page charts your sets against MEV (10) and MAV (20) lines using this research.`,
      },
      {
        label: 'MRV — Maximum Recoverable Volume',
        color: 'var(--red)',
        body: `MRV is the **upper limit** — volume above which you accumulate more fatigue than you can recover from. Exceeding MRV causes performance regression, injury risk, and overtraining symptoms.

**Signs you're over MRV:**
- Performance declining session-to-session
- Persistent joint soreness (not DOMS)
- Sleep quality deteriorating
- Loss of motivation to train

**Application:** MRV varies by muscle, individual, and training phase. Deloads (every 4–8 weeks) reset accumulated fatigue and allow MRV to creep upward over training blocks.`,
      },
    ],
  },
  {
    id: 'emg',
    title: 'EMG — ELECTROMYOGRAPHY',
    accent: 'var(--green)',
    icon: '⚗',
    summary: 'The scientific tool used to measure which muscles are actually working during an exercise.',
    sections: [
      {
        label: 'What EMG Measures',
        color: 'var(--green)',
        body: `**Electromyography (EMG)** measures the **electrical signal** produced by motor units when they fire. Higher EMG amplitude = more muscle fibres recruited = more stimulus for growth.

This is how researchers determine which exercises most efficiently target a specific muscle. An electrode (surface or fine-wire) is placed on the muscle belly. The participant performs the exercise. EMG amplitude is expressed as a percentage of **MVC (Maximum Voluntary Contraction)** — the EMG recorded during an all-out isometric contraction.

An exercise producing 80% MVC means 80% of the muscle's maximum recruitment capacity is being used.`,
      },
      {
        label: 'EMG Classifications in This App',
        color: 'var(--text3)',
        body: `The three EMG tags in the exercise library:

**HIGH EMG** — exercises that produce peak muscle activation (>70% MVC in research). Examples: deadlifts, pull-ups, curl variations. These recruit the most fibres per rep.

**STRETCH-LOADED** — exercises where muscle activation is HIGH specifically in the **lengthened/stretched position**. This is critical because [Maeo et al. (2021)](https://pubmed.ncbi.nlm.nih.gov/33009197/) demonstrated that exercises trained in the lengthened position produce ~2× the hypertrophy of exercises trained in the shortened position. Examples: incline DB curl (long head stretch), RDL (hamstring stretch).

**CONSTANT TENSION** — cable exercises that maintain resistance through the full ROM. Free weights lose tension at the top (where gravity's moment arm is shortest). Cables eliminate this. Examples: cable lateral raise, cable flyes, cable curls.`,
      },
    ],
  },
  {
    id: 'rm-1rm',
    title: '1RM — ONE REP MAX',
    accent: 'var(--gold)',
    icon: '🏆',
    summary: 'The maximum weight you can lift for exactly one rep. The foundation of strength programming.',
    sections: [
      {
        label: 'Epley Formula (used in this app)',
        color: 'var(--gold)',
        body: `The **estimated 1RM** is calculated using the Epley formula (1985):

> **1RM = Weight × (1 + Reps / 30)**

This allows estimation of your max strength from any working set. For example: 80 kg × 8 reps → 1RM = 80 × (1 + 8/30) = 80 × 1.27 = **101.3 kg**

**Accuracy:** Epley's formula is most accurate for sets of 2–12 reps. At higher reps (15+) it overestimates. At true 1RM it equals the actual weight.

The Track Progress page uses this formula to plot your strength trend over time without requiring you to attempt dangerous max singles.`,
      },
      {
        label: 'Using %1RM for Programming',
        color: 'var(--text3)',
        body: `Once you know your estimated 1RM, you can set training intensities:

| %1RM | Approx Reps | Goal |
|------|-------------|------|
| 95–100% | 1–2 | True strength/max testing |
| 85–95% | 2–5 | Strength (neural adaptation) |
| 70–85% | 6–12 | Hypertrophy (sweet spot) |
| 60–70% | 12–20 | Metabolic/pump work |
| <60% | 20+ | Endurance / warm-up |

**Research:** The Training Zone concept is validated by Schoenfeld et al. (2017) — all rep ranges produce hypertrophy when taken close to failure, but heavy loading (≥85% 1RM) specifically develops the nervous system's ability to express strength.`,
      },
    ],
  },
  {
    id: 'rpe-rir',
    title: 'RPE & RIR',
    accent: 'var(--red)',
    icon: '🌡',
    summary: 'How hard are you actually working? Subjective effort measures that correlate directly with muscle stimulus.',
    sections: [
      {
        label: 'RPE — Rate of Perceived Exertion',
        color: 'var(--red)',
        body: `**RPE** is a 1–10 scale (modified Borg scale) measuring how hard a set feels:

| RPE | Meaning |
|-----|---------|
| 6 | Very easy — could do 4+ more reps |
| 7 | Easy — 3 more reps |
| 7.5 | Moderate — 2–3 more reps |
| 8 | Hard — 2 more reps |
| 8.5 | Very hard — 1–2 more reps |
| 9 | Near limit — 1 more rep |
| 10 | Maximum — could not do another rep |

**Research:** [Zourdos et al. (2016)](https://pubmed.ncbi.nlm.nih.gov/26040702/) validated RPE-based training in powerlifters — RPE 8–9 sets produce optimal strength development. For hypertrophy, most sets should be RPE 7.5–9 (2–3 RIR).

The Log Session page captures your RPE for every set.`,
      },
      {
        label: 'RIR — Reps In Reserve',
        color: 'var(--orange)',
        body: `**RIR** is the inverse of RPE — how many more reps you COULD have done before true failure.

- RPE 8 = 2 RIR (could do 2 more reps)
- RPE 9 = 1 RIR
- RPE 10 = 0 RIR (technical failure)

**Proximity to failure is the key driver of hypertrophy** ([Schoenfeld & Grgic, 2019](https://scholar.google.com/scholar?q=Does+Training+to+Failure+Maximize+Muscle+Hypertrophy)). Research confirms that sets ending 0–3 RIR from failure produce equivalent hypertrophy, while sets with >5 RIR significantly underperform.

For strength: train 1–3 RIR on working sets to preserve technique and CNS reserves.
For hypertrophy: drive sets to 0–2 RIR on isolation exercises; 1–3 RIR on big compounds.`,
      },
    ],
  },
  {
    id: 'rom',
    title: 'ROM — RANGE OF MOTION',
    accent: 'var(--blue)',
    icon: '📐',
    summary: 'Full ROM isn\'t just for technique — it directly determines how much muscle you build.',
    sections: [
      {
        label: 'Why ROM Matters for Hypertrophy',
        color: 'var(--blue)',
        body: `**Range of motion** is not just a safety consideration — it is a primary determinant of hypertrophic stimulus.

**[Maeo et al. (2021)](https://pubmed.ncbi.nlm.nih.gov/33009197/):** Full ROM produces significantly greater muscle hypertrophy than partial ROM at matched load. The stretch position (muscle elongated) is where the greatest mechanical tension per fibre is created.

**Practical implications:**
- Incline DB curl → arm hanging fully extended at bottom (long head stretch) → significantly more bicep peak growth
- Leg extension from fully bent knee → full RF stretch → more VMO growth
- RDL to full hip flexion → full hamstring stretch → more growth than half-ROM versions

**Abbreviated ROM (quarter squats, partial curls) wastes the bottom portion** — exactly where stretch-mediated hypertrophy occurs.`,
      },
      {
        label: 'Stretch-Mediated Hypertrophy',
        color: 'var(--gold)',
        body: `The most important finding in modern exercise science: **muscles trained in the lengthened (stretched) position grow approximately twice as much as muscles trained in the shortened position** ([Maeo et al., 2021 — Frontiers in Physiology](https://pubmed.ncbi.nlm.nih.gov/33009197/)).

The mechanism: at the elongated position, each sarcomere is at greater length, producing more titin-derived passive force in addition to the active myosin-actin crossbridge force. This combined mechanical signalling through both active and passive pathways leads to superior muscle protein synthesis.

**Exercises in this library tagged STRETCH-LOADED** specifically exploit this effect: incline DB curl, RDL, lying leg curl, skullcrusher, overhead tricep extension, RDL, ab wheel rollout.`,
      },
    ],
  },
  {
    id: 'rest-recovery',
    title: 'REST & RECOVERY',
    accent: 'var(--purple)',
    icon: '😴',
    summary: 'Rest periods between sets and recovery between sessions — both directly affect your results.',
    sections: [
      {
        label: 'Inter-Set Rest',
        color: 'var(--purple)',
        body: `**Rest between sets** determines the quality of subsequent sets and the metabolic stimulus.

| Rest | Use Case | Why |
|------|----------|-----|
| 30–60s | Isolation, high-rep pump work | Metabolic stress, incomplete recovery = burn |
| 60–90s | Hypertrophy compounds | Partial recovery = more total volume possible |
| 90–120s | Heavy compounds | Near-full recovery for quality reps |
| 2–4min | Max strength (1–5 RM) | Full ATP-PCr system recovery |

**[Schoenfeld et al. (2016)](https://pubmed.ncbi.nlm.nih.gov/26605807/):** Longer rest (3 min vs 1 min) between sets produced significantly greater hypertrophy and strength gains, because it allowed more total quality volume per session. Short rest should be strategic (intentional pump sets) not habitual.`,
      },
      {
        label: 'Inter-Session Recovery',
        color: 'var(--text3)',
        body: `Muscle protein synthesis (MPS) peaks 24–48 hours post-training and returns to baseline by 72 hours. Training the same muscle again before MPS returns to baseline means you are building on an elevated base.

**Practical frequency recommendations:**
- Beginners: Full body 3×/week (each muscle 3× = faster skill acquisition)
- Intermediate: Upper/Lower or PPL × 2 (each muscle 2×/week)
- Advanced: 2× per muscle minimum; some muscles may benefit from direct 3× frequency

**Sleep:** [Dattilo et al. (2011)](https://pubmed.ncbi.nlm.nih.gov/21550729/) — sleep restriction below 6 hours reduces testosterone by ~10–15% and increases cortisol, directly impairing muscle protein synthesis. 7–9 hours is the dose required for full recovery.

**Nutrition:** 1.6–2.2g protein/kg bodyweight/day is the evidence-based range for maximising hypertrophy ([Morton et al. 2018](https://pubmed.ncbi.nlm.nih.gov/28698222/) meta-analysis).`,
      },
    ],
  },
]

function ConceptModal({ concept, onClose }) {
  const [activeSection, setActiveSection] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  return createPortal(
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 740, '--accent': concept.accent }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 36, lineHeight: 1 }}>{concept.icon}</span>
            <div>
              <div className="modal-title" style={{ color: concept.accent, margin: 0, fontSize: 22 }}>
                {concept.title}
              </div>
              <div style={{ color: 'var(--text3)', fontSize: 14, marginTop: 4, lineHeight: 1.4 }}>
                {concept.summary}
              </div>
            </div>
          </div>
          <button className="btn btn-ghost" onClick={onClose} style={{ fontSize: 24, padding: '4px 8px', marginTop: -4 }}>✕</button>
        </div>

        {concept.sections.length > 1 && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
            {concept.sections.map((s, i) => (
              <button key={i}
                className={`filter-chip ${activeSection === i ? 'active' : ''}`}
                style={{ '--accent': s.color, fontSize: 11, padding: '8px 14px' }}
                onClick={() => setActiveSection(i)}>
                {s.label}
              </button>
            ))}
          </div>
        )}

        <div className="sci-box" style={{ borderLeftColor: concept.sections[activeSection]?.color || concept.accent, background: 'var(--bg2)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
          <div className="sci-label" style={{ color: concept.sections[activeSection]?.color || concept.accent, fontSize: 13, marginBottom: 12 }}>
            {concept.sections[activeSection]?.label.toUpperCase()}
          </div>
          <div style={{ fontSize: 14, color: 'var(--text3)', lineHeight: 1.75 }}>
            {concept.sections[activeSection]?.body.split('\n\n').map((para, pi) => {
              if (para.startsWith('|')) {
                const rows = para.trim().split('\n').filter(r => !r.match(/^[\|:-]+$/))
                return (
                  <table key={pi} className="sets-table" style={{ marginBottom: 16, width: '100%', background: 'var(--bg)' }}>
                    <thead>
                      <tr>{rows[0].split('|').filter(Boolean).map((cell, ci) => (
                        <th key={ci}>{cell.trim()}</th>
                      ))}</tr>
                    </thead>
                    <tbody>
                      {rows.slice(1).map((row, ri) => (
                        <tr key={ri}>{row.split('|').filter(Boolean).map((cell, ci) => (
                          <td key={ci}>{cell.trim()}</td>
                        ))}</tr>
                      ))}
                    </tbody>
                  </table>
                )
              }
              if (para.startsWith('>')) {
                return (
                  <div key={pi} style={{ padding: '12px 16px', borderLeft: `3px solid ${concept.accent}`, background: 'var(--bg)', marginBottom: 16, fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text)' }}>
                    {para.replace(/^>\s*/, '')}
                  </div>
                )
              }
              const parts = para.split(/(\*\*.*?\*\*|\[.*?\]\(.*?\))/g)
              return (
                <p key={pi} style={{ marginBottom: 14 }}>
                  {parts.map((part, pi2) => {
                    if (!part) return null
                    if (part.startsWith('**')) return <strong key={pi2} style={{ color: 'var(--text)' }}>{part.slice(2, -2)}</strong>
                    if (part.startsWith('[')) {
                      const textMatch = part.match(/\[(.*?)\]/)
                      const urlMatch = part.match(/\((.*?)\)/)
                      if (textMatch && urlMatch) {
                        return <a key={pi2} href={urlMatch[1]} target="_blank" rel="noreferrer" style={{ color: concept.accent, textDecoration: 'underline' }}>{textMatch[1]}</a>
                      }
                    }
                    return part
                  })}
                </p>
              )
            })}
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default function ScienceClient() {
  const [activeConcept, setActiveConcept] = useState(null)

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <div className="page-title" style={{ color: 'var(--purple)' }}>SCIENCE HUB</div>
        <div className="page-subtitle">
          Evidence-based explanations of the principles that underpin every exercise and programme in this app. Click any concept to dive deep into the research.
        </div>
      </div>

      <style>{`
        .science-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 32px;
        }
        @media (max-width: 768px) {
          .science-grid {
            grid-template-columns: repeat(auto-fill, minmax(135px, 1fr));
          }
        }
      `}</style>

      <div className="science-grid">
        {CONCEPTS.map(c => (
          <div key={c.id}
            onClick={() => setActiveConcept(c)}
            style={{
              padding: '24px 16px',
              background: 'var(--bg2)',
              border: `1px solid ${c.accent}33`,
              borderRadius: 'var(--radius)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = c.accent; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = `${c.accent}33`; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <div style={{ fontSize: 36, lineHeight: 1, marginBottom: 16 }}>{c.icon}</div>
            <div style={{
              fontFamily: 'var(--font-head)',
              fontSize: 15,
              fontWeight: 800,
              color: c.accent,
              lineHeight: 1.2,
              textAlign: 'center',
              letterSpacing: '0.02em',
              marginBottom: 8
            }}>{c.title.split(' — ')[0]}</div>
            <div style={{
              fontSize: 12,
              color: 'var(--text5)',
              textAlign: 'center',
              lineHeight: 1.4,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {c.summary}
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: '16px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
        <div style={{ fontFamily: 'var(--font-head)', fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>KEY REFERENCES</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 12 }}>
          {[
            'Maeo et al. (2021) — Hypertrophy in lengthened vs shortened positions. Frontiers in Physiology.',
            'Schoenfeld et al. (2017) — Dose-response relationship between weekly sets and hypertrophy. JSCR.',
            'Schoenfeld (2010) — The mechanisms of muscle hypertrophy. JSCR.',
            'Barnett et al. (1995) — Muscle use in various chest exercises. JSCR.',
            'Lehman et al. (2004) — Effect of grip width and hand orientation in various pulling movements. JSCR.',
            'Bourne et al. (2017) — Impact of the Nordic hamstring exercise on fascicle length. BJSM.',
            'Contreras et al. (2015) — A comparison of gluteus maximus, biceps femoris, and vastus lateralis EMG. JSCR.',
            'McGill et al. (2010) — Exercises for the torso. CHEK Institute.',
            'Gullett et al. (2009) — Biomechanical comparison of back and front squats. JSCR.',
            'Zourdos et al. (2016) — Novel Resistance Training-Specific Rating of Perceived Exertion Scale.'
          ].map((ref, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--text5)', fontSize: 11, marginTop: 2 }}>{i + 1}.</span>
              <span style={{ fontSize: 12, color: 'var(--text4)', lineHeight: 1.5 }}>{ref}</span>
            </div>
          ))}
        </div>
      </div>

      {activeConcept && <ConceptModal concept={activeConcept} onClose={() => setActiveConcept(null)} />}
    </div>
  )
}
