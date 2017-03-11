/* eslint-env mocha */
/* eslint no-unused-expressions: "off" */
/* eslint prefer-arrow-callback: "off" */
import chai from 'chai';
import createSchema from './createSchema.js';
import {
  ERROR_REQUIRED,
  ERROR_NOT_ALLOWED,
  ERROR_NO_MATCH,
  ERROR_EXPECTED_STRING,
  ERROR_EXPECTED_NUMBER,
  ERROR_BAD_FORMAT,
  ERROR_EXPECTED_ARRAY,
  ERROR_MIN_COUNT,
  ERROR_MAX_COUNT,
} from './constants.js';
import presetDefault from './plugins/presetDefault.js';

const should = chai.should();

describe('Test createSchema', function () {
  beforeEach(function () {
    this.Schema = createSchema(presetDefault);
  });

  describe('Given empty schema', function () {
    beforeEach(function () {
      this.schema = new this.Schema({});
    });
    it('should validate empty object', function () {
      should.not.exist(this.schema.getErrors({}));
    });
  });

  describe('Given an array schema', function () {
    beforeEach(function () {
      this.schema1 = new this.Schema([Number]);
      this.schema2 = new this.Schema([String], { allowedValues: ['a', 'b', 'c'] });
      this.schema3 = new this.Schema([Number], { minCount: 1 });
      this.schema4 = new this.Schema([Number], { maxCount: 2 });
    });
    it('should return error if not an array', function () {
      this.schema1.getErrors('this is not an array').should.deep.equal({
        error: ERROR_EXPECTED_ARRAY,
        actual: 'this is not an array',
      });
    });
    it('should accept array of numbers', function () {
      should.not.exist(this.schema1.getErrors([1, 2, 3]));
    });
    it('should reject array of strings', function () {
      this.schema1.getErrors(['a', 'b']).should.deep.equal({
        errors: [{
          error: ERROR_EXPECTED_NUMBER,
          actual: 'a',
        }, {
          error: ERROR_EXPECTED_NUMBER,
          actual: 'b',
        }],
      });
    });
    it('should accept array with minimal number of elements', function () {
      should.not.exist(this.schema3.getErrors([1]));
    });
    it('should reject array with to little elements', function () {
      this.schema3.getErrors([]).should.deep.equal({
        error: ERROR_MIN_COUNT,
        expected: 1,
      });
    });
    it('should accept array with maximal number of elements', function () {
      should.not.exist(this.schema3.getErrors([1, 2]));
    });
    it('should reject array with to many elements', function () {
      this.schema4.getErrors([1, 2, 3]).should.deep.equal({
        error: ERROR_MAX_COUNT,
        expected: 2,
      });
    });
  });

  describe('Given a "oneOf" schema', function () {
    beforeEach(function () {
      this.schema1 = new this.Schema([Number, String]);
    });
    it('should accept a number', function () {
      should.not.exist(this.schema1.getErrors(1));
    });
    it('should accept a string', function () {
      should.not.exist(this.schema1.getErrors('a'));
    });
    it('should reject if neither string nor number', function () {
      this.schema1.getErrors(true).should.deep.equal({
        error: ERROR_NO_MATCH,
      });
    });
  });

  describe('Given a schema with allowedValues', function () {
    describe('and the schema is atomic', function () {
      beforeEach(function () {
        this.schema1 = new this.Schema(Number, { allowedValues: [1, 2] });
      });
      it('should reject value that is not allowed', function () {
        this.schema1.getErrors(3).should.deep.equal({
          error: ERROR_NOT_ALLOWED,
          expected: [1, 2],
          actual: 3,
        });
      });
      it('should accept value that is allowed', function () {
        should.not.exist(this.schema1.getErrors(1));
      });
    });

    describe('and the schema is an array', function () {
      beforeEach(function () {
        this.schema1 = new this.Schema([String], { allowedValues: ['a', 'b', 'c'] });
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
    describe('and the schema is atomic', function () {
      beforeEach(function () {
        this.schema1 = new this.Schema(String, { regEx: /a+b+/ });
      });
      it('should reject value that is not allowed', function () {
        this.schema1.getErrors('axx').should.deep.equal({
          error: ERROR_BAD_FORMAT,
          expected: 'match /a+b+/',
        });
      });
      it('should accept value that is allowed', function () {
        should.not.exist(this.schema1.getErrors('aabb'));
      });
    });

    describe('and the schema is an array', function () {
      beforeEach(function () {
        this.schema1 = new this.Schema([String], { regEx: /\d+/ });
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

  describe('Given an object schema', function () {
    beforeEach(function () {
      this.schema1 = new this.Schema({
        a: { type: String },
        b: { type: String, optional: true },
        x: { type: Number },
      });
      this.schema2 = new this.Schema({
        a: String,
        b: String,
        x: Number,
      });
    });
    it('should accept a valid object', function () {
      should.not.exist(this.schema1.getErrors({
        a: '',
        b: '',
        x: 0,
      }));
    });
    it('should reject if required fields are missing', function () {
      this.schema1.getErrors({}).should.deep.equal({
        errors: {
          a: { error: ERROR_REQUIRED },
          x: { error: ERROR_REQUIRED },
        },
      });
    });
    it('should reject if required fields are missing (shorthand)', function () {
      this.schema2.getErrors({}).should.deep.equal({
        errors: {
          a: { error: ERROR_REQUIRED },
          b: { error: ERROR_REQUIRED },
          x: { error: ERROR_REQUIRED },
        },
      });
    });
    it('should reject if a fields is of invalid type', function () {
      this.schema1.getErrors({
        a: 1,
        x: true,
      }).should.deep.equal({
        errors: {
          a: { error: ERROR_EXPECTED_STRING, actual: 1 },
          x: { error: ERROR_EXPECTED_NUMBER, actual: true },
        },
      });
    });
    it('should reject if a fields is of invalid type (shorthand)', function () {
      this.schema2.getErrors({
        a: 1,
        b: 2,
        x: true,
      }).should.deep.equal({
        errors: {
          a: { error: ERROR_EXPECTED_STRING, actual: 1 },
          b: { error: ERROR_EXPECTED_STRING, actual: 2 },
          x: { error: ERROR_EXPECTED_NUMBER, actual: true },
        },
      });
    });
  });

  describe('Given a nested object schema', function () {
    beforeEach(function () {
      this.schema1 = new this.Schema({
        a: {
          x: Number,
          y: Number,
        },
        b: {
          type: new this.Schema({
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
      this.schema1 = new this.Schema({
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

  describe('Given different error types', function () {
    it('should describe a string type error', function () {
      this.Schema.describe({
        error: ERROR_EXPECTED_STRING,
      }).should.equal('Value must be a string');
    });

    it('should describe a number type error', function () {
      this.Schema.describe({
        error: ERROR_EXPECTED_NUMBER,
      }).should.equal('Value must be a number');
    });

    it('should describe an array error', function () {
      this.Schema.describe({
        error: ERROR_EXPECTED_ARRAY,
      }).should.equal('Value must be an array');
    });

    it('should describe an object error', function () {
      this.Schema.describe({
        error: ERROR_EXPECTED_ARRAY,
      }).should.equal('Value must be an array');
    });

    it('should describe an object field error', function () {
      this.Schema.describe({
        errors: {
          a: { error: ERROR_EXPECTED_STRING },
        },
      }).should.deep.equal({
        a: 'Value.a must be a string',
      });
    });

    it('should describe errors in an array', function () {
      this.Schema.describe({
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
      this.Schema.describe({
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
      new this.Schema({
        name: {
          type: new this.Schema({
            first: String,
            last: String,
          }),
        },
        books: {
          type: [new this.Schema({
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
