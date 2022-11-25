import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
import {
  BoundingBox,
  TownEmitter,
  BlackjackArea as GamingAreaModel,
  PlayingCard,
  BlackjackPlayer,
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

  private _gameStatus: string;

  private _game: BlackJack;

  public get dealer() {
    return this._dealer;
  }

  public get players() {
    return this._players;
  }

  public get gameStatus() {
    return this._gameStatus;
  }

  /**
   * Creates a new GamingArea
   * @param gamingArea represents a gamingArea with id, dealer, and players
   * @param coordinates the bounding box that defines this viewing area
   * @param townEmitter a broadcast emitter that can be used to emit updates to players
   */
  public constructor(
    { id, dealer, players, gameStatus }: GamingAreaModel,
    coordinates: BoundingBox,
    townEmitter: TownEmitter,
  ) {
    super(id, coordinates, townEmitter);
    this._dealer = dealer;
    this._players = players;
    this._gameStatus = gameStatus;
    const dealerProper = new DealerPlayer(GameStatus.Waiting, dealer.id);
    const playersProper = players.map(player => new HumanPlayer(GameStatus.Waiting, player.id));
    this._game = new BlackJack(playersProper, dealerProper, this);
  }

  /**
   * Updates the state of this BlackjackArea, setting the dealer and players
   *
   * @param gamingArea updated model
   */
  public updateModel({ dealer, players, gameStatus }: GamingAreaModel) {
    // console.log('updateModelCalled');
    this._dealer = dealer;
    let startGame = false;
    if (this._players.length === 0 && players.length > 0) {
      startGame = true;
    }
    this._players = players;
    this._gameStatus = gameStatus;
    // NOTE: please change to support more players / keeping track of game is active
    this._players.forEach(playerHand => {
      if (playerHand.hand.length === 0 && this._game.dealer.status !== GameStatus.Playing) {
        // TODO: Figure out correct status here
        this._game.addPlayer(new HumanPlayer(GameStatus.Waiting, playerHand.id));
        // console.log(`added ${playerHand.id}`);
      } else {
        // console.log('trying to join an existing game');
        // NOTE: send some alert to the player somehow
      }
    });
    if (startGame) {
      this._game.playGame();
    }
  }

  // NOTE: refactor for array order checking later
  /**
   * Obtains a model from the Blackjack backend whenever players or dealer are updated
   *
   * @param dealer the dealer player
   * @param players the human players
   */
  public updateFromBlackjack(dealer: DealerPlayer, players: HumanPlayer[], status: string) {
    this._dealer = { id: dealer.id, hand: BlackjackArea.handToListOfPlayingCards(dealer.hand) };
    this._players = BlackjackArea.playersToBlackjackPlayers(players);
    this._gameStatus = status;
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
      gameStatus: this._gameStatus,
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
    const dealer: BlackjackPlayer = { id: '0', hand: [] };
    const players: BlackjackPlayer[] = [];
    const rect: BoundingBox = { x: mapObject.x, y: mapObject.y, width, height };
    return new BlackjackArea(
      { id: name, players, dealer, gameStatus: 'Waiting' },
      rect,
      townEmitter,
    );
  }
}
