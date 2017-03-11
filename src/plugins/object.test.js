/* eslint-env mocha */
/* eslint no-unused-expressions: "off" */
/* eslint prefer-arrow-callback: "off" */
import chai from 'chai';
import {
  ERROR_REQUIRED,
  ERROR_EXPECTED_STRING,
} from '../constants.js';
import pluginObject from './object.js';

const should = chai.should();

describe('Test object plugin', function () {
  beforeEach(function () {
    this.Schema = function () {};
    this.compiler = {
      options: {},
      compile: (schemaDef, schemaOptions) => ({
        validate: (
          schemaDef === String
            ? value => (typeof value === 'string' ? undefined : { error: ERROR_EXPECTED_STRING, actual: value })
            : this.createValidate(schemaDef, schemaOptions)
        ),
      }),
    };
    this.createValidate =
      (schemaDef, schemaOptions = {}) =>
      pluginObject.compile(this.compiler, schemaDef, schemaOptions).validate;
  });

  describe('Given an object schema', function () {
    beforeEach(function () {
      this.validate1 = this.createValidate({
        a: { type: String },
        b: { type: String, optional: true },
        x: { type: String },
      });
      this.validate2 = this.createValidate({
        a: String,
        b: String,
        x: String,
      });
    });
    it('should accept a valid object', function () {
      should.not.exist(this.validate1({
        a: '',
        b: '',
        x: '',
      }));
    });
    it('should reject if required fields are missing', function () {
      this.validate1({}).should.deep.equal({
        errors: {
          a: { error: ERROR_REQUIRED },
          x: { error: ERROR_REQUIRED },
        },
      });
    });
    it('should reject if required fields are missing (shorthand)', function () {
      this.validate2({}).should.deep.equal({
        errors: {
          a: { error: ERROR_REQUIRED },
          b: { error: ERROR_REQUIRED },
          x: { error: ERROR_REQUIRED },
        },
      });
    });
    it('should reject if a fields is of invalid type', function () {
      this.validate1({
        a: 1,
        x: true,
      }).should.deep.equal({
        errors: {
          a: { error: ERROR_EXPECTED_STRING, actual: 1 },
          x: { error: ERROR_EXPECTED_STRING, actual: true },
        },
      });
    });
    it('should reject if a fields is of invalid type (shorthand)', function () {
      this.validate2({
        a: 1,
        b: 2,
        x: true,
      }).should.deep.equal({
        errors: {
          a: { error: ERROR_EXPECTED_STRING, actual: 1 },
          b: { error: ERROR_EXPECTED_STRING, actual: 2 },
          x: { error: ERROR_EXPECTED_STRING, actual: true },
        },
      });
    });
  });

  describe('Given a nested object schema', function () {
    beforeEach(function () {
      this.validate1 = this.createValidate({
        a: {
          x: String,
          y: String,
        },
        b: {
          // type: new this.Schema({
          //   x: String,
          //   y: String,
          // }),
          type: {
            x: String,
            y: String,
          },
        },
        c: {
          type: {
            x: String,
            y: String,
          },
        },
      });
    });
    it('should reject object with missing properties', function () {
      this.validate1({
        a: { x: 'a' },
        b: { x: 'a' },
        c: { x: 'a' },
      }).should.deep.equal({
        errors: {
          a: { errors: { y: { error: ERROR_REQUIRED } } },
          b: { errors: { y: { error: ERROR_REQUIRED } } },
          c: { errors: { y: { error: ERROR_REQUIRED } } },
        },
      });
    });
  });
});
