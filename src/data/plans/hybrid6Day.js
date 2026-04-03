import { findEx, genSets } from './utils.js';

export const HYBRID_6_DAY = {
  id: 'hybrid-6',
  name: 'Push, Pull, Core, Push, Pull, Legs',
  type: 'Custom',
  description: 'A 6-day split designed for advanced lifters blending strength & hypertrophy while providing dedicated core development.',
  days: [
    {
      key: 'push1', label: 'Push (Heavy)', focus: 'STRENGTH', accent: '#e5534b',
      exercises: [
        { ...findEx('flat-bb-bench'), sets: genSets(4, '6', '3m', 70, 0) },
        { ...findEx('bb-ohp'), sets: genSets(3, '6', '2m', 40, 0) },
        { ...findEx('incline-db-press'), sets: genSets(3, '10', '90s', 25, 0) },
        { ...findEx('ez-skullcrusher'), sets: genSets(3, '10', '60s', 20, 0) }
      ]
    },
    {
      key: 'pull1', label: 'Pull (Heavy)', focus: 'STRENGTH', accent: '#4e9eed',
      exercises: [
        { ...findEx('conventional-deadlift'), sets: genSets(4, '5', '3m', 120, 0) },
        { ...findEx('wide-pullups'), sets: genSets(4, '8', '2m', 0, 0) },
        { ...findEx('bb-row'), sets: genSets(3, '8', '90s', 60, 0) },
        { ...findEx('ez-curl'), sets: genSets(3, '10', '60s', 25, 0) }
      ]
    },
    {
      key: 'core', label: 'Core & Stabilisers', focus: 'HYPERTROPHY', accent: '#9b72cf',
      desc: 'Active recovery and midsection building to stabilise heavy lifts.',
      exercises: [
        { ...findEx('cable-crunch'), sets: genSets(4, '15', '45s', 30, 0) },
        { ...findEx('hanging-leg-raise'), sets: genSets(4, '15', '45s', 0, 0) },
        { ...findEx('ab-wheel'), sets: genSets(3, '12', '60s', 0, 0) },
        { ...findEx('plank'), sets: genSets(3, '60s', '60s', 0, 0) },
        { ...findEx('face-pull'), sets: genSets(3, '20', '45s', 12, 0) }
      ]
    },
    {
      key: 'push2', label: 'Push (Hypertrophy)', focus: 'HYPERTROPHY', accent: '#e5934b',
      exercises: [
        { ...findEx('machine-chest-press'), sets: genSets(4, '12', '90s', 50, 0) },
        { ...findEx('cable-crossover'), sets: genSets(3, '15', '45s', 15, 0) },
        { ...findEx('cable-lateral-raise'), sets: genSets(4, '15', '45s', 10, 0) },
        { ...findEx('overhead-tricep-ext'), sets: genSets(3, '15', '45s', 15, 0) }
      ]
    },
    {
      key: 'pull2', label: 'Pull (Hypertrophy)', focus: 'HYPERTROPHY', accent: '#3dbdb8',
      exercises: [
        { ...findEx('lat-pulldown'), sets: genSets(4, '12', '90s', 55, 0) },
        { ...findEx('cable-row'), sets: genSets(3, '12', '60s', 45, 0) },
        { ...findEx('incline-db-curl'), sets: genSets(3, '12', '60s', 12, 0) },
        { ...findEx('reverse-pec-deck'), sets: genSets(3, '15', '45s', 15, 0) }
      ]
    },
    {
      key: 'legs', label: 'Legs (Complete Phase)', focus: 'MIXED', accent: '#3db88a',
      exercises: [
        { ...findEx('bb-squat'), sets: genSets(4, '6', '3m', 90, 0) },
        { ...findEx('rdl'), sets: genSets(3, '10', '2m', 70, 0) },
        { ...findEx('leg-press'), sets: genSets(3, '12', '90s', 150, 0) },
        { ...findEx('seated-leg-curl'), sets: genSets(3, '12', '60s', 30, 0) },
        { ...findEx('standing-calf-raise'), sets: genSets(4, '15', '60s', 50, 0) }
      ]
    },
    { key: 'rest1', label: 'Rest', focus: 'RECOVERY', accent: '#333', exercises: [], rest: true }
  ]
};
