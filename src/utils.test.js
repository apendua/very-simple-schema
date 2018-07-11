/* eslint-env jest */
import {
  isArray,
  isEmpty,
  getAny,
  each,
  every,
} from './utils';

describe('Test utils', () => {
  describe('isArray', () => {
    test('detects an array', () => {
      expect(isArray([])).toEqual(true);
    });
    test('detects object is not an array', () => {
      expect(isArray({})).toEqual(false);
    });
  });

  describe('isEmpty', () => {
    test('detects falsy value', () => {
      expect(isEmpty(null)).toEqual(true);
    });
    test('detects an object is empty', () => {
      expect(isEmpty({})).toEqual(true);
    });
    test('detects an object is not empty', () => {
      expect(isEmpty({ a: 1 })).toEqual(false);
    });
    test('detects an array is empty', () => {
      expect(isEmpty([])).toEqual(true);
    });
    test('detects an array is not empty', () => {
      expect(isEmpty([1])).toEqual(false);
    });
  });

  describe('getAny', () => {
    test('returns nothing if falsy value', () => {
      expect(getAny(null)).toEqual(undefined);
    });
    test('returns nothing if object is empty', () => {
      expect(getAny({})).toEqual(undefined);
    });
    test('returns the only value in object', () => {
      expect(getAny({ a: 1 })).toEqual(1);
    });
  });

  describe('each', () => {
    test('executes for each array element', () => {
      let total = 0;
      each([1, 2, 3], (value) => {
        total += value;
      });
      expect(total).toEqual(6);
    });
    test('executes for each object element', () => {
      let total = 0;
      each({
        a: 1,
        b: 2,
        c: 3,
      }, (value) => {
        total += value;
      });
      expect(total).toEqual(6);
    });
  });

  describe('every', () => {
    test('executes for each array element', () => {
      expect(every([1, 2, 3], value => value > 0)).toEqual(true);
    });
    test('executes for each array element unless predicate fails', () => {
      expect(every([1, 2, 3], value => value < 3)).toEqual(false);
    });
    test('executes for each object element', () => {
      expect(every({
        a: 1,
        b: 2,
        c: 3,
      }, value => value > 0)).toEqual(true);
    });
    test('executes for each object element unless predicate fails', () => {
      expect(every({
        a: 1,
        b: 2,
        c: 3,
      }, value => value < 3)).toEqual(false);
    });
  });
});
