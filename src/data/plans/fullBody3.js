import { findEx, genSets } from './utils.js';

export const FULL_BODY_3 = {
  id: 'fb-3',
  name: 'Full Body 3: Time Crunch',
  type: 'Full Body',
  description: 'Designed for high efficiency. Just the most essential compound movements to hit every muscle group in under 45 minutes.',
  days: [
    {
      key: 'day1', label: 'Workout A', focus: 'HYPERTROPHY', accent: '#3db88a',
      exercises: [
        { ...findEx('goblet-squat'), sets: genSets(3, '12', '90s', 25, 0) },
        { ...findEx('push-ups'), sets: genSets(3, 'AMRAP', '60s', 0, 0) },
        { ...findEx('cable-row'), sets: genSets(3, '12', '60s', 45, 0) },
        { ...findEx('cable-lateral-raise'), sets: genSets(3, '15', '45s', 8, 0) }
      ]
    },
    { key: 'rest1', label: 'Rest', focus: 'RECOVERY', accent: '#333', exercises: [], rest: true },
    {
      key: 'day2', label: 'Workout B', focus: 'HYPERTROPHY', accent: '#e5534b',
      exercises: [
        { ...findEx('rdl'), sets: genSets(3, '10', '90s', 60, 0) },
        { ...findEx('lat-pulldown'), sets: genSets(3, '12', '60s', 45, 0) },
        { ...findEx('machine-shoulder-press'), sets: genSets(3, '12', '60s', 30, 0) },
        { ...findEx('cable-crunch'), sets: genSets(3, '15', '45s', 20, 0) }
      ]
    },
    { key: 'rest2', label: 'Rest', focus: 'RECOVERY', accent: '#333', exercises: [], rest: true },
    {
      key: 'day3', label: 'Workout C', focus: 'HYPERTROPHY', accent: '#9b72cf',
      exercises: [
        { ...findEx('leg-press'), sets: genSets(3, '15', '90s', 100, 0) },
        { ...findEx('machine-chest-press'), sets: genSets(3, '12', '60s', 40, 0) },
        { ...findEx('face-pull'), sets: genSets(3, '15', '45s', 12, 0) },
        { ...findEx('ez-curl'), sets: genSets(2, '12', '45s', 20, 0) },
        { ...findEx('rope-pushdown'), sets: genSets(2, '12', '45s', 15, 0) }
      ]
    },
    { key: 'rest3', label: 'Rest', focus: 'RECOVERY', accent: '#333', exercises: [], rest: true },
    { key: 'rest4', label: 'Rest', focus: 'RECOVERY', accent: '#333', exercises: [], rest: true }
  ]
};
