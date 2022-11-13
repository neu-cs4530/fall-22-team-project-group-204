import GameStatus from './GameStatus';

export default abstract class Player {
  private _status: GameStatus;

  public get status(): GameStatus {
    return this._status;
  }

  // This is protected because Spectator shouldn't be able
  // to set their status
  protected set status(status: GameStatus) {
    this._status = status;
  }

  constructor(status: GameStatus) {
    this._status = status;
  }
}
