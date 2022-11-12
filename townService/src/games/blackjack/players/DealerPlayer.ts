/* eslint-disable no-else-return */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable class-methods-use-this */
import Card from '../../cards/Card';
import Hand from './Hand';
import GameStatus from './GameStatus';
import HumanPlayer from './HumanPlayer';
import CardFactory from '../../cards/CardFactory';
import BlackjackAction from '../blackjack/BlackjackAction';

export default class DealerPlayer extends HumanPlayer {
  public _masterDeck: Card[];

  constructor() {
    super();
    this._masterDeck = DealerPlayer.getDecks(2).flat();
    this.shuffleDecks();
  }

  public get hand(): Hand {
    return super.hand;
  }

  public set hand(value: Hand) {
    super.hand = value;
  }

  public get status(): GameStatus {
    return super.status;
  }

  public set status(status: GameStatus) {
    super.status = status;
  }

  public get deck(): Card[] {
    return this._masterDeck;
  }

  public static getDecks(amount: number): Card[][] {
    const decks: Card[][] = [];
    Array(amount)
      .fill(0)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .forEach(_ => {
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

  private getStarterHand(isFirstHidden = true): [Card, boolean][] {
    return [
      [this.popCard(), isFirstHidden],
      [this.popCard(), true],
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

    this.hand.cards = this.getStarterHand(false);
  }

  private willHit(): boolean {
    const scores = super.getNumericScore().filter(score => score < 18);
    return scores.length > 0;
  }

  public async doRound(players: HumanPlayer[]): Promise<void> {
    await this.doTurns(players);
  }

  public async doHumanTurns(players: HumanPlayer[]): Promise<void> {
    for (const player of players) {
      // If they hit or stay do the correct thing
      // eslint-disable-next-line no-await-in-loop
      const chosenAction: BlackjackAction = await player.doTurn();
      // replace if with switch statement (i forgot the syntax)
      if (chosenAction === BlackjackAction.Hit) {
        player.addCard(this.popCard());
      }
      if (player.has21()) {
        player.status = GameStatus.Won;
        return;
        // need to break/end game right here
      } else if (player.hasBusted()) {
        player.status = GameStatus.Lost;
      }
    }
  }

  public addCard(newCard: Card): void {
    super.addCard(newCard, super.hand.cards.length !== 0);
  }

  private isGameOver(players: HumanPlayer[]): boolean {
    return (
      players.some(player => player.status === GameStatus.Won) ||
      players.every(player => player.status === GameStatus.Lost)
    );
  }

  public async doTurns(players: HumanPlayer[]): Promise<void> {
    if (!players || players.length === 0) {
      throw new Error("Can't play Blackjack with 0 people!");
    }

    await this.doHumanTurns(players);

    if (this.isGameOver(players)) {
      return;
    }

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
