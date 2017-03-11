/* eslint-env mocha */
/* eslint no-unused-expressions: "off" */
/* eslint prefer-arrow-callback: "off" */
import chai from 'chai';
import pluginRegExp from './regExp.js';
import {
  ERROR_BAD_FORMAT,
} from '../constants.js';

const should = chai.should();
const compiler = {
  options: {},
  compile: () => ({ validate: () => {} }),
};

describe('Test regExp plugin', function () {
  beforeEach(function () {
    this.Schema = function () {};
    pluginRegExp.mixin(this.Schema);
    this.createValidate =
      (schemaDef, schemaOptions) =>
      pluginRegExp.compile(compiler, schemaDef, schemaOptions).validate;
  });

  describe('given I use a custom regExp', function () {
    beforeEach(function () {
      this.validate = this.createValidate(String, { regEx: /^a+/ });
    });
    it('should not accept an empty string', function () {
      this.validate('').should.deep.equal({
        error: ERROR_BAD_FORMAT,
        expected: 'match /^a+/',
      });
    });
    it('should not accept a non-matching string', function () {
      this.validate('b').should.deep.equal({
        error: ERROR_BAD_FORMAT,
        expected: 'match /^a+/',
      });
    });
    it('should accept a matching string', function () {
      should.not.exist(this.validate('aaa'));
    });
  });

  describe('given I use built-in RegEx.Email', function () {
    beforeEach(function () {
      this.validate = this.createValidate(String, { regEx: this.Schema.RegEx.Email });
    });
    it('should not accept an empty string', function () {
      this.validate('').should.deep.equal({
        error: ERROR_BAD_FORMAT,
        expected: this.Schema.RegEx.Email.to,
      });
    });
    it('should not accept an invalid email', function () {
      this.validate('a@').should.deep.equal({
        error: ERROR_BAD_FORMAT,
        expected: this.Schema.RegEx.Email.to,
      });
    });
    it('should accept a basic email', function () {
      should.not.exist(this.validate('a@b.c'));
    });
  });

  describe('given I use built-in RegEx.Id', function () {
    beforeEach(function () {
      this.validate = this.createValidate(String, { regEx: this.Schema.RegEx.Id });
    });
    it('should not accept an empty string', function () {
      this.validate('').should.deep.equal({
        error: ERROR_BAD_FORMAT,
        expected: this.Schema.RegEx.Id.to,
      });
    });
    it('should not accept a string that is too short', function () {
      this.validate('abcdefghijkmnopq').should.deep.equal({
        error: ERROR_BAD_FORMAT,
        expected: this.Schema.RegEx.Id.to,
      });
    });
    it('should not accept a string that contains invalid characters', function () {
      this.validate('0bcdefghijkmnopqr').should.deep.equal({
        error: ERROR_BAD_FORMAT,
        expected: this.Schema.RegEx.Id.to,
      });
    });
    it('should accept 17 alphabet characters', function () {
      should.not.exist(this.validate('abcdefghijkmnopqr'));
    });
  });
});

