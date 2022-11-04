import Hand from "./Hand";
import { GameStatus } from "./GameStatus";
import Player from "./Player";

export default class HumanPlayer extends Player {

  private _hand: Hand;

  public get hand(): Hand {
    return this._hand;
  }

  public set hand(value: Hand) {
    this._hand = value;
  }

	constructor() {
    super(GameStatus.Waiting);
    this._hand = new Hand();
  }


}
