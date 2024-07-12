// All the game mechanics in this file

import { stores } from './stores';
import { upgrades } from './upgrades';
import { events } from './events';

class Game {
  constructor() {
    this.stores = stores(this);
    this.upgrades = upgrades(this);
    this.events = events(this);
  }

  // Game tick
  tick(dt) {
    this.stores.power.set(this.stores.numSatellites.value);
    this.stores.storedEnergy.set(
      Math.min(
        this.stores.maxStoredEnergy.value,
        this.stores.storedEnergy.value +
          (this.stores.power.value * dt) / 1000 / 60 / 60,
      ),
    );
  }
}

// TODO: load this from localStorage
const game = new Game();
export { game };
