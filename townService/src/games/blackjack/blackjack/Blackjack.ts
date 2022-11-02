import { Suit, SUITS } from "../../cards/Suit";
import { Value, VALUES } from "../../cards/Value";
import { GameStatus } from "../players/GameStatus";
import DealerPlayer from "../players/DealerPlayer";
import HumanPlayer from "../players/HumanPlayer";

export default class BlackJack {

  // Going to have this DealerPlayer class handle the responsiblites of the Dealer and the Player.
  // I thought about this for a while, and think this is the best solution, if anyone disagrees lmk.
  public _dealer: DealerPlayer;

  // i need to abstract this out to a Player[] where
  // a player is a interface that HumanPlayer and SpectatorPlayer implement.
  // I think that will be easier once I finish implementing this though
  public _players: HumanPlayer[];

  private _mainPlayer: HumanPlayer;

  constructor() {
    this._dealer = new DealerPlayer();

    this._mainPlayer = new HumanPlayer();
    // We assume that there is at least one human player. I am going to start with the
    // assumption of one Player but will make sure to expand tests to cover 2 players
    this._players = [this._mainPlayer];
  }

  // update everyones status to Playing
  private updateToPlaying(): void {
    this._dealer._status = GameStatus.Playing
    this._players.forEach(player => {
      player._status = GameStatus.Playing
    });
  }

  public playGame(): void {
    // maybe check that there is more than 1 player before i start the gameplay loop?
    this.updateToPlaying();
    this._dealer.dealCards(this._players);

    // dealer asks first person if they want to hit or stay

    // we will essentially have to make a bunch of async functions
    // and have the flow of the game be controller by await statements

    // that allows us some flexibilty when we go to connect this to the actual game
    // and it also allows me to hotswap command line input

    // but essentially ask every player if they want to hit or stay
    // then dealer hits or stays (based on 17 rule)

    // and we just keep doing this loop, updating the status of the players as we go

    // if any player goes over 21, we set their status to GameStatus.Lost and skip over
    // them in the main gameplay loop.

    // We know someone won either when:
    //    they get 21 (and their status is set to GameStatus.Won)
    //      OR
    //    their is only one player with GameStatus.Playing, and there does not
    //    exist a player with GameStatus.Won

  }





}
