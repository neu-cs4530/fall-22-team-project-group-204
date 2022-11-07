import GameStatus from './GameStatus';

export default abstract class Player {
  private _status: GameStatus;

  public get status(): GameStatus {
    return this._status;
  }

  public set status(value: GameStatus) {
    this._status = value;
  }

  constructor(status: GameStatus) {
    this._status = status;
  }
}
