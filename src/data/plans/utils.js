import { EXERCISES } from '../exercises.js';

export const findEx = (id) => {
  const ex = EXERCISES.find(e => e.id === id);
  if (!ex) return { id, name: id.replace(/-/g, ' '), sets: [] };
  return ex;
};

// Helper to quickly generate sets
export const genSets = (count, reps, rest, initKg = 0, stepKg = 0) => {
  return Array.from({ length: count }).map((_, i) => ({
    n: i + 1,
    kg: initKg + (i * stepKg),
    reps: typeof reps === 'function' ? reps(i) : reps,
    rest,
  }));
};
