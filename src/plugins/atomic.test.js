/* eslint-env mocha */
/* eslint no-unused-expressions: "off" */
/* eslint prefer-arrow-callback: "off" */
import chai from 'chai';
import pluginAtomic from './atomic.js';
import {
  ERROR_MIN,
  ERROR_MAX,
  ERROR_NO_DECIMAL,
  ERROR_EXPECTED_STRING,
  ERROR_EXPECTED_NUMBER,
  ERROR_EXPECTED_BOOLEAN,
} from '../constants.js';

const should = chai.should();
const compiler = {
  options: {},
  compile: () => ({ validate: () => {} }),
};

describe('Test atomic plugin', function () {
  beforeEach(function () {
    this.Schema = function () {};
    this.createValidate =
      (schemaDef, schemaOptions = {}) =>
      pluginAtomic.compile(compiler, schemaDef, schemaOptions).validate;
  });

  describe('Given an atomic schema', function () {
    beforeEach(function () {
      this.validate1 = this.createValidate(Number);
      this.validate2 = this.createValidate(String);
      this.validate3 = this.createValidate(Boolean);
      this.validate4 = this.createValidate(Number, { min: 0, max: 10 });
      this.validate5 = this.createValidate(String, { min: 'e', max: 'k' });
    });
    it('should validate a number', function () {
      should.not.exist(this.validate1(1));
    });
    it('should return error if not a number', function () {
      this.validate1('not a number').should.deep.equal({
        error: ERROR_EXPECTED_NUMBER,
        actual: 'not a number',
      });
    });
    it('should reject non integer by default', function () {
      this.validate1(0.1).should.deep.equal({
        error: ERROR_NO_DECIMAL,
        actual: 0.1,
      });
    });
    it('should validate a string', function () {
      should.not.exist(this.validate2('this is a string'));
    });
    it('should return error if not a string', function () {
      this.validate2(true).should.deep.equal({
        error: ERROR_EXPECTED_STRING,
        actual: true,
      });
    });
    it('should validate a boolean', function () {
      should.not.exist(this.validate3(true));
    });
    it('should return error if not a boolean', function () {
      this.validate3('not a boolean').should.deep.equal({
        error: ERROR_EXPECTED_BOOLEAN,
        actual: 'not a boolean',
      });
    });
    it('should accept a number value within range', function () {
      should.not.exist(this.validate4(5));
    });
    it('should reject a number above max', function () {
      this.validate4(11).should.deep.equal({
        error: ERROR_MAX,
        expected: 10,
      });
    });
    it('should reject a number below min', function () {
      this.validate4(-1).should.deep.equal({
        error: ERROR_MIN,
        expected: 0,
      });
    });
    it('should accept a string value within range', function () {
      should.not.exist(this.validate5('j'));
    });
    it('should reject a string above max', function () {
      this.validate5('z').should.deep.equal({
        error: ERROR_MAX,
        expected: 'k',
      });
    });
    it('should reject a string below min', function () {
      this.validate5('a').should.deep.equal({
        error: ERROR_MIN,
        expected: 'e',
      });
    });
  });
});

