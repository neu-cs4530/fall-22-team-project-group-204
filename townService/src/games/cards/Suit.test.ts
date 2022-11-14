/* eslint-disable prettier/prettier */
import Suit, { getSuitSymbolString, parseSuit, getSuitString } from './Suit';

describe('Suit', () => {

  describe('getSuitString', () => {
    it('Function works properly', () => {
      expect(getSuitSymbolString(Suit.Diamonds)).toBe('♦')
      expect(getSuitSymbolString(Suit.Spades)).toBe('♠')
      expect(getSuitSymbolString(Suit.Hearts)).toBe('♥')
      expect(getSuitSymbolString(Suit.Clubs)).toBe('♣')
    });
  });

  describe('getSuitStringFormal', () => {
    it('Function works properly', () => {
      expect(getSuitString(Suit.Diamonds)).toBe('Diamonds')
      expect(getSuitString(Suit.Spades)).toBe('Spades')
      expect(getSuitString(Suit.Hearts)).toBe('Hearts')
      expect(getSuitString(Suit.Clubs)).toBe('Clubs')
    });
  });

  describe('parseSuit', () => {
    it('Function works properly', () => {
      expect(parseSuit('Diamonds')).toBe(Suit.Diamonds)
      expect(parseSuit('Spades')).toBe(Suit.Spades)
      expect(parseSuit('Hearts')).toBe(Suit.Hearts)
      expect(parseSuit('Clubs')).toBe(Suit.Clubs)

      expect(parseSuit('diamonds')).toBe(Suit.Diamonds)
      expect(parseSuit('spades')).toBe(Suit.Spades)

      expect(parseSuit('♦')).toBe(Suit.Diamonds)
      expect(parseSuit('♠')).toBe(Suit.Spades)
      expect(parseSuit('♥')).toBe(Suit.Hearts)
      expect(parseSuit('♣')).toBe(Suit.Clubs)

      expect(() => { parseSuit('spade') }).toThrowError()
      expect(() => { parseSuit('diamond') }).toThrowError()
      expect(() => { parseSuit('heart') }).toThrowError()
      expect(() => { parseSuit('club') }).toThrowError()
      expect(() => { parseSuit('queen') }).toThrowError()

    });
  });
});
