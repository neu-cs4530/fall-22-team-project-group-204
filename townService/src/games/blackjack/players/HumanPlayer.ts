import Hand from "./Hand";
import { GameStatus } from "./GameStatus";

export default class HumanPlayer {

  private _hand: Hand;

  public _status: GameStatus;

  public get hand(): Hand {
    return this._hand;
  }

  public set hand(value: Hand) {
    this._hand = value;
  }

	constructor() {
    this._hand = new Hand();
    this._status = GameStatus.Waiting;
  }


}
