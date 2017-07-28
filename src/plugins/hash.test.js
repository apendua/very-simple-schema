/* eslint-env mocha */
/* eslint no-unused-expressions: "off" */
/* eslint prefer-arrow-callback: "off" */
import chai from 'chai';
import {
  ERROR_NOT_STRING,
  ERROR_NOT_OBJECT,
} from '../constants.js';
import pluginHash from './hash.js';

const should = chai.should();

describe('Test hash plugin', function () {
  beforeEach(function () {
    const compiler = {
      Schema: class Schema {},
      options: {},
      compile: () => ({ validate: value => (typeof value !== 'string' ? { error: ERROR_NOT_STRING, actual: value } : undefined) }),
    };
    pluginHash.mixin(compiler.Schema);
    this.createValidate =
      (schemaDef, schemaOptions = {}) =>
      pluginHash.compile(compiler, new compiler.Schema.Hash({ value: schemaDef }), schemaOptions).validate;
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
    it('should accept hash of strings', function () {
      should.not.exist(this.validate1({
        a: 'a',
        b: 'b',
        c: 'c',
      }));
    });
    it('should reject hash of numbers', function () {
      this.validate1({
        a: 1,
        b: 2,
      }).should.deep.equal({
        errors: {
          a: {
            error: ERROR_NOT_STRING,
            actual: 1,
          },
          b: {
            error: ERROR_NOT_STRING,
            actual: 2,
          },
        },
      });
    });
  });
});
