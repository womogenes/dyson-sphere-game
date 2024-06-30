// All the game mechanics in this file

import { stores } from './stores';
import { upgrades } from './upgrades';
import { events } from './events';

export class Game {
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
