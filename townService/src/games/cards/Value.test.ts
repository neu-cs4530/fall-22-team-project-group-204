/* eslint-disable prettier/prettier */
import Value, { getValueString, parseValueFromString } from './Value';

describe('Value', () => {



  describe('getValueString', () => {
    it('Function works properly', () => {
      expect(getValueString(Value.Ace)).toBe('A');
      expect(getValueString((Value.Two))).toBe('2');
      expect(getValueString(Value.Three)).toBe('3');
      expect(getValueString(Value.Four)).toBe('4');
      expect(getValueString(Value.Five)).toBe('5');
      expect(getValueString(Value.Six)).toBe('6');
      expect(getValueString(Value.Seven)).toBe('7');
      expect(getValueString(Value.Eight)).toBe('8');
      expect(getValueString(Value.Nine)).toBe('9');
      expect(getValueString(Value.Ten)).toBe('10');
      expect(getValueString(Value.Jack)).toBe('J');
      expect(getValueString(Value.Queen)).toBe('Q');
      expect(getValueString(Value.King)).toBe('K');
    });
    });
    });


  describe('parseValueFromString', () => {
    it('Function works properly', () => {
      expect(parseValueFromString('A')).toBe(Value.Ace)
      expect(parseValueFromString('2')).toBe(Value.Two)
      expect(parseValueFromString('3')).toBe(Value.Three);
      expect(parseValueFromString('4')).toBe(Value.Four);
      expect(parseValueFromString('5')).toBe(Value.Five);
      expect(parseValueFromString('6')).toBe(Value.Six);
      expect(parseValueFromString('7')).toBe(Value.Seven);
      expect(parseValueFromString('8')).toBe(Value.Eight);
      expect(parseValueFromString('9')).toBe(Value.Nine);
      expect(parseValueFromString('10')).toBe(Value.Ten);
      expect(parseValueFromString('J')).toBe(Value.Jack);
      expect(parseValueFromString('Q')).toBe(Value.Queen);
      expect(parseValueFromString('K')).toBe(Value.King);
    });
  });

