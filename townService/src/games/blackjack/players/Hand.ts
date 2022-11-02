import Card from "../../cards/Card";

export default class Hand {

  private _cards: Card[];

  public get cards(): Card[] {
    return this._cards;
  }

  public set cards(value: Card[]) {
    this._cards = value;
  }

	constructor(cards: Card[] = []) {
    this._cards = cards;
  }



}
