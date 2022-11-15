import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
import {
  BoundingBox,
  TownEmitter,
  GamingArea as GamingAreaModel,
  PlayingCard,
  PlayerHand,
} from '../types/CoveyTownSocket';
import InteractableArea from './InteractableArea';
import BlackJack from '../games/blackjack/blackjack/Blackjack';
import DealerPlayer from '../games/blackjack/players/DealerPlayer';
import HumanPlayer from '../games/blackjack/players/HumanPlayer';
import Hand from '../games/blackjack/players/Hand';

export default class GamingArea extends InteractableArea {
  private _dealerHand: PlayingCard[];

  private _playerHands: PlayerHand[];

  private _game: BlackJack;

  private _gameIsActive: boolean;

  public get dealerHand() {
    return this._dealerHand;
  }

  public get playerHands() {
    return this._playerHands;
  }

  /**
   * Creates a new GamingArea
   * @param gamingArea represents a gamingArea with id, dealer hand, and player hands
   * @param coordinates the bounding box that defines this viewing area
   * @param townEmitter a broadcast emitter that can be used to emit updates to players
   */
  public constructor(
    { id, dealerHand, playerHands }: GamingAreaModel,
    coordinates: BoundingBox,
    townEmitter: TownEmitter,
  ) {
    super(id, coordinates, townEmitter);
    this._dealerHand = dealerHand;
    this._playerHands = playerHands;
    this._game = new BlackJack();
    this._gameIsActive = false;
  }

  /**
   * Updates the state of this GamingArea, setting the dealerHand and playerHands
   *
   * @param gamingArea updated model
   */
  public updateModel({ dealerHand, playerHands }: GamingAreaModel) {
    this._dealerHand = dealerHand;
    this._playerHands = playerHands;
    // NOTE: please change to support more players / keeping track of game is active
    this._playerHands.forEach(playerHand => {
      if (playerHand.hand.length === 0) {
        this._game.addPlayer(new HumanPlayer(playerHand.id));
        this._game.playGame();
      }
    });
  }

  // NOTE: refactor for array order checking later
  /**
   * Obtains a model from the Blackjack backend whenever players or dealer are updated
   *
   * @param gamingArea
   */
  public updateFromBlackjack(dealer: DealerPlayer, players: HumanPlayer[]) {
    this._dealerHand = GamingArea.handToListOfPlayingCards(dealer.hand);
    this._playerHands = GamingArea.playersToPlayerHands(players);
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
      playingCards.push({ suit: card[0].suit.toString(), value: card[0].value.toString() });
    });
    return playingCards;
  }

  /**
   * Static method that help converts each player's hand from Blackjack into a usable format
   * @param players The players
   * @returns a list of PlayerHands for each player
   */
  public static playersToPlayerHands(players: HumanPlayer[]): PlayerHand[] {
    const playerHands: PlayerHand[] = [];
    players.forEach(player => {
      playerHands.push({ hand: GamingArea.handToListOfPlayingCards(player.hand), id: player.id });
    });
    return playerHands;
  }

  /**
   * Convert this GamingArea instance to a simple GamingAreaModel suitable for
   * transporting over a socket to a client.
   */
  public toModel(): GamingAreaModel {
    return {
      id: this.id,
      dealerHand: this._dealerHand,
      playerHands: this._playerHands,
    };
  }

  /**
   * Creates a new GamingArea object that will represent a Gaming Area object in the town map.
   * @param mapObject An ITiledMapObject that represents a rectangle in which this gaming area exists
   * @param townEmitter An emitter that can be used by this gaming area to broadcast updates to players in the town
   * @returns
   */
  public static fromMapObject(mapObject: ITiledMapObject, townEmitter: TownEmitter): GamingArea {
    const { name, width, height } = mapObject;
    if (!width || !height) {
      throw new Error(`Malformed viewing area ${name}`);
    }
    const dealerHand: PlayingCard[] = [];
    const playerHands: PlayerHand[] = [];
    const rect: BoundingBox = { x: mapObject.x, y: mapObject.y, width, height };
    return new GamingArea({ id: name, playerHands, dealerHand }, rect, townEmitter);
  }
}
