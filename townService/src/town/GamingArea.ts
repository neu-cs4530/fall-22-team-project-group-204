import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
import {
  BoundingBox,
  TownEmitter,
  GamingArea as GamingAreaModel,
  Card,
  PlayerHand,
} from '../types/CoveyTownSocket';
import InteractableArea from './InteractableArea';

export default class GamingArea extends InteractableArea {
  private _dealerHand: Card[];

  private _playerHands: PlayerHand[];

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
  }

  /**
   * Updates the state of this GamgArea, setting the dealerHand and playerHands
   *
   * @param gamingArea updated model
   */
  public updateModel({ dealerHand, playerHands }: GamingAreaModel) {
    this._dealerHand = dealerHand;
    this._playerHands = playerHands;
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
    const dealerHand: Card[] = [];
    const playerHands: PlayerHand[] = [];
    const rect: BoundingBox = { x: mapObject.x, y: mapObject.y, width, height };
    return new GamingArea({ id: name, playerHands, dealerHand }, rect, townEmitter);
  }
}
