/* eslint-disable import/no-named-as-default */
/* eslint-disable @typescript-eslint/naming-convention */
import GameStatus from '../players/GameStatus';
import DealerPlayer from '../players/DealerPlayer';
import HumanPlayer from '../players/HumanPlayer';
import Player from '../players/Player';

export default class BlackJack {
  // Going to have this DealerPlayer class handle the responsiblites of the Dealer and the Player.
  // I thought about this for a while, and think this is the best solution, if anyone disagrees lmk.
  public _dealer: DealerPlayer;

  // i need to abstract this out to a Player[] where
  // a player is a interface that HumanPlayer and SpectatorPlayer implement.
  // I think that will be easier once I finish implementing this though
  public _players: Player[];

  constructor() {
    this._dealer = new DealerPlayer();
    // We assume that there is at least one human player. I am going to start with the
    // assumption of one Player but will make sure to expand tests to cover 2 players
    this._players = [];
  }

  // update everyones status to Playing
  private updateToPlaying(): void {
    this._dealer.status = GameStatus.Playing;
    this._players.forEach(player => {
      player.status = GameStatus.Playing;
    });
  }

  private getActiveHumanPlayers(): HumanPlayer[] {
    const humanPlayers: HumanPlayer[] = [];
    this._players.forEach(player => {
      if (player.status === GameStatus.Waiting) {
        humanPlayers.push(player as HumanPlayer);
      }
    });
    return humanPlayers;
  }

  private getPlayersStillInGame(): HumanPlayer[] {
    return this._players.filter(
      player => player.status === GameStatus.Playing || player.status === GameStatus.Won,
    ) as HumanPlayer[];
  }

  private getWinner(): Player {
    const playersStillInGame: HumanPlayer[] = this.getPlayersStillInGame();

    if (playersStillInGame.length === 0) {
      throw new Error('There are no players in the game, so there is no winner!');
    }

    return playersStillInGame[0];
  }

  private isGameOver(): boolean {
    const playersStillInGame: HumanPlayer[] = this.getPlayersStillInGame();

    if (playersStillInGame.length === 0) {
      throw new Error("There are no players in the game, can't determine if game is over");
    }

    return playersStillInGame.length === 1;
  }

  public playGame(): void {
    // maybe check that there is more than 1 player before i start the gameplay loop?
    this.updateToPlaying();
    this._dealer.dealCards(this.getActiveHumanPlayers());

    while (!this.isGameOver()) {
      this._dealer.doTurns(this.getActiveHumanPlayers());
    }

    // we have nothing to do with this currently, but just want to show the intended usage
    const winner: Player = this.getWinner();
  }
}
