import Card from "../../cards/Card";
import { Suit, SUITS } from "../../cards/Suit";
import { Value, VALUES } from "../../cards/Value";

export default class BlackJack {

  public _masterDeck: Card[][];

  public getDeck(): Card[] {
    const deck: Card[] = [];
    SUITS.forEach(suit => {
      VALUES.forEach(value => {
        deck.push(new Card(value, suit));
      })
    })
    return deck;
  }

  public getDecks(amount: number): Card[][] {
    const decks: Card[][] = [];
    Array(amount).fill(0).forEach((_, i) => {
      decks.push(this.getDeck())
    })
    return decks;
  }

  constructor() {
    // 2 decks seems like a reasonable default
    this._masterDeck = this.getDecks(2);
  }

}
