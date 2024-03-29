/* eslint-disable no-new */
/* eslint-disable prettier/prettier */

import Card from '../../cards/Card';
import CardFactory from '../../cards/CardFactory';
import Suit from '../../cards/Suit';
import Value from '../../cards/Value';
import BlackjackAction from '../blackjack/BlackjackAction';
import GameStatus from './GameStatus';
import Hand from './Hand';
import HumanPlayer from './HumanPlayer';


describe('HumanPlayer', () => {
  let player: HumanPlayer;

  beforeEach(() => {
    player = new HumanPlayer(GameStatus.Waiting, '0');
  });

  describe('constructor', () => {
    it('Constructs a HumanPlayer properly', () => {
      expect(() => {
        new HumanPlayer(GameStatus.Waiting, '1');
      }).not.toThrowError();
      const newPlayer = new HumanPlayer(GameStatus.Waiting, '1');
      expect(newPlayer.status).toBe(GameStatus.Waiting);
      expect(newPlayer.id).toBe('1');
    });
  });

  describe('getters', () => {
    it('Status getter works correctly', () => {
      expect(player.status).toBe(GameStatus.Waiting);
    });

    it('Hand getter works correctly', () => {
      expect(player.hand).toBeInstanceOf(Hand);
      expect(player.hand.cards).toStrictEqual([]);
    });

    it('id getter works correctly', () => {
      expect(player.id).toBe('0');
    });

    it('wallet getter works correctly', () => {
      expect(player.wallet).toBe(500);
    });

    it('wins getter works correctly', () => {
      expect(player.wins).toBe(0);
    });

    it('losses getter works correctly', () => {
      expect(player.losses).toBe(0);
    });

    it('ties getter works correctly', () => {
      expect(player.ties).toBe(0);
    });
  });

  describe('setters', () => {
    it('Hand setter works correctly', () => {
      const newHandArray: [Card, boolean][] = [
        [CardFactory.getCard(Value.Two, Suit.Spades), true],
        [CardFactory.getCard(Value.Ace, Suit.Diamonds), false],
      ];
      const newHand = new Hand(newHandArray);
      player.hand = newHand;
      expect(player.hand).toEqual(newHand);
      expect(player.hand.cards).toStrictEqual(newHandArray);
    });

    it('Status setter works correctly', () => {
      player.status = GameStatus.Playing;
      expect(player.status).toBe(GameStatus.Playing);
      player.status = GameStatus.Won;
      expect(player.status).toBe(GameStatus.Won);
    });

    it('Wallet setter works correctly', () => {
      expect(player.wallet).toBe(500);
      player.wallet = 700;
      expect(player.wallet).toBe(700);
    });

    it('Wins setter works correctly', () => {
      expect(player.wins).toBe(0);
      player.wins = 700;
      expect(player.wins).toBe(700);
    });

    it('Losses setter works correctly', () => {
      expect(player.losses).toBe(0);
      player.losses = 700;
      expect(player.losses).toBe(700);
    });

    it('Ties setter works correctly', () => {
      expect(player.ties).toBe(0);
      player.ties = 700;
      expect(player.ties).toBe(700);
    });
  });

  describe('class methods', () => {
    describe('addCard', () => {
      it('Adds a card to the hand properly', () => {
        const newCard = CardFactory.getCard(Value.Two, Suit.Spades);
        player.addCard(newCard);
        expect(player.hand.cards).toContainEqual([newCard, true]);

        const newCard2 = CardFactory.getCard(Value.Ace, Suit.Diamonds);
        player.addCard(newCard2);
        expect(player.hand.cards).toStrictEqual([
          [newCard, true],
          [newCard2, true],
        ]);
      });
    });

    describe('getNumericScore', () => {
      it('Tallys score properly', () => {
        expect(player.getNumericScore()).toStrictEqual([0]);

        player.addCard(CardFactory.getCard(Value.Two, Suit.Spades));
        player.addCard(CardFactory.getCard(Value.Ace, Suit.Diamonds));
        expect(player.getNumericScore()).toStrictEqual([3, 13]);

        player.addCard(CardFactory.getCard(Value.Ace, Suit.Clubs));
        expect(player.getNumericScore()).toStrictEqual([4, 14]);

        player.addCard(CardFactory.getCard(Value.Seven, Suit.Hearts));
        expect(player.getNumericScore()).toStrictEqual([11, 21]);

        player.addCard(CardFactory.getCard(Value.Three, Suit.Hearts));
        expect(player.getNumericScore()).toStrictEqual([14]);

        player.addCard(CardFactory.getCard(Value.Eight, Suit.Hearts));
        expect(player.getNumericScore()).toStrictEqual([22]);
      });
    });

    describe('has21', () => {
      it('Returns true if the player has 21', () => {
        expect(player.has21()).toBe(false);

        player.addCard(CardFactory.getCard(Value.Ace, Suit.Diamonds));
        player.addCard(CardFactory.getCard(Value.Eight, Suit.Spades));
        expect(player.has21()).toBe(false);

        player.addCard(CardFactory.getCard(Value.Two, Suit.Hearts));
        expect(player.has21()).toBe(true);

        player.addCard(CardFactory.getCard(Value.King, Suit.Hearts));
        // This should still be true (1 + 8 + 2 + 10 = 21)
        expect(player.has21()).toBe(true);

        player.addCard(CardFactory.getCard(Value.Two, Suit.Hearts));
        expect(player.has21()).toBe(false);
      });
    });

    describe('hasBusted', () => {
      it('Returns true if the player has busted', () => {
        expect(player.hasBusted()).toBe(false);

        player.addCard(CardFactory.getCard(Value.Ace, Suit.Diamonds));
        player.addCard(CardFactory.getCard(Value.Eight, Suit.Spades));
        expect(player.getNumericScore()).toStrictEqual([9, 19]);
        expect(player.hasBusted()).toBe(false);

        player.addCard(CardFactory.getCard(Value.Two, Suit.Hearts));
        expect(player.hasBusted()).toBe(false);

        player.addCard(CardFactory.getCard(Value.King, Suit.Hearts));
        // This should still be true (1 + 8 + 2 + 10 = 21)
        expect(player.hasBusted()).toBe(false);

        player.addCard(CardFactory.getCard(Value.Two, Suit.Hearts));
        expect(player.hasBusted()).toBe(true);

        player.addCard(CardFactory.getCard(Value.Five, Suit.Spades));
        expect(player.hasBusted()).toBe(true);
      });
    });

    describe('addCurrency', () => {
      it('adds or subtracts currency to players wallet', () => {
        expect(player.wallet).toBe(500);

        player.addCurrency(600);

        expect(player.wallet).toBe(1100);

      });
    });
  });

  describe('static methods', () => {
    describe('parseNextMove', () => {
      it('Parses a string into a BlackjackAction', () => {
        const hit = BlackjackAction.Hit;
        expect(HumanPlayer.parseNextMove('hit')).toBe(hit);
        expect(HumanPlayer.parseNextMove('Hit')).toBe(hit);
        expect(HumanPlayer.parseNextMove('hIT')).toBe(hit);
        expect(HumanPlayer.parseNextMove('h')).toBe(hit);
        expect(HumanPlayer.parseNextMove('H')).toBe(hit);
        expect(HumanPlayer.parseNextMove('1')).toBe(hit);

        const stay = BlackjackAction.Stay;
        expect(HumanPlayer.parseNextMove('stay')).toBe(stay);
        expect(HumanPlayer.parseNextMove('Stay')).toBe(stay);
        expect(HumanPlayer.parseNextMove('stAY')).toBe(stay);
        expect(HumanPlayer.parseNextMove('S')).toBe(stay);
        expect(HumanPlayer.parseNextMove('s')).toBe(stay);
        expect(HumanPlayer.parseNextMove('0')).toBe(stay);

        expect(HumanPlayer.parseNextMove('hits')).toBe(stay);
        expect(HumanPlayer.parseNextMove('stays')).toBe(stay);
        expect(HumanPlayer.parseNextMove('dog')).toBe(stay);
        expect(HumanPlayer.parseNextMove('cat')).toBe(stay);
      });
    });
  });
});
