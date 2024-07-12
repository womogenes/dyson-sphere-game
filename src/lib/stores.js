class Writable {
  constructor(value) {
    this.value = value;
    this.callbacks = [];
  }
  subscribe(callback) {
    this.callbacks.push(callback);
    callback(this.value);
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) this.callbacks.splice(index, 1);
    };
  }
  set(newValue) {
    this.value = newValue;
    this.notify();
  }
  update(callback) {
    this.value = callback(this.value);
    this.notify();
  }
  get() {
    return this.value;
  }
  notify() {
    this.callbacks.forEach((callback) => callback(this.value));
  }
}

const writable = (value) => new Writable(value);
// import { writable } from 'svelte/store';

export const stores = (game) => {
  const defaultValues = {
    power: 0, // megawatts
    maxPower: 200000, // megawatts
    storedEnergy: 0, // megawatt-hours
    maxStoredEnergy: 50000, // megawatt-hours
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
