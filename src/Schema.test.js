/* eslint-env mocha */
/* eslint no-unused-expressions: "off" */
/* eslint prefer-arrow-callback: "off" */
import chai from 'chai';
import {
  ERROR_REQUIRED,
  ERROR_NOT_ALLOWED,
  ERROR_BAD_FORMAT,
  ERROR_EXPECTED_NUMBER,
  ERROR_EXPECTED_STRING,
  ERROR_KEY_NOT_ALLOWED,
} from './constants.js';
import Schema from './Schema.js';

const should = chai.should();

describe('Test createSchema', function () {
  describe('Given empty schema', function () {
    beforeEach(function () {
      this.schema = new Schema({});
    });
    it('should validate empty object', function () {
      should.not.exist(this.schema.getErrors({}));
    });
  });

  describe('Given a schema with allowedValues', function () {
    describe('and the schema is an array', function () {
      beforeEach(function () {
        this.schema1 = new Schema([String], { allowedValues: ['a', 'b', 'c'] });
      });
      it('should reject value that is not allowed', function () {
        this.schema1.getErrors(['a', 'b', 'x']).should.deep.equal({
          errors: [
            undefined,
            undefined,
            {
              error: ERROR_NOT_ALLOWED,
              actual: 'x',
              expected: ['a', 'b', 'c'],
            },
          ],
        });
      });
      it('should accept value that is allowed', function () {
        should.not.exist(this.schema1.getErrors(['a', 'b', 'c']));
      });
    });
  });

  describe('Given a schema with regular expression', function () {
    describe('and the schema is an array', function () {
      beforeEach(function () {
        this.schema1 = new Schema([String], { regEx: /\d+/ });
      });
      it('should reject value that is not allowed', function () {
        this.schema1.getErrors(['1', '12', 'xxx']).should.deep.equal({
          errors: [
            undefined,
            undefined,
            {
              error: ERROR_BAD_FORMAT,
              expected: 'match /\\d+/',
            },
          ],
        });
      });
      it('should accept value that is allowed', function () {
        should.not.exist(this.schema1.getErrors(['1', '12', '123']));
      });
    });
  });

  describe('Given a nested object schema', function () {
    beforeEach(function () {
      this.schema1 = new Schema({
        a: {
          x: Number,
          y: Number,
        },
        b: {
          type: new Schema({
            x: Number,
            y: Number,
          }),
        },
        c: {
          type: {
            x: Number,
            y: Number,
          },
        },
      });
    });
    it('should reject object with missing properties', function () {
      this.schema1.getErrors({
        a: { x: 1 },
        b: { x: 1 },
        c: { x: 1 },
      }).should.deep.equal({
        errors: {
          a: { errors: { y: { error: ERROR_REQUIRED } } },
          b: { errors: { y: { error: ERROR_REQUIRED } } },
          c: { errors: { y: { error: ERROR_REQUIRED } } },
        },
      });
    });
  });

  describe('Given a schema with lazy fields', function () {
    beforeEach(function () {
      this.schema1 = new Schema({
        children: {
          type: [() => this.schema1],
          lazy: true,
        },
      });
    });

    it('should accept a nested object', function () {
      should.not.exist(this.schema1.getErrors({
        children: [{
          children: [{
            children: [],
          }],
        }],
      }));
    });

    it('should reject object with missing fields', function () {
      this.schema1.getErrors({}).should.deep.equal({
        errors: {
          children: { error: ERROR_REQUIRED },
        },
      });
    });
  });

  describe('Given a merge schema', function () {
    beforeEach(function () {
      this.schema1 = new Schema([
        {
          a: { type: Number },
          b: { type: String },
        },
        {
          b: { type: Number },
          c: { type: String },
        },
      ], { merge: true });
    });

    it('should accept a valid object', function () {
      should.not.exist(this.schema1.getErrors({
        a: 1,
        b: 1,
        c: 'x',
      }));
    });

    it('should reject an object with invalid property type', function () {
      this.schema1.getErrors({
        a: 1,
        b: 'x',
        c: 'x',
      }).should.deep.equal({
        errors: {
          b: { error: ERROR_EXPECTED_NUMBER, actual: 'x' },
        },
      });
    });
  });

  describe('Given a schema with "pick"', function () {
    beforeEach(function () {
      this.schema1 = new Schema({
        a: { type: Number },
        b: { type: String },
        c: { type: Number },
      }, { pick: ['a', 'b'] });
    });

    it('should accept a valid object', function () {
      should.not.exist(this.schema1.getErrors({
        a: 1,
        b: 'x',
      }));
    });

    it('should reject an object with invalid property type', function () {
      this.schema1.getErrors({
        a: 1,
        b: 1,
        c: 'x',
      }).should.deep.equal({
        errors: {
          b: { error: ERROR_EXPECTED_STRING, actual: 1 },
          c: { error: ERROR_KEY_NOT_ALLOWED },
        },
      });
    });
  });
});
