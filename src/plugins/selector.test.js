/* eslint-env mocha */
/* eslint no-unused-expressions: "off" */
/* eslint prefer-arrow-callback: "off" */
import chai from 'chai';
import {
  ERROR_NOT_NUMBER,
  ERROR_MISSING_FIELD,
  ERROR_KEY_NOT_ALLOWED,
} from '../constants.js';
import {
  validateIsArray,
} from '../validators.js';
import {
  combine,
} from '../utils.js';
import { applyPlugins } from '../createCompiler.js';
import pluginSelector from './selector.js';
import pluginObject from './object.js';
import pluginAtomic from './atomic.js';
import pluginArray from './array.js';
// import pluginSchema from './schema.js';

const should = chai.should();

describe('Test selector plugin', function () {
  beforeEach(function () {
    const compiler = applyPlugins({
      Schema: class Schema {},
      options: {},
    }, [
      // pluginSchema,
      pluginSelector,
      pluginAtomic,
      pluginObject,
      pluginArray,
    ]);
    pluginSelector.mixin(compiler.Schema);
    this.createValidate =
      (schemaDef, schemaOptions = {}) =>
        compiler.compile({}, new compiler.Schema.Operator(schemaDef), schemaOptions).validate;
  });

  describe('Given an operator schema', function () {
    beforeEach(function () {
      this.validate = this.createValidate({
        a: {
          type: {
            x: Number,
            y: Number,
          },
        },
        b: {
          // array of objects
          type: [{
            z: Number,
            w: Number,
          }],
        },
      }, {
        operators: {
          $elemMatch: (validator, {
            validateSelector,
          }) => ({
            validate: validateSelector(validator),
          }),
          $and: (validator, {
            validateSelector,
          }) => ({
            isArray: true,
            validate: combine([
              validateIsArray,
              (value) => {
                const errors = value.map(x => validateSelector(validator)(x));
                return errors.some(err => !!err) ? { errors } : undefined;
              },
            ]),
          }),
        },
      });
    });
    it('should reject an unknown key', function () {
      this.validate({
        c: 1,
      }).should.deep.equal({
        errors: {
          c: { error: ERROR_KEY_NOT_ALLOWED },
        },
      });
    });
    it('should reject an unknown nested key', function () {
      this.validate({
        'a.z': 1,
      }).should.deep.equal({
        errors: {
          a: {
            errors: {
              z: { error: ERROR_KEY_NOT_ALLOWED },
            },
          },
        },
      });
    });
    it('should reject a nested key of wrong type', function () {
      this.validate({
        'a.x': '',
      }).should.deep.equal({
        errors: {
          a: {
            errors: {
              x: { error: ERROR_NOT_NUMBER, actual: '' },
            },
          },
        },
      });
    });
    it('should reject an unknown nested key (2)', function () {
      this.validate({
        a: {
          x: 1,
          y: 1,
          z: 1,
        },
      }).should.deep.equal({
        errors: {
          a: {
            errors: {
              z: { error: ERROR_KEY_NOT_ALLOWED },
            },
          },
        },
      });
    });
    it('should accept a valid key', function () {
      should.not.exist(this.validate({
        a: {
          x: 1,
          y: 1,
        },
      }));
    });
    it('should accept a valid nested key', function () {
      should.not.exist(this.validate({
        'a.x': 1,
      }));
    });
    it('should accept multiple nested keys', function () {
      should.not.exist(this.validate({
        'a.x': 1,
        'a.y': 1,
      }));
    });
    it('should reject missing properties in valid key', function () {
      this.validate({
        a: {
          x: 1,
        },
      }).should.deep.equal({
        errors: {
          a: {
            errors: {
              y: { error: ERROR_MISSING_FIELD },
            },
          },
        },
      });
    });
    it('should reject an unknown operator', function () {
      this.validate({
        $operator: {},
      }).should.deep.equal({
        errors: {
          $operator: { error: ERROR_KEY_NOT_ALLOWED },
        },
      });
    });
    it('should reject invalid key inside an array', function () {
      this.validate({
        'b.x': 1,
      }).should.deep.equal({
        errors: {
          b: {
            errors: {
              x: { error: ERROR_KEY_NOT_ALLOWED },
            },
          },
        },
      });
    });
    it('should accept a valid key inside an array', function () {
      should.not.exist(this.validate({
        'b.z': 1,
      }));
    });
    it('should reject $elemMatch with invalid key', function () {
      this.validate({
        b: {
          $elemMatch: {
            x: 1,
          },
        },
      }).should.deep.equal({
        errors: {
          b: {
            errors: {
              $elemMatch: {
                errors: {
                  x: { error: ERROR_KEY_NOT_ALLOWED },
                },
              },
            },
          },
        },
      });
    });
    it('should accept $elemMatch with valid keys', function () {
      should.not.exist(this.validate({
        b: {
          $elemMatch: {
            z: 1,
            w: 1,
          },
        },
      }));
    });
    it('should accept selector with $and operator', function () {
      should.not.exist(this.validate({
        $and: [
          { 'a.x': 1 },
          { 'b.z': 1 },
        ],
      }));
    });
    it('should reject selector with invalid key nested in $and operator', function () {
      this.validate({
        $and: [
          { 'a.z': 1 },
        ],
      }).should.deep.equal({
        errors: {
          $and: {
            errors: [
              {
                errors: {
                  a: {
                    errors: {
                      z: { error: ERROR_KEY_NOT_ALLOWED },
                    },
                  },
                },
              },
            ],
          },
        },
      });
    });
  });
});
