import { findEx, genSets } from './utils.js';

export const PPL_1 = {
  id: 'ppl-1',
  name: 'PPL 1: Strength & Hypertrophy',
  type: 'PPL',
  description: 'A 6-day split combining heavy neural adaptation (strength) days and pump-focused hypertrophy days. Based on the 2x frequency model to maximise muscle protein synthesis.',
  days: [
    {
      key: 'push1', label: 'Push 1 (Strength)', focus: 'STRENGTH', accent: '#e5534b',
      desc: 'Heavy, neural, ascending pyramid.',
      vol: [{ k: 'CHEST', v: '8 sets' }, { k: 'DELTS', v: '5 sets' }, { k: 'TRICEPS', v: '6 sets' }],
      exercises: [
        { ...findEx('incline-db-press'), sets: genSets(4, '8', '90s', 20, 2.5), prog: 'Add weight when hitting top reps twice.' },
        { ...findEx('flat-bb-bench'), sets: [{n:1,kg:60,reps:8,rest:'2m'},{n:2,kg:65,reps:6,rest:'2.5m'},{n:3,kg:70,reps:5,rest:'3m'}] },
        { ...findEx('bb-ohp'), sets: genSets(4, '6', '2 min', 30, 2.5) },
        { ...findEx('weighted-dips'), sets: genSets(3, '10', '90s') },
        { ...findEx('cable-lateral-raise'), sets: genSets(4, '12', '30s', 8, 0) },
        { ...findEx('ez-skullcrusher'), sets: genSets(3, '10', '75s', 20, 0) }
      ]
    },
    {
      key: 'pull1', label: 'Pull 1 (Strength)', focus: 'STRENGTH', accent: '#4e9eed',
      desc: 'Deadlift-led strength day. Lat width and thick rhomboids.',
      vol: [{ k: 'BACK', v: '12 sets' }, { k: 'BICEPS', v: '5 sets' }],
      exercises: [
        { ...findEx('conventional-deadlift'), sets: [{n:1,kg:100,reps:5,rest:'2m'},{n:2,kg:120,reps:3,rest:'3m'},{n:3,kg:130,reps:2,rest:'3m'}] },
        { ...findEx('wide-pullups'), sets: genSets(4, '8', '2 min') },
        { ...findEx('bb-row'), sets: genSets(4, '6', '2.5 min', 60, 5) },
        { ...findEx('ez-curl'), sets: genSets(4, '8', '90s', 25, 2.5) },
        { ...findEx('face-pull'), sets: genSets(3, '15', '45s', 12.5, 0) }
      ]
    },
    {
      key: 'legs1', label: 'Legs 1 (Strength)', focus: 'STRENGTH', accent: '#3db88a',
      desc: 'Squat-led strength. Deep ROM and heavy hamstrings.',
      vol: [{ k: 'QUADS', v: '10 sets' }, { k: 'HAMSTRINGS', v: '7 sets' }],
      exercises: [
        { ...findEx('bb-squat'), sets: [{n:1,kg:80,reps:8,rest:'2m'},{n:2,kg:90,reps:6,rest:'2.5m'},{n:3,kg:100,reps:5,rest:'3m'}] },
        { ...findEx('rdl'), sets: genSets(3, '8', '2 min', 70, 10) },
        { ...findEx('leg-press'), sets: genSets(3, '10', '90s', 140, 20) },
        { ...findEx('lying-leg-curl'), sets: genSets(3, '10', '75s', 35, 0) },
        { ...findEx('standing-calf-raise'), sets: genSets(4, '12', '60s', 50, 0) }
      ]
    },
    {
      key: 'push2', label: 'Push 2 (Hypertrophy)', focus: 'HYPERTROPHY', accent: '#e5934b',
      desc: 'Isolation-first. 3s eccentrics. Chase the burn.',
      vol: [{ k: 'CHEST', v: '8 sets' }, { k: 'DELTS', v: '12 sets' }],
      exercises: [
        { ...findEx('incline-machine-press'), sets: genSets(4, '12', '60s', 40, 0) },
        { ...findEx('cable-chest-fly'), sets: genSets(4, '15', '45s', 10, 0) },
        { ...findEx('cable-lateral-raise'), sets: genSets(4, '15', '30s', 8, 0) },
        { ...findEx('machine-shoulder-press'), sets: genSets(3, '12', '60s', 30, 0) },
        { ...findEx('overhead-tricep-ext'), sets: genSets(4, '12', '60s', 15, 0) },
        { ...findEx('rope-pushdown'), sets: genSets(4, '12', '45s', 15, 0) }
      ]
    },
    {
      key: 'pull2', label: 'Pull 2 (Hypertrophy)', focus: 'HYPERTROPHY', accent: '#9b72cf',
      desc: 'Lat width, bicep peak. Pure aesthetic architecture.',
      vol: [{ k: 'LATS', v: '8 sets' }, { k: 'BICEPS', v: '12 sets' }],
      exercises: [
        { ...findEx('lat-pulldown'), sets: genSets(4, '10', '75s', 55, 0) },
        { ...findEx('one-arm-row'), sets: genSets(4, '10', '60s', 30, 0) },
        { ...findEx('cable-row'), sets: genSets(3, '10', '60s', 50, 0) },
        { ...findEx('incline-db-curl'), sets: genSets(3, '10', '60s', 12.5, 0) },
        { ...findEx('hammer-curl'), sets: genSets(3, '10', '45s', 15, 0) },
        { ...findEx('reverse-pec-deck'), sets: genSets(4, '15', '45s', 15, 0) }
      ]
    },
    {
      key: 'legs2', label: 'Legs 2 (Hypertrophy)', focus: 'HYPERTROPHY', accent: '#3dbdb8',
      desc: 'Quad isolation, glute peak contraction.',
      vol: [{ k: 'QUADS', v: '11 sets' }, { k: 'ABS', v: '11 sets' }],
      exercises: [
        { ...findEx('leg-extension'), sets: genSets(4, '12', '60s', 40, 0) },
        { ...findEx('bulgarian-split-squat'), sets: genSets(3, '10', '75s', 10, 0) },
        { ...findEx('seated-leg-curl'), sets: genSets(4, '10', '75s', 35, 0) },
        { ...findEx('hip-thrust'), sets: genSets(3, '12', '90s', 80, 0) },
        { ...findEx('cable-crunch'), sets: genSets(4, '15', '45s', 25, 0) },
        { ...findEx('hanging-leg-raise'), sets: genSets(4, '12', '45s', 0, 0) }
      ]
    },
    { key: 'rest1', label: 'Rest', focus: 'RECOVERY', accent: '#333', exercises: [], rest: true }
  ]
};
