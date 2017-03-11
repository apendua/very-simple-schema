/* eslint-env mocha */
/* eslint no-unused-expressions: "off" */
/* eslint prefer-arrow-callback: "off" */
import chai from 'chai';
import {
  ERROR_EXPECTED_STRING,
  ERROR_EXPECTED_NUMBER,
  ERROR_EXPECTED_ARRAY,
} from './constants.js';
import Schema from './Schema.js';

chai.should();

describe('Test Schema.describe', function () {
  describe('Given different error types', function () {
    it('should describe a string type error', function () {
      Schema.describe({
        error: ERROR_EXPECTED_STRING,
      }).should.equal('Value must be a string');
    });

    it('should describe a number type error', function () {
      Schema.describe({
        error: ERROR_EXPECTED_NUMBER,
      }).should.equal('Value must be a number');
    });

    it('should describe an array error', function () {
      Schema.describe({
        error: ERROR_EXPECTED_ARRAY,
      }).should.equal('Value must be an array');
    });

    it('should describe an object error', function () {
      Schema.describe({
        error: ERROR_EXPECTED_ARRAY,
      }).should.equal('Value must be an array');
    });

    it('should describe an object field error', function () {
      Schema.describe({
        errors: {
          a: { error: ERROR_EXPECTED_STRING },
        },
      }).should.deep.equal({
        a: 'Value.a must be a string',
      });
    });

    it('should describe errors in an array', function () {
      Schema.describe({
        errors: [
          undefined,
          undefined,
          { error: ERROR_EXPECTED_STRING },
        ],
      }).should.deep.equal([
        undefined,
        undefined,
        'Value.2 must be a string',
      ]);
    });

    it('should describe an deep nested field error', function () {
      Schema.describe({
        errors: {
          a: {
            errors: {
              b: {
                errors: {
                  c: { error: ERROR_EXPECTED_STRING },
                },
              },
            },
          },
        },
      }).should.deep.equal({
        a: { b: { c: 'Value.a.b.c must be a string' } },
      });
    });

    it('should describe errors in a complex object', function () {
      new Schema({
        name: {
          type: new Schema({
            first: String,
            last: String,
          }),
        },
        books: {
          type: [new Schema({
            title: String,
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
      }).should.deep.equal({
        books: [
          undefined,
          {
            title: 'Value.books.1.title is required',
          },
        ],
        name: {
          last: 'Value.name.last is required',
        },
      });
    });
  });
});
