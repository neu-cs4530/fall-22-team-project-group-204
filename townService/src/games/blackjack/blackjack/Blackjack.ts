// eslint-disable-next-line import/no-extraneous-dependencies
import mock from 'jest-mock-extended/lib/Mock';
import { TownEmitter } from 'src/types/CoveyTownSocket';
import GameStatus from '../players/GameStatus';
import DealerPlayer from '../players/DealerPlayer';
import HumanPlayer from '../players/HumanPlayer';
// eslint-disable-next-line import/no-cycle
import BlackjackArea from '../../../town/BlackjackArea';
import Card from '../../cards/Card';
import BlackjackAction from './BlackjackAction';

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

  // contains a reference to the BlackjackArea for sending notifications of changes
  private _gamingArea: BlackjackArea;

  // default BlackjackArea should never be used, but is good for testing purpose where gamingArea
  // is irrelevant
  constructor(
    players: HumanPlayer[] = [],
    dealer: DealerPlayer = new DealerPlayer(GameStatus.Waiting, '0'),
    gamingArea: BlackjackArea = new BlackjackArea(
      {
        id: 'invalidId',
        dealer: { id: 'dealer', hand: [], gameStatus: 'Waiting' },
        players: [],
        update: undefined,
        bettingAmount: 0,
      },
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

  public async addPlayer(player: HumanPlayer): Promise<void> {
    await player.addToDatabase();
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
      if (
        player.status === GameStatus.Waiting ||
        player.status === GameStatus.Playing ||
        player.status === GameStatus.Staying
      ) {
        humanPlayers.push(player as HumanPlayer);
      }
    });
    return humanPlayers;
  }

  public static isGameOver(players: HumanPlayer[]): boolean {
    return (
      players.some(player => player.status === GameStatus.Won) ||
      players.every(player => player.status === GameStatus.Lost)
    );
  }

  public startGame(doDealing = true): void {
    console.log('c');
    console.log(this._players);
    console.log('d');
    console.log(this._getActiveHumanPlayers());
    const players: HumanPlayer[] = this._getActiveHumanPlayers();
    this._updateToPlaying();

    if (doDealing) {
      this._dealer.dealCards(players);
    }

    this._gamingArea.updateFromBlackjack(this.dealer, this.players);
  }

  public advanceGame(playerId: string, playerAction: BlackjackAction): void {
    // you may need to replace this call of this._getActiveHumanPlayers with just a call to this._players
    this._dealer.advanceGame(this._getActiveHumanPlayers(), playerId, playerAction);

    // Also not sure when to call updateFromBlackjack
    this._gamingArea.updateFromBlackjack(this.dealer, this.players);
  }

  public async playGame(doDealing = true): Promise<void> {
    // maybe check that there is more than 1 player before i start the gameplay loop?
    const players: HumanPlayer[] = this._getActiveHumanPlayers();
    this._updateToPlaying();

    if (doDealing) {
      this._dealer.dealCards(players);
    }

    this._gamingArea.updateFromBlackjack(this._dealer, players);

    while (!BlackJack.isGameOver([...players, this._dealer])) {
      await this._dealer.doTurns(players);
    }
  }
}
