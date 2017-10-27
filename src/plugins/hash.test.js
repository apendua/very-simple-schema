/* eslint-env mocha */
/* eslint no-unused-expressions: "off" */
/* eslint prefer-arrow-callback: "off" */
import chai from 'chai';
import {
  ERROR_NOT_STRING,
  ERROR_NOT_OBJECT,
} from '../constants.js';
import pluginHash from './hash.js';
import {
  validateIsString,
} from '../validators.js';
import {
  combine,
} from '../utils.js';
import { applyPlugins } from '../createCompiler.js';

const should = chai.should();
const pluginString = {
  compile: () => next => (validator, schemaDef, schemaOptions) => {
    if (schemaDef === String) {
      return next({
        ...validator,
        validate: combine([
          validator.validate,
          validateIsString,
        ]),
      }, schemaDef, schemaOptions);
    }
    return next(validator, schemaDef, schemaOptions);
  },
};

describe('Test hash plugin', function () {
  beforeEach(function () {
    const compiler = applyPlugins({
      Schema: class Schema {},
      options: {},
    }, [
      pluginString,
      pluginHash,
    ]);
    pluginHash.mixin(compiler.Schema);
    this.createValidate =
      (schemaDef, schemaOptions = {}) =>
        compiler.compile({}, new compiler.Schema.Hash({ value: schemaDef }), schemaOptions).validate;
  });

  describe('Given an hash schema', function () {
    beforeEach(function () {
      this.validate1 = this.createValidate(String);
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
