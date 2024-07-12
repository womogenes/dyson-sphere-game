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
  tick() {
    //
  }
}

// TODO: load this from localStorage
const game = new Game();
export { game };
