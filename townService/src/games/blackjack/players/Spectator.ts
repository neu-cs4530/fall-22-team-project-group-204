import Player from './Player';
import GameStatus from './GameStatus';

export default class Spectator extends Player {
  constructor() {
    super(GameStatus.Spectator);
  }
}
