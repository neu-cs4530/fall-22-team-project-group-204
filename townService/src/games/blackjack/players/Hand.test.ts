/* eslint-disable no-new */
/* eslint-disable prettier/prettier */

import Card from '../../cards/Card';
import CardFactory from '../../cards/CardFactory';
import Suit from '../../cards/Suit';
import Value from '../../cards/Value';
import Hand from './Hand';

describe('Hand', () => {
  describe('constructor', () => {
    it('Constructing a hand with a pre-defined list of cards works properly', () => {
      const handArray: [Card, boolean][] = [
        [CardFactory.getCard(Value.Two, Suit.Spades), true],
        [CardFactory.getCard(Value.Ace, Suit.Diamonds), false],
      ];
      expect(() => {
        new Hand(handArray);
      }).not.toThrowError();

      const hand = new Hand(handArray);

      expect(hand.cards).toBe(handArray);
    });

    it('Constructing a hand with an empty list of cards works properly', () => {
      expect(() => {
        new Hand();
      }).not.toThrowError();

      const hand = new Hand();

      expect(hand.cards).toStrictEqual([]);
    });
  });

  describe('getters & setters', () => {
    it('Hand.cards getter works properly', () => {
      const handArray: [Card, boolean][] = [
        [CardFactory.getCard(Value.Five, Suit.Diamonds), true],
        [CardFactory.getCard(Value.Ace, Suit.Hearts), false],
      ];
      const hand = new Hand(handArray);
      expect(hand.cards).toBe(handArray);

      const emptyHand = new Hand();
      expect(emptyHand.cards).toStrictEqual([]);
    });

    it('Hands.cards setter works properly', () => {
      const handArray: [Card, boolean][] = [
        [CardFactory.getCard(Value.Five, Suit.Diamonds), true],
        [CardFactory.getCard(Value.Ace, Suit.Hearts), false],
      ];
      const hand = new Hand(handArray);
      expect(hand.cards).toStrictEqual(handArray);

      const newHandArray: [Card, boolean][] = [
        [CardFactory.getCard(Value.Seven, Suit.Hearts), true],
        [CardFactory.getCard(Value.Two, Suit.Hearts), false],
        [CardFactory.getCard(Value.King, Suit.Clubs), true],
      ];
      hand.cards = newHandArray;
      expect(hand.cards).toStrictEqual(newHandArray);

      const emptyHand = new Hand();
      expect(emptyHand.cards).toStrictEqual([]);
      const lastHandArray: [Card, boolean][] = [
        [CardFactory.getCard(Value.Two, Suit.Spades), true],
        [CardFactory.getCard(Value.Ace, Suit.Diamonds), false],
      ];
      emptyHand.cards = lastHandArray;
      expect(emptyHand.cards).toStrictEqual(lastHandArray);
    });
  });

  describe('getNumericScore', () => {
    const hand = new Hand([
      [CardFactory.getCard(Value.Five, Suit.Diamonds), true],
      [CardFactory.getCard(Value.Ace, Suit.Hearts), false],
    ]);

    expect(hand.getNumericScores()).toStrictEqual([6, 16]);

    const hand2 = new Hand([[CardFactory.getCard(Value.Five, Suit.Diamonds), true]]);
    expect(hand2.getNumericScores()).toStrictEqual([5]);

    hand2.addCard(CardFactory.getCard(Value.Seven, Suit.Hearts));

    expect(hand2.getNumericScores()).toStrictEqual([12]);

    expect(new Hand().getNumericScores()).toStrictEqual([0]);

    expect(
      new Hand([
        [CardFactory.getCard(Value.King, Suit.Diamonds), true],
        [CardFactory.getCard(Value.Ace, Suit.Hearts), false],
      ]).getNumericScores(),
    ).toStrictEqual([11, 21]);
    expect(
      new Hand([
        [CardFactory.getCard(Value.Ace, Suit.Diamonds), true],
        [CardFactory.getCard(Value.Ace, Suit.Hearts), false],
      ]).getNumericScores(),
    ).toStrictEqual([2, 12, 22]);
    expect(
      new Hand([
        [CardFactory.getCard(Value.Ace, Suit.Diamonds), true],
        [CardFactory.getCard(Value.Two, Suit.Hearts), false],
      ]).getNumericScores(),
    ).toStrictEqual([3, 13]);
  });
});
// jest <file-name.ts?> --forceExit
