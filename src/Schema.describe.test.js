/* eslint-env mocha */
/* eslint no-unused-expressions: "off" */
/* eslint prefer-arrow-callback: "off" */
import chai from 'chai';
import {
  ERROR_NOT_STRING,
  ERROR_NOT_NUMBER,
  ERROR_NOT_ARRAY,
} from './constants.js';
import Schema from './Schema.js';

chai.should();

describe('Test Schema.describe', function () {
  describe('Given different error types', function () {
    it('should describe a string type error', function () {
      Schema.describe({
        error: ERROR_NOT_STRING,
      }).should.equal('Value should be a string');
    });

    it('should describe a number type error', function () {
      Schema.describe({
        error: ERROR_NOT_NUMBER,
      }).should.equal('Value should be a number');
    });

    it('should describe an array error', function () {
      Schema.describe({
        error: ERROR_NOT_ARRAY,
      }).should.equal('Value should be an array');
    });

    it('should describe an object error', function () {
      Schema.describe({
        error: ERROR_NOT_ARRAY,
      }).should.equal('Value should be an array');
    });

    it('should describe an object field error', function () {
      Schema.describe({
        errors: {
          a: { error: ERROR_NOT_STRING },
        },
      }).should.deep.equal({
        a: 'a should be a string',
      });
    });

    it('should describe errors in an array', function () {
      Schema.describe({
        errors: [
          undefined,
          undefined,
          { error: ERROR_NOT_STRING },
        ],
      }).should.deep.equal([
        undefined,
        undefined,
        '2 should be a string',
      ]);
    });

    it('should describe an deep nested field error', function () {
      Schema.describe({
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
      }).should.deep.equal({
        a: { b: { c: 'a.b.c should be a string' } },
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
      }).should.deep.equal({
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
