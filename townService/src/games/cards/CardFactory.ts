import Card from "./Card";
import { Suit } from "./Suit";
import { Value, VALUES } from "./Value";

// this is essentially a factory that is sort of like a singleton
export default class CardFactory {

  private static _cards: Map<Suit, Array<Card>> = new Map<Suit, Array<Card>>([
    [Suit.Clubs, VALUES.map(value => new Card(value, Suit.Clubs))],
    [Suit.Diamonds, VALUES.map(value => new Card(value, Suit.Diamonds))],
    [Suit.Hearts,  VALUES.map(value => new Card(value, Suit.Hearts))],
    [Suit.Spades,  VALUES.map(value => new Card(value, Suit.Spades))]
  ]);

  public static getCard(value: Value, suit: Suit): Card {
    const cards = this._cards.get(suit);
    if (!cards) {
      throw new Error(`Invalid suit: ${suit}`);
    }
    const card = cards.find(card => card._value === value);
    if (!card) {
      throw new Error(`Invalid value: ${suit}`);
    }
    return card;
  }

  public static getDeck(): Card[] {
    const cards: Card[] = [];
    this._cards.forEach((cardsInSuit: Array<Card>) => {
      cards.push(...cardsInSuit);
    });
    return cards;
  }


}
