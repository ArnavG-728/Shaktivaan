// Default PPL×2 plan pre-loaded from ppl_refined.jsx
import { EXERCISES } from './exercises.js'

const findEx = (id) => EXERCISES.find(e => e.id === id)

export const DEFAULT_PPL_PLAN = {
  id: 'default-ppl',
  name: 'PPL × 2 REFINED',
  type: 'PPL',
  days: [
    {
      key: 'push1',
      label: 'Push 1',
      focus: 'STRENGTH',
      accent: '#e5534b',
      desc: 'Strength day. Heavy, neural, ascending pyramid. Bench is the weak point vs deadlift — fix it here every week.',
      tip: '<strong>Today\'s goal:</strong> Complete every set cleanly. If the last set feels like a 9/10 RPE — weight is right. If it\'s a 7 — go up 2.5kg next session.',
      vol: [{ k: 'CHEST', v: '8 sets' }, { k: 'DELTS', v: '5 sets' }, { k: 'TRICEPS', v: '6 sets' }],
      exercises: [
        {
          ...findEx('incline-db-press'),
          sets: [
            { n: 1, kg: 17.5, reps: 10, rest: '75s' },
            { n: 2, kg: 20,   reps: 8,  rest: '90s' },
            { n: 3, kg: 22.5, reps: 6,  rest: '90s' },
            { n: 4, kg: 22.5, reps: 6,  rest: '—' },
          ],
          prog: 'When you hit 8 reps on sets 3 & 4 twice in a row, move to 25 kg',
        },
        {
          ...findEx('flat-bb-bench'),
          sets: [
            { n: 1, kg: 50,   reps: 8,    rest: '90s' },
            { n: 2, kg: 57.5, reps: 6,    rest: '2 min' },
            { n: 3, kg: 62.5, reps: '4–5', rest: '2.5 min' },
          ],
          prog: 'Add 2.5 kg when you hit the top rep on all 3 sets',
        },
        {
          ...findEx('bb-ohp'),
          sets: [
            { n: 1, kg: 25,   reps: 8,    rest: '90s' },
            { n: 2, kg: 30,   reps: 6,    rest: '2 min' },
            { n: 3, kg: 32.5, reps: 5,    rest: '2 min' },
            { n: 4, kg: 35,   reps: '3–4', rest: '—' },
          ],
          prog: 'Add 2.5 kg when all 4 sets are clean',
        },
        {
          ...findEx('weighted-dips'),
          sets: [
            { n: 1, kg: 0,   reps: 12, rest: '75s', label: 'BW' },
            { n: 2, kg: 5,   reps: 10, rest: '90s', label: 'BW+5kg' },
            { n: 3, kg: 7.5, reps: 8,  rest: '—',   label: 'BW+7.5kg' },
          ],
          prog: 'Add 2.5 kg when you hit 10 reps on set 2 and 9 on set 3',
        },
        {
          ...findEx('cable-lateral-raise'),
          sets: [
            { n: 1, kg: 6,  reps: 20, rest: '30s' },
            { n: 2, kg: 8,  reps: 15, rest: '30s' },
            { n: 3, kg: 10, reps: 12, rest: '30s' },
            { n: 4, kg: 10, reps: 12, rest: '—' },
          ],
          prog: 'Add 1 kg when all 4 sets are clean with correct form',
        },
        {
          ...findEx('ez-skullcrusher'),
          sets: [
            { n: 1, kg: 15,   reps: 12, rest: '60s' },
            { n: 2, kg: 17.5, reps: 10, rest: '75s' },
            { n: 3, kg: 20,   reps: 8,  rest: '—' },
          ],
          prog: 'Add 2.5 kg when all 3 sets are clean',
        },
      ],
    },
    {
      key: 'pull1',
      label: 'Pull 1',
      focus: 'STRENGTH',
      accent: '#4e9eed',
      desc: 'Deadlift-led strength day. Every kg of back thickness built here transfers directly to aesthetics.',
      tip: '<strong>Deadlift warm-up protocol:</strong> 60 kg × 5 → 90 kg × 3 → 110 kg × 2 → then start working sets.',
      vol: [{ k: 'BACK', v: '12 sets' }, { k: 'BICEPS', v: '5 sets' }, { k: 'REAR DELT', v: '3 sets' }],
      exercises: [
        {
          ...findEx('conventional-deadlift'),
          sets: [
            { n: 1, kg: 100,   reps: 5, rest: '2 min' },
            { n: 2, kg: 117.5, reps: 3, rest: '2.5 min' },
            { n: 3, kg: 130,   reps: 2, rest: '3 min' },
            { n: 4, kg: 137.5, reps: 1, rest: '—' },
          ],
          prog: 'When you hit 140 kg × 1 clean for 2 sessions, attempt 145 kg',
        },
        {
          ...findEx('wide-pullups'),
          sets: [
            { n: 1, kg: 0,    reps: 10,    rest: '90s',   label: 'BW' },
            { n: 2, kg: 5,    reps: 8,     rest: '2 min', label: 'BW+5kg' },
            { n: 3, kg: 10,   reps: 6,     rest: '2 min', label: 'BW+10kg' },
            { n: 4, kg: 12.5, reps: '4–5', rest: '—',    label: 'BW+12.5kg' },
          ],
          prog: 'Add 2.5 kg when you hit all top reps cleanly',
        },
        {
          ...findEx('bb-row'),
          sets: [
            { n: 1, kg: 55, reps: 8, rest: '90s' },
            { n: 2, kg: 65, reps: 6, rest: '2 min' },
            { n: 3, kg: 70, reps: 5, rest: '2.5 min' },
            { n: 4, kg: 75, reps: 4, rest: '—' },
          ],
          prog: 'Add 2.5 kg when all 4 sets are clean',
        },
        {
          ...findEx('ez-curl'),
          sets: [
            { n: 1, kg: 22.5, reps: 10,    rest: '60s' },
            { n: 2, kg: 27.5, reps: 8,     rest: '75s' },
            { n: 3, kg: 30,   reps: 6,     rest: '90s' },
            { n: 4, kg: 32.5, reps: '4–5', rest: '—' },
          ],
          prog: 'Strict 3s eccentric on every rep — no swinging',
        },
        {
          ...findEx('face-pull'),
          sets: [
            { n: 1, kg: 10,   reps: 15, rest: '45s' },
            { n: 2, kg: 12.5, reps: 15, rest: '45s' },
            { n: 3, kg: 12.5, reps: 12, rest: '—' },
          ],
          prog: 'Focus on pulling APART at the end — external rotation is the key movement',
        },
      ],
    },
    {
      key: 'legs1',
      label: 'Legs 1',
      focus: 'STRENGTH',
      accent: '#3db88a',
      desc: 'Squat-led strength. Start conservative, build weekly. Calves and hamstrings attacked from lengthened position.',
      tip: '<strong>Squat depth rule:</strong> ATG or at minimum below parallel. VMO activation drops 25% at parallel vs full depth.',
      vol: [{ k: 'QUADS', v: '10 sets' }, { k: 'HAMSTRINGS', v: '7 sets' }, { k: 'CALVES', v: '4 sets' }],
      exercises: [
        {
          ...findEx('bb-squat'),
          sets: [
            { n: 1, kg: 70,   reps: 8, rest: '2 min' },
            { n: 2, kg: 80,   reps: 6, rest: '2.5 min' },
            { n: 3, kg: 90,   reps: 5, rest: '3 min' },
            { n: 4, kg: 97.5, reps: 3, rest: '—' },
          ],
          prog: 'Add 2.5 kg when all sets are clean. Build to 120+ kg over 8 weeks.',
        },
        {
          ...findEx('rdl'),
          sets: [
            { n: 1, kg: 60, reps: 10, rest: '90s' },
            { n: 2, kg: 70, reps: 8,  rest: '2 min' },
            { n: 3, kg: 80, reps: 6,  rest: '—' },
          ],
          prog: 'Feel the hamstring STRETCH, not the lower back',
        },
        {
          ...findEx('leg-press'),
          sets: [
            { n: 1, kg: 120, reps: 12, rest: '75s' },
            { n: 2, kg: 140, reps: 10, rest: '90s' },
            { n: 3, kg: 160, reps: 8,  rest: '—' },
          ],
          prog: 'Don\'t lock out at the top. Go deep — heels stay on platform.',
        },
        {
          ...findEx('lying-leg-curl'),
          sets: [
            { n: 1, kg: 30,   reps: 12, rest: '60s' },
            { n: 2, kg: 35,   reps: 10, rest: '75s' },
            { n: 3, kg: 37.5, reps: 8,  rest: '—' },
          ],
          prog: 'Slow 4s eccentric. Control the weight back down — don\'t let the stack drop.',
        },
        {
          ...findEx('standing-calf-raise'),
          sets: [
            { n: 1, kg: 40, reps: 15, rest: '60s', label: 'BW+40kg' },
            { n: 2, kg: 50, reps: 12, rest: '60s', label: 'BW+50kg' },
            { n: 3, kg: 60, reps: 10, rest: '60s', label: 'BW+60kg' },
            { n: 4, kg: 60, reps: 8,  rest: '—',   label: 'BW+60kg' },
          ],
          prog: 'Full stretch at bottom (dorsiflexion). Pause. Full extension at top.',
        },
      ],
    },
    {
      key: 'push2',
      label: 'Push 2',
      focus: 'HYPERTROPHY',
      accent: '#e5934b',
      desc: 'Isolation-first hypertrophy day. Less compound, more targeted burn. Triceps, side delts, front delts, upper chest.',
      tip: '<strong>Hypertrophy rules for today:</strong> 3s eccentrics on everything. Short rest (30–60s on isolation). Chase the BURN, not the weight.',
      vol: [{ k: 'CHEST', v: '8 sets' }, { k: 'DELTS', v: '12 sets' }, { k: 'TRICEPS', v: '7 sets' }],
      exercises: [
        {
          ...findEx('incline-machine-press'),
          sets: [
            { n: 1, kg: 35,   reps: 15, rest: '60s' },
            { n: 2, kg: 42.5, reps: 12, rest: '60s' },
            { n: 3, kg: 50,   reps: 10, rest: '75s' },
            { n: 4, kg: 50,   reps: 8,  rest: '—' },
          ],
          prog: 'Machine = safe to go near failure. Use the stretch at the bottom.',
        },
        {
          ...findEx('cable-chest-fly'),
          sets: [
            { n: 1, kg: 8,  reps: 15, rest: '45s' },
            { n: 2, kg: 10, reps: 12, rest: '45s' },
            { n: 3, kg: 12, reps: 12, rest: '45s' },
            { n: 4, kg: 12, reps: 10, rest: '—' },
          ],
          prog: 'SQUEEZE for 2 seconds at peak.',
        },
        {
          ...findEx('cable-lateral-raise'),
          sets: [
            { n: 1, kg: 6,  reps: 20, rest: '30s' },
            { n: 2, kg: 8,  reps: 15, rest: '30s' },
            { n: 3, kg: 10, reps: 12, rest: '30s' },
            { n: 4, kg: 10, reps: 12, rest: '30s' },
            { n: 5, kg: 6,  reps: 20, rest: '—', label: '6kg (drop)' },
          ],
          prog: '30s rest is INTENTIONAL. Short rest + high reps = massive pump.',
        },
        {
          ...findEx('cable-front-raise'),
          sets: [
            { n: 1, kg: 8,  reps: 12, rest: '45s' },
            { n: 2, kg: 10, reps: 10, rest: '45s' },
            { n: 3, kg: 12, reps: 10, rest: '—' },
          ],
          prog: 'Don\'t raise above shoulder height. Cable from behind = longest ROM.',
        },
        {
          ...findEx('machine-shoulder-press'),
          sets: [
            { n: 1, kg: 30,   reps: 15, rest: '60s' },
            { n: 2, kg: 40,   reps: 12, rest: '60s' },
            { n: 3, kg: 47.5, reps: 10, rest: '—' },
          ],
          prog: 'Pause at the bottom to feel the delt stretch on every rep.',
        },
        {
          ...findEx('overhead-tricep-ext'),
          sets: [
            { n: 1, kg: 15,   reps: 15, rest: '60s' },
            { n: 2, kg: 17.5, reps: 12, rest: '60s' },
            { n: 3, kg: 20,   reps: 10, rest: '75s' },
            { n: 4, kg: 20,   reps: 8,  rest: '—' },
          ],
          prog: 'Slow 3s eccentric. Feel the DEEP stretch at the bottom.',
        },
        {
          ...findEx('rope-pushdown'),
          sets: [
            { n: 1, kg: 12.5, reps: 15, rest: '45s' },
            { n: 2, kg: 15,   reps: 12, rest: '45s' },
            { n: 3, kg: 17.5, reps: 12, rest: '45s' },
            { n: 4, kg: 17.5, reps: 10, rest: '—' },
          ],
          prog: 'Flare the rope handles apart at the bottom.',
        },
      ],
    },
    {
      key: 'pull2',
      label: 'Pull 2',
      focus: 'HYPERTROPHY',
      accent: '#9b72cf',
      desc: 'Lat width, bicep PEAK, brachialis thickness, rear delts. Pure aesthetic architecture.',
      tip: '<strong>Bicep tip for today:</strong> Every single curl — supinate FULLY at the top. Half-supination = half the growth.',
      vol: [{ k: 'LATS', v: '8 sets' }, { k: 'BICEPS', v: '12 sets' }, { k: 'REAR DELT', v: '4 sets' }],
      exercises: [
        {
          ...findEx('lat-pulldown'),
          sets: [
            { n: 1, kg: 50,   reps: 12, rest: '75s' },
            { n: 2, kg: 57.5, reps: 10, rest: '75s' },
            { n: 3, kg: 62.5, reps: 8,  rest: '90s' },
            { n: 4, kg: 65,   reps: 8,  rest: '—' },
          ],
          prog: 'FULLY extend arms at the top — feel the lat stretch.',
        },
        {
          ...findEx('one-arm-row'),
          sets: [
            { n: 1, kg: 30,   reps: 12, rest: '60s' },
            { n: 2, kg: 35,   reps: 10, rest: '75s' },
            { n: 3, kg: 37.5, reps: 8,  rest: '75s' },
            { n: 4, kg: 40,   reps: 8,  rest: '—' },
          ],
          prog: 'Row to your HIP (not armpit). Allow full scapular protraction at the bottom.',
        },
        {
          ...findEx('cable-row'),
          sets: [
            { n: 1, kg: 47.5, reps: 12, rest: '60s' },
            { n: 2, kg: 55,   reps: 10, rest: '75s' },
            { n: 3, kg: 60,   reps: 8,  rest: '—' },
          ],
          prog: 'Hold 1 second at full contraction.',
        },
        {
          ...findEx('incline-db-curl'),
          sets: [
            { n: 1, kg: 10, reps: 12, rest: '60s' },
            { n: 2, kg: 12.5, reps: 10, rest: '75s' },
            { n: 3, kg: 14, reps: 8,   rest: '75s' },
            { n: 4, kg: 14, reps: 8,   rest: '—' },
          ],
          prog: 'Let the arm hang FULLY at the bottom before each rep.',
        },
        {
          ...findEx('hammer-curl'),
          sets: [
            { n: 1, kg: 12.5, reps: 12, rest: '45s' },
            { n: 2, kg: 15,   reps: 10, rest: '45s' },
            { n: 3, kg: 17.5, reps: 8,  rest: '—' },
          ],
          prog: 'Neutral grip throughout. No supination. Slow 3s eccentric.',
        },
        {
          ...findEx('cable-curl'),
          sets: [
            { n: 1, kg: 12.5, reps: 15, rest: '45s' },
            { n: 2, kg: 15,   reps: 12, rest: '45s' },
            { n: 3, kg: 15,   reps: 10, rest: '—' },
          ],
          prog: 'Supinate HARD at the top. Hold the peak. Feel the burn.',
        },
        {
          ...findEx('reverse-pec-deck'),
          sets: [
            { n: 1, kg: 15,   reps: 15, rest: '45s' },
            { n: 2, kg: 17.5, reps: 12, rest: '45s' },
            { n: 3, kg: 20,   reps: 12, rest: '45s' },
            { n: 4, kg: 20,   reps: 12, rest: '—' },
          ],
          prog: 'Full ROM — arms should go from directly in front to behind your shoulders.',
        },
      ],
    },
    {
      key: 'legs2',
      label: 'Legs 2',
      focus: 'HYPERTROPHY',
      accent: '#3dbdb8',
      desc: 'Quad isolation, hamstring lengthening, glute peak contraction, and full AB protocol.',
      tip: '<strong>V-cut reminder:</strong> Abs are muscles — they respond to progressive overload. Add weight to cable crunches every 2–3 weeks.',
      vol: [{ k: 'QUADS', v: '11 sets' }, { k: 'HAMSTRINGS', v: '8 sets' }, { k: 'ABS', v: '11 sets' }],
      exercises: [
        {
          ...findEx('leg-extension'),
          sets: [
            { n: 1, kg: 30,   reps: 15, rest: '60s' },
            { n: 2, kg: 37.5, reps: 12, rest: '60s' },
            { n: 3, kg: 45,   reps: 10, rest: '75s' },
            { n: 4, kg: 47.5, reps: 10, rest: '—' },
          ],
          prog: 'SQUEEZE at lockout for 2 seconds. Slow 3s eccentric.',
        },
        {
          ...findEx('bulgarian-split-squat'),
          sets: [
            { n: 1, kg: 10, reps: 12, rest: '75s', label: '10kg/hand' },
            { n: 2, kg: 12.5, reps: 10, rest: '90s', label: '12.5kg/hand' },
            { n: 3, kg: 15, reps: 8, rest: '—', label: '15kg/hand' },
          ],
          prog: 'Rear foot elevated on bench. Front foot far enough that knee doesn\'t pass toes excessively.',
        },
        {
          ...findEx('seated-leg-curl'),
          sets: [
            { n: 1, kg: 30, reps: 12, rest: '60s' },
            { n: 2, kg: 35, reps: 10, rest: '75s' },
            { n: 3, kg: 37.5, reps: 8, rest: '90s' },
            { n: 4, kg: 40, reps: 8, rest: '—' },
          ],
          prog: 'Control the eccentric. Don\'t bounce at the top.',
        },
        {
          ...findEx('hip-thrust'),
          sets: [
            { n: 1, kg: 60,  reps: 15, rest: '75s' },
            { n: 2, kg: 80,  reps: 12, rest: '90s' },
            { n: 3, kg: 100, reps: 10, rest: '—' },
          ],
          prog: 'Posterior pelvic tilt at the TOP = full glute squeeze.',
        },
        {
          ...findEx('seated-calf-raise'),
          sets: [
            { n: 1, kg: 20,   reps: 15, rest: '45s' },
            { n: 2, kg: 25,   reps: 12, rest: '45s' },
            { n: 3, kg: 30,   reps: 12, rest: '45s' },
            { n: 4, kg: 32.5, reps: 10, rest: '—' },
          ],
          prog: 'Bent knee = gastroc slack = pure soleus. Full stretch at bottom. Pause.',
        },
        {
          ...findEx('cable-crunch'),
          sets: [
            { n: 1, kg: 20,   reps: 20, rest: '45s' },
            { n: 2, kg: 22.5, reps: 15, rest: '45s' },
            { n: 3, kg: 25,   reps: 12, rest: '45s' },
            { n: 4, kg: 27.5, reps: 12, rest: '—' },
          ],
          prog: 'Crunch THORAX toward PELVIS — don\'t just pull from the hips.',
        },
        {
          ...findEx('hanging-leg-raise'),
          sets: [
            { n: 1, kg: 0, reps: 15, rest: '45s', label: 'BW' },
            { n: 2, kg: 0, reps: 12, rest: '45s', label: 'BW' },
            { n: 3, kg: 0, reps: 12, rest: '45s', label: 'BW' },
            { n: 4, kg: 0, reps: '10–12', rest: '—', label: 'BW' },
          ],
          prog: 'Posterior pelvic tilt at TOP = lower ab contraction. No swing.',
        },
        {
          ...findEx('ab-wheel'),
          sets: [
            { n: 1, kg: 0, reps: 10, rest: '60s', label: 'BW' },
            { n: 2, kg: 0, reps: 10, rest: '60s', label: 'BW' },
            { n: 3, kg: 0, reps: '8–10', rest: '—', label: 'BW' },
          ],
          prog: 'Brace your core BEFORE you extend. Don\'t let lower back cave.',
        },
      ],
    },
    { key: 'rest1', label: 'Rest', focus: 'RECOVERY', accent: '#333', exercises: [], rest: true },
  ],
}
