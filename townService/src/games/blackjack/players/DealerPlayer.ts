import Card from "../../cards/Card";
import Hand from "./Hand";
import { GameStatus } from "./GameStatus";
import { Suit, SUITS } from "../../cards/Suit";
import { Value, VALUES } from "../../cards/Value";
import HumanPlayer from "./HumanPlayer";
import Player from "./Player";

export default class DealerPlayer extends HumanPlayer {

  public _masterDeck: Card[];

  constructor() {
    super()
    this._masterDeck = this.getDecks(2).flat()
    this.shuffleDecks()
  }

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

  public shuffleDeck(deck: Card[]): Card[] {
    return deck.map(card => ({card, sort: Math.random() }))
               .sort((a, b) => a.sort - b.sort)
               .map(({ card }) => card)
  }

  public shuffleDecks(): void {
    this._masterDeck = this.shuffleDeck(this._masterDeck)
  }

  private popCard(): Card {
    const card = this._masterDeck.pop();
    if (!card) {
      throw new Error("No more cards left!")
    }
    return card;

  }

  private getStarterHand(): [Card, Boolean][] {
    return [[this.popCard(), true], [this.popCard(), false]]
  }

  // Deals 2 cards to every player in the input array, and then deals 2 cards
  // to itself. Throws an error if the input array is empty
  public dealCards(players: HumanPlayer[]): void {
    if (!players || players.length === 0) {
      throw new Error("Can't play Blackjack with 0 people!");
    }
    players.forEach(player => {
      if (this._masterDeck.length < 2) {
        throw new Error("")
      }
      player.hand = new Hand(this.getStarterHand());
    })

    this.hand.cards = this.getStarterHand();

  }
}
