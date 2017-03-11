/* eslint-env mocha */
/* eslint no-unused-expressions: "off" */
/* eslint prefer-arrow-callback: "off" */
import chai from 'chai';
import {
  ERROR_NO_MATCH,
  ERROR_EXPECTED_STRING,
  ERROR_EXPECTED_NUMBER,
} from '../constants.js';
import pluginOneOf from './oneOf.js';

const should = chai.should();
const compiler = {
  options: {},
  compile: (schemaDef) => {
    if (schemaDef === String) {
      return { validate: value => (typeof value === 'string' ? undefined : { error: ERROR_EXPECTED_STRING, actual: value }) };
    } else if (schemaDef === Number) {
      return { validate: value => (typeof value === 'number' ? undefined : { error: ERROR_EXPECTED_NUMBER, actual: value }) };
    }
    return { validate: () => ({}) };
  },
};

describe('Test oneOf plugin', function () {
  beforeEach(function () {
    this.Schema = function () {};
    this.createValidate =
      (schemaDef, schemaOptions = {}) =>
      pluginOneOf.compile(compiler, schemaDef, schemaOptions).validate;
  });

  describe('Given a "oneOf" schema', function () {
    beforeEach(function () {
      this.validate1 = this.createValidate([Number, String], { oneOf: true });
    });
    it('should accept a number', function () {
      should.not.exist(this.validate1(1));
    });
    it('should accept a string', function () {
      should.not.exist(this.validate1('a'));
    });
    it('should reject if neither string nor number', function () {
      this.validate1(true).should.deep.equal({
        error: ERROR_NO_MATCH,
      });
    });
  });
});
