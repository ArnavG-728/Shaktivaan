import { findEx, genSets } from './utils.js';

export const UPPER_LOWER_2 = {
  id: 'ul-2',
  name: 'Upper/Lower 2: Pure Hypertrophy',
  type: 'Upper/Lower',
  description: 'A 4-day split engineered entirely for muscle growth. Higher reps, more isolation, shorter rests, and constant tension.',
  days: [
    {
      key: 'upper1', label: 'Upper 1', focus: 'HYPERTROPHY', accent: '#e5534b',
      exercises: [
        { ...findEx('incline-machine-press'), sets: genSets(4, '12', '60s', 40, 0) },
        { ...findEx('t-bar-row'), sets: genSets(4, '12', '75s', 35, 0) },
        { ...findEx('machine-chest-press'), sets: genSets(3, '15', '60s', 45, 0) },
        { ...findEx('cable-row'), sets: genSets(3, '15', '60s', 45, 0) },
        { ...findEx('cable-lateral-raise'), sets: genSets(4, '15', '30s', 8, 0) },
        { ...findEx('rope-pushdown'), sets: genSets(3, '15', '45s', 15, 0) }
      ]
    },
    {
      key: 'lower1', label: 'Lower 1', focus: 'HYPERTROPHY', accent: '#3db88a',
      exercises: [
        { ...findEx('hack-squat'), sets: genSets(4, '12', '90s', 50, 0) },
        { ...findEx('bulgarian-split-squat'), sets: genSets(3, '12', '75s', 10, 0) },
        { ...findEx('leg-extension'), sets: genSets(3, '15', '60s', 35, 0) },
        { ...findEx('seated-leg-curl'), sets: genSets(4, '12', '60s', 30, 0) },
        { ...findEx('hip-abduction'), sets: genSets(3, '20', '45s', 25, 0) }
      ]
    },
    { key: 'rest1', label: 'Rest', focus: 'RECOVERY', accent: '#333', exercises: [], rest: true },
    {
      key: 'upper2', label: 'Upper 2', focus: 'HYPERTROPHY', accent: '#4e9eed',
      exercises: [
        { ...findEx('arnold-press'), sets: genSets(4, '12', '75s', 15, 0) },
        { ...findEx('lat-pulldown'), sets: genSets(4, '12', '75s', 50, 0) },
        { ...findEx('incline-db-press'), sets: genSets(3, '12', '75s', 20, 0) },
        { ...findEx('preacher-curl'), sets: genSets(4, '12', '60s', 20, 0) },
        { ...findEx('cable-overhead-extension'), sets: genSets(4, '15', '60s', 12, 0) },
        { ...findEx('face-pull'), sets: genSets(3, '15', '45s', 12, 0) }
      ]
    },
    {
      key: 'lower2', label: 'Lower 2', focus: 'HYPERTROPHY', accent: '#9b72cf',
      exercises: [
        { ...findEx('stiff-leg-deadlift'), sets: genSets(4, '10', '90s', 60, 0) },
        { ...findEx('leg-press'), sets: genSets(4, '15', '90s', 110, 0) },
        { ...findEx('lying-leg-curl'), sets: genSets(4, '12', '60s', 30, 0) },
        { ...findEx('seated-calf-raise'), sets: genSets(4, '20', '45s', 20, 0) },
        { ...findEx('ab-wheel'), sets: genSets(3, '12', '60s', 0, 0) }
      ]
    },
    { key: 'rest2', label: 'Rest', focus: 'RECOVERY', accent: '#333', exercises: [], rest: true },
    { key: 'rest3', label: 'Rest', focus: 'RECOVERY', accent: '#333', exercises: [], rest: true }
  ]
};
