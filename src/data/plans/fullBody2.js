import { findEx, genSets } from './utils.js';

export const FULL_BODY_2 = {
  id: 'fb-2',
  name: 'Full Body 2: Athletic Performance',
  type: 'Full Body',
  description: 'A 3-day split balancing barbell strength with unilateral movements for functional athletic performance.',
  days: [
    {
      key: 'day1', label: 'Day 1', focus: 'MIXED', accent: '#e5534b',
      exercises: [
        { ...findEx('conventional-deadlift'), sets: genSets(4, '5', '3m', 100, 0) },
        { ...findEx('incline-db-press'), sets: genSets(3, '10', '90s', 25, 0) },
        { ...findEx('bulgarian-split-squat'), sets: genSets(3, '10', '90s', 15, 0) },
        { ...findEx('lat-pulldown'), sets: genSets(3, '12', '90s', 50, 0) },
        { ...findEx('ab-wheel'), sets: genSets(3, '10', '60s', 0, 0) }
      ]
    },
    { key: 'rest1', label: 'Rest', focus: 'RECOVERY', accent: '#333', exercises: [], rest: true },
    {
      key: 'day2', label: 'Day 2', focus: 'MIXED', accent: '#3db88a',
      exercises: [
        { ...findEx('front-squat'), sets: genSets(4, '6', '2.5m', 70, 0) },
        { ...findEx('bb-ohp'), sets: genSets(3, '8', '2m', 35, 0) },
        { ...findEx('t-bar-row'), sets: genSets(3, '10', '90s', 45, 0) },
        { ...findEx('kettlebell-swing'), sets: genSets(3, '15', '60s', 24, 0) },
        { ...findEx('face-pull'), sets: genSets(3, '15', '45s', 12, 0) }
      ]
    },
    { key: 'rest2', label: 'Rest', focus: 'RECOVERY', accent: '#333', exercises: [], rest: true },
    {
      key: 'day3', label: 'Day 3', focus: 'MIXED', accent: '#9b72cf',
      exercises: [
        { ...findEx('hack-squat'), sets: genSets(4, '10', '2m', 70, 0) },
        { ...findEx('flat-db-bench'), sets: genSets(3, '10', '90s', 30, 0) },
        { ...findEx('one-arm-row'), sets: genSets(3, '10', '90s', 35, 0) },
        { ...findEx('db-tricep-kickback'), sets: genSets(2, '12', '60s', 10, 0) },
        { ...findEx('cable-crunch'), sets: genSets(3, '15', '60s', 30, 0) }
      ]
    },
    { key: 'rest3', label: 'Rest', focus: 'RECOVERY', accent: '#333', exercises: [], rest: true },
    { key: 'rest4', label: 'Rest', focus: 'RECOVERY', accent: '#333', exercises: [], rest: true }
  ]
};
