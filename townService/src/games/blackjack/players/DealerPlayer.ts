import { nanoid } from 'nanoid';
import Card from '../../cards/Card';
import Hand from './Hand';
import GameStatus from './GameStatus';
import HumanPlayer from './HumanPlayer';
import CardFactory from '../../cards/CardFactory';
import BlackjackAction from '../blackjack/BlackjackAction';

export default class DealerPlayer extends HumanPlayer {
  private _masterDeck: Card[];

  constructor(status: GameStatus = GameStatus.Waiting, id: string = nanoid()) {
    super(status, id);
    this._masterDeck = DealerPlayer.getDecks(6).flat();
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

  public get id(): string {
    return super.id;
  }

  public set id(value: string) {
    super.id = value;
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

  public static shuffleDeck(deck: Card[]): Card[] {
    return deck
      .map(card => ({ card, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ card }) => card);
  }

  public shuffleDecks(): void {
    this._masterDeck = DealerPlayer.shuffleDeck(this._masterDeck);
  }

  private _popCard(): Card {
    const card = this._masterDeck.pop();
    if (!card) {
      throw new Error('No more cards left!');
    }
    return card;
  }

  private _getStarterHand(isFirstHidden = true): [Card, boolean][] {
    return [
      [this._popCard(), isFirstHidden],
      [this._popCard(), true],
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
      player.hand = new Hand(this._getStarterHand());
    });

    this.hand.cards = this._getStarterHand(false);
  }

  private _willHit(): boolean {
    const scores = super.getNumericScore().filter(score => score < 18);
    return scores.length > 0;
  }

  public async doRound(players: HumanPlayer[]): Promise<void> {
    await this.doTurns(players);
  }

  private _setEveryoneElseToLost(players: HumanPlayer[], dealerWon = false): void {
    players.forEach(player => {
      player.status = GameStatus.Lost;
    });

    if (dealerWon) {
      super.status = GameStatus.Lost;
    }
  }

  public async doHumanTurns(players: HumanPlayer[]): Promise<void> {
    const activePlayers = players.filter(player => player.status !== GameStatus.Lost);
    for (const player of activePlayers) {
      // If they hit or stay do the correct thing
      const chosenAction: BlackjackAction = await player.doTurn();
      // replace if with switch statement (i forgot the syntax)
      if (chosenAction === BlackjackAction.Hit) {
        player.addCard(this._popCard());
      }
      // move these three checks into a helper method
      if (player.has21()) {
        player.status = GameStatus.Won;
        this._setEveryoneElseToLost(players.filter(p => p !== player));
        return;
      }
      if (player.hasBusted()) {
        player.status = GameStatus.Lost;
      }

      if (players.filter(p => p !== player).every(p => p.status === GameStatus.Lost)) {
        player.status = GameStatus.Won;
        return;
      }
    }
  }

  public addCard(newCard: Card): void {
    super.addCard(newCard, super.hand.cards.length !== 0);
  }

  private _isGameOver(players: HumanPlayer[]): boolean {
    // make this a method and set said players GameStatus to Won
    const allButOneBusted =
      players.filter(player => player.status === GameStatus.Lost).length === players.length - 1 &&
      this.status === GameStatus.Lost;
    const allButDealerBusted =
      players.every(player => player.status === GameStatus.Lost) && this.status !== GameStatus.Lost;
    const somePlayerWon = players.some(player => player.status === GameStatus.Won);
    const dealerWon = this.status === GameStatus.Won;
    return allButOneBusted || allButDealerBusted || somePlayerWon || dealerWon;
  }

  public async doTurns(players: HumanPlayer[]): Promise<void> {
    if (!players || players.length === 0) {
      throw new Error("Can't play Blackjack with 0 people!");
    }

    await this.doHumanTurns(players);

    if (this._isGameOver(players)) {
      return;
    }

    if (this._willHit()) {
      super.addCard(this._popCard());
    }

    if (super.has21()) {
      super.status = GameStatus.Won;
      this._setEveryoneElseToLost(players);
    } else if (super.hasBusted()) {
      super.status = GameStatus.Lost;
    }
  }
}
