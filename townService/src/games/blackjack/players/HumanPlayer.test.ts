/* eslint-disable prettier/prettier */

import Card from "../../cards/Card";
import CardFactory from "../../cards/CardFactory";
import Suit from "../../cards/Suit";
import Value from "../../cards/Value";
import BlackjackAction from "../blackjack/BlackjackAction";
import GameStatus from "./GameStatus";
import Hand from "./Hand";
import HumanPlayer from "./HumanPlayer";

describe('HumanPlayer', () => {
  let player: HumanPlayer;

  beforeEach(() => {
    player = new HumanPlayer();
  })

  describe('constructor', () => {
    it('Constructs a HumanPlayer properly', () => {
      expect(new HumanPlayer()).not.toThrowError();
      const newPlayer = new HumanPlayer();
      expect(newPlayer.status).toBe(GameStatus.Waiting);
  })});

  describe('getters', () => {
    it('Status getter works correctly', () => {
      expect(player.status).toBe(GameStatus.Spectator);
    });

    it('Hand getter works correctly', () => {
      expect(player.hand).toBe([]);
    });
  });

  describe('setters', () => {
    it('Hand setter works correctly', () => {
      const newHandArray: [Card, boolean][] = [[CardFactory.getCard(Value.Two, Suit.Spades), true],  [CardFactory.getCard(Value.Ace, Suit.Diamonds), false]];
      const newHand = new Hand(newHandArray);
      player.hand = newHand;
      expect(player.hand).toBe(newHand);
      expect(player.hand.cards).toBe(newHandArray);
    });

    it('Status setter works correctly', () => {
      player.status = GameStatus.Playing;
      expect(player.status).toBe(GameStatus.Playing);
      player.status = GameStatus.Won;
      expect(player.status).toBe(GameStatus.Won);
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
        expect(player.hand.cards).toBe([[newCard, true], [newCard2, true]]);
      });
    });

    describe('getNumericScore', () => {
      it('Tallys score properly', () => {
        expect(player.getNumericScore()).toBe([0]);

        player.addCard(CardFactory.getCard(Value.Two, Suit.Spades));
        player.addCard(CardFactory.getCard(Value.Ace, Suit.Diamonds));
        expect(player.getNumericScore()).toBe([13, 3]);

        player.addCard(CardFactory.getCard(Value.Ace, Suit.Clubs));
        expect(player.getNumericScore()).toBe([14, 4]);

        player.addCard(CardFactory.getCard(Value.Seven, Suit.Hearts));
        expect(player.getNumericScore()).toBe([21, 11]);

        player.addCard(CardFactory.getCard(Value.Three, Suit.Hearts));
        expect(player.getNumericScore()).toBe([15]);

        player.addCard(CardFactory.getCard(Value.Eight, Suit.Hearts));
        expect(player.getNumericScore()).toBe([23]);
      });
    });

    describe('has21', () => {
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


    describe('hasBusted', () => {
      expect(player.hasBusted()).toBe(false);

      player.addCard(CardFactory.getCard(Value.Ace, Suit.Diamonds));
      player.addCard(CardFactory.getCard(Value.Eight, Suit.Spades));
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

    describe('getNextMove', () => {
      // Not exactly sure how to test this currently, will finish later
    })

    describe('getBlackjackAction', () => {
      // Not exactly sure how to test this currently, will finish later

    })

    describe('doTurn', () => {
      // Not exactly sure how to test this currently, will finish later
    })



  });

  describe('static methods', () => {
    describe('parseNextMove', () => {
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
