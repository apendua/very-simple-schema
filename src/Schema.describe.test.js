/* eslint-env jest */
import {
  ERROR_NOT_STRING,
  ERROR_NOT_NUMBER,
  ERROR_NOT_ARRAY,
} from './constants.js';
import Schema from './Schema.js';

describe('Test Schema.describe', () => {
  describe('Given different error types', () => {
    test('should describe a string type error', () => {
      expect(Schema.describe({
        error: ERROR_NOT_STRING,
      })).toBe('Value should be a string');
    });

    test('should describe a number type error', () => {
      expect(Schema.describe({
        error: ERROR_NOT_NUMBER,
      })).toBe('Value should be a number');
    });

    test('should describe an array error', () => {
      expect(Schema.describe({
        error: ERROR_NOT_ARRAY,
      })).toBe('Value should be an array');
    });

    test('should describe an object error', () => {
      expect(Schema.describe({
        error: ERROR_NOT_ARRAY,
      })).toBe('Value should be an array');
    });

    test('should describe an object field error', () => {
      expect(Schema.describe({
        errors: {
          a: { error: ERROR_NOT_STRING },
        },
      })).toEqual({
        a: 'a should be a string',
      });
    });

    test('should describe errors in an array', () => {
      expect(Schema.describe({
        errors: [
          undefined,
          undefined,
          { error: ERROR_NOT_STRING },
        ],
      })).toEqual([
        undefined,
        undefined,
        '2 should be a string',
      ]);
    });

    test('should describe an deep nested field error', () => {
      expect(Schema.describe({
        errors: {
          a: {
            errors: {
              b: {
                errors: {
                  c: { error: ERROR_NOT_STRING },
                },
              },
            },
          },
        },
      })).toEqual({
        a: { b: { c: 'a.b.c should be a string' } },
      });
    });

    test('should describe errors in a complex object', () => {
      expect(new Schema({
        name: {
          type: new Schema({
            first: String,
            last: String,
          }),
        },
        books: {
          type: [new Schema({
            title: { type: String, label: 'Book title' },
          })],
        },
      }).validate({
        name: {
          first: 'Tomasz',
        },
        books: [
          { title: 'The Lord of the Rings', author: 'Tolkien' },
          { },
        ],
      }, {
        noException: true,
      })).toEqual({
        books: [
          {
            author: 'books.0.author is not allowed',
          },
          {
            title: 'Book title is required',
          },
        ],
        name: {
          last: 'name.last is required',
        },
      });
    });
  });
});
