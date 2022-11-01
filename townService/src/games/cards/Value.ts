
export enum Value {
  Two, Three, Four, Five, Six, Seven, Eight,
  Nine, Ten, Jack, Queen, King, Ace
}

export const VALUES: Value[] = [Value.Two, Value.Three, Value.Four, Value.Five,
Value.Six, Value.Seven, Value.Eight, Value.Nine, Value.Ten, Value.Jack, Value.Queen,
Value.King, Value.Ace];

let valueStringLookup: Map<Value, Array<string>> = new Map([
  [Value.Ace, ["Ace", "1", "One"]],
  [Value.Two, ["Two", "2"]],
  [Value.Three, ["Three", "3"]],
  [Value.Four, ["Four", "4"]],
  [Value.Five, ["Five", "5"]],
  [Value.Six, ["Six", "6"]],
  [Value.Seven, ["Seven", "7"]],
  [Value.Eight, ["Eight", "8"]],
  [Value.Nine, ["Nine", "9"]],
  [Value.Ten, ["Ten", "10"]],
  [Value.Jack, ["Jack", "11", "Eleven"]],
  [Value.Queen, ["Queen", "12", "Twelve"]],
  [Value.King, ["King", "13", "Thirteen"]]]);

export function getValueString(value: Value): string {
  const sval = valueStringLookup.get(value)
  if (!sval) {
    throw new Error("Input argument is not a valid value!");
  }
  return sval[0]
}

export function parseValueFromString(value: string): Value {
  valueStringLookup.forEach((svals, val) => {
    if (svals.some(s => s === value)) {
      return val;
    }
  });
  throw new Error("Input argument is not a valid value!");
}

let valueNumLookup: Map<Value, number> = new Map([
  [Value.Ace, 1],
  [Value.Two, 2],
  [Value.Three, 3],
  [Value.Four, 4],
  [Value.Five, 5],
  [Value.Six, 6],
  [Value.Seven, 7],
  [Value.Eight, 8],
  [Value.Nine, 9],
  [Value.Ten, 10],
  [Value.Jack, 11],
  [Value.Queen, 12],
  [Value.King, 13]]);  


export function parseValue(value: number): Value {
  valueNumLookup.forEach((val, num) => {
    if (num === value) {
      return val;
    }
  });
  throw new Error("Input argument is not a valid value!");

}

export function getValueNumber(value: Value): number {
  const nval = valueNumLookup.get(value);
  if (!nval) {
    throw new Error("Input argument is not a valid value!");
  }
  return nval;
}