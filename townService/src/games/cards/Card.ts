import Suit, { getSuitSymbolString } from './Suit';
import Value, { getValueString, getValueNumbers } from './Value';

export default class Card {
  public readonly _value: Value;

  get value(): Value {
    return this._value;
  }

  public readonly _suit: Suit;

  get suit(): Suit {
    return this._suit;
  }

  constructor(value: Value, suit: Suit) {
    this._value = value;
    this._suit = suit;
  }

  public toString(): string {
    return getSuitSymbolString(this._suit) + getValueString(this._value);
  }

  public getNumericValue(): Array<number> {
    return getValueNumbers(this._value);
  }
}
