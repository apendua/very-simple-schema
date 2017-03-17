/* eslint-env mocha */
/* eslint no-unused-expressions: "off" */
/* eslint prefer-arrow-callback: "off" */
import chai from 'chai';
import {
  ERROR_MISSING_FIELD,
  ERROR_NOT_INTEGER,
  ERROR_KEY_NOT_ALLOWED,
} from './constants.js';
import SimpleSchema from './SimpleSchema.js';

chai.should();

describe('Test SimpleSchema', function () {
  describe('Given empty schema', function () {
    beforeEach(function () {
      this.schema = new SimpleSchema({});
    });
    it('should not allow additional properties', function () {
      this.schema.getErrors({
        a: 1,
      }).should.deep.equal({
        errors: {
          a: {
            error: ERROR_KEY_NOT_ALLOWED,
          },
        },
      });
    });
  });

  describe('Given a number schema', function () {
    beforeEach(function () {
      this.schema = new SimpleSchema(Number);
    });
    it('should not non-integers by default', function () {
      this.schema.getErrors(0.5).should.deep.equal({
        error: ERROR_NOT_INTEGER,
        actual: 0.5,
      });
    });
  });

  describe('Given an object schema', function () {
    beforeEach(function () {
      this.schema = new SimpleSchema({
        a: { type: String },
      });
    });
    it('should treat empty string as missing value', function () {
      this.schema.getErrors({
        a: '',
      }).should.deep.equal({
        errors: {
          a: {
            error: ERROR_MISSING_FIELD,
          },
        },
      });
    });
  });
});
