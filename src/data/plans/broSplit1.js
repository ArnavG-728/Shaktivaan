import { findEx, genSets } from './utils.js';

export const BRO_SPLIT_1 = {
  id: 'bro-1',
  name: 'Bro Split 1: Golden Era',
  type: 'Bro Split',
  description: 'The classic 5-day body part split. One muscle group per day destroyed with high volume and high mind-muscle connection.',
  days: [
    {
      key: 'chest', label: 'Chest Day', focus: 'HYPERTROPHY', accent: '#e5534b',
      exercises: [
        { ...findEx('flat-bb-bench'), sets: genSets(4, '8', '2m', 70, 0) },
        { ...findEx('incline-db-press'), sets: genSets(4, '10', '90s', 25, 0) },
        { ...findEx('machine-chest-press'), sets: genSets(3, '12', '60s', 50, 0) },
        { ...findEx('cable-crossover'), sets: genSets(4, '15', '45s', 15, 0) }
      ]
    },
    {
      key: 'back', label: 'Back Day', focus: 'HYPERTROPHY', accent: '#4e9eed',
      exercises: [
        { ...findEx('wide-pullups'), sets: genSets(4, 'AMRAP', '90s', 0, 0) },
        { ...findEx('bb-row'), sets: genSets(4, '8', '90s', 60, 0) },
        { ...findEx('lat-pulldown'), sets: genSets(3, '12', '60s', 55, 0) },
        { ...findEx('one-arm-row'), sets: genSets(3, '10', '60s', 30, 0) },
        { ...findEx('db-pullover'), sets: genSets(3, '15', '60s', 20, 0) }
      ]
    },
    {
      key: 'legs', label: 'Leg Day', focus: 'HYPERTROPHY', accent: '#3db88a',
      exercises: [
        { ...findEx('bb-squat'), sets: genSets(4, '8', '3m', 85, 0) },
        { ...findEx('leg-press'), sets: genSets(4, '12', '90s', 150, 0) },
        { ...findEx('rdl'), sets: genSets(4, '10', '90s', 70, 0) },
        { ...findEx('leg-extension'), sets: genSets(3, '15', '60s', 35, 0) },
        { ...findEx('lying-leg-curl'), sets: genSets(3, '12', '60s', 30, 0) }
      ]
    },
    {
      key: 'shoulders', label: 'Shoulder Day', focus: 'HYPERTROPHY', accent: '#e5934b',
      exercises: [
        { ...findEx('machine-shoulder-press'), sets: genSets(4, '10', '90s', 45, 0) },
        { ...findEx('arnold-press'), sets: genSets(3, '12', '60s', 15, 0) },
        { ...findEx('cable-lateral-raise'), sets: genSets(5, '15', '45s', 8, 0) },
        { ...findEx('reverse-pec-deck'), sets: genSets(4, '15', '45s', 15, 0) },
        { ...findEx('barbell-shrugs'), sets: genSets(4, '12', '60s', 60, 0) }
      ]
    },
    {
      key: 'arms', label: 'Arm Day', focus: 'HYPERTROPHY', accent: '#9b72cf',
      exercises: [
        { ...findEx('ez-skullcrusher'), sets: genSets(4, '10', '60s', 25, 0) },
        { ...findEx('ez-curl'), sets: genSets(4, '10', '60s', 25, 0) },
        { ...findEx('cable-overhead-extension'), sets: genSets(3, '15', '45s', 15, 0) },
        { ...findEx('incline-db-curl'), sets: genSets(3, '12', '60s', 12, 0) },
        { ...findEx('rope-pushdown'), sets: genSets(3, '15', '45s', 15, 0) },
        { ...findEx('hammer-curl'), sets: genSets(3, '12', '45s', 15, 0) }
      ]
    },
    { key: 'rest1', label: 'Rest', focus: 'RECOVERY', accent: '#333', exercises: [], rest: true },
    { key: 'rest2', label: 'Rest', focus: 'RECOVERY', accent: '#333', exercises: [], rest: true }
  ]
};
