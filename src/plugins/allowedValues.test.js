/* eslint-env mocha */
/* eslint no-unused-expressions: "off" */
/* eslint prefer-arrow-callback: "off" */
import chai from 'chai';
import {
  ERROR_VALUE_NOT_ALLOWED,
} from '../constants.js';
import { applyPlugins } from '../createCompiler.js';
import pluginAllowedValues from './allowedValues.js';

const should = chai.should();
const compiler = applyPlugins({
  Validator(props) {
    Object.assign(this, props);
  },
}, [
  pluginAllowedValues,
]);

describe('Test allowedValues plugin', function () {
  beforeEach(function () {
    this.Schema = function () {};
    this.createValidate =
      (schemaDef, schemaOptions = {}) =>
        compiler.compile({ isAtomic: true }, schemaDef, schemaOptions).validate;
  });

  describe('Given a schema with allowedValues', function () {
    describe('and the schema is atomic', function () {
      beforeEach(function () {
        this.validate1 = this.createValidate(Number, { allowedValues: [1, 2] });
      });
      it('should reject value that is not allowed', function () {
        this.validate1(3).should.deep.equal({
          error: ERROR_VALUE_NOT_ALLOWED,
          expected: [1, 2],
          actual: 3,
        });
      });
      it('should accept value that is allowed', function () {
        should.not.exist(this.validate1(1));
      });
    });
  });
});
