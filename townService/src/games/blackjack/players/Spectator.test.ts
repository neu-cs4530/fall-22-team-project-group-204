/* eslint-disable prettier/prettier */

import GameStatus from "./GameStatus";
import Spectator from "./Spectator";

// We are effectively testing both the Spectator class and the
// Player class here
describe('Spectator', () => {
  let spectator: Spectator;

  beforeEach(() => {
    spectator = new Spectator();
  })

  describe('constructor', () => {
    it('Constructs a Spectator properly', () => {
      const newSpectator = new Spectator();
      expect(newSpectator.status).toBe(GameStatus.Spectator);
    });
  });

  describe('getters', () => {
    it('Status getter works correctly', () => {
      expect(spectator.status).toBe(GameStatus.Spectator);
    });
  });
});
