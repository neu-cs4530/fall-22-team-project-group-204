/* eslint-disable prettier/prettier */

import Card from "../../cards/Card"
import CardFactory from "../../cards/CardFactory"
import Suit from "../../cards/Suit"
import Value from "../../cards/Value"
import Hand from "./Hand"


describe('Hand', () => {

  describe('constructor', () => {
    it('Constructing a hand with a pre-defined list of cards works properly', () => {
      const handArray: [Card, boolean][] = [[CardFactory.getCard(Value.Two, Suit.Spades), true],
      [CardFactory.getCard(Value.Ace, Suit.Diamonds), false]];
      expect(new Hand(handArray)).not.toThrowError();

      const hand = new Hand(handArray);

      expect(hand.cards).toBe(handArray);
    });

    it('Constructing a hand with an empty list of cards works properly', () => {
      expect(new Hand()).not.toThrowError();

      const hand = new Hand();

      expect(hand.cards).toBe([]);
    });
  })

  describe('getters & setters', () => {
    it('Hand.cards getter works properly', () => {
      const handArray: [Card, boolean][] = [[CardFactory.getCard(Value.Five, Suit.Diamonds), true],
      [CardFactory.getCard(Value.Ace, Suit.Hearts), false]];
      const hand = new Hand(handArray);
      expect(hand.cards).toBe(handArray);

      const emptyHand = new Hand();
      expect(emptyHand.cards).toBe([])
    });

    it('Hands.cards setter works properly', () => {
      const handArray: [Card, boolean][] = [[CardFactory.getCard(Value.Five, Suit.Diamonds), true],
      [CardFactory.getCard(Value.Ace, Suit.Hearts), false]];
      const hand = new Hand(handArray);
      expect(hand.cards).toBe(handArray);


      const newHandArray: [Card, boolean][] = [[CardFactory.getCard(Value.Seven, Suit.Hearts), true],
      [CardFactory.getCard(Value.Two, Suit.Hearts), false],
      [CardFactory.getCard(Value.King, Suit.Clubs), true]];
      hand.cards = newHandArray
      expect(hand.cards).toBe(newHandArray);

      const emptyHand = new Hand();
      expect(emptyHand.cards).toBe([]);
      const lastHandArray: [Card, boolean][] = [[CardFactory.getCard(Value.Two, Suit.Spades), true],
      [CardFactory.getCard(Value.Ace, Suit.Diamonds), false]];
      emptyHand.cards = lastHandArray;
      expect(emptyHand.cards).toBe(lastHandArray);
    });

  });

  describe('getNumericScore', () => {
    const hand = new Hand([[CardFactory.getCard(Value.Five, Suit.Diamonds), true],
                           [CardFactory.getCard(Value.Ace, Suit.Hearts), false]]);
    expect(hand.getNumericScores()).toBe([16, 6])

    expect(new Hand().getNumericScores()).toBe([])

    expect(new Hand([[CardFactory.getCard(Value.King, Suit.Diamonds), true],
    [CardFactory.getCard(Value.Ace, Suit.Hearts), false]]).getNumericScores()).toBe([21])

  });



})
