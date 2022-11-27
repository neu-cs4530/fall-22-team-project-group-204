import { nanoid } from 'nanoid';
import Card from '../../cards/Card';
import Hand from './Hand';
import GameStatus from './GameStatus';
import HumanPlayer from './HumanPlayer';
import CardFactory from '../../cards/CardFactory';
import BlackjackAction from '../blackjack/BlackjackAction';

enum PlayerStatusUpdateType {
  UpdatedToWon,
  UpdatedToLost,
  Nothing,
}

export default class DealerPlayer extends HumanPlayer {
  private _masterDeck: Card[];

  constructor(status: GameStatus = GameStatus.Waiting, id: string = nanoid()) {
    super(status, id);
    this._masterDeck = DealerPlayer.getDecks(6).flat();
    this.shuffleDecks();
  }

  public get id(): string {
    return super.id;
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

  public updateDealer(newDealer: DealerPlayer): void {
    this._masterDeck = newDealer.deck;
    this.hand = newDealer.hand;
    this.status = newDealer.status;
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

  public updateCards(cards: Card[]): void {
    this.hand.updateCards(cards);
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
      const otherPlayers = players.filter(p => p !== player);
      let playerUpdateStatus = this._updatePlayerStatusAndReport(player, otherPlayers);
      if (playerUpdateStatus === PlayerStatusUpdateType.UpdatedToLost) {
        // eslint-disable-next-line no-continue
        continue;
      } else if (playerUpdateStatus === PlayerStatusUpdateType.UpdatedToWon) {
        return;
      }
      // If they hit or stay do the correct thing
      const chosenAction: BlackjackAction = await player.doTurn();
      // replace if with switch statement (i forgot the syntax)
      if (chosenAction === BlackjackAction.Hit) {
        player.addCard(this._popCard());
      }
      playerUpdateStatus = this._updatePlayerStatusAndReport(player, otherPlayers);
      if (playerUpdateStatus === PlayerStatusUpdateType.UpdatedToWon) {
        return;
      }
    }
  }

  // Update's the players status if needed and reports if the game
  // needs to be exited early
  private _updatePlayerStatusAndReport(
    player: HumanPlayer,
    otherPlayers: HumanPlayer[],
  ): PlayerStatusUpdateType {
    if (player.has21()) {
      player.status = GameStatus.Won;
      // this._setEveryoneElseToLost(otherPlayers);
      return PlayerStatusUpdateType.UpdatedToWon;
    }
    if (otherPlayers.every(p => p.status === GameStatus.Lost) && super.status === GameStatus.Lost) {
      player.status = GameStatus.Won;
      return PlayerStatusUpdateType.UpdatedToWon;
    }
    if (player.hasBusted()) {
      player.status = GameStatus.Lost;
      return PlayerStatusUpdateType.UpdatedToLost;
    }
    return PlayerStatusUpdateType.Nothing;
  }

  public addCard(newCard: Card): void {
    super.addCard(newCard, super.hand.cards.length !== 0);
  }

  private _isGameOver(players: HumanPlayer[]): boolean {
    // make this a method and set said players GameStatus to Won
    const allButOneBusted = this._allButOneBusted(players);
    const allButDealerBusted = this._allButDealerBusted(players);
    const allBusted = this._allBusted(players);
    const somePlayerWon = players.some(player => player.status === GameStatus.Won);
    const dealerWon = this.status === GameStatus.Won;
    return allButOneBusted || allButDealerBusted || allBusted || somePlayerWon || dealerWon;
  }

  private _allBusted(players: HumanPlayer[]): boolean {
    return (
      players.every(player => player.status === GameStatus.Lost) && this.status === GameStatus.Lost
    );
  }

  private _allButOneBusted(players: HumanPlayer[]): boolean {
    let idxToUpdate = -1;
    let count = 0;
    for (let i = 0; i < players.length; i++) {
      if (players[i].status === GameStatus.Lost) {
        count += 1;
      } else {
        idxToUpdate = i;
      }
    }

    if (count === players.length - 1 && this.status === GameStatus.Lost && idxToUpdate !== -1) {
      players[idxToUpdate].status = GameStatus.Won;
      this._setEveryoneElseToLost(players.filter(p => p !== players[idxToUpdate]));
      return true;
    }
    return false;
  }

  private _allButDealerBusted(players: HumanPlayer[]): boolean {
    const allBusted = players.every(player => player.status === GameStatus.Lost);
    if (allBusted && this.status !== GameStatus.Lost) {
      this.status = GameStatus.Won;
      return true;
    }
    return false;
  }

  public advanceGame(players: HumanPlayer[], playerId: string, action: BlackjackAction): void {
    if (!players || players.length === 0) {
      throw new Error("Can't play Blackjack with 0 people!");
    }

    const player = players.find(p => p.id === playerId);
    const playerIndex = players.indexOf(player);
    const otherPlayers = players.filter(p => p !== player);
    if (!player) {
      throw new Error("This is not a valid player's id!");
    }

    let playerUpdateStatus = this._updatePlayerStatusAndReport(player, otherPlayers);
    const wonLost = [PlayerStatusUpdateType.UpdatedToLost, PlayerStatusUpdateType.UpdatedToWon];
    if (wonLost.includes(playerUpdateStatus)) {
      return;
    }

    if (action === BlackjackAction.Hit) {
      player.addCard(this._popCard());
    }
    playerUpdateStatus = this._updatePlayerStatusAndReport(player, otherPlayers);

    if (players.indexOf(player) === players.length - 1) {
      if (super.hasBusted()) {
        this.status = GameStatus.Lost;
      }
  
      if (this._isGameOver(players)) {
        // again - will remove this and refactor once we come to a better conclusion
        // for what to do in the case of multiple winners at the same time
        if (super.status !== GameStatus.Won) {
          this.status = GameStatus.Lost;
        }
        return;
      }
  
      if (this._willHit()) {
        super.addCard(this._popCard());
      }
  
      if (super.has21()) {
        this.status = GameStatus.Won;
        this._setEveryoneElseToLost(players);
      } else if (super.hasBusted()) {
        this.status = GameStatus.Lost;
      }
    };
  }

  public async doTurns(players: HumanPlayer[]): Promise<void> {
    if (!players || players.length === 0) {
      throw new Error("Can't play Blackjack with 0 people!");
    }

    await this.doHumanTurns(players);

    if (super.hasBusted()) {
      this.status = GameStatus.Lost;
    }

    if (this._isGameOver(players)) {
      // again - will remove this and refactor once we come to a better conclusion
      // for what to do in the case of multiple winners at the same time
      if (super.status !== GameStatus.Won) {
        this.status = GameStatus.Lost;
      }
      return;
    }

    if (this._willHit()) {
      super.addCard(this._popCard());
    }

    if (super.has21()) {
      this.status = GameStatus.Won;
      this._setEveryoneElseToLost(players);
    } else if (super.hasBusted()) {
      this.status = GameStatus.Lost;
    }
  }
}
