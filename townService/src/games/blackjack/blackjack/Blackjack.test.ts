/* eslint-disable no-promise-executor-return */
/* eslint-disable prettier/prettier */

import Card from '../../cards/Card';
import CardFactory from '../../cards/CardFactory';
import Suit from '../../cards/Suit';
import Value from '../../cards/Value';
import BlackJack from "./Blackjack";
import BlackjackAction from "./BlackjackAction";
import DealerPlayer from '../players/DealerPlayer';
import GameStatus from '../players/GameStatus';
import Hand from '../players/Hand';
import HumanPlayer from '../players/HumanPlayer';


describe('Blackjack', () => {
  let blackjackInstance: BlackJack;
  let playerOne: HumanPlayer;
  let playerTwo: HumanPlayer;
  let playerThree: HumanPlayer;
  let players: HumanPlayer[];

  beforeEach(() => {
    playerOne = new HumanPlayer(GameStatus.Waiting, '1');
    playerTwo = new HumanPlayer(GameStatus.Waiting, '2');
    playerThree = new HumanPlayer(GameStatus.Waiting, '3');
    players = [playerOne, playerTwo, playerThree];
    blackjackInstance = new BlackJack(players);
    playerOne.getBlackjackAction = jest.fn().mockReturnValue(BlackjackAction.Hit);
    playerTwo.getBlackjackAction = jest.fn().mockReturnValue(BlackjackAction.Hit);
    playerThree.getBlackjackAction = jest.fn().mockReturnValue(BlackjackAction.Stay);
    playerOne.doTurn = jest.fn().mockReturnValue(BlackjackAction.Hit);
    playerTwo.doTurn = jest.fn().mockReturnValue(BlackjackAction.Hit);
    playerThree.doTurn = jest.fn().mockReturnValue(BlackjackAction.Stay);
  });

  describe('constructor', () => {
    it('Constructs a DealerPlayer properly', () => {
      expect(blackjackInstance.dealer).toBeInstanceOf(DealerPlayer);
      const newBlackjackInstance = new BlackJack();
      expect(newBlackjackInstance.players).toStrictEqual([]);
      expect(newBlackjackInstance.dealer).not.toBeNull();
      expect(newBlackjackInstance.dealer).toBeInstanceOf(DealerPlayer);

      const newPlayerOne = new HumanPlayer(GameStatus.Waiting, '1');
      const newPlayerTwo = new HumanPlayer(GameStatus.Waiting, '2');
      const newPlayerThree = new HumanPlayer(GameStatus.Waiting, '3');
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

    /**
     *
      #4 all players bust including dealer
      #5 all players win except dealer busts
      #6 all players win including dealer
      #7 one player gets 22
      #8 Player bust & all others win
      #9 Player loses & all others win
      #10 Player wins & all others lose
     *
     *
     *
     *
       #4 dealer busts, all players win (with 1 player)
       #5 dealer busts, all players win (with 2 players)
       #6 all players are dealt blackjack except dealer (not sure who wins here - follow casino rules)
       #7 all players are dealt blackjack including dealer (not sure who wins here - follow casino rules)
       #8 dealer is dealt blackjack immediately, players are all under 21 (just confirm that the statuses are set correctly)
     *
     */
    it('Blackjack Edge Case #1 Player wins & all others bust', async () => {
      const handArray: [Card, boolean][] = [
        [CardFactory.getCard(Value.King, Suit.Hearts), true],
        [CardFactory.getCard(Value.Ace, Suit.Diamonds), false],
      ];
      const handArray2: [Card, boolean][] = [
        [CardFactory.getCard(Value.Queen, Suit.Clubs), true],
        [CardFactory.getCard(Value.King, Suit.Diamonds), false],
        [CardFactory.getCard(Value.Seven, Suit.Diamonds), false],
      ];
      const handArray3: [Card, boolean][] = [
        [CardFactory.getCard(Value.King, Suit.Hearts), true],
        [CardFactory.getCard(Value.King, Suit.Spades), false],
        [CardFactory.getCard(Value.Five, Suit.Spades), false],
      ];
      const handArray4: [Card, boolean][] = [
        [CardFactory.getCard(Value.King, Suit.Hearts), true],
        [CardFactory.getCard(Value.King, Suit.Spades), false],
        [CardFactory.getCard(Value.Eight, Suit.Spades), false],
      ];

      const hand = new Hand(handArray);
      playerOne.hand = hand;
      const hand2 = new Hand(handArray2);
      playerTwo.hand = hand2;
      const hand3 = new Hand(handArray3);
      playerThree.hand = hand3;
      blackjackInstance.dealer.hand = new Hand(handArray4);

      expect(playerOne.getNumericScore()).toStrictEqual([11, 21]);
      expect(playerTwo.getNumericScore()).toStrictEqual([27]);
      expect(playerThree.getNumericScore()).toStrictEqual([25]);
      expect(blackjackInstance.dealer.getNumericScore()).toStrictEqual([28]);

      blackjackInstance.advanceGame('1', BlackjackAction.Stay);
      blackjackInstance.advanceGame('2', BlackjackAction.Stay);
      blackjackInstance.advanceGame('3', BlackjackAction.Stay);

      expect(playerOne.getNumericScore()).toStrictEqual([11, 21]);
      expect(playerOne.status).toBe(GameStatus.Won);

      expect(playerTwo.getNumericScore()).toStrictEqual([27]);
      expect(playerTwo.status).toBe(GameStatus.Lost);

      expect(playerThree.getNumericScore()).toStrictEqual([25]);
      expect(playerThree.status).toBe(GameStatus.Lost);

      expect(blackjackInstance.dealer.getNumericScore()).toStrictEqual([28]);
    });
    it('Blackjack Edge Case #2 Everyone busts except for single player', () => {
      const handArray: [Card, boolean][] = [
        [CardFactory.getCard(Value.Ace, Suit.Hearts), true],
        [CardFactory.getCard(Value.Nine, Suit.Clubs), false],
        [CardFactory.getCard(Value.Four, Suit.Diamonds), false],
        [CardFactory.getCard(Value.King, Suit.Diamonds), false]];

      const handArray2: [Card, boolean][] = [
        [CardFactory.getCard(Value.Queen, Suit.Clubs), true],
        [CardFactory.getCard(Value.Three, Suit.Diamonds), false],
        [CardFactory.getCard(Value.Seven, Suit.Diamonds), false]];

      const handArray3: [Card, boolean][] = [
        [CardFactory.getCard(Value.King, Suit.Hearts), true],
        [CardFactory.getCard(Value.Three, Suit.Diamonds), false],
        [CardFactory.getCard(Value.King, Suit.Spades), false]];

      const handArray4: [Card, boolean][] = [
        [CardFactory.getCard(Value.King, Suit.Hearts), true],
        [CardFactory.getCard(Value.Six, Suit.Hearts), false],
        [CardFactory.getCard(Value.King, Suit.Spades), false]];

      const hand = new Hand(handArray);
      playerOne.hand = hand;
      const hand2 = new Hand(handArray2);
      playerTwo.hand = hand2;
      const hand3 = new Hand(handArray3);
      playerThree.hand = hand3;
      blackjackInstance.dealer.hand = new Hand(handArray4);

      // the scores here are actually [24, 34] but if you have multiple
      // scores above 21 we just return the smallest one
      expect(playerOne.getNumericScore()).toStrictEqual([24]);
      expect(playerTwo.getNumericScore()).toStrictEqual([20]);
      expect(playerThree.getNumericScore()).toStrictEqual([23]);
      expect(blackjackInstance.dealer.getNumericScore()).toStrictEqual([26]);

      blackjackInstance.advanceGame('1', BlackjackAction.Stay);
      blackjackInstance.advanceGame('2', BlackjackAction.Stay);
      blackjackInstance.advanceGame('3', BlackjackAction.Stay);

      expect(playerOne.getNumericScore()).toStrictEqual([24]);
      expect(playerOne.status).toBe(GameStatus.Lost);

      expect(playerTwo.getNumericScore()).toStrictEqual([20]);

      expect(playerThree.getNumericScore()).toStrictEqual([23]);
      expect(playerThree.status).toBe(GameStatus.Lost);

      expect(blackjackInstance.dealer.getNumericScore()).toStrictEqual([26]);
    });


    it('Blackjack Edge Case #4 dealer busts, all players win (with 1 player) ', async () => {

      const handArray: [Card, boolean][] = [
        [CardFactory.getCard(Value.Ace, Suit.Hearts), true],
        [CardFactory.getCard(Value.King, Suit.Diamonds), false],
      ];
      const handArray2: [Card, boolean][] = [
        [CardFactory.getCard(Value.Queen, Suit.Clubs), true],
        [CardFactory.getCard(Value.Six, Suit.Diamonds), false],
      ];


      const hand = new Hand(handArray);
      playerOne.hand = hand;
      blackjackInstance.dealer.hand = new Hand(handArray2);


      expect(playerOne.getNumericScore()).toStrictEqual([11, 21]);
      expect(blackjackInstance.dealer.getNumericScore()).toStrictEqual([16]);

      blackjackInstance.advanceGame('1', BlackjackAction.Stay);

      expect(playerOne.getNumericScore()).toStrictEqual([11, 21]);
      expect(playerOne.status).toBe(GameStatus.Won);
      expect(blackjackInstance.dealer.getNumericScore()).toStrictEqual([16]);
    });
    it('Blackjack Edge Case #5 dealer busts, all players win (with 2 players)', async () => {
      const handArray: [Card, boolean][] = [
        [CardFactory.getCard(Value.Ace, Suit.Hearts), true],
        [CardFactory.getCard(Value.King, Suit.Diamonds), false],
      ];
      const handArray2: [Card, boolean][] = [
        [CardFactory.getCard(Value.Ace, Suit.Clubs), true],
        [CardFactory.getCard(Value.Queen, Suit.Diamonds), false],
      ];
      const handArray3: [Card, boolean][] = [
        [CardFactory.getCard(Value.Four, Suit.Diamonds), true],
        [CardFactory.getCard(Value.King, Suit.Spades), false],
        [CardFactory.getCard(Value.Ten, Suit.Hearts), false],
        [CardFactory.getCard(Value.Eight, Suit.Hearts), false],
      ];

      const hand = new Hand(handArray);
      playerOne.hand = hand;
      const hand2 = new Hand(handArray2);
      playerTwo.hand = hand2;
      blackjackInstance.dealer.hand = new Hand(handArray3);

      expect(playerOne.getNumericScore()).toStrictEqual([11, 21]);
      expect(playerTwo.getNumericScore()).toStrictEqual([11, 21]);
      expect(blackjackInstance.dealer.getNumericScore()).toStrictEqual([32]);

      blackjackInstance.advanceGame('1', BlackjackAction.Stay);
      blackjackInstance.advanceGame('2', BlackjackAction.Stay);

      expect(playerOne.getNumericScore()).toStrictEqual([11, 21]);
      expect(playerOne.status).toBe(GameStatus.Won);
      expect(playerTwo.getNumericScore()).toStrictEqual([11, 21]);
      expect(playerTwo.status).toBe(GameStatus.Won);
      expect(blackjackInstance.dealer.getNumericScore()).toStrictEqual([32]);
    });
    it('Blackjack Edge Case #6 all players are dealt blackjack except dealer', async () => {

      const handArray: [Card, boolean][] = [
        [CardFactory.getCard(Value.Queen, Suit.Hearts), true],
        [CardFactory.getCard(Value.King, Suit.Diamonds), false],
        [CardFactory.getCard(Value.Two, Suit.Diamonds), false],
      ];
      const handArray2: [Card, boolean][] = [
        [CardFactory.getCard(Value.Ace, Suit.Clubs), true],
        [CardFactory.getCard(Value.Queen, Suit.Diamonds), false],
      ];
      const handArray3: [Card, boolean][] = [
        [CardFactory.getCard(Value.Ace, Suit.Diamonds), true],
        [CardFactory.getCard(Value.King, Suit.Spades), false],
      ];
      const handArray4: [Card, boolean][] = [
        [CardFactory.getCard(Value.King, Suit.Hearts), true],
        [CardFactory.getCard(Value.Ace, Suit.Spades), false],
      ];

      const hand = new Hand(handArray4);
      playerOne.hand = hand;
      const hand2 = new Hand(handArray2);
      playerTwo.hand = hand2;
      const hand3 = new Hand(handArray3);
      playerThree.hand = hand3;
      blackjackInstance.dealer.hand = new Hand(handArray);

      expect(playerOne.getNumericScore()).toStrictEqual([11, 21]);
      expect(playerTwo.getNumericScore()).toStrictEqual([11, 21]);
      expect(playerThree.getNumericScore()).toStrictEqual([11, 21]);
      expect(blackjackInstance.dealer.getNumericScore()).toStrictEqual([22]);

      blackjackInstance.advanceGame('1', BlackjackAction.Stay);
      blackjackInstance.advanceGame('2', BlackjackAction.Stay);
      blackjackInstance.advanceGame('3', BlackjackAction.Stay);

      expect(playerOne.getNumericScore()).toStrictEqual([11, 21]);
      expect(playerOne.status).toBe(GameStatus.Won);
      expect(playerTwo.getNumericScore()).toStrictEqual([11, 21]);
      expect(playerTwo.status).toBe(GameStatus.Won);
      expect(playerThree.getNumericScore()).toStrictEqual([11, 21]);

      expect(blackjackInstance.dealer.getNumericScore()).toStrictEqual([22]);

    });
    it('Blackjack Edge Case #7 all players are dealt blackjack including dealer', async () => {

      const handArray: [Card, boolean][] = [
        [CardFactory.getCard(Value.Ace, Suit.Hearts), true],
        [CardFactory.getCard(Value.King, Suit.Diamonds), false],
      ];
      const handArray2: [Card, boolean][] = [
        [CardFactory.getCard(Value.Queen, Suit.Clubs), true],
        [CardFactory.getCard(Value.Ace, Suit.Diamonds), false],
      ];
      const handArray3: [Card, boolean][] = [
        [CardFactory.getCard(Value.King, Suit.Hearts), true],
        [CardFactory.getCard(Value.Ace, Suit.Spades), false],
      ];
      const handArray4: [Card, boolean][] = [
        [CardFactory.getCard(Value.King, Suit.Hearts), true],
        [CardFactory.getCard(Value.Ace, Suit.Clubs), false],
      ];

      const hand = new Hand(handArray);
      playerOne.hand = hand;
      const hand2 = new Hand(handArray2);
      playerTwo.hand = hand2;
      const hand3 = new Hand(handArray3);
      playerThree.hand = hand3;
      blackjackInstance.dealer.hand = new Hand(handArray4);

      expect(playerOne.getNumericScore()).toStrictEqual([11, 21]);
      expect(playerTwo.getNumericScore()).toStrictEqual([11, 21]);
      expect(playerThree.getNumericScore()).toStrictEqual([11, 21]);
      expect(blackjackInstance.dealer.getNumericScore()).toStrictEqual([11, 21]);

      blackjackInstance.advanceGame('1', BlackjackAction.Stay);
      blackjackInstance.advanceGame('2', BlackjackAction.Stay);
      blackjackInstance.advanceGame('3', BlackjackAction.Stay);

      expect(playerOne.getNumericScore()).toStrictEqual([11, 21]);

      expect(playerTwo.getNumericScore()).toStrictEqual([11, 21]);

      expect(playerThree.getNumericScore()).toStrictEqual([11, 21]);

      expect(blackjackInstance.dealer.getNumericScore()).toStrictEqual([11, 21]);
    });
    it('Blackjack Edge Case #8 Dealer dealt blackjack immediately, all others under 21', async () => {

      const handArray: [Card, boolean][] = [
        [CardFactory.getCard(Value.Two, Suit.Hearts), true],
        [CardFactory.getCard(Value.King, Suit.Diamonds), false],
      ];
      const handArray2: [Card, boolean][] = [
        [CardFactory.getCard(Value.Two, Suit.Clubs), true],
        [CardFactory.getCard(Value.Queen, Suit.Diamonds), false],
      ];
      const handArray3: [Card, boolean][] = [
        [CardFactory.getCard(Value.Jack, Suit.Diamonds), true],
        [CardFactory.getCard(Value.King, Suit.Spades), false],
      ];
      const handArray4: [Card, boolean][] = [
        [CardFactory.getCard(Value.King, Suit.Hearts), true],
        [CardFactory.getCard(Value.Ace, Suit.Spades), false],
      ];

      const hand = new Hand(handArray);
      playerOne.hand = hand;
      const hand2 = new Hand(handArray2);
      playerTwo.hand = hand2;
      const hand3 = new Hand(handArray3);
      playerThree.hand = hand3;
      blackjackInstance.dealer.hand = new Hand(handArray4);

      expect(playerOne.getNumericScore()).toStrictEqual([12]);
      expect(playerTwo.getNumericScore()).toStrictEqual([12]);
      expect(playerThree.getNumericScore()).toStrictEqual([20]);
      expect(blackjackInstance.dealer.getNumericScore()).toStrictEqual([11, 21]);

      blackjackInstance.advanceGame('1', BlackjackAction.Stay);
      blackjackInstance.advanceGame('2', BlackjackAction.Stay);
      blackjackInstance.advanceGame('3', BlackjackAction.Stay);

      expect(playerOne.getNumericScore()).toStrictEqual([12]);

      expect(playerTwo.getNumericScore()).toStrictEqual([12]);

      expect(playerThree.getNumericScore()).toStrictEqual([20]);

    });
  });
});
