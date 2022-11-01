export enum Suit {
  Diamonds, Spades, Hearts, Clubs
}

export const SUITS: Suit[] = [Suit.Diamonds, Suit.Spades, Suit.Hearts, Suit.Clubs];

let suitLookup: Map<Suit, Array<string>> = new Map([
  [Suit.Diamonds, ["♦", "Diamonds"]],
  [Suit.Spades, ["♠", "Spades"]],
  [Suit.Hearts, ["♥", "Hearts"]],
  [Suit.Clubs, ["♣", "Suits"]]
])

export function getSuitString(suit: Suit): string {
  const ssuit = suitLookup.get(suit);
  if (!ssuit) {
    throw new Error("Input argument is not a valid suit!");
  }
  return ssuit[0];
}

export function getSuitStringFormal(suit: Suit): string {
  const ssuit = suitLookup.get(suit);
  if (!ssuit) {
    throw new Error("Input argument is not a valid suit!");
  }
  return ssuit[1];
}

export function parseSuit(suit: string): Suit {
  suitLookup.forEach((ssuits, osuit) => {
    if (ssuits.some(s => s === suit)) {
      return osuit;
    }
  });
  throw new Error("Input argument is not a valid suit!"); 
}