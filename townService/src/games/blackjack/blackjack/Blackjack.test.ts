/* eslint-disable no-promise-executor-return */
/* eslint-disable prettier/prettier */

import DealerPlayer from "../players/DealerPlayer";
import GameStatus from "../players/GameStatus";
import HumanPlayer from "../players/HumanPlayer";
import BlackJack from "./Blackjack";
import BlackjackAction from "./BlackjackAction";

// We are effectively testing both the DealerPlayer class and the
// Player class here
describe('DealerPlayer', () => {
  let blackjackInstance: BlackJack;
  let playerOne: HumanPlayer;
  let playerTwo: HumanPlayer;
  let players: HumanPlayer[];

  beforeEach(() => {
    playerOne = new HumanPlayer('0');
    playerTwo = new HumanPlayer('1');
    players = [playerOne, playerTwo];
    blackjackInstance = new BlackJack(players);
    playerOne.getBlackjackAction = jest.fn().mockReturnValue(BlackjackAction.Hit);
    playerTwo.getBlackjackAction = jest.fn().mockReturnValue(BlackjackAction.Stay);
    playerOne.doTurn = jest.fn().mockReturnValue(BlackjackAction.Hit);
    playerTwo.doTurn = jest.fn().mockReturnValue(BlackjackAction.Stay);
  });


  describe('constructor', () => {
    it('Constructs a DealerPlayer properly', () => {
      const newBlackjackInstance = new BlackJack();
      expect(newBlackjackInstance.players).toStrictEqual([]);
      expect(newBlackjackInstance.dealer).not.toBeNull();
      expect(newBlackjackInstance.dealer).toBeInstanceOf(DealerPlayer);

      const newPlayerOne = new HumanPlayer('2');
      const newPlayerTwo = new HumanPlayer('3');
      const newPlayerThree = new HumanPlayer('4');
      const newPlayers = [newPlayerOne, newPlayerTwo, newPlayerThree];
      const anotherBlackjackInstance = new BlackJack(newPlayers);

      expect(anotherBlackjackInstance.players).toStrictEqual(newPlayers);
      expect(anotherBlackjackInstance.dealer).not.toBeNull();
      expect(anotherBlackjackInstance.dealer).toBeInstanceOf(DealerPlayer);
    });
  });

  describe('getters', () => {
    it('Dealer getter works correctly', () => {
      expect(blackjackInstance.dealer).toBeInstanceOf(DealerPlayer);
      expect(blackjackInstance.dealer.hand.cards).toStrictEqual([]);
    });

    it('Players getter works properly', () => {
      expect(blackjackInstance.players).toStrictEqual(players);
      const newBlackjackInstance = new BlackJack();
      expect(newBlackjackInstance.players).toStrictEqual([]);
    });
  });


  describe('class methods', () => {
    describe('playGame', () => {
      it('Correctly plays Blackjack', async () => {
        /*
        Apologies that this test isn't thorough. I just want to do a sanity test check to know that
        it is handling the basic gameplay and async functions correctly. It is much easier for me to change
        and refactor this code once I have a full set of suits.

        I will come back later and test the edge cases of Blackjack. (We have to try to think of weird scenarios and test them)
        */
        await blackjackInstance.playGame();
        expect(blackjackInstance.players).toStrictEqual(players);
        expect(blackjackInstance.dealer).toBeInstanceOf(DealerPlayer);

        const fullPlayers = [...blackjackInstance.players, blackjackInstance.dealer];
        const someoneWon = fullPlayers.some(player => player.status === GameStatus.Won);
        expect(someoneWon).toBe(true);
      });

    });
  });

});

