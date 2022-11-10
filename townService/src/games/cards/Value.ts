/* eslint-disable consistent-return */

enum Value {
  Two,
  Three,
  Four,
  Five,
  Six,
  Seven,
  Eight,
  Nine,
  Ten,
  Jack,
  Queen,
  King,
  Ace,
}

export const VALUES: Value[] = [
  Value.Two,
  Value.Three,
  Value.Four,
  Value.Five,
  Value.Six,
  Value.Seven,
  Value.Eight,
  Value.Nine,
  Value.Ten,
  Value.Jack,
  Value.Queen,
  Value.King,
  Value.Ace,
];

const valueStringLookup: Map<Value, Array<string>> = new Map([
  [Value.Ace, ['A', 'Ace', '1', 'One', '11', 'Eleven']],
  [Value.Two, ['2', 'Two']],
  [Value.Three, ['3', 'Three']],
  [Value.Four, ['4', 'Four']],
  [Value.Five, ['5', 'Five']],
  [Value.Six, ['6', 'Six']],
  [Value.Seven, ['7', 'Seven']],
  [Value.Eight, ['8', 'Eight']],
  [Value.Nine, ['9', 'Nine']],
  [Value.Ten, ['10', 'Ten']],
  [Value.Jack, ['J', 'Jack', '10', 'Ten']],
  [Value.Queen, ['Q', 'Queen', '10', 'Ten']],
  [Value.King, ['K', 'King', '10', 'Ten']],
]);

export function getValueString(value: Value): string {
  // it technically could still be undefined so I am not going
  // to give it an official type declaration
  const valueAsString = valueStringLookup.get(value);
  if (!valueAsString) {
    throw new Error('Input argument is not a valid value!');
  }
  return valueAsString[0];
}

export function parseValueFromString(value: string): Value {
  for (const [key, valueArray] of valueStringLookup) {
    if (valueArray.some(valueString => valueString === value)) {
      return key;
    }
  }
  throw new Error('Input argument is not a valid value!');
}

const valueNumLookup: Map<Value, Array<number>> = new Map([
  [Value.Ace, [1, 11]],
  [Value.Two, [2]],
  [Value.Three, [3]],
  [Value.Four, [4]],
  [Value.Five, [5]],
  [Value.Six, [6]],
  [Value.Seven, [7]],
  [Value.Eight, [8]],
  [Value.Nine, [9]],
  [Value.Ten, [10]],
  [Value.Jack, [10]],
  [Value.Queen, [10]],
  [Value.King, [10]],
]);

export function parseValue(value: number): Value {
  for (const [key, valueArray] of valueNumLookup) {
    if (valueArray.some(valueNum => valueNum === value)) {
      return key;
    }
  }
  throw new Error('Input argument is not a valid value!');
}

export function getValueNumbers(value: Value): Array<number> {
  const valueAsNums = valueNumLookup.get(value);
  // if it is null or undefined throw error
  if (!valueAsNums) {
    throw new Error('Input argument is not a valid value!');
  }
  return valueAsNums;
}

export default Value;
