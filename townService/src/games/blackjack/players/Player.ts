import GameStatus from './GameStatus';

export default abstract class Player {
  private _status: GameStatus;

  private _id: string;

  public get status(): GameStatus {
    return this._status;
  }

  // This is protected because Spectator shouldn't be able
  // to set their status
  protected set status(status: GameStatus) {
    this._status = status;
  }

  public get id(): string {
    return this._id;
  }

  protected set id(id: string) {
    this._id = id;
  }

  constructor(status: GameStatus, id: string) {
    this._status = status;
    this._id = id;
  }
}
