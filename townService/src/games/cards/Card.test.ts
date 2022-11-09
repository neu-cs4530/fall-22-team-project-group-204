/* eslint-disable prettier/prettier */
import Suit from './Suit';
import Value from './Value';
import Card from './Card';

describe('Card', () => {
  describe('constructor', () => {
    it('Constructs a Card properly', () => {
      const aceOfSpades = new Card(Value.Ace, Suit.Spades);
      expect(aceOfSpades.value).toBe(Value.Ace);
      expect(aceOfSpades.suit).toBe(Suit.Spades);
    });
  });

  describe('getters', () => {
    it('Value getter works correctly', () => {
      const sevenOfDiamonds = new Card(Value.Seven, Suit.Diamonds);
      expect(sevenOfDiamonds.value).toBe(Value.Seven);
    });

    it('Suit getter works correctly', () => {
      const sevenOfDiamonds = new Card(Value.Seven, Suit.Diamonds);
      expect(sevenOfDiamonds.suit).toBe(Value.Seven);
    });

  });

  describe('toString', () => {
    it('Card.toString() works properly', () => {
      const sevenOfDiamonds = new Card(Value.Seven, Suit.Diamonds);
      expect(sevenOfDiamonds.toString()).toBe("♦7");

      const aceOfSpades = new Card(Value.Ace, Suit.Spades);
      expect(aceOfSpades.toString()).toBe("♠A");

      const twoOfHearts = new Card(Value.Two, Suit.Hearts);
      expect(twoOfHearts.toString()).toBe("♥2");

      const fiveOfClubs = new Card(Value.Five, Suit.Clubs);
      expect(fiveOfClubs.toString()).toBe("♣5");

    });
  });

  describe('getNumericValue', () => {
    it('Card.getNumericValue() works properly', () => {
      const sevenOfDiamonds = new Card(Value.Seven, Suit.Diamonds);
      expect(sevenOfDiamonds.getNumericValue).toBe([7]);

      const aceOfSpades = new Card(Value.Ace, Suit.Spades);
      expect(aceOfSpades.getNumericValue).toBe([1, 11]);

      const fiveOfClubs = new Card(Value.Five, Suit.Clubs);
      expect(fiveOfClubs.getNumericValue()).toBe([5]);
    });
  });


});
