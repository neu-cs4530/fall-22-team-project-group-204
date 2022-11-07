/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable class-methods-use-this */
import Card from '../../cards/Card';
import Hand from './Hand';
import { GameStatus } from './GameStatus';
import { Suit, SUITS } from '../../cards/Suit';
import { Value, VALUES } from '../../cards/Value';
import HumanPlayer from './HumanPlayer';
import Player from './Player';
import CardFactory from '../../cards/CardFactory';
import { BlackjackAction } from '../blackjack/BlackjackAction';
import { SocketAddress } from 'net';

export default class DealerPlayer extends HumanPlayer {
  public _masterDeck: Card[];

  constructor() {
    super();
    this._masterDeck = this.getDecks(2).flat();
    this.shuffleDecks();
  }

  public getDecks(amount: number): Card[][] {
    const decks: Card[][] = [];
    Array(amount)
      .fill(0)
      .forEach((_, i) => {
        decks.push(CardFactory.getDeck());
      });
    return decks;
  }

  public shuffleDeck(deck: Card[]): Card[] {
    return deck
      .map(card => ({ card, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ card }) => card);
  }

  public shuffleDecks(): void {
    this._masterDeck = this.shuffleDeck(this._masterDeck);
  }

  private popCard(): Card {
    const card = this._masterDeck.pop();
    if (!card) {
      throw new Error('No more cards left!');
    }
    return card;
  }

  private getStarterHand(isFirstHidden = false): [Card, boolean][] {
    return [
      [this.popCard(), isFirstHidden],
      [this.popCard(), false],
    ];
  }

  // Deals 2 cards to every player in the input array, and then deals 2 cards
  // to itself. Throws an error if the input array is empty
  public dealCards(players: HumanPlayer[]): void {
    if (!players || players.length === 0) {
      throw new Error("Can't play Blackjack with 0 people!");
    }
    players.forEach(player => {
      if (this._masterDeck.length < 2) {
        throw new Error('');
      }
      player.hand = new Hand(this.getStarterHand());
    });

    this.hand.cards = this.getStarterHand(true);
  }

  private willHit(): boolean {
    const scores = super.getNumericScore().filter(score => score < 18);
    return scores.length > 0;
  }

  public doRound(players: HumanPlayer[]): void {
    return this.doTurns(players);
  }

  public doTurns(players: HumanPlayer[]): void {
    if (!players || players.length === 0) {
      throw new Error("Can't play Blackjack with 0 people!");
    }
    players.forEach(async player => {
      // If they hit or stay do the correct thing
      const chosenAction: BlackjackAction = await player.doTurn();
      // replace if with switch statement (i forgot the syntax)
      if (chosenAction === BlackjackAction.Hit) {
        player.addCard(this.popCard());
      }

      if (player.has21()) {
        player.status = GameStatus.Won;
        // need to break/end game right here
      } else if (player.hasBusted()) {
        player.status = GameStatus.Lost;
      }
    });

    if (this.willHit()) {
      super.addCard(this.popCard());
    }

    if (super.has21()) {
      super.status = GameStatus.Won;
    } else if (super.hasBusted()) {
      super.status = GameStatus.Lost;
    }
  }
}
