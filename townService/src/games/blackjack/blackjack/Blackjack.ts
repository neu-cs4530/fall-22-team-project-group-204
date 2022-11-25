// eslint-disable-next-line import/no-extraneous-dependencies
import mock from 'jest-mock-extended/lib/Mock';
import { TownEmitter } from 'src/types/CoveyTownSocket';
import GameStatus from '../players/GameStatus';
import DealerPlayer from '../players/DealerPlayer';
import HumanPlayer from '../players/HumanPlayer';
// eslint-disable-next-line import/no-cycle
import GamingArea from '../../../town/GamingArea';
import Card from '../../cards/Card';

export default class BlackJack {
  // Going to have this DealerPlayer class handle the responsiblites of the Dealer and the Player.
  // I thought about this for a while, and think this is the best solution, if anyone disagrees lmk.
  private _dealer: DealerPlayer;

  public get dealer(): DealerPlayer {
    return this._dealer;
  }

  // i need to abstract this out to a Player[] where
  // a player is a interface that HumanPlayer and SpectatorPlayer implement.
  // I think that will be easier once I finish implementing this though
  private _players: HumanPlayer[];

  public get players(): HumanPlayer[] {
    return this._players;
  }

  // contains a reference to the GamingArea for sending notifications of changes
  private _gamingArea: GamingArea;

  // default GamingArea should never be used, but is good for testing purpose where gamingArea
  // is irrelevant
  constructor(
    players: HumanPlayer[] = [],
    dealer: DealerPlayer = new DealerPlayer(GameStatus.Waiting, '0'),
    gamingArea: GamingArea = new GamingArea(
      { id: 'invalidId', dealerHand: [], playerHands: [], gameStatus: 'Waiting' },
      { x: 0, y: 0, width: 0, height: 0 },
      mock<TownEmitter>(), // NOTE: may need to change in the future
    ),
  ) {
    this._dealer = dealer;
    this._players = players;
    this._gamingArea = gamingArea;
  }

  public updatePlayerCards(allCards: Card[][]): void {
    this._players.forEach((player, index) => {
      player.updateCards(allCards[index]);
    });
  }

  public addPlayer(player: HumanPlayer): void {
    this._players.push(player);
  }

  // update everyones status to Playing
  private _updateToPlaying(): void {
    const players: HumanPlayer[] = [...this._getActiveHumanPlayers(), this._dealer];
    players.forEach(player => {
      player.status = GameStatus.Playing;
    });
  }

  private _getActiveHumanPlayers(): HumanPlayer[] {
    const humanPlayers: HumanPlayer[] = [];
    this._players.forEach(player => {
      if (player.status === GameStatus.Waiting || player.status === GameStatus.Playing) {
        humanPlayers.push(player as HumanPlayer);
      }
    });
    return humanPlayers;
  }

  private static _isGameOver(players: HumanPlayer[]): boolean {
    return (
      players.some(player => player.status === GameStatus.Won) ||
      players.every(player => player.status === GameStatus.Lost)
    );
  }

  public async playGame(doDealing = true): Promise<void> {
    // maybe check that there is more than 1 player before i start the gameplay loop?
    const players: HumanPlayer[] = this._getActiveHumanPlayers();
    this._updateToPlaying();

    if (doDealing) {
      this._dealer.dealCards(players);
    }

    this._gamingArea.updateFromBlackjack(this._dealer, players, GameStatus[this._dealer.status]);

    while (!BlackJack._isGameOver([...players, this._dealer])) {
      await this._dealer.doTurns(players);
    }
  }
}
