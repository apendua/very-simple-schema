/* eslint-env mocha */
/* eslint no-unused-expressions: "off" */
/* eslint prefer-arrow-callback: "off" */
import chai from 'chai';
import {
  ERROR_MISSING_FIELD,
  ERROR_VALUE_NOT_ALLOWED,
  ERROR_DOES_NOT_MATCH,
  ERROR_NOT_NUMBER,
  ERROR_NOT_STRING,
  ERROR_KEY_NOT_ALLOWED,
  ERROR_TOO_LONG,
  ERROR_NOT_OBJECT,
} from './constants.js';
import Schema from './Schema.js';

const should = chai.should();

describe('Test Schema', function () {
  describe('Given a Schema class', function () {
    it('should expose ERROR_MISSING_FIELD', function () {
      Schema.ERROR_MISSING_FIELD.should.be.ok;
    });
    it('should expose ERROR_KEY_NOT_ALLOWED', function () {
      Schema.ERROR_KEY_NOT_ALLOWED.should.be.ok;
    });
    it('should expose ERROR_INVALID_DATE', function () {
      Schema.ERROR_INVALID_DATE.should.be.ok;
    });
    it('should expose ERROR_DOES_NOT_MATCH', function () {
      Schema.ERROR_DOES_NOT_MATCH.should.be.ok;
    });
    it('should expose ERROR_NOT_EQUAL', function () {
      Schema.ERROR_NOT_EQUAL.should.be.ok;
    });
    it('should expose ERROR_NOT_INTEGER', function () {
      Schema.ERROR_NOT_INTEGER.should.be.ok;
    });
    it('should expose ERROR_NOT_STRING', function () {
      Schema.ERROR_NOT_STRING.should.be.ok;
    });
    it('should expose ERROR_NOT_NUMBER', function () {
      Schema.ERROR_NOT_NUMBER.should.be.ok;
    });
    it('should expose ERROR_NOT_BOOLEAN', function () {
      Schema.ERROR_NOT_BOOLEAN.should.be.ok;
    });
    it('should expose ERROR_NOT_ARRAY', function () {
      Schema.ERROR_NOT_ARRAY.should.be.ok;
    });
    it('should expose ERROR_NOT_OBJECT', function () {
      Schema.ERROR_NOT_OBJECT.should.be.ok;
    });
    it('should expose ERROR_NOT_DATE', function () {
      Schema.ERROR_NOT_DATE.should.be.ok;
    });
    it('should expose ERROR_NOT_INSTANCE_OF', function () {
      Schema.ERROR_NOT_INSTANCE_OF.should.be.ok;
    });
    it('should expose ERROR_NO_ALTERNATIVE', function () {
      Schema.ERROR_NO_ALTERNATIVE.should.be.ok;
    });
    it('should expose ERROR_VALUE_NOT_ALLOWED', function () {
      Schema.ERROR_VALUE_NOT_ALLOWED.should.be.ok;
    });
    it('should expose ERROR_TOO_MANY', function () {
      Schema.ERROR_TOO_MANY.should.be.ok;
    });
    it('should expose ERROR_TOO_FEW', function () {
      Schema.ERROR_TOO_FEW.should.be.ok;
    });
    it('should expose ERROR_TOO_LONG', function () {
      Schema.ERROR_TOO_LONG.should.be.ok;
    });
    it('should expose ERROR_TOO_SHORT', function () {
      Schema.ERROR_TOO_SHORT.should.be.ok;
    });
    it('should expose ERROR_TOO_LARGE', function () {
      Schema.ERROR_TOO_LARGE.should.be.ok;
    });
    it('should expose ERROR_TOO_SMALL', function () {
      Schema.ERROR_TOO_SMALL.should.be.ok;
    });
    it('should expose ERROR_IS_EMPTY', function () {
      Schema.ERROR_IS_EMPTY.should.be.ok;
    });
  });

  describe('Given "any" schema', function () {
    beforeEach(function () {
      this.schema = Schema.any();
    });
    it('should set "any" flag', function () {
      this.schema.compiled.isAny.should.be.true;
    });
    it('should accept an empty object', function () {
      should.not.exist(this.schema.getErrors({}));
    });
    it('should accept a number', function () {
      should.not.exist(this.schema.getErrors(1));
    });
  });

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
              error: ERROR_VALUE_NOT_ALLOWED,
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
              error: ERROR_DOES_NOT_MATCH,
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
        a: new Schema({
          x: Number,
          y: Number,
        }),
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
      }, {
        emptyStringsAreMissingValues: true,
      });
    });
    it('should reject object with missing properties', function () {
      this.schema1.getErrors({
        a: { x: 1 },
        b: { x: 1 },
        c: { x: 1 },
      }).should.deep.equal({
        errors: {
          a: { errors: { y: { error: ERROR_MISSING_FIELD } } },
          b: { errors: { y: { error: ERROR_MISSING_FIELD } } },
          c: { errors: { y: { error: ERROR_MISSING_FIELD } } },
        },
      });
    });
    it('should not report empty string, if object is expected', function () {
      this.schema1.getErrors({
        a: '',
        b: null,
        c: undefined,
      }).should.deep.equal({
        errors: {
          a: { error: ERROR_NOT_OBJECT, actual: '' },
          b: { error: ERROR_MISSING_FIELD },
          c: { error: ERROR_MISSING_FIELD },
        },
      });
    });
    it('should not report missing string, if number is expected', function () {
      this.schema1.getErrors({
        a: { x: '', y: 1 },
      }).should.deep.equal({
        errors: {
          a: {
            errors: {
              x: { error: ERROR_NOT_NUMBER, actual: '' },
            },
          },
          b: { error: ERROR_MISSING_FIELD },
          c: { error: ERROR_MISSING_FIELD },
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
          children: { error: ERROR_MISSING_FIELD },
        },
      });
    });
  });

  describe('Given a merge schema', function () {
    beforeEach(function () {
      this.schema1 = Schema.merge([
        {
          a: { type: Number },
          b: { type: String },
        },
        {
          b: { type: Number },
          c: { type: String },
        },
      ]);
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
          b: { error: ERROR_NOT_NUMBER, actual: 'x' },
        },
      });
    });
  });

  describe('Given a schema with "pick"', function () {
    beforeEach(function () {
      this.schema1 = Schema.pick({
        a: { type: Number },
        b: { type: String },
        c: { type: Number },
      }, ['a', 'b']);
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
          b: { error: ERROR_NOT_STRING, actual: 1 },
          c: { error: ERROR_KEY_NOT_ALLOWED },
        },
      });
    });
  });

  describe('Given a merged schema', function () {
    beforeEach(function () {
      this.schema1 = Schema.merge([
        {
          a: { type: String },
          b: { type: String },
        },
        {
          b: { type: String, optional: true },
          c: { type: String },
          d: { type: String },
        },
      ]);
    });

    it('should accept a valid object', function () {
      should.not.exist(this.schema1.getErrors({
        a: 'a',
        c: 'c',
        d: 'd',
      }));
    });

    it('should reject an invalid object', function () {
      this.schema1.getErrors({
        c: 'c',
        d: 'd',
      }).should.deep.equal({
        errors: {
          a: { error: ERROR_MISSING_FIELD },
        },
      });
    });

    it('should flag itself with isObject', function () {
      this.schema1.compiled.isObject.should.be.true;
    });

    it('should provide getSubSchema function', function () {
      this.schema1.compiled.getSubSchema.should.be.ok;
    });
  });

  describe('Given a hash with object sub-schema', function () {
    beforeEach(function () {
      this.schema = Schema.hash({
        key: new Schema(String, { max: 3 }),
        value: {
          a: Number,
          b: String,
        },
      });
    });
    it('should accept a valid object', function () {
      should.not.exist(this.schema.getErrors({
        xxx: { a: 1, b: 'x' },
        yyy: { a: 2, b: 'y' },
      }));
    });
    it('should reject if key is too long', function () {
      this.schema.getErrors({
        xxxx: { a: 1, b: 'x' },
      }).should.deep.equal({
        errors: {
          xxxx: {
            actual: 'xxxx',
            error: ERROR_TOO_LONG,
            expected: 3,
          },
        },
      });
    });
    it('should reject an invalid object', function () {
      this.schema.getErrors({
        xxx: { b: 'x' },
        yyy: { c: 2, a: 1, b: 'y' },
      }).should.deep.equal({
        errors: {
          xxx: {
            errors: {
              a: {
                error: ERROR_MISSING_FIELD,
              },
            },
          },
          yyy: {
            errors: {
              c: {
                error: ERROR_KEY_NOT_ALLOWED,
              },
            },
          },
        },
      });
    });
  });

  describe('Given an alternative schema', function () {
    beforeEach(function () {
      this.schema = Schema.oneOf([
        new Schema({}, { typeName: 'empty' }),
        new Schema(String, { typeName: 'text' }),
        new Schema([Number]),
      ]);
    });

    it('should generate a descriptive error of there is no match', function () {
      this.schema.validate(true, { noException: true }).should.equal('Value should be one of: empty, text, array of number');
    });
  });

  describe('Schema.clean()', function () {
    beforeEach(function () {
      this.schema = new Schema({
        a: new Schema({
          x: Number,
          y: String,
        }),
        b: [new Schema(Number)],
      });
      this.schema2 = new Schema({
        a: Number,
        b: Number,
        c: String,
      }, {
        additionalProperties: true,
      });
      this.schema3 = new Schema({
        a: Number,
        b: Number,
        c: String,
      }, {
        emptyStringsAreMissingValues: true,
      });
    });
    it('should not modify a valid object', function () {
      this.schema.clean({
        a: { x: 1, y: 'y' },
        b: [1, 2, 3],
      }).should.deep.equal({
        a: { x: 1, y: 'y' },
        b: [1, 2, 3],
      });
    });
    it('should convert strings to numbers', function () {
      this.schema.clean({
        a: { x: '1.5' },
        b: ['1', '2', 3],
      }).should.deep.equal({
        a: { x: 1.5 },
        b: [1, 2, 3],
      });
    });
    it('should convert numbers to strings', function () {
      this.schema.clean({
        a: { y: 1 },
      }).should.deep.equal({
        a: { y: '1' },
      });
    });
    it('should remove properties that are not allowed', function () {
      this.schema.clean({
        a: { z: {} },
      }).should.deep.equal({
        a: {},
      });
    });
    it('should remove properties that are null, undefined or empty', function () {
      this.schema3.clean({
        a: null,
        b: undefined,
        c: '',
      }).should.deep.equal({});
    });
    it('should not remove empty strings if they are not considerd missing values', function () {
      this.schema2.clean({
        a: null,
        b: undefined,
        c: '',
      }).should.deep.equal({
        c: '',
      });
    });
    it('should keep additional properties if they are allowed', function () {
      this.schema2.clean({
        d: 3,
      }).should.deep.equal({
        d: 3,
      });
    });
    it('should not change things that cannot be cleaned', function () {
      this.schema.clean({
        a: [1, 2, 3],
      }).should.deep.equal({
        a: [1, 2, 3],
      });
    });
  });

  describe('Given a an object schema with assumed value', function () {
    beforeEach(function () {
      this.schema1 = new Schema({
        a: new Schema({
          x: { type: new Schema(Number, { assumed: 0 }), optional: true },
          y: new Schema(Number, { assumed: 0 }),
        }),
        b: {
          type: new Schema({
            x: Number,
            y: Number,
          }, {
            assumed: {
              x: 0,
            },
          }),
          optional: true,
        },
      }, {
        assumed: {},
      });
    });
    it('should return relevant errors web validating null', function () {
      this.schema1.getErrors(null).should.deep.equal({
        errors: {
          a: { error: ERROR_MISSING_FIELD },
          b: { errors: { y: { error: ERROR_MISSING_FIELD } } },
        },
      });
    });
    it('should return relevant errors when validating empty object ', function () {
      this.schema1.getErrors({}).should.deep.equal({
        errors: {
          a: { error: ERROR_MISSING_FIELD },
          b: { errors: { y: { error: ERROR_MISSING_FIELD } } },
        },
      });
    });
    it('should return relevant errors when properties are empty objects', function () {
      this.schema1.getErrors({
        a: {},
        b: {},
      }).should.deep.equal({
        errors: {
          a: {
            errors: {
              y: { error: ERROR_MISSING_FIELD },
            },
          },
          b: {
            errors: {
              x: { error: ERROR_MISSING_FIELD },
              y: { error: ERROR_MISSING_FIELD },
            },
          },
        },
      });
    });
  });
});
