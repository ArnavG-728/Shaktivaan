import { findEx, genSets } from './utils.js';

export const PUSH_PULL_2 = {
  id: 'pp-2',
  name: 'Push/Pull 2: Hypertrophy Split',
  type: 'Push/Pull',
  description: 'A 4-day split avoiding spinal loading, heavily relying on machines and cables to isolate muscle groups safely near failure.',
  days: [
    {
      key: 'push1', label: 'Push + Quads 1 (Isolation focus)', focus: 'HYPERTROPHY', accent: '#e5534b',
      exercises: [
        { ...findEx('leg-press'), sets: genSets(4, '12', '2m', 150, 0) },
        { ...findEx('machine-chest-press'), sets: genSets(4, '12', '90s', 50, 0) },
        { ...findEx('leg-extension'), sets: genSets(4, '15', '60s', 40, 0) },
        { ...findEx('cable-lateral-raise'), sets: genSets(4, '15', '45s', 8, 0) },
        { ...findEx('rope-pushdown'), sets: genSets(3, '15', '45s', 15, 0) }
      ]
    },
    {
      key: 'pull1', label: 'Pull + Hams 1 (Isolation focus)', focus: 'HYPERTROPHY', accent: '#4e9eed',
      exercises: [
        { ...findEx('lying-leg-curl'), sets: genSets(4, '12', '90s', 35, 0) },
        { ...findEx('lat-pulldown'), sets: genSets(4, '10', '90s', 55, 0) },
        { ...findEx('hip-thrust'), sets: genSets(3, '12', '90s', 90, 0) },
        { ...findEx('cable-row'), sets: genSets(3, '12', '60s', 50, 0) },
        { ...findEx('hammer-curl'), sets: genSets(3, '12', '60s', 15, 0) }
      ]
    },
    { key: 'rest1', label: 'Rest', focus: 'RECOVERY', accent: '#333', exercises: [], rest: true },
    {
      key: 'push2', label: 'Push + Quads 2 (Incline + Sweep)', focus: 'HYPERTROPHY', accent: '#3db88a',
      exercises: [
        { ...findEx('hack-squat'), sets: genSets(4, '12', '2m', 60, 0) },
        { ...findEx('incline-machine-press'), sets: genSets(4, '12', '90s', 45, 0) },
        { ...findEx('cable-crossover'), sets: genSets(3, '15', '45s', 12, 0) },
        { ...findEx('machine-shoulder-press'), sets: genSets(4, '12', '60s', 40, 0) },
        { ...findEx('overhead-tricep-ext'), sets: genSets(3, '15', '60s', 15, 0) },
        { ...findEx('seated-calf-raise'), sets: genSets(4, '15', '45s', 30, 0) }
      ]
    },
    {
      key: 'pull2', label: 'Pull + Hams 2 (Thickness + Peak)', focus: 'HYPERTROPHY', accent: '#9b72cf',
      exercises: [
        { ...findEx('seated-leg-curl'), sets: genSets(4, '12', '60s', 35, 0) },
        { ...findEx('t-bar-row'), sets: genSets(4, '10', '90s', 35, 0) },
        { ...findEx('db-pullover'), sets: genSets(3, '15', '60s', 20, 0) },
        { ...findEx('face-pull'), sets: genSets(3, '15', '45s', 12, 0) },
        { ...findEx('cable-curl'), sets: genSets(4, '12', '45s', 15, 0) }
      ]
    },
    { key: 'rest2', label: 'Rest', focus: 'RECOVERY', accent: '#333', exercises: [], rest: true },
    { key: 'rest3', label: 'Rest', focus: 'RECOVERY', accent: '#333', exercises: [], rest: true }
  ]
};
