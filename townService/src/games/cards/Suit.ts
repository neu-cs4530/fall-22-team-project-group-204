/* eslint-disable consistent-return */
enum Suit {
  Diamonds,
  Spades,
  Hearts,
  Clubs,
}

export const SUITS: Suit[] = [Suit.Diamonds, Suit.Spades, Suit.Hearts, Suit.Clubs];

const suitLookup: Map<Suit, Array<string>> = new Map([
  [Suit.Diamonds, ['♦', 'Diamonds']],
  [Suit.Spades, ['♠', 'Spades']],
  [Suit.Hearts, ['♥', 'Hearts']],
  [Suit.Clubs, ['♣', 'Clubs']],
]);

export function getSuitSymbolString(suit: Suit): string {
  const ssuit = suitLookup.get(suit);
  if (!ssuit) {
    throw new Error('Input argument is not a valid suit!');
  }
  return ssuit[0];
}

export function getSuitString(suit: Suit): string {
  const ssuit = suitLookup.get(suit);
  if (!ssuit) {
    throw new Error('Input argument is not a valid suit!');
  }
  return ssuit[1];
}

export function parseSuit(suit: string): Suit {
  const suitLowercase = suit.toLowerCase();

  for (const [key, value] of suitLookup) {
    if (value.some(suitString => suitString.toLowerCase() === suitLowercase)) {
      return key;
    }
  }
  throw new Error('Input argument is not a valid suit!');
}

export default Suit;
