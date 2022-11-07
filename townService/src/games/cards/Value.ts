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
  [Value.Ace, ['Ace', '1', 'One', '11', 'Eleven']],
  [Value.Two, ['Two', '2']],
  [Value.Three, ['Three', '3']],
  [Value.Four, ['Four', '4']],
  [Value.Five, ['Five', '5']],
  [Value.Six, ['Six', '6']],
  [Value.Seven, ['Seven', '7']],
  [Value.Eight, ['Eight', '8']],
  [Value.Nine, ['Nine', '9']],
  [Value.Ten, ['Ten', '10']],
  [Value.Jack, ['Jack', '10', 'Ten']],
  [Value.Queen, ['Queen', '10', 'Ten']],
  [Value.King, ['King', '10', 'Ten']],
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
  valueStringLookup.forEach((svals, val) => {
    if (svals.some(s => s === value)) {
      return val;
    }
  });
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
  valueNumLookup.forEach((val, num) => {
    if (num === value) {
      return val;
    }
  });
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
