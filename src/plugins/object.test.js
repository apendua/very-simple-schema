/* eslint-env mocha */
/* eslint no-unused-expressions: "off" */
/* eslint prefer-arrow-callback: "off" */
import chai from 'chai';
import {
  ERROR_MISSING_FIELD,
  ERROR_NOT_STRING,
  ERROR_NOT_OBJECT,
} from '../constants.js';
import pluginObject from './object.js';
import pluginMember from './member.js';
import Schema from '../Schema.js';

const should = chai.should();

describe('Test object plugin', function () {
  beforeEach(function () {
    this.Schema = function () {};
    this.compiler = {
      Schema,
      options: {},
      compile: (schemaDef, schemaOptions) => ({
        validate: (() => {
          if (schemaDef === String) {
            return value => (typeof value === 'string' ? undefined : { error: ERROR_NOT_STRING, actual: value });
          }
          if (schemaDef instanceof Schema) {
            return schemaDef.getErrors.bind(schemaDef);
          }
          return this.createValidate(schemaDef, schemaOptions);
        })(),
      }),
    };
    pluginMember.mixin(this.compiler.Schema);
    this.createValidate =
      (schemaDef, schemaOptions = {}) =>
      pluginObject.compile(this.compiler, schemaDef, schemaOptions).validate;
  });

  describe('Given an empty object schema', function () {
    beforeEach(function () {
      this.validate = this.createValidate({});
    });
    it('should accept an empty object', function () {
      should.not.exist(this.validate({}));
    });
    it('should reject an array', function () {
      this.validate([]).should.deep.equal({
        actual: [],
        error: ERROR_NOT_OBJECT,
      });
    });
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
      this.validate3 = this.createValidate({
        a: { type: String },
        b: { type: String, optional: true },
      }, {
        emptyStringsAreMissingValues: true,
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
          a: { error: ERROR_MISSING_FIELD },
          x: { error: ERROR_MISSING_FIELD },
        },
      });
    });
    it('should reject if required fields are null or undefined', function () {
      this.validate1({
        a: null,
        x: undefined,
      }).should.deep.equal({
        errors: {
          a: { error: ERROR_MISSING_FIELD },
          x: { error: ERROR_MISSING_FIELD },
        },
      });
    });
    it('should reject if required fields are missing (shorthand)', function () {
      this.validate2({}).should.deep.equal({
        errors: {
          a: { error: ERROR_MISSING_FIELD },
          b: { error: ERROR_MISSING_FIELD },
          x: { error: ERROR_MISSING_FIELD },
        },
      });
    });
    it('should reject if a fields is of invalid type', function () {
      this.validate1({
        a: 1,
        x: true,
      }).should.deep.equal({
        errors: {
          a: { error: ERROR_NOT_STRING, actual: 1 },
          x: { error: ERROR_NOT_STRING, actual: true },
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
          a: { error: ERROR_NOT_STRING, actual: 1 },
          b: { error: ERROR_NOT_STRING, actual: 2 },
          x: { error: ERROR_NOT_STRING, actual: true },
        },
      });
    });
    it('should if required string is empty and emptyStringsAreMissingValues', function () {
      this.validate3({
        a: '',
        b: '', // this one is optional
      }).should.deep.equal({
        errors: {
          a: { error: ERROR_MISSING_FIELD },
        },
      });
    });
  });

  describe('Given fields are optional by default', function () {
    beforeEach(function () {
      this.validate1 = this.createValidate({
        a: { type: String },
        b: { type: String },
        c: { type: String },
      }, {
        required: ['a', 'b'],
        fieldsOptionalByDefault: true,
      });
    });
    it('should accept a valid object', function () {
      should.not.exist(this.validate1({
        a: '',
        b: '',
      }));
    });
    it('should reject if required fields are missing', function () {
      this.validate1({}).should.deep.equal({
        errors: {
          a: { error: ERROR_MISSING_FIELD },
          b: { error: ERROR_MISSING_FIELD },
        },
      });
    });
    it('should reject if required fields are null or undefined', function () {
      this.validate1({
        a: null,
        b: undefined,
      }).should.deep.equal({
        errors: {
          a: { error: ERROR_MISSING_FIELD },
          b: { error: ERROR_MISSING_FIELD },
        },
      });
    });
  });

  describe('Given a nested object schema', function () {
    beforeEach(function () {
      this.validate1 = this.createValidate({
        a: new Schema({
          x: String,
          y: String,
        }),
        b: {
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
      }).should.deep.equal({
        errors: {
          a: { errors: { y: { error: ERROR_MISSING_FIELD } } },
          b: { errors: { y: { error: ERROR_MISSING_FIELD } } },
        },
      });
    });
  });
});
