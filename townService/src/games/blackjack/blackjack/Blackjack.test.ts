/* eslint-disable no-promise-executor-return */
/* eslint-disable prettier/prettier */

// import Card from '../../cards/Card';
// import CardFactory from '../../cards/CardFactory';
// import Suit from '../../cards/Suit';
// import Value from '../../cards/Value';
import DealerPlayer from '../players/DealerPlayer';
import GameStatus from '../players/GameStatus';
// import Hand from '../players/Hand';
import HumanPlayer from '../players/HumanPlayer';
import BlackJack from './Blackjack';
import BlackjackAction from './BlackjackAction';


// We are effectively testing both the DealerPlayer class and the
// Player class here
describe('DealerPlayer', () => {
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
  });});

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
          [CardFactory.getCard(Value.Ace, Suit.Hearts), true],
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

        expect(playerOne.getNumericScore()).toStrictEqual([21]);
        expect(playerTwo.getNumericScore()).toStrictEqual([27]);
        expect(playerThree.getNumericScore()).toStrictEqual([25]);
        expect(blackjackInstance.dealer.getNumericScore()).toStrictEqual([28]);

        blackJackInstance.advanceGame(players, '1', BlackjackAction.Stay);
        blackJackInstance.advanceGame(players, '2', BlackjackAction.Stay);
        blackJackInstance.advanceGame(players, '3', BlackjackAction.Stay);

        expect(playerOne.getNumericScore()).toStrictEqual([21]);
        expect(playerOne.status).toBe(GameStatus.Won);

        expect(playerTwo.getNumericScore()).toStrictEqual([27]);
        expect(playerTwo.status).toBe(GameStatus.Lost);

        expect(playerThree.getNumericScore()).toStrictEqual([25]);
        expect(playerThree.status).toBe(GameStatus.Lost);

        expect(blackjackInstance.dealer.getNumericScore()).toStrictEqual([28]);
        expect(blackjackInstance.dealer.status).toBe(GameStatus.Lost);
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

    // Dealer does his turn automatically so only need to call
    // .advanceGame 3 times (as opposed to four)
    blackJackInstance.advanceGame(players, '1', BlackjackAction.Stay);
    blackJackInstance.advanceGame(players, '2', BlackjackAction.Stay);
    blackJackInstance.advanceGame(players, '3', BlackjackAction.Stay);
    
    expect(playerOne.getNumericScore()).toStrictEqual([24]);
    expect(playerOne.status).toBe(GameStatus.Lost);

    expect(playerTwo.getNumericScore()).toStrictEqual([20]);
    expect(playerTwo.status).toBe(GameStatus.Won);

    expect(playerThree.getNumericScore()).toStrictEqual([23]);
    expect(playerThree.status).toBe(GameStatus.Lost);

    expect(blackjackInstance.dealer.getNumericScore()).toStrictEqual([26]);
    expect(blackjackInstance.dealer.status).toBe(GameStatus.Lost);
});
      it('Blackjack Edge Case #3 all players bust except dealer', async () => {

        const handArray: [Card, boolean][] = [
          [CardFactory.getCard(Value.Ace, Suit.Hearts), true],
          [CardFactory.getCard(Value.King, Suit.Diamonds), false],
          [CardFactory.getCard(Value.King, Suit.Clubs), false],
          [CardFactory.getCard(Value.Four, Suit.Clubs), false],
        ];
        const handArray2: [Card, boolean][] = [
          [CardFactory.getCard(Value.Queen, Suit.Clubs), true],
          [CardFactory.getCard(Value.Six, Suit.Diamonds), false],
          [CardFactory.getCard(Value.Seven, Suit.Diamonds), false],
        ];
        const handArray3: [Card, boolean][] = [
          [CardFactory.getCard(Value.King, Suit.Hearts), true],
          [CardFactory.getCard(Value.King, Suit.Spades), false],
          [CardFactory.getCard(Value.Five, Suit.Spades), false],
        ];
        const handArray4: [Card, boolean][] = [
          [CardFactory.getCard(Value.King, Suit.Hearts), true],
          [CardFactory.getCard(Value.Eight, Suit.Spades), false],
        ];

        const hand = new Hand(handArray);
        playerOne.hand = hand;
        const hand2 = new Hand(handArray2);
        playerTwo.hand = hand2;
        const hand3 = new Hand(handArray3);
        playerThree.hand = hand3;
        blackjackInstance.dealer.hand = new Hand(handArray4);

        expect(playerOne.getNumericScore()).toStrictEqual([25]);
        expect(playerTwo.getNumericScore()).toStrictEqual([23]);
        expect(playerThree.getNumericScore()).toStrictEqual([25]);
        expect(blackjackInstance.dealer.getNumericScore()).toStrictEqual([18]);

        blackJackInstance.advanceGame(players, '1', BlackjackAction.Stay);
        blackJackInstance.advanceGame(players, '2', BlackjackAction.Stay);
        blackJackInstance.advanceGame(players, '3', BlackjackAction.Stay);

        expect(playerOne.getNumericScore()).toStrictEqual([25]);
        expect(playerOne.status).toBe(GameStatus.Lost);

        expect(playerTwo.getNumericScore()).toStrictEqual([23]);
        expect(playerTwo.status).toBe(GameStatus.Lost);

        expect(playerThree.getNumericScore()).toStrictEqual([25]);
        expect(playerThree.status).toBe(GameStatus.Lost);

        expect(blackjackInstance.dealer.getNumericScore()).toStrictEqual([18]);
        expect(blackjackInstance.dealer.status).toBe(GameStatus.Won);
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


        expect(playerOne.getNumericScore()).toStrictEqual([11]);
        expect(blackjackInstance.dealer.getNumericScore()).toStrictEqual([26]);

        blackJackInstance.advanceGame(players, '1', BlackjackAction.Stay);

        expect(playerOne.getNumericScore()).toStrictEqual([11]);
        expect(playerOne.status).toBe(GameStatus.Won);
        expect(blackjackInstance.dealer.getNumericScore()).toStrictEqual([26]);
        expect(blackjackInstance.dealer.status).toBe(GameStatus.Lost);
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
          [CardFactory.getCard(Value.Ace, Suit.Diamonds), true],
          [CardFactory.getCard(Value.King, Suit.Spades), false],
          [CardFactory.getCard(Value.Ten, Suit.Hearts), false],
          [CardFactory.getCard(Value.Eight, Suit.Hearts), false],
        ];

        const hand = new Hand(handArray);
        playerOne.hand = hand;
        const hand2 = new Hand(handArray2);
        playerTwo.hand = hand2;
        blackjackInstance.dealer.hand = new Hand(handArray3);

        expect(playerOne.getNumericScore()).toStrictEqual([21]);
        expect(playerTwo.getNumericScore()).toStrictEqual([21]);
        expect(blackjackInstance.dealer.getNumericScore()).toStrictEqual([21]);

        blackJackInstance.advanceGame(players, '1', BlackjackAction.Stay);
        blackJackInstance.advanceGame(players, '2', BlackjackAction.Stay);

        // Nikhil your intuition on this is right - I need to go back and fix this
        expect(playerOne.getNumericScore()).toStrictEqual([21]);
        expect(playerOne.status).toBe(GameStatus.Won);
        expect(playerTwo.getNumericScore()).toStrictEqual([21]);
        expect(playerTwo.status).toBe(GameStatus.Playing);
        expect(playerThree.getNumericScore()).toStrictEqual([21]);
        expect(playerThree.status).toBe(GameStatus.Playing);
        expect(blackjackInstance.dealer.getNumericScore()).toStrictEqual([21]);
        expect(blackjackInstance.dealer.status).toBe(GameStatus.Lost);
      });
      it('Blackjack Edge Case #7 one player gets 22', async () => {
    
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

        const hand = new Hand(handArray);
        playerOne.hand = hand;
        const hand2 = new Hand(handArray2);
        playerTwo.hand = hand2;
        const hand3 = new Hand(handArray3);
        playerThree.hand = hand3;
        blackjackInstance.dealer.hand = new Hand(handArray4);

        expect(playerOne.getNumericScore()).toStrictEqual([22]);
        expect(playerTwo.getNumericScore()).toStrictEqual([21]);
        expect(playerThree.getNumericScore()).toStrictEqual([21]);
        expect(blackjackInstance.dealer.getNumericScore()).toStrictEqual([21]);

        blackJackInstance.advanceGame(players, '1', BlackjackAction.Stay);
        blackJackInstance.advanceGame(players, '2', BlackjackAction.Stay);
        blackJackInstance.advanceGame(players, '3', BlackjackAction.Stay);

        expect(playerOne.getNumericScore()).toStrictEqual([22]);
        expect(playerOne.status).toBe(GameStatus.Lost);
        expect(playerTwo.getNumericScore()).toStrictEqual([21]);
        expect(playerTwo.status).toBe(GameStatus.Won);
        expect(playerThree.getNumericScore()).toStrictEqual([21]);
        expect(playerThree.status).toBe(GameStatus.Playing);
        expect(blackjackInstance.dealer.getNumericScore()).toStrictEqual([21]);
        expect(blackjackInstance.dealer.status).toBe(GameStatus.Lost);
      });
      it('Blackjack Edge Case #8 Player bust & all others win', async () => {

        const handArray: [Card, boolean][] = [
          [CardFactory.getCard(Value.Ace, Suit.Hearts), true],
          [CardFactory.getCard(Value.King, Suit.Diamonds), false],
        ];
        const handArray2: [Card, boolean][] = [
          [CardFactory.getCard(Value.Queen, Suit.Clubs), true],
          [CardFactory.getCard(Value.Three, Suit.Diamonds), false],
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
        ];

        const hand = new Hand(handArray);
        playerOne.hand = hand;
        const hand2 = new Hand(handArray2);
        playerTwo.hand = hand2;
        const hand3 = new Hand(handArray3);
        playerThree.hand = hand3;
        blackjackInstance.dealer.hand = new Hand(handArray4);

        expect(playerOne.getNumericScore()).toStrictEqual([21]);
        expect(playerTwo.getNumericScore()).toStrictEqual([20]);
        expect(playerThree.getNumericScore()).toStrictEqual([25]);
        expect(blackjackInstance.dealer.getNumericScore()).toStrictEqual([20]);

        blackJackInstance.advanceGame(players, '1', BlackjackAction.Stay);
        blackJackInstance.advanceGame(players, '2', BlackjackAction.Stay);
        blackJackInstance.advanceGame(players, '3', BlackjackAction.Stay);

        expect(playerOne.getNumericScore()).toStrictEqual([21]);
        expect(playerOne.status).toBe(GameStatus.Won);
        expect(playerTwo.getNumericScore()).toStrictEqual([20]);
        expect(playerTwo.status).toBe(GameStatus.Playing);
        expect(playerThree.getNumericScore()).toStrictEqual([25]);
        // TODO: FIX THIS TEST / LINE
        expect(playerThree.status).toBe(GameStatus.Playing);
        expect(blackjackInstance.dealer.getNumericScore()).toStrictEqual([20]);
        expect(blackjackInstance.dealer.status).toBe(GameStatus.Lost);
      });
      it('Blackjack Edge Case #9 Player loses & all others win', async () => {

        const handArray: [Card, boolean][] = [
          [CardFactory.getCard(Value.Ace, Suit.Hearts), true],
          [CardFactory.getCard(Value.King, Suit.Diamonds), false],
        ];
        const handArray2: [Card, boolean][] = [
          [CardFactory.getCard(Value.Ace, Suit.Clubs), true],
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

        expect(playerOne.getNumericScore()).toStrictEqual([21]);
        expect(playerTwo.getNumericScore()).toStrictEqual([21]);
        expect(playerThree.getNumericScore()).toStrictEqual([20]);
        expect(blackjackInstance.dealer.getNumericScore()).toStrictEqual([21]);

        blackJackInstance.advanceGame(players, '1', BlackjackAction.Stay);
        blackJackInstance.advanceGame(players, '2', BlackjackAction.Stay);
        blackJackInstance.advanceGame(players, '3', BlackjackAction.Stay);

        expect(playerOne.getNumericScore()).toStrictEqual([21]);
        expect(playerOne.status).toBe(GameStatus.Won);
        expect(playerTwo.getNumericScore()).toStrictEqual([21]);
        expect(playerTwo.status).toBe(GameStatus.Playing);
        expect(playerThree.getNumericScore()).toStrictEqual([20]);
        expect(playerThree.status).toBe(GameStatus.Playing);
        expect(blackjackInstance.dealer.getNumericScore()).toStrictEqual([21]);
        expect(blackjackInstance.dealer.status).toBe(GameStatus.Lost);
      });
      it('Blackjack Edge Case #10 Player wins & all others lose', async () => {

        const handArray: [Card, boolean][] = [
          [CardFactory.getCard(Value.Ace, Suit.Hearts), true],
          [CardFactory.getCard(Value.King, Suit.Diamonds), false],
        ];
        const handArray2: [Card, boolean][] = [
          [CardFactory.getCard(Value.Queen, Suit.Clubs), true],
          [CardFactory.getCard(Value.Three, Suit.Diamonds), false],
          [CardFactory.getCard(Value.Seven, Suit.Diamonds), false],
        ];
        const handArray3: [Card, boolean][] = [
          [CardFactory.getCard(Value.King, Suit.Hearts), true],
          [CardFactory.getCard(Value.King, Suit.Spades), false],
        ];
        const handArray4: [Card, boolean][] = [
          [CardFactory.getCard(Value.King, Suit.Hearts), true],
          [CardFactory.getCard(Value.King, Suit.Spades), false],
        ];

        const hand = new Hand(handArray);
        playerOne.hand = hand;
        const hand2 = new Hand(handArray2);
        playerTwo.hand = hand2;
        const hand3 = new Hand(handArray3);
        playerThree.hand = hand3;
        blackjackInstance.dealer.hand = new Hand(handArray4);

        expect(playerOne.getNumericScore()).toStrictEqual([11, 21]);
        expect(playerTwo.getNumericScore()).toStrictEqual([20]);
        expect(playerThree.getNumericScore()).toStrictEqual([20]);
        expect(blackjackInstance.dealer.getNumericScore()).toStrictEqual([20]);

        blackJackInstance.advanceGame(players, '1', BlackjackAction.Stay);
        blackJackInstance.advanceGame(players, '2', BlackjackAction.Stay);
        blackJackInstance.advanceGame(players, '3', BlackjackAction.Stay);        

        expect(playerOne.getNumericScore()).toStrictEqual([11, 21]);
        expect(playerOne.status).toBe(GameStatus.Won);
        expect(playerTwo.getNumericScore()).toStrictEqual([20]);
        expect(playerTwo.status).toBe(GameStatus.Playing);
        expect(playerThree.getNumericScore()).toStrictEqual([20]);
        expect(playerThree.status).toBe(GameStatus.Playing);
        expect(blackjackInstance.dealer.getNumericScore()).toStrictEqual([20]);
        expect(blackjackInstance.dealer.status).toBe(GameStatus.Lost);
      });
    });
  });
});
