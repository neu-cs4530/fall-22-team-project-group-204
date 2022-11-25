import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
import {
  BoundingBox,
  TownEmitter,
  BlackjackArea as BlackjackAreaModel,
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
  // need to add a proper representation of this to the backend - on my todo list
  private _gameStatus: string;

  private _game: BlackJack;

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
    { id, dealer, players, gameStatus }: BlackjackAreaModel,
    coordinates: BoundingBox,
    townEmitter: TownEmitter,
  ) {
    super(id, coordinates, townEmitter);
    const dealerProper = new DealerPlayer(GameStatus.Waiting, dealer.id);
    const playersProper = players.map(player => new HumanPlayer(GameStatus.Waiting, player.id));
    this._game = new BlackJack(playersProper, dealerProper);
    // I feel a bit weird about this line - we really should be pulling gameStatus from the backend
    // representation of the game. I can't think of a case where the back end would need to know
    // whats going on in the front end (in that sense), but its very possible that said case exists.
    // I'm going to leave this here for now, but I just want to note this for future reference
    this._gameStatus = gameStatus;
  }

  /**
   * Updates the state of this GamingArea, setting the dealerHand and playerHands
   *
   * @param gamingArea updated model
   */
  public updateModel({ id, dealer, players, gameStatus }: BlackjackAreaModel) {
    this._game.dealer = dealer;
  }

  // NOTE: refactor for array order checking later
  /**
   * Obtains a model from the Blackjack backend whenever players or dealer are updated
   *
   * @param dealer the dealer player
   * @param players the human players
   */
  public updateFromBlackjack(dealer: DealerPlayer, players: HumanPlayer[], status: string) {
    this._dealerHand = BlackjackArea.handToListOfPlayingCards(dealer.hand);
    this._playerHands = BlackjackArea.playersToPlayerHands(players);
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
   * Static method that help converts each player's hand from Blackjack into a usable format
   * @param players The players
   * @returns a list of PlayerHands for each player
   */
  public static playersToPlayerHands(players: HumanPlayer[]): PlayerHand[] {
    const playerHands: PlayerHand[] = [];
    players.forEach(player => {
      playerHands.push({
        hand: BlackjackArea.handToListOfPlayingCards(player.hand),
        id: player.id,
      });
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
      gameStatus: this._gameStatus,
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
    return new GamingArea(
      { id: name, playerHands, dealerHand, gameStatus: 'Waiting' },
      rect,
      townEmitter,
    );
  }
}
