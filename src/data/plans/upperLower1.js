import { findEx, genSets } from './utils.js';

export const UPPER_LOWER_1 = {
  id: 'ul-1',
  name: 'Upper/Lower 1: Strength Focus',
  type: 'Upper/Lower',
  description: 'A 4-day split designed around heavy compound movements to rapidly build systemic strength, followed by hypertrophy accessories.',
  days: [
    {
      key: 'upper1', label: 'Upper 1', focus: 'STRENGTH', accent: '#e5534b',
      exercises: [
        { ...findEx('flat-bb-bench'), sets: genSets(4, '5', '3m', 70, 0) },
        { ...findEx('bb-row'), sets: genSets(4, '6', '90s', 65, 0) },
        { ...findEx('incline-db-press'), sets: genSets(3, '10', '90s', 25, 0) },
        { ...findEx('lat-pulldown'), sets: genSets(3, '10', '90s', 55, 0) },
        { ...findEx('ez-skullcrusher'), sets: genSets(3, '10', '60s', 20, 0) },
        { ...findEx('ez-curl'), sets: genSets(3, '10', '60s', 25, 0) }
      ]
    },
    {
      key: 'lower1', label: 'Lower 1', focus: 'STRENGTH', accent: '#3db88a',
      exercises: [
        { ...findEx('bb-squat'), sets: genSets(4, '5', '3m', 90, 0) },
        { ...findEx('rdl'), sets: genSets(3, '8', '2m', 80, 0) },
        { ...findEx('leg-press'), sets: genSets(3, '10', '90s', 150, 0) },
        { ...findEx('standing-calf-raise'), sets: genSets(4, '12', '60s', 50, 0) },
        { ...findEx('cable-crunch'), sets: genSets(3, '15', '60s', 25, 0) }
      ]
    },
    { key: 'rest1', label: 'Rest', focus: 'RECOVERY', accent: '#333', exercises: [], rest: true },
    {
      key: 'upper2', label: 'Upper 2', focus: 'HYPERTROPHY', accent: '#4e9eed',
      exercises: [
        { ...findEx('bb-ohp'), sets: genSets(4, '6', '2.5m', 40, 0) },
        { ...findEx('wide-pullups'), sets: genSets(4, '8', '90s', 0, 0) },
        { ...findEx('cable-row'), sets: genSets(3, '10', '90s', 50, 0) },
        { ...findEx('cable-lateral-raise'), sets: genSets(4, '12', '45s', 10, 0) },
        { ...findEx('incline-db-curl'), sets: genSets(3, '12', '60s', 12, 0) },
        { ...findEx('overhead-tricep-ext'), sets: genSets(3, '12', '60s', 15, 0) }
      ]
    },
    {
      key: 'lower2', label: 'Lower 2', focus: 'STRENGTH', accent: '#9b72cf',
      exercises: [
        { ...findEx('conventional-deadlift'), sets: genSets(4, '5', '3m', 120, 0) },
        { ...findEx('hack-squat'), sets: genSets(3, '10', '2m', 70, 0) },
        { ...findEx('lying-leg-curl'), sets: genSets(3, '10', '90s', 35, 0) },
        { ...findEx('seated-calf-raise'), sets: genSets(3, '15', '60s', 30, 0) },
        { ...findEx('hanging-leg-raise'), sets: genSets(3, '12', '60s', 0, 0) }
      ]
    },
    { key: 'rest2', label: 'Rest', focus: 'RECOVERY', accent: '#333', exercises: [], rest: true },
    { key: 'rest3', label: 'Rest', focus: 'RECOVERY', accent: '#333', exercises: [], rest: true }
  ]
};
