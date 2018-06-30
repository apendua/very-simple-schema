/* eslint-env jest */
import {
  ERROR_NOT_NUMBER,
  ERROR_MISSING_FIELD,
  ERROR_KEY_NOT_ALLOWED,
} from '../constants.js';
import { applyPlugins } from '../createCompiler.js';
import pluginSelector from './selector.js';
import pluginObject from './object.js';
import pluginAtomic from './atomic.js';
import pluginArray from './array.js';
// import pluginSchema from './schema.js';

describe('Test selector plugin', () => {
  let testContext;

  beforeEach(() => {
    testContext = {};
  });

  beforeEach(() => {
    const compiler = applyPlugins({
      Schema: class Schema {},
      options: {
        sealedByDefault: true,
      },
    }, [
      // pluginSchema,
      pluginSelector,
      pluginAtomic,
      pluginObject,
      pluginArray,
    ]);
    pluginSelector.mixin(compiler.Schema);
    testContext.createValidate =
      (schemaDef, schemaOptions = {}) =>
        compiler.compile({}, new compiler.Schema.Operator(schemaDef), schemaOptions).validate;
  });

  describe('Given an operator schema', () => {
    beforeEach(() => {
      testContext.validate = testContext.createValidate({
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
          $elemMatch: ({
            validator,
            validateSelector,
          }) => ({
            validate: validateSelector(validator),
          }),
          '$in,$each': ({
            arrayOf,
            validator,
            validateExpression,
          }) => arrayOf(validateExpression(validator)),
          '$and,$or': ({
            arrayOf,
            validator,
            validateSelector,
          }) => arrayOf(validateSelector(validator)),
        },
      });
    });
    test('should reject an unknown key', () => {
      expect(testContext.validate({
        c: 1,
      })).toEqual({
        errors: {
          c: { error: ERROR_KEY_NOT_ALLOWED },
        },
      });
    });
    test('should reject an unknown nested key', () => {
      expect(testContext.validate({
        'a.z': 1,
      })).toEqual({
        errors: {
          a: {
            errors: {
              z: { error: ERROR_KEY_NOT_ALLOWED },
            },
          },
        },
      });
    });
    test('should reject a nested key of wrong type', () => {
      expect(testContext.validate({
        'a.x': '',
      })).toEqual({
        errors: {
          a: {
            errors: {
              x: { error: ERROR_NOT_NUMBER, actual: '' },
            },
          },
        },
      });
    });
    test('should reject an unknown nested key (2)', () => {
      expect(testContext.validate({
        a: {
          x: 1,
          y: 1,
          z: 1,
        },
      })).toEqual({
        errors: {
          a: {
            errors: {
              z: { error: ERROR_KEY_NOT_ALLOWED },
            },
          },
        },
      });
    });
    test('should accept a valid key', () => {
      expect(testContext.validate({
        a: {
          x: 1,
          y: 1,
        },
      })).toBeFalsy();
    });
    test('should accept a valid nested key', () => {
      expect(testContext.validate({
        'a.x': 1,
      })).toBeFalsy();
    });
    test('should accept multiple nested keys', () => {
      expect(testContext.validate({
        'a.x': 1,
        'a.y': 1,
      })).toBeFalsy();
    });
    test('should reject missing properties in valid key', () => {
      expect(testContext.validate({
        a: {
          x: 1,
        },
      })).toEqual({
        errors: {
          a: {
            errors: {
              y: { error: ERROR_MISSING_FIELD },
            },
          },
        },
      });
    });
    test('should reject an unknown operator', () => {
      expect(testContext.validate({
        $operator: {},
      })).toEqual({
        errors: {
          $operator: { error: ERROR_KEY_NOT_ALLOWED },
        },
      });
    });
    test('should reject invalid key inside an array', () => {
      expect(testContext.validate({
        'b.x': 1,
      })).toEqual({
        errors: {
          b: {
            errors: {
              x: { error: ERROR_KEY_NOT_ALLOWED },
            },
          },
        },
      });
    });
    test('should accept a valid key inside an array', () => {
      expect(testContext.validate({
        'b.z': 1,
      })).toBeFalsy();
    });
    test('should reject $elemMatch with invalid key', () => {
      expect(testContext.validate({
        b: {
          $elemMatch: {
            x: 1,
          },
        },
      })).toEqual({
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
    test('should accept $elemMatch with valid keys', () => {
      expect(testContext.validate({
        b: {
          $elemMatch: {
            z: 1,
            w: 1,
          },
        },
      })).toBeFalsy();
    });
    test('should accept selector with $and operator', () => {
      expect(testContext.validate({
        $and: [
          { 'a.x': 1 },
          { 'b.z': 1 },
        ],
      })).toBeFalsy();
    });
    test(
      'should reject selector with invalid key nested in $and operator',
      () => {
        expect(testContext.validate({
          $and: [
            { 'a.z': 1 },
          ],
        })).toEqual({
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
      },
    );
    test('should accept selector with nested $or/$and operators', () => {
      expect(testContext.validate({
        $and: [
          {
            $or: [
              { 'a.x': 1 },
              { 'a.x': 2 },
            ],
          },
          {
            $or: [
              { 'b.z': 1 },
              { 'b.z': 2 },
            ],
          },
        ],
      })).toBeFalsy();
    });
  });
});
