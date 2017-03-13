/* eslint-env mocha */
/* eslint no-unused-expressions: "off" */
/* eslint prefer-arrow-callback: "off" */
import chai from 'chai';
import {
  ERROR_NOT_STRING,
  ERROR_NOT_NUMBER,
} from '../constants.js';
import lazyPlugin from './lazy.js';

const should = chai.should();
const compiler = {
  options: {},
  compile: (schemaDef) => {
    if (schemaDef === String) {
      return { validate: value => (typeof value === 'string' ? undefined : { error: ERROR_NOT_STRING, actual: value }) };
    } else if (schemaDef === Number) {
      return { validate: value => (typeof value === 'number' ? undefined : { error: ERROR_NOT_NUMBER, actual: value }) };
    }
    return { validate: () => ({}) };
  },
};

describe('Test lazy plugin', function () {
  beforeEach(function () {
    this.Schema = function () {};
    this.createValidate =
      (schemaDef, schemaOptions = {}) =>
      lazyPlugin.compile(compiler, schemaDef, schemaOptions).validate;
  });

  describe('Given a lazy Number schema', function () {
    beforeEach(function () {
      this.validate1 = this.createValidate(() => Number, { lazy: true });
    });

    it('should accept a number', function () {
      should.not.exist(this.validate1(1));
    });

    it('should reject if value is not a number', function () {
      this.validate1(true).should.deep.equal({
        error: ERROR_NOT_NUMBER,
        actual: true,
      });
    });
  });
});
