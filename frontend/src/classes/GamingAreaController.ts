import { EventEmitter } from 'events';
import TypedEventEmitter from 'typed-emitter';
import { GamingArea } from '../types/CoveyTownSocket';
import { Card, PlayerHand } from '../types/CoveyTownSocket';

/**
 * The events that a GamingAreaController can emit
 */
export type GamingAreaEvents = {
  /**
   * A cardUpdateChange indicates whether a player chooses to hit or stay. The back end should
   * confirm whether the player provided is currently playing, and update the game's status
   * dependant on whether the player hit (true) or stayed (false)
   */
  cardUpdateChange: (playerId: string, hit: boolean) => void;

  dealerHandChange: (dealerHand: Card[]) => void;
  playerHandsChange: (playerHands: PlayerHand[]) => void;
};

/**
 * A GamingAreaController manages the state for a GamingArea in the frontend app, serving as a bridge between the
 * blackjack game on the player's browser and the backend representation of the game, ensuring that all players
 * are experiencing the same game state
 *
 * The GamingAreaController implements callbacks that handle events from the game in this browser window, and
 * emits updates when the state is updated, @see GamingAreaEvents
 */
export default class GamingAreaController extends (EventEmitter as new () => TypedEventEmitter<GamingAreaEvents>) {
  private _model: GamingArea;

  /**
   * Constructs a new GamingAreaController
   */
  constructor(model: GamingArea) {
    super();
    this._model = model;
  }

  /**
   * Returns the id of the GamingArea
   */
  public get id() {
    return this._model.id;
  }

  /**
   * Returns a list of Suit/Value pairs in the dealer's hand
   */
  public get dealerHand() {
    return this._model.dealerHand;
  }

  /**
   * Sets the dealer's hand
   */
  public set dealerHand(dealerHand: Card[]) {
    if (this.dealerHand != dealerHand) {
      this._model.dealerHand = dealerHand;
      this.emit('dealerHandChange', this.dealerHand);
    }
  }

  /**
   * Returns a list of Suit/Value pairs for each player's hand
   */
  public get playerHands() {
    return this._model.playerHands;
  }

  /**
   * Sets the dealer's hand
   */
  public set playerHands(playerHands: PlayerHand[]) {
    if (this.playerHands != playerHands) {
      this._model.playerHands = playerHands;
      this.emit('playerHandsChange', this.playerHands);
    }
  }

  /**
   * Indicates how the player wants to advance their turn (hit: true, stay: false)
   *
   * @param playerId the id of the current player
   * @param hit how the player advances their turn (hit or stay)
   */
  public advanceTurn(playerId: string, hit: boolean): void {
    this.emit('cardUpdateChange', playerId, hit);
  }

  /**
   * Applies updates to this gaming area controller's model, setting the fields
   * playerHands and dealerHand
   *
   * @param updatedModel
   */
  public updateFrom(updatedModel: GamingArea): void {
    this.playerHands = updatedModel.playerHands;
    this.dealerHand = updatedModel.dealerHand;
  }

  /**
   * @returns GamingArea that represents the current state of this GamingAreaController
   */
  public gamingAreaModel(): GamingArea {
    return this._model;
  }
}
