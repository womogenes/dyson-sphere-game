import { writable } from 'svelte/store';

export const stores = (game) => {
  const defaultValues = {
    power: 0, // megawatts
    numSatellites: 0,
  };

  // Fancy code to convert literals to stores
  return Object.keys(defaultValues).reduce(
    (curStores, curKey) => ({
      ...curStores,
      [curKey]: writable(defaultValues[curKey]),
    }),
    {},
  );
};
