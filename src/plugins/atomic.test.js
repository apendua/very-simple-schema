/* eslint-env mocha */
/* eslint no-unused-expressions: "off" */
/* eslint prefer-arrow-callback: "off" */
import chai from 'chai';
import pluginAtomic from './atomic.js';
import {
  ERROR_TOO_SMALL,
  ERROR_TOO_LARGE,
  ERROR_NOT_EQUAL,
  ERROR_TOO_SHORT,
  ERROR_TOO_LONG,
  ERROR_NOT_INTEGER,
  ERROR_NOT_STRING,
  ERROR_NOT_NUMBER,
  ERROR_NOT_BOOLEAN,
  ERROR_NOT_DATE,
  ERROR_INVALID_DATE,
  ERROR_NOT_INSTANCE_OF,
} from '../constants.js';

const should = chai.should();
const compiler = {
  options: {},
  compile: () => ({ validate: () => {} }),
};
class Model {}

describe('Test atomic plugin', function () {
  beforeEach(function () {
    this.Schema = function () {};
    this.compile = (schemaDef, schemaOptions = {}) => pluginAtomic.compile(compiler, schemaDef, schemaOptions);
  });

  describe('Given the definition is not atomic', function () {
    beforeEach(function () {
      this.schema = this.compile([]);
    });
    it('should recognize it is not atomic', function () {
      this.schema.isAtomic.should.be.false;
    });
  });

  describe('Given a literal schema', function () {
    describe('and the definition is "1"', function () {
      beforeEach(function () {
        this.schema1 = this.compile(1);
      });
      it('should recognize this is an atomic schema', function () {
        this.schema1.isAtomic.should.be.true;
      });
      it('should recognize this is a literal', function () {
        this.schema1.isLiteral.should.be.true;
      });
      it('should accept the right value', function () {
        should.not.exist(this.schema1.validate(1));
      });
      it('should return error if number is not equal', function () {
        this.schema1.validate(2).should.deep.equal({
          error: ERROR_NOT_EQUAL,
          actual: 2,
          expected: 1,
        });
      });
    });

    describe('and the definition is "a"', function () {
      beforeEach(function () {
        this.schema2 = this.compile('a');
      });
      it('should recognize this is an atomic schema', function () {
        this.schema2.isAtomic.should.be.true;
      });
      it('should recognize this is a literal', function () {
        this.schema2.isLiteral.should.be.true;
      });
      it('should accept the right value', function () {
        should.not.exist(this.schema2.validate('a'));
      });
      it('should return error if strings are not equal', function () {
        this.schema2.validate('b').should.deep.equal({
          error: ERROR_NOT_EQUAL,
          actual: 'b',
          expected: 'a',
        });
      });
    });

    describe('and the definition is "true"', function () {
      beforeEach(function () {
        this.schema3 = this.compile(true);
      });
      it('should recognize this is an atomic schema', function () {
        this.schema3.isAtomic.should.be.true;
      });
      it('should recognize this is a literal', function () {
        this.schema3.isLiteral.should.be.true;
      });
      it('should validate a boolean', function () {
        should.not.exist(this.schema3.validate(true));
      });
      it('should return error if booleans are not equal', function () {
        this.schema3.validate(false).should.deep.equal({
          error: ERROR_NOT_EQUAL,
          actual: false,
          expected: true,
        });
      });
    });

    describe('and the definition is "null"', function () {
      beforeEach(function () {
        this.schema4 = this.compile(null);
      });
      it('should recognize this is an atomic schema', function () {
        this.schema4.isAtomic.should.be.true;
      });
      it('should recognize this is a literal', function () {
        this.schema4.isLiteral.should.be.true;
      });
      it('should validate a null', function () {
        should.not.exist(this.schema4.validate(null));
      });
      it('should return error if values is not null', function () {
        this.schema4.validate('whatever').should.deep.equal({
          error: ERROR_NOT_EQUAL,
          actual: 'whatever',
          expected: null,
        });
      });
    });
  });

  describe('Given an atomic schema', function () {
    describe('and the definition is "Number"', function () {
      beforeEach(function () {
        this.schema1 = this.compile(Number);
        this.schema1x = this.compile(Number, { decimal: true });
      });
      it('should recognize this is an atomic schema', function () {
        this.schema1.isAtomic.should.be.true;
      });
      it('should recognize a Number is expected', function () {
        this.schema1.isNumber.should.be.true;
      });
      it('should validate a number', function () {
        should.not.exist(this.schema1.validate(1));
      });
      it('should reject non integer by default', function () {
        this.schema1.validate(0.1).should.deep.equal({
          error: ERROR_NOT_INTEGER,
          actual: 0.1,
        });
      });
      it('should allow non integer if decimal option is used', function () {
        should.not.exist(this.schema1x.validate(0.1));
      });
      it('should return error if not a number', function () {
        this.schema1.validate('not a number').should.deep.equal({
          error: ERROR_NOT_NUMBER,
          actual: 'not a number',
        });
      });
    });

    describe('and the definition is "String"', function () {
      beforeEach(function () {
        this.schema2 = this.compile(String);
      });
      it('should recognize this is an atomic schema', function () {
        this.schema2.isAtomic.should.be.true;
      });
      it('should recognize a String is expected', function () {
        this.schema2.isString.should.be.true;
      });
      it('should validate a string', function () {
        should.not.exist(this.schema2.validate('this is a string'));
      });
      it('should return error if not a string', function () {
        this.schema2.validate(true).should.deep.equal({
          error: ERROR_NOT_STRING,
          actual: true,
        });
      });
    });

    describe('and the definition is "Boolean"', function () {
      beforeEach(function () {
        this.schema3 = this.compile(Boolean);
      });
      it('should recognize this is an atomic schema', function () {
        this.schema3.isAtomic.should.be.true;
      });
      it('should recognize a Boolean is expected', function () {
        this.schema3.isBoolean.should.be.true;
      });
      it('should validate a boolean', function () {
        should.not.exist(this.schema3.validate(true));
      });
      it('should return error if not a boolean', function () {
        this.schema3.validate('not a boolean').should.deep.equal({
          error: ERROR_NOT_BOOLEAN,
          actual: 'not a boolean',
        });
      });
    });

    describe('and the definition is "Number" with min/max', function () {
      beforeEach(function () {
        this.schema4 = this.compile(Number, { min: 0, max: 10 });
      });
      it('should accept a number value within range', function () {
        should.not.exist(this.schema4.validate(5));
      });
      it('should reject a number above max', function () {
        this.schema4.validate(11).should.deep.equal({
          error: ERROR_TOO_LARGE,
          expected: 10,
        });
      });
      it('should reject a number below min', function () {
        this.schema4.validate(-1).should.deep.equal({
          error: ERROR_TOO_SMALL,
          expected: 0,
        });
      });
    });

    describe('and the definition is "String" with min/max', function () {
      beforeEach(function () {
        this.schema5 = this.compile(String, { min: 2, max: 4 });
      });
      it('should accept a string value within range', function () {
        should.not.exist(this.schema5.validate('12'));
      });
      it('should reject a string above max', function () {
        this.schema5.validate('12345').should.deep.equal({
          error: ERROR_TOO_LONG,
          expected: 4,
        });
      });
      it('should reject a string below min', function () {
        this.schema5.validate('1').should.deep.equal({
          error: ERROR_TOO_SHORT,
          expected: 2,
        });
      });
    });

    describe('and the definition is "Date"', function () {
      beforeEach(function () {
        this.schema6 = this.compile(Date);
        this.schema6x = this.compile(Date, { min: new Date('2017-01-01'), max: new Date('2017-12-31') });
      });
      it('should accept a Date', function () {
        should.not.exist(this.schema6.validate(new Date()));
      });
      it('should not accept a differt type of data', function () {
        this.schema6.validate(1).should.deep.equal({
          error: ERROR_NOT_DATE,
          actual: 1,
        });
      });
      it('should reject an invalid date', function () {
        this.schema6.validate(new Date('2017-30-30')).should.deep.equal({
          error: ERROR_INVALID_DATE,
          actual: new Date('2017-30-30'),
        });
      });
      it('should accept a date within range', function () {
        should.not.exist(this.schema6x.validate(new Date('2017-03-11')));
      });
      it('should reject a date above max', function () {
        this.schema6x.validate(new Date('2018-01-01')).should.deep.equal({
          error: ERROR_TOO_LARGE,
          expected: new Date('2017-12-31'),
        });
      });
      it('should reject a date below min', function () {
        this.schema6x.validate(new Date('2016-12-31')).should.deep.equal({
          error: ERROR_TOO_SMALL,
          expected: new Date('2017-01-01'),
        });
      });
    });

    describe('and the definition is custom "Model"', function () {
      beforeEach(function () {
        this.schema7 = this.compile(Model);
      });
      it('should accept an instance of Model', function () {
        should.not.exist(this.schema7.validate(new Model()));
      });
      it('should not accept a differt type of data', function () {
        this.schema7.validate({}).should.deep.equal({
          error: ERROR_NOT_INSTANCE_OF,
          actual: {},
          expected: Model.name,
        });
      });
    });
  });
});

