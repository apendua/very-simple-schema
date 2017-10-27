/* eslint-env mocha */
/* eslint no-unused-expressions: "off" */
/* eslint prefer-arrow-callback: "off" */
import chai from 'chai';
import {
  ERROR_NOT_NUMBER,
} from '../constants.js';
import pluginLazy from './lazy.js';
import {
  combine,
} from '../utils.js';
import {
  validateIsNumber,
} from '../validators.js';
import { applyPlugins } from '../createCompiler.js';

const should = chai.should();
const pluginNumber = {
  compile: () => next => (validator, schemaDef, schemaOptions) => {
    if (schemaDef === Number) {
      return {
        ...validator,
        validate: combine([
          validator.validate,
          validateIsNumber,
        ]),
      };
    }
    return next(validator, schemaDef, schemaOptions);
  },
};
const compiler = applyPlugins({}, [
  pluginNumber,
  pluginLazy,
]);

describe('Test lazy plugin', function () {
  beforeEach(function () {
    this.Schema = function () {};
    this.createValidate =
      (schemaDef, schemaOptions = {}) =>
        compiler.compile({}, schemaDef, schemaOptions).validate;
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
