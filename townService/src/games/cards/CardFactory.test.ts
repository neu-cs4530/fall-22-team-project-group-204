/* eslint-disable prettier/prettier */
import Suit, { SUITS } from './Suit';
import Value, { VALUES } from './Value';
import Card from './Card';
import CardFactory from './CardFactory';

describe('CardFactory', () => {
  describe('getCard', () => {
    it('Method works correctly', () => {
      const card = CardFactory.getCard(Value.Ace, Suit.Diamonds);
      expect(card).toBeInstanceOf(Card);
      expect(card.value).toBe(Value.Ace);
      expect(card.suit).toBe(Suit.Diamonds);
      const eightOfHearts = CardFactory.getCard(Value.Eight, Suit.Hearts);
      expect(eightOfHearts.value).toBe(Value.Eight);
      expect(eightOfHearts.suit).toBe(Suit.Hearts);
      const tenOfSpades = CardFactory.getCard(Value.Ten, Suit.Spades);
      expect(tenOfSpades.value).toBe(Value.Ten);
      expect(tenOfSpades.suit).toBe(Suit.Spades);
      const queenOfClubs = CardFactory.getCard(Value.Queen, Suit.Clubs);
      expect(queenOfClubs.value).toBe(Value.Queen);
      expect(queenOfClubs.suit).toBe(Suit.Clubs);
    });

    it('Method shares the same instances of Cards', () => {
      const card = CardFactory.getCard(Value.Three, Suit.Spades);
      const card2 = CardFactory.getCard(Value.Three, Suit.Spades);
      expect(card).toBe(card2);
    });
  });

  describe('getDeck', () => {
    it('CardFactory.getDeck() works properly', () => {
      const fullDeck = VALUES.map(value =>
        SUITS.map(suit => CardFactory.getCard(value, suit)),
      ).flat();

      function matchExists(value: Value, suit: Suit) {
        return fullDeck.find(card => card.value === value && card.suit === suit) !== undefined;
      }

      const fullDeckFromFactory = CardFactory.getDeck();
      fullDeckFromFactory.forEach(card => {
        expect(matchExists(card.value, card.suit)).toBe(true);
      });
    });
  });
});
