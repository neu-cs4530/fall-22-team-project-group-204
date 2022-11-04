import Card from "../../cards/Card";

export default class Hand {

  // remind me to explain why i did it this way
  private _cards: [Card, Boolean][];

  public get cards(): [Card, Boolean][] {
    // there is most certainly a better way to do this
    return this._cards;
  }

  public set cards(value: [Card, Boolean][]) {
    this._cards = value;
  }

	constructor(cards: [Card, Boolean][] = []) {
    this._cards = cards;
  }



}
