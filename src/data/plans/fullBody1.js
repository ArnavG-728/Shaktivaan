import { findEx, genSets } from './utils.js';

export const FULL_BODY_1 = {
  id: 'fb-1',
  name: 'Full Body 1: Squat/Deadlift/Press',
  type: 'Full Body',
  description: 'A 3-day full body split. High frequency, focuses on heavy multi-joint movements with daily rotating main compounds.',
  days: [
    {
      key: 'day1', label: 'Day 1 (Squat Focus)', focus: 'STRENGTH', accent: '#e5534b',
      exercises: [
        { ...findEx('bb-squat'), sets: genSets(4, '5', '3m', 90, 0) },
        { ...findEx('flat-bb-bench'), sets: genSets(3, '8', '2m', 65, 0) },
        { ...findEx('bb-row'), sets: genSets(3, '8', '2m', 60, 0) },
        { ...findEx('standing-calf-raise'), sets: genSets(3, '15', '60s', 40, 0) },
        { ...findEx('ez-curl'), sets: genSets(2, '12', '60s', 25, 0) }
      ]
    },
    { key: 'rest1', label: 'Rest', focus: 'RECOVERY', accent: '#333', exercises: [], rest: true },
    {
      key: 'day2', label: 'Day 2 (Deadlift Focus)', focus: 'STRENGTH', accent: '#4e9eed',
      exercises: [
        { ...findEx('conventional-deadlift'), sets: genSets(3, '5', '3m', 120, 0) },
        { ...findEx('bb-ohp'), sets: genSets(3, '6', '2.5m', 40, 0) },
        { ...findEx('wide-pullups'), sets: genSets(3, '8', '90s', 0, 0) },
        { ...findEx('leg-press'), sets: genSets(3, '12', '90s', 140, 0) },
        { ...findEx('ez-skullcrusher'), sets: genSets(2, '12', '60s', 20, 0) }
      ]
    },
    { key: 'rest2', label: 'Rest', focus: 'RECOVERY', accent: '#333', exercises: [], rest: true },
    {
      key: 'day3', label: 'Day 3 (Bench Focus)', focus: 'STRENGTH', accent: '#e5934b',
      exercises: [
        { ...findEx('flat-bb-bench'), sets: genSets(4, '5', '3m', 70, 0) },
        { ...findEx('hack-squat'), sets: genSets(3, '8', '2m', 60, 0) },
        { ...findEx('cable-row'), sets: genSets(3, '10', '90s', 50, 0) },
        { ...findEx('cable-lateral-raise'), sets: genSets(3, '15', '45s', 8, 0) },
        { ...findEx('cable-crunch'), sets: genSets(3, '15', '60s', 25, 0) }
      ]
    },
    { key: 'rest3', label: 'Rest', focus: 'RECOVERY', accent: '#333', exercises: [], rest: true },
    { key: 'rest4', label: 'Rest', focus: 'RECOVERY', accent: '#333', exercises: [], rest: true }
  ]
};
