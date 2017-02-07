/* eslint-env mocha */
/* eslint no-unused-expressions: "off" */
/* eslint prefer-arrow-callback: "off" */
import chai from 'chai';
import createSchema from './createSchema.js';
import {
  MODE_ARRAY,
  MODE_MERGE,
  MODE_ONE_OF,
  ERROR_BAD_DATE,
  ERROR_REQUIRED,
  ERROR_NOT_EQUAL,
  ERROR_NOT_ALLOWED,
  ERROR_NO_MATCH,
  ERROR_NO_DECIMAL,
  ERROR_EXPECTED_STRING,
  ERROR_EXPECTED_NUMBER,
  ERROR_EXPECTED_BOOLEAN,
  ERROR_EXPECTED_DATE,
  ERROR_EXPECTED_ARRAY,
  ERROR_EXPECTED_OBJECT,
  ERROR_EXPECTED_CONSTRUCTOR,
} from './constants.js';
import presetDefault from './plugins/preset-default.js';

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

  describe('Given a literal schema', function () {
    beforeEach(function () {
      this.schema1 = new this.Schema(1);
      this.schema2 = new this.Schema('a');
      this.schema3 = new this.Schema(true);
      this.schema4 = new this.Schema(null);
    });
    it('should validate a number', function () {
      should.not.exist(this.schema1.getErrors(1));
    });
    it('should return error if number is not equal', function () {
      this.schema1.getErrors(2).should.deep.equal({
        error: ERROR_NOT_EQUAL,
        value: 2,
        expected: 1,
      });
    });
    it('should validate a string', function () {
      should.not.exist(this.schema2.getErrors('a'));
    });
    it('should return error if strings are not equal', function () {
      this.schema2.getErrors('b').should.deep.equal({
        error: ERROR_NOT_EQUAL,
        value: 'b',
        expected: 'a',
      });
    });
    it('should validate a boolean', function () {
      should.not.exist(this.schema3.getErrors(true));
    });
    it('should return error if booleans are not equal', function () {
      this.schema3.getErrors(false).should.deep.equal({
        error: ERROR_NOT_EQUAL,
        value: false,
        expected: true,
      });
    });
    it('should validate a null', function () {
      should.not.exist(this.schema4.getErrors(null));
    });
    it('should return error if values is not null', function () {
      this.schema4.getErrors('whatever').should.deep.equal({
        error: ERROR_NOT_EQUAL,
        value: 'whatever',
        expected: null,
      });
    });
  });

  describe('Given an atomic schema', function () {
    beforeEach(function () {
      this.schema1 = new this.Schema(Number);
      this.schema2 = new this.Schema(String);
      this.schema3 = new this.Schema(Boolean);
    });
    it('should validate a number', function () {
      should.not.exist(this.schema1.getErrors(1));
    });
    it('should return error if not a number', function () {
      this.schema1.getErrors('not a number').should.deep.equal({
        error: ERROR_EXPECTED_NUMBER,
        value: 'not a number',
      });
    });
    it('should validate a string', function () {
      should.not.exist(this.schema2.getErrors('this is a string'));
    });
    it('should return error if not a string', function () {
      this.schema2.getErrors(true).should.deep.equal({
        error: ERROR_EXPECTED_STRING,
        value: true,
      });
    });
    it('should validate a boolean', function () {
      should.not.exist(this.schema3.getErrors(true));
    });
    it('should return error if not a boolean', function () {
      this.schema3.getErrors('not a boolean').should.deep.equal({
        error: ERROR_EXPECTED_BOOLEAN,
        value: 'not a boolean',
      });
    });
  });

  describe('Given an array schema', function () {
    beforeEach(function () {
      this.schema1 = new this.Schema([Number]);
      this.schema2 = new this.Schema([String], { allowedValues: ['a', 'b', 'c'] });
    });
    it('should return error if not an array', function () {
      this.schema1.getErrors('this is not an array').should.deep.equal({
        error: ERROR_EXPECTED_ARRAY,
        value: 'this is not an array',
      });
    });
    it('should accept array of numbers', function () {
      should.not.exist(this.schema1.getErrors([1, 2, 3]));
    });
    it('should reject array of strings', function () {
      this.schema1.getErrors(['a', 'b']).should.deep.equal({
        errors: [{
          error: ERROR_EXPECTED_NUMBER,
          value: 'a',
        }, {
          error: ERROR_EXPECTED_NUMBER,
          value: 'b',
        }],
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
          value: 3,
          expected: [1, 2],
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
              value: 'x',
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

  describe('Given a flat object schema', function () {
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
          a: { error: ERROR_EXPECTED_STRING, value: 1 },
          x: { error: ERROR_EXPECTED_NUMBER, value: true },
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
          a: { error: ERROR_EXPECTED_STRING, value: 1 },
          b: { error: ERROR_EXPECTED_STRING, value: 2 },
          x: { error: ERROR_EXPECTED_NUMBER, value: true },
        },
      });
    });
  });

  describe('Describe errors', function () {
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
