import { getSuitString, parseSuit, Suit } from "./Suit";
import { getValueString, parseValueFromString, Value, getValueNumbers } from "./Value";

export default class Card {

  public _value: Value;

  public _suit: Suit;

  constructor(value: Value, suit: Suit) {
    this._value = value;
    this._suit = suit;
  }

  public toString(): string {
    return getValueString(this._value) + getSuitString(this._suit);
  }

  public getNumericValue(): Array<number> {
    return getValueNumbers(this._value);
  }

}
