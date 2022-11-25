import { EventEmitter } from 'events';
import TypedEventEmitter from 'typed-emitter';
import { BlackjackArea } from '../types/CoveyTownSocket';
import { BlackjackPlayer } from '../types/CoveyTownSocket';
import _ from 'lodash';

/**
 * The events that a GamingAreaController can emit
 */
export type GamingAreaEvents = {
  dealerChange: (dealer: BlackjackPlayer) => void;
  playersChange: (players: BlackjackPlayer[]) => void;
  gameStatusChange: (gameStatus: string) => void;
  activeGameAlert: (isPlaying: boolean) => void;
};

/**
 * A GamingAreaController manages the state for a BlackjackArea in the frontend app, serving as a bridge between the
 * blackjack game on the player's browser and the backend representation of the game, ensuring that all players
 * are experiencing the same game state
 *
 * The GamingAreaController implements callbacks that handle events from the game in this browser window, and
 * emits updates when the state is updated, @see GamingAreaEvents
 */
export default class GamingAreaController extends (EventEmitter as new () => TypedEventEmitter<GamingAreaEvents>) {
  private _model: BlackjackArea;

  /**
   * Constructs a new GamingAreaController
   */
  constructor(model: BlackjackArea) {
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
   * Returns a list of PlayingCards in the dealer's hand
   */
  public get dealer() {
    return this._model.dealer;
  }

  /**
   * Sets the dealer's hand
   */
  public set dealer(dealer: BlackjackPlayer) {
    if (
      dealer.hand.length !== this.dealer.hand.length ||
      _.xor(dealer.hand, this.dealer.hand).length > 0
    ) {
      this._model.dealer = dealer;
      this.emit('dealerChange', this.dealer);
    }
  }

  /**
   * Returns a list of BlackjackPlayers
   */
  public get players() {
    return this._model.players;
  }

  /**
   * Sets the players' hands
   */
  public set players(players: BlackjackPlayer[]) {
    if (players.length !== this.players.length || _.xor(players, this.players).length > 0) {
      this._model.players = players;
      this.emit('playersChange', this.players);
    }
  }

  /**
   * Returns the game's status
   */
  public get gameStatus() {
    return this._model.gameStatus;
  }

  /**
   * Sets the game's status
   */
  public set gameStatus(gameStatus: string) {
    if (this.gameStatus != gameStatus) {
      this._model.gameStatus = gameStatus;
      this.emit('gameStatusChange', this.gameStatus);
    }
  }

  /**
   * Joins the game of blackjack if the player isn't already in the game
   * Leaves the game of blackjack if the player is already in the game
   *
   * @param playerId id of player trying to join
   */
  public toggleJoinGame(playerId: string): boolean {
    const player = this.players.find(playerHand => playerHand.id === playerId);
    if (!player) {
      if (this.gameStatus === 'Playing') {
        this.emit('activeGameAlert', true);
        console.log('activeGameAlert');
        return false;
      } else {
        this.players.push({ id: playerId, hand: [] });
        this.emit('playersChange', this.players);
        console.log('playersChange');
        return true;
      }
    } else {
      if (this.gameStatus === 'Playing') {
        this.emit('activeGameAlert', false);
        console.log('activeGameAlert');
        return false;
      } else {
        this.players = this.players.filter(playerHand => playerHand.id !== playerId);
        this.emit('playersChange', this.players);
        console.log('playersChange');
        return true;
      }
    }
  }

  /**
   * Applies updates to this gaming area controller's model, setting the fields
   * players and dealer
   *
   * @param updatedModel
   */
  public updateFrom(updatedModel: BlackjackArea): void {
    this.players = updatedModel.players;
    this.dealer = updatedModel.dealer;
    this.gameStatus = updatedModel.gameStatus;
  }

  /**
   * @returns BlackjackArea that represents the current state of this GamingAreaController
   */
  public gamingAreaModel(): BlackjackArea {
    return this._model;
  }
}
