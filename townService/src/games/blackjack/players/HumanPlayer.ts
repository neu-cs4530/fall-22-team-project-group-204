import Hand from "./Hand";

export default class HumanPlayer {

  private _hand: Hand;

  public get hand(): Hand {
    return this._hand;
  }

  public set hand(value: Hand) {
    this._hand = value;
  }

	constructor() {
    this._hand = new Hand();
  }


}
