/* eslint-env mocha */
/* eslint no-unused-expressions: "off" */
/* eslint prefer-arrow-callback: "off" */
import chai from 'chai';
import {
  ERROR_NO_MATCH,
} from '../constants.js';
import pluginArray from './presetDefault.js';

const should = chai.should();
const compiler = {
  options: {},
  compile: () => ({ validate: () => {} }),
};

describe.skip('Test oneOf plugin', function () {
  beforeEach(function () {
    this.Schema = function () {};
    this.createValidate =
      (schemaDef, schemaOptions = {}) =>
      pluginArray.compile(compiler, schemaDef, schemaOptions).validate;
  });

  describe('Given a "oneOf" schema', function () {
    beforeEach(function () {
      this.validate1 = new this.Schema([Number, String]);
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
