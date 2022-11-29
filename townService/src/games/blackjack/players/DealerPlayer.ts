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
      if (player.getMaxScore() === 21) player.status = GameStatus.Won;
    });

    this.hand.cards = this._getStarterHand(false);
  }

  private _willHit(): boolean {
    const scores = super.getNumericScore().filter(score => score < 18);
    return scores.length > 0;
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
  private _updatePlayerStatusAndReport(player: HumanPlayer, otherPlayers: HumanPlayer[]): PlayerStatusUpdateType {
    if (player.has21()) {
      player.status = GameStatus.Won;
      // eslint-disable-next-line prettier/prettier
      if (otherPlayers.length === 0 || otherPlayers.every(thePlayer => thePlayer.status === GameStatus.Lost)) {
        this.status = GameStatus.Lost;
      }
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

  private static _wonOrLost(status: PlayerStatusUpdateType): boolean {
    return status === PlayerStatusUpdateType.UpdatedToLost || status === PlayerStatusUpdateType.UpdatedToWon;
  }

  private static _nothing(status: PlayerStatusUpdateType): boolean {
    return status === PlayerStatusUpdateType.Nothing;
  }

  private static _remainingPlayersDone(players: HumanPlayer[]): boolean {
    return players.every(player => player.status === GameStatus.Won || player.status === GameStatus.Lost);
  }

  private static _onlyPlayer(players: HumanPlayer[]): boolean {
    return players.length === 1;
  }

  private _unhideFirstCard(): void {
    this.hand.cards[0][1] = true;
  }

  public advanceGame(players: HumanPlayer[], playerId: string, action: BlackjackAction): void {
    if (!players || players.length === 0) {
      throw new Error("Can't play Blackjack with 0 people!");
    }

    const player = players.find(p => p.id === playerId);
    const otherPlayers = players.filter(p => p !== player);
    if (!player) {
      throw new Error("This is not a valid player's id!");
    }

    // updates status and then checks if it is won or loss
    // NOTE: I am assuming that the players status has already been checked or that they immediately got 21
    // if this check is true, and in that case we don't need to worry about updating the dealers status
    if (DealerPlayer._wonOrLost(this._updatePlayerStatusAndReport(player, otherPlayers))) return;

    if (action === BlackjackAction.Hit) {
      player.addCard(this._popCard());
      if (DealerPlayer._nothing(this._updatePlayerStatusAndReport(player, otherPlayers))) return;
    }

    // so if we are here then 1 of 3 things MUST be true
    // 1. We hit and busted (If this is true and we are the only player, we will immediately set the dealers status to won and return)
    // 2. We hit and got 21 (If this is true and we are the only player, it is still possible for the dealer to win - if they had 21 in less cards)
    // 3. We stayed
    // In all three cases we may want to updates the dealers status, so we go through with this check

    if (!DealerPlayer._remainingPlayersDone(otherPlayers)) return;

    // note that I am passing the original players array here, so if it has length 1 we are the only player
    if (DealerPlayer._onlyPlayer(players) && player.status === GameStatus.Lost) {
      this._unhideFirstCard();
      this.status = GameStatus.Won;
      return;
    }

    while (this._willHit()) {
      super.addCard(this._popCard());
    }

    this._unhideFirstCard();

    if (super.hasBusted()) {
      this.status = GameStatus.Lost;
      // If the dealer busts, all remaining player hands win. If the dealer does not bust,
      // each remaining bet wins if its hand is higher than the dealer's and loses if it is lower. - from wikipedia
      players.forEach(p => {
        p.status = GameStatus.Won;
      });
    }

    const dealerScore = super.getMaxScore();
    const maxPlayerScore = Math.max(...players.map(p => p.getMaxScore()));
    if (super.has21() || dealerScore > maxPlayerScore) {
      this.status = GameStatus.Won;
      this._setEveryoneElseToLost(players, true);
    } else {
      this.status = GameStatus.Lost;
      players.forEach(p => p.compareToDealerScoreAndUpdate(dealerScore));
    }
  }
}
