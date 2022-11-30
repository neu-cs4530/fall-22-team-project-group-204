import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
import {
  BoundingBox,
  TownEmitter,
  BlackjackArea as GamingAreaModel,
  PlayingCard,
  BlackjackPlayer,
  BlackjackUpdate,
} from '../types/CoveyTownSocket';
import InteractableArea from './InteractableArea';
// eslint-disable-next-line import/no-cycle
import BlackJack from '../games/blackjack/blackjack/Blackjack';
import DealerPlayer from '../games/blackjack/players/DealerPlayer';
import HumanPlayer from '../games/blackjack/players/HumanPlayer';
import Hand from '../games/blackjack/players/Hand';
import Suit from '../games/cards/Suit';
import Value from '../games/cards/Value';
import GameStatus from '../games/blackjack/players/GameStatus';

export default class BlackjackArea extends InteractableArea {
  private _dealer: BlackjackPlayer;

  private _players: BlackjackPlayer[];

  private _lastUpdate: BlackjackUpdate | undefined;

  // an instance of the current blackjack game
  private _game: BlackJack;

  // time each player has in seconds
  private _timer = 20;

  // id of each player's timeout
  private _timeoutIds: Map<string, NodeJS.Timeout>;

  // tells whether a player timed out recently
  private _timedOut: Map<string, boolean>;

  // notes whether timeouts are enabled
  private _timeoutsEnabled: boolean;

  public get dealer() {
    return this._dealer;
  }

  public get players() {
    return this._players;
  }

  public get update() {
    return this._lastUpdate;
  }

  /**
   * Creates a new GamingArea
   * @param gamingArea represents a gamingArea with id, dealer, and players
   * @param coordinates the bounding box that defines this viewing area
   * @param townEmitter a broadcast emitter that can be used to emit updates to players
   */
  public constructor(
    { id, dealer, players, update }: GamingAreaModel,
    coordinates: BoundingBox,
    townEmitter: TownEmitter,
  ) {
    super(id, coordinates, townEmitter);
    console.log(players);
    this._dealer = dealer;
    this._players = players;
    this._lastUpdate = update;
    const dealerProper = new DealerPlayer(GameStatus.Waiting, dealer.id);
    const playersProper = players.map(player => new HumanPlayer(GameStatus.Waiting, player.id));
    this._game = new BlackJack(playersProper, dealerProper, this);
    this._timeoutIds = new Map<string, NodeJS.Timeout>();
    this._timedOut = new Map<string, boolean>();
    this._timeoutsEnabled = true;
  }

  /**
   * Updates the state of this BlackjackArea, setting the dealer and players
   *
   * @param gamingArea updated model
   */
  public updateModel({ dealer, players, update }: GamingAreaModel) {
    this._dealer = dealer;
    let newUpdate = false;
    this._players = players;
    if (
      this._lastUpdate?.action !== update?.action ||
      this._lastUpdate?.id !== update?.id ||
      this._lastUpdate?.timestamp !== update?.timestamp
    ) {
      newUpdate = true;
    }
    this._lastUpdate = update;
    players.forEach(async p => {
      if (!this._game.players.some(playerProper => playerProper.id === p.id)) {
        await this._game.addPlayer(new HumanPlayer(GameStatus.Waiting, p.id));
      }
    });
    console.log(players);
    this._players.forEach(playerHand => {
      if (
        newUpdate &&
        update !== undefined &&
        update.action !== 'Start' &&
        playerHand.id === update.id &&
        playerHand.gameStatus === 'Playing'
      ) {
        this._game.advanceGame(playerHand.id, HumanPlayer.parseNextMove(update.action));
        if (update.action === 'Stay' && this._timeoutsEnabled) {
          this._timedOut.set(playerHand.id, false);
          clearTimeout(this._timeoutIds.get(playerHand.id));
        }
      }
    });

    if (
      newUpdate &&
      update?.action === 'Start' &&
      this.dealer.gameStatus === 'Waiting' &&
      this._players.length > 0 &&
      this._players.map(p => p.id).includes(update.id)
    ) {
      console.log('a');
      console.log(this._players);
      this._players.forEach(async playerHand => {
        if (this._timeoutsEnabled) {
          this._timeoutIds.set(
            playerHand.id,
            setTimeout(() => {
              this._timedOut.set(playerHand.id, true);
              this._game.advanceGame(playerHand.id, HumanPlayer.parseNextMove('Stay'));
              console.log(this._players);
              console.log(players);
            }, this._timer * 1000),
          );
        }
      });
      console.log('b');
      console.log(this._players);
      this._game.startGame();
    }
  }

  /**
   * Disables timeouts from causing asynchronous errors and stops game from restarting
   * Used mostly for testing purposes
   */
  public disableTimeouts() {
    this._timeoutsEnabled = false;
  }

