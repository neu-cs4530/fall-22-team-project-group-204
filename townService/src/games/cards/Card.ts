import { getSuitString, parseSuit, Suit } from "./Suit";
import { getValueString, parseValueFromString, Value } from "./Value";

export default class Card {

  public _value: Value;

  public _suit: Suit;

  public _hidden?: Boolean;

  // figure defaulting to hidden is a reasonable
  constructor(value: Value, suit: Suit, hidden: Boolean = true) {
    this._value = value;
    this._suit = suit;
    this._hidden = hidden;
  }

  public toString(): string {
    return getValueString(this._value) + getSuitString(this._suit);
  }

}
