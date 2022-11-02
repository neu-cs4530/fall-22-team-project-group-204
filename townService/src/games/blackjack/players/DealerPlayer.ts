import Card from "../../cards/Card";
import Hand from "./Hand";
import { GameStatus } from "./GameStatus";
import { Suit, SUITS } from "../../cards/Suit";
import { Value, VALUES } from "../../cards/Value";
import HumanPlayer from "./HumanPlayer";

export default class DealerPlayer {

  public _masterDeck: Card[];

  public _hand: Hand;

  public _status: GameStatus;

  public get hand(): Hand {
    return this._hand;
  }

  private set hand(value: Hand) {
    this._hand = value;
  }

	constructor() {
    // 2 decks seems like a reasonable default
    this._masterDeck = this.getDecks(2).flat()
    this.shuffleDecks();
    this._hand = new Hand();
    this._status = GameStatus.Waiting
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
      player.hand = new Hand([this.popCard(), this.popCard()]);
    })

    this._hand.cards = [this.popCard(), this.popCard()];

  }


}
