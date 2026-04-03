import { findEx, genSets } from './utils.js';

export const PPL_2 = {
  id: 'ppl-2',
  name: 'PPL 2: Aesthetics Focus',
  type: 'PPL',
  description: 'A higher volume, purely aesthetic PPL that skips powerlifting compounds (no barbell deadlift or flat barbell bench) to focus 100% on muscle tension and joint health.',
  days: [
    {
      key: 'push1', label: 'Push (Upper Chest & Medial Delt)', focus: 'HYPERTROPHY', accent: '#e5534b',
      desc: 'Focus on incline pressing and lateral raises for the V-Taper.',
      exercises: [
        { ...findEx('incline-db-press'), sets: genSets(4, '10', '90s', 25, 0) },
        { ...findEx('machine-chest-press'), sets: genSets(3, '12', '60s', 50, 0) },
        { ...findEx('arnold-press'), sets: genSets(3, '12', '75s', 15, 0) },
        { ...findEx('cable-lateral-raise'), sets: genSets(5, '15', '45s', 8, 0) },
        { ...findEx('cable-overhead-extension'), sets: genSets(4, '12', '60s', 15, 0) }
      ]
    },
    {
      key: 'pull1', label: 'Pull (Lat Width & Bicep Peak)', focus: 'HYPERTROPHY', accent: '#4e9eed',
      desc: 'All about width. Pull-ups and heavy DB rows.',
      exercises: [
        { ...findEx('wide-pullups'), sets: genSets(4, '10', '90s') },
        { ...findEx('t-bar-row'), sets: genSets(4, '10', '90s', 40, 0) },
        { ...findEx('lat-pulldown'), sets: genSets(3, '12', '60s', 50, 0) },
        { ...findEx('preacher-curl'), sets: genSets(4, '10', '75s', 25, 0) },
        { ...findEx('concentration-curl'), sets: genSets(3, '12', '60s', 10, 0) }
      ]
    },
    {
      key: 'legs1', label: 'Legs (Quad Sweep)', focus: 'HYPERTROPHY', accent: '#3db88a',
      desc: 'Hack squats and extensions to build the outer quad sweep.',
      exercises: [
        { ...findEx('hack-squat'), sets: genSets(4, '10', '90s', 60, 0) },
        { ...findEx('leg-press'), sets: genSets(4, '12', '90s', 120, 0) },
        { ...findEx('leg-extension'), sets: genSets(4, '15', '60s', 35, 0) },
        { ...findEx('lying-leg-curl'), sets: genSets(4, '10', '75s', 30, 0) },
        { ...findEx('seated-calf-raise'), sets: genSets(4, '15', '60s', 25, 0) }
      ]
    },
    { key: 'rest1', label: 'Rest', focus: 'RECOVERY', accent: '#333', exercises: [], rest: true },
    {
      key: 'push2', label: 'Push (Chest Depth & Triceps)', focus: 'HYPERTROPHY', accent: '#e5934b',
      desc: 'Cable work and close grip pressing for thick triceps.',
      exercises: [
        { ...findEx('flat-db-bench'), sets: genSets(4, '10', '90s', 30, 0) },
        { ...findEx('cable-crossover'), sets: genSets(4, '15', '45s', 12, 0) },
        { ...findEx('machine-shoulder-press'), sets: genSets(3, '12', '60s', 40, 0) },
        { ...findEx('cable-lateral-raise'), sets: genSets(4, '15', '30s', 8, 0) },
        { ...findEx('close-grip-bench'), sets: genSets(3, '8', '90s', 60, 0) },
        { ...findEx('db-tricep-kickback'), sets: genSets(3, '15', '45s', 8, 0) }
      ]
    },
    {
      key: 'pull2', label: 'Pull (Back Thickness & Brachialis)', focus: 'HYPERTROPHY', accent: '#9b72cf',
      desc: 'Rowing focus to build 3D depth.',
      exercises: [
        { ...findEx('pendlay-row'), sets: genSets(4, '8', '90s', 60, 0) },
        { ...findEx('cable-row'), sets: genSets(4, '12', '60s', 50, 0) },
        { ...findEx('db-pullover'), sets: genSets(3, '12', '60s', 20, 0) },
        { ...findEx('hammer-curl'), sets: genSets(4, '10', '60s', 15, 0) },
        { ...findEx('reverse-pec-deck'), sets: genSets(4, '15', '45s', 15, 0) }
      ]
    },
    {
      key: 'legs2', label: 'Legs (Hamstring/Glute Tie-in)', focus: 'HYPERTROPHY', accent: '#3dbdb8',
      desc: 'Posterior chain focus for a balanced lower body.',
      exercises: [
        { ...findEx('rdl'), sets: genSets(4, '10', '90s', 80, 0) },
        { ...findEx('bulgarian-split-squat'), sets: genSets(3, '12', '75s', 12, 0) },
        { ...findEx('hip-thrust'), sets: genSets(4, '10', '90s', 100, 0) },
        { ...findEx('seated-leg-curl'), sets: genSets(3, '12', '60s', 35, 0) },
        { ...findEx('leg-press-calf-raise'), sets: genSets(4, '15', '60s', 80, 0) }
      ]
    }
  ]
};
