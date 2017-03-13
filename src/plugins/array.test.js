/* eslint-env mocha */
/* eslint no-unused-expressions: "off" */
/* eslint prefer-arrow-callback: "off" */
import chai from 'chai';
import {
  ERROR_NOT_NUMBER,
  ERROR_NOT_ARRAY,
  ERROR_TOO_FEW,
  ERROR_TOO_MANY,
} from '../constants.js';
import pluginArray from './array.js';

const should = chai.should();
const compiler = {
  options: {},
  compile: () => ({ validate: value => (typeof value !== 'number' ? { error: ERROR_NOT_NUMBER, actual: value } : undefined) }),
};

describe('Test array plugin', function () {
  beforeEach(function () {
    this.Schema = function () {};
    this.createValidate =
      (schemaDef, schemaOptions = {}) =>
      pluginArray.compile(compiler, schemaDef, schemaOptions).validate;
  });

  describe('Given an array schema', function () {
    beforeEach(function () {
      this.validate1 = this.createValidate([Number]);
      this.validate2 = this.createValidate([Number], { minCount: 1 });
      this.validate3 = this.createValidate([Number], { maxCount: 2 });
    });
    it('should return error if not an array', function () {
      this.validate1('this is not an array').should.deep.equal({
        error: ERROR_NOT_ARRAY,
        actual: 'this is not an array',
      });
    });
    it('should accept array of numbers', function () {
      should.not.exist(this.validate1([1, 2, 3]));
    });
    it('should reject array of strings', function () {
      this.validate1(['a', 'b']).should.deep.equal({
        errors: [{
          error: ERROR_NOT_NUMBER,
          actual: 'a',
        }, {
          error: ERROR_NOT_NUMBER,
          actual: 'b',
        }],
      });
    });
    it('should accept array with minimal number of elements', function () {
      should.not.exist(this.validate2([1]));
    });
    it('should reject array with to little elements', function () {
      this.validate2([]).should.deep.equal({
        error: ERROR_TOO_FEW,
        expected: 1,
      });
    });
    it('should accept array with maximal number of elements', function () {
      should.not.exist(this.validate2([1, 2]));
    });
    it('should reject array with to many elements', function () {
      this.validate3([1, 2, 3]).should.deep.equal({
        error: ERROR_TOO_MANY,
        expected: 2,
      });
    });
  });
});
