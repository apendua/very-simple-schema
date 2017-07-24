/* eslint-env mocha */
/* eslint no-unused-expressions: "off" */
/* eslint prefer-arrow-callback: "off" */
import chai from 'chai';
import {
  ERROR_NOT_NUMBER,
  ERROR_NOT_OBJECT,
} from '../constants.js';
import pluginHash from './hash.js';

const should = chai.should();

describe('Test hash plugin', function () {
  beforeEach(function () {
    const compiler = {
      Schema: class Schema {},
      options: {},
      compile: () => ({ validate: value => (typeof value !== 'number' ? { error: ERROR_NOT_NUMBER, actual: value } : undefined) }),
    };
    pluginHash.mixin(compiler.Schema);
    this.createValidate =
      (schemaDef, schemaOptions = {}) =>
      pluginHash.compile(compiler, new compiler.Schema.Hash(schemaDef), schemaOptions).validate;
  });

  describe('Given an hash schema', function () {
    beforeEach(function () {
      this.validate1 = this.createValidate(Number);
    });
    it('should return error if not an hash', function () {
      this.validate1([]).should.deep.equal({
        error: ERROR_NOT_OBJECT,
        actual: [],
      });
    });
    it('should accept hash of numbers', function () {
      should.not.exist(this.validate1({
        a: 1,
        b: 2,
        c: 3,
      }));
    });
    it('should reject hash of strings', function () {
      this.validate1({
        a: 'a',
        b: 'b',
      }).should.deep.equal({
        errors: {
          a: {
            error: ERROR_NOT_NUMBER,
            actual: 'a',
          },
          b: {
            error: ERROR_NOT_NUMBER,
            actual: 'b',
          },
        },
      });
    });
  });
});