  /**
   * Obtains a model from the Blackjack backend whenever players or dealer are updated
   *
   * @param dealer the dealer player
   * @param players the human players
   */
  public updateFromBlackjack(dealer: DealerPlayer, players: HumanPlayer[]) {
    this._dealer = {
      id: dealer.id,
      hand: BlackjackArea.handToListOfPlayingCards(dealer.hand),
      gameStatus: GameStatus[dealer.status],
    };
    this._players = BlackjackArea.playersToBlackjackPlayers(players);
    if (BlackJack.isGameOver([...players, dealer])) {
      this.endGame();
    } else if (
      dealer.status !== GameStatus.Waiting &&
      dealer.status !== GameStatus.Playing &&
      this._timeoutsEnabled
    ) {
      setTimeout(() => {
        this.endGame();
      }, 5000);
    }
    this._emitAreaChanged();
  }

  /**
   * Ends the game by resetting all players decks and making a new Blackjack instance
   */
  public endGame() {
    this._players.forEach(p => {
      p.gameStatus = 'Waiting';
      p.hand = [];
    });
    this._game.players.forEach(async plyr => {
      if (plyr.status === GameStatus.Won) {
        await plyr.addWin();
      } else if (plyr.status === GameStatus.Lost) {
        await plyr.addLoss();
      }
    });
    if (this._timeoutsEnabled) this._players = this._players.filter(p => !this._timedOut.get(p.id));
    this._dealer = { id: '0', hand: [], gameStatus: 'Waiting' };
    this._game.dealer.hand.cards = [];
    this._game.dealer.status = GameStatus.Waiting;
    this._game.players.forEach(plyr => {
      plyr.hand.cards = [];
      plyr.status = GameStatus.Waiting;
    });
    if (this._timeoutsEnabled) this._timedOut = new Map<string, boolean>();
    this._emitAreaChanged();
  }

  /**
   * Static method that helps convert a dealer's hand from Blackjack into a usable format
   *
   * @param hand The dealer's hand
   * @returns a usable list of PlayingCards
   */
  public static handToListOfPlayingCards(hand: Hand): PlayingCard[] {
    const playingCards: PlayingCard[] = [];
    hand.cards.forEach(card => {
      const { suit, value } = card[0];
      playingCards.push({
        suit: BlackjackArea.suitToString(suit),
        value: BlackjackArea.valueToString(value),
        faceUp: card[1],
      });
    });
    return playingCards;
  }

  /**
   * Converts a Suit to a string
   * @param suit Suit of the card
   * @returns a string representative
   */
  public static suitToString(suit: Suit): string {
    switch (suit) {
      case Suit.Clubs:
        return 'Clubs';
      case Suit.Diamonds:
        return 'Diamonds';
      case Suit.Hearts:
        return 'Hearts';
      case Suit.Spades:
        return 'Spades';
      default:
        return 'unknown';
    }
  }

  /**
   * Converts a value to a string
   *
   * @param value Value of the card
   * @returns a string representative
   */
  public static valueToString(value: Value): string {
    switch (value) {
      case Value.Ace:
        return 'A';
      case Value.King:
        return 'K';
      case Value.Queen:
        return 'Q';
      case Value.Jack:
        return 'J';
      case Value.Ten:
        return '10';
      case Value.Nine:
        return '9';
      case Value.Eight:
        return '8';
      case Value.Seven:
        return '7';
      case Value.Six:
        return '6';
      case Value.Five:
        return '5';
      case Value.Four:
        return '4';
      case Value.Three:
        return '3';
      case Value.Two:
        return '2';
      default:
        return 'unknown';
    }
  }

  /**
   * Static method that help converts each player's hand from Blackjack into a usable format
   * @param players The players
   * @returns a list of BlackjackPlayers for each player
   */
  public static playersToBlackjackPlayers(newPlayers: HumanPlayer[]): BlackjackPlayer[] {
    const players: BlackjackPlayer[] = [];
    newPlayers.forEach(newPlayer => {
      players.push({
        hand: BlackjackArea.handToListOfPlayingCards(newPlayer.hand),
        id: newPlayer.id,
        gameStatus: GameStatus[newPlayer.status],
      });
    });
    return players;
  }

  /**
   * Convert this BlackjackArea instance to a simple GamingAreaModel suitable for
   * transporting over a socket to a client.
   */
  public toModel(): GamingAreaModel {
    return {
      id: this.id,
      dealer: this._dealer,
      players: this._players,
      update: this._lastUpdate,
      bettingAmount: 0,
    };
  }

  /**
   * Creates a new BlackjackArea object that will represent a Gaming Area object in the town map.
   * @param mapObject An ITiledMapObject that represents a rectangle in which this gaming area exists
   * @param townEmitter An emitter that can be used by this gaming area to broadcast updates to players in the town
   * @returns
   */
  public static fromMapObject(mapObject: ITiledMapObject, townEmitter: TownEmitter): BlackjackArea {
    const { name, width, height } = mapObject;
    if (!width || !height) {
      throw new Error(`Malformed viewing area ${name}`);
    }
    const dealer: BlackjackPlayer = { id: '0', hand: [], gameStatus: 'Waiting' };
    const players: BlackjackPlayer[] = [];
    const rect: BoundingBox = { x: mapObject.x, y: mapObject.y, width, height };
    return new BlackjackArea(
      { id: name, players, dealer, update: undefined, bettingAmount: 0 },
      rect,
      townEmitter,
    );
  }
}
