import GameStatus from '../players/GameStatus';
import DealerPlayer from '../players/DealerPlayer';
import HumanPlayer from '../players/HumanPlayer';

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

  constructor(players: HumanPlayer[] = []) {
    this._dealer = new DealerPlayer(GameStatus.Waiting, '0');
    // We assume that there is at least one human player. I am going to start with the
    // assumption of one Player but will make sure to expand tests to cover 2 players
    this._players = players;
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
    return players.some(player => player.status === GameStatus.Won);
  }

  public async playGame(doDealing = true): Promise<void> {
    // maybe check that there is more than 1 player before i start the gameplay loop?
    const players: HumanPlayer[] = this._getActiveHumanPlayers();
    this._updateToPlaying();

    if (doDealing) {
      this._dealer.dealCards(players);
    }

    while (!BlackJack._isGameOver([...players, this._dealer])) {
      await this._dealer.doTurns(players);
    }
  }
}
