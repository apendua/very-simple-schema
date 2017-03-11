/* eslint-env mocha */
/* eslint no-unused-expressions: "off" */
/* eslint prefer-arrow-callback: "off" */
import chai from 'chai';
import {
  ERROR_REQUIRED,
} from '../constants.js';
import lazyPlugin from './lazy.js';

const should = chai.should();

describe.skip('Test lazy plugin', function () {
  beforeEach(function () {
    this.Schema = function () {};
    this.compiler = {
      options: {},
      compile: (...args) => ({ validate: this.createValidate(...args) }),
    };
    this.createValidate =
      (schemaDef, schemaOptions = {}) =>
      lazyPlugin.compile(this.compiler, schemaDef, schemaOptions).validate;
  });

  describe('Given a schema with lazy fields', function () {
    beforeEach(function () {
      this.validate1 = this.createValidate({
        children: {
          type: [() => this.validate1],
          lazy: true,
        },
      });
    });

    it('should accept a nested object', function () {
      should.not.exist(this.validate1({
        children: [{
          children: [{
            children: [],
          }],
        }],
      }));
    });

    it('should reject object with missing fields', function () {
      this.validate1({}).should.deep.equal({
        errors: {
          children: { error: ERROR_REQUIRED },
        },
      });
    });
  });
});
