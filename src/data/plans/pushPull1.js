import { findEx, genSets } from './utils.js';

export const PUSH_PULL_1 = {
  id: 'pp-1',
  name: 'Push/Pull 1: 4-Day Strength & Size',
  type: 'Push/Pull',
  description: 'A 4-day split integrating quads with pushing movements, and hamstrings/glutes with pulling movements. Ideal for athletes wanting maximum frequency on 4 days.',
  days: [
    {
      key: 'push1', label: 'Push + Quads 1', focus: 'STRENGTH', accent: '#e5534b',
      exercises: [
        { ...findEx('bb-squat'), sets: genSets(4, '6', '3m', 85, 0) },
        { ...findEx('flat-bb-bench'), sets: genSets(4, '6', '2.5m', 65, 0) },
        { ...findEx('leg-extension'), sets: genSets(3, '12', '75s', 40, 0) },
        { ...findEx('machine-shoulder-press'), sets: genSets(3, '10', '75s', 35, 0) },
        { ...findEx('ez-skullcrusher'), sets: genSets(3, '10', '60s', 20, 0) }
      ]
    },
    {
      key: 'pull1', label: 'Pull + Hams 1', focus: 'STRENGTH', accent: '#4e9eed',
      exercises: [
        { ...findEx('conventional-deadlift'), sets: genSets(4, '5', '3m', 110, 0) },
        { ...findEx('wide-pullups'), sets: genSets(4, '8', '2m', 0, 0) },
        { ...findEx('seated-leg-curl'), sets: genSets(3, '12', '60s', 30, 0) },
        { ...findEx('bb-row'), sets: genSets(3, '8', '90s', 55, 0) },
        { ...findEx('ez-curl'), sets: genSets(3, '10', '60s', 25, 0) }
      ]
    },
    { key: 'rest1', label: 'Rest', focus: 'RECOVERY', accent: '#333', exercises: [], rest: true },
    {
      key: 'push2', label: 'Push + Quads 2', focus: 'HYPERTROPHY', accent: '#3db88a',
      exercises: [
        { ...findEx('hack-squat'), sets: genSets(4, '10', '2m', 60, 0) },
        { ...findEx('incline-db-press'), sets: genSets(4, '10', '90s', 25, 0) },
        { ...findEx('bulgarian-split-squat'), sets: genSets(3, '12', '75s', 12, 0) },
        { ...findEx('cable-chest-fly'), sets: genSets(3, '15', '45s', 10, 0) },
        { ...findEx('cable-lateral-raise'), sets: genSets(4, '15', '30s', 8, 0) },
        { ...findEx('cable-overhead-extension'), sets: genSets(3, '12', '60s', 15, 0) }
      ]
    },
    {
      key: 'pull2', label: 'Pull + Hams 2', focus: 'HYPERTROPHY', accent: '#9b72cf',
      exercises: [
        { ...findEx('rdl'), sets: genSets(4, '10', '2m', 70, 0) },
        { ...findEx('lat-pulldown'), sets: genSets(4, '12', '90s', 50, 0) },
        { ...findEx('lying-leg-curl'), sets: genSets(3, '12', '60s', 30, 0) },
        { ...findEx('cable-row'), sets: genSets(3, '12', '60s', 45, 0) },
        { ...findEx('incline-db-curl'), sets: genSets(3, '12', '60s', 12, 0) },
        { ...findEx('standing-calf-raise'), sets: genSets(4, '15', '60s', 30, 0) }
      ]
    },
    { key: 'rest2', label: 'Rest', focus: 'RECOVERY', accent: '#333', exercises: [], rest: true },
    { key: 'rest3', label: 'Rest', focus: 'RECOVERY', accent: '#333', exercises: [], rest: true }
  ]
};
