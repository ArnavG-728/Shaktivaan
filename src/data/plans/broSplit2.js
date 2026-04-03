import { findEx, genSets } from './utils.js';

export const BRO_SPLIT_2 = {
  id: 'bro-2',
  name: 'Bro Split 2: Arnold Variation',
  type: 'Bro Split',
  description: 'An old-school split inspired by Arnold\'s framework. Synergistic muscle groupings for maximum blood flow and massive pumps.',
  days: [
    {
      key: 'chest_back', label: 'Chest & Back', focus: 'HYPERTROPHY', accent: '#e5534b',
      exercises: [
        { ...findEx('incline-db-press'), sets: genSets(4, '10', '90s', 25, 0) },
        { ...findEx('wide-pullups'), sets: genSets(4, '8', '90s', 0, 0) },
        { ...findEx('flat-db-bench'), sets: genSets(4, '10', '90s', 30, 0) },
        { ...findEx('t-bar-row'), sets: genSets(4, '10', '90s', 45, 0) },
        { ...findEx('db-pullover'), sets: genSets(3, '12', '60s', 22, 0) }
      ]
    },
    {
      key: 'legs', label: 'Legs & Calves', focus: 'HYPERTROPHY', accent: '#3db88a',
      exercises: [
        { ...findEx('front-squat'), sets: genSets(4, '8', '2m', 60, 0) },
        { ...findEx('leg-press'), sets: genSets(4, '12', '90s', 140, 0) },
        { ...findEx('lying-leg-curl'), sets: genSets(4, '12', '60s', 30, 0) },
        { ...findEx('stiff-leg-deadlift'), sets: genSets(3, '10', '90s', 60, 0) },
        { ...findEx('standing-calf-raise'), sets: genSets(4, '15', '45s', 40, 0) }
      ]
    },
    {
      key: 'shoulders_arms', label: 'Shoulders & Arms', focus: 'HYPERTROPHY', accent: '#4e9eed',
      exercises: [
        { ...findEx('bb-ohp'), sets: genSets(4, '8', '90s', 35, 0) },
        { ...findEx('cable-lateral-raise'), sets: genSets(4, '15', '45s', 8, 0) },
        { ...findEx('ez-skullcrusher'), sets: genSets(3, '12', '60s', 20, 0) },
        { ...findEx('preacher-curl'), sets: genSets(3, '10', '60s', 20, 0) },
        { ...findEx('cable-overhead-extension'), sets: genSets(3, '15', '45s', 15, 0) },
        { ...findEx('concentration-curl'), sets: genSets(3, '12', '45s', 10, 0) }
      ]
    },
    { key: 'rest1', label: 'Rest', focus: 'RECOVERY', accent: '#333', exercises: [], rest: true },
    {
      key: 'weakpoint', label: 'Weak Point (Custom)', focus: 'HYPERTROPHY', accent: '#9b72cf',
      desc: 'Hit whatever muscle group needs to catch up (e.g. Arms, Calves, Rear Delts). Default: Rear Delts & Abs.',
      exercises: [
        { ...findEx('face-pull'), sets: genSets(4, '15', '45s', 15, 0) },
        { ...findEx('reverse-pec-deck'), sets: genSets(4, '15', '45s', 15, 0) },
        { ...findEx('hanging-leg-raise'), sets: genSets(4, '12', '45s', 0, 0) },
        { ...findEx('cable-crunch'), sets: genSets(4, '15', '45s', 25, 0) }
      ]
    },
    { key: 'rest2', label: 'Rest', focus: 'RECOVERY', accent: '#333', exercises: [], rest: true },
    { key: 'rest3', label: 'Rest', focus: 'RECOVERY', accent: '#333', exercises: [], rest: true }
  ]
};
