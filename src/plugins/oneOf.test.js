/* eslint-env mocha */
/* eslint no-unused-expressions: "off" */
/* eslint prefer-arrow-callback: "off" */
import chai from 'chai';
import {
  ERROR_NO_ALTERNATIVE,
} from '../constants.js';
import pluginOneOf from './oneOf.js';
import {
  combine,
} from '../utils.js';
import {
  validateIsNumber,
  validateIsString,
} from '../validators.js';
import { applyPlugins } from '../createCompiler.js';

const should = chai.should();
const pluginNumber = {
  compile: () => next => (validator, schemaDef, schemaOptions) => {
    if (schemaDef === Number) {
      return next({
        ...validator,
        typeName: 'number',
        validate: combine([
          validator.validate,
          validateIsNumber,
        ]),
      }, schemaDef, schemaOptions);
    }
    return next(validator, schemaDef, schemaOptions);
  },
};
const pluginString = {
  compile: () => next => (validator, schemaDef, schemaOptions) => {
    if (schemaDef === String) {
      return next({
        ...validator,
        typeName: 'string',
        validate: combine([
          validator.validate,
          validateIsString,
        ]),
      }, schemaDef, schemaOptions);
    }
    return next(validator, schemaDef, schemaOptions);
  },
};

describe('Test oneOf plugin', function () {
  beforeEach(function () {
    const compiler = applyPlugins({
      Schema: class Schema {},
      options: {},
    }, [
      pluginNumber,
      pluginString,
      pluginOneOf,
    ]);
    pluginOneOf.mixin(compiler.Schema);
    this.createValidate =
      (schemaDef, schemaOptions = {}) =>
        compiler.compile({}, new compiler.Schema.OneOf(schemaDef), schemaOptions).validate;
  });

  describe('Given a "oneOf" schema', function () {
    beforeEach(function () {
      this.validate1 = this.createValidate([Number, String]);
    });
    it('should accept a number', function () {
      should.not.exist(this.validate1(1));
    });
    it('should accept a string', function () {
      should.not.exist(this.validate1('a'));
    });
    it('should reject if neither string nor number', function () {
      this.validate1(true).should.deep.equal({
        error: ERROR_NO_ALTERNATIVE,
        expected: ['number', 'string'],
      });
    });
  });
});
