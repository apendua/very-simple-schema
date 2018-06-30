/* eslint-env jest */
import {
  ERROR_MISSING_FIELD,
  ERROR_VALUE_NOT_ALLOWED,
  ERROR_DOES_NOT_MATCH,
  ERROR_NOT_NUMBER,
  ERROR_NOT_INTEGER,
  ERROR_NOT_STRING,
  ERROR_KEY_NOT_ALLOWED,
  ERROR_TOO_LONG,
  ERROR_NOT_OBJECT,
  ERROR_TOO_SMALL,
  ERROR_TOO_MANY,
} from './constants.js';
import Schema from './Schema.js';

describe('Test Schema', () => {
  let testContext;

  beforeEach(() => {
    testContext = {};
  });

  describe('Given a Schema class', () => {
    test('should expose ERROR_MISSING_FIELD', () => {
      expect(Schema.ERROR_MISSING_FIELD).toBeTruthy();
    });
    test('should expose ERROR_KEY_NOT_ALLOWED', () => {
      expect(Schema.ERROR_KEY_NOT_ALLOWED).toBeTruthy();
    });
    test('should expose ERROR_INVALID_DATE', () => {
      expect(Schema.ERROR_INVALID_DATE).toBeTruthy();
    });
    test('should expose ERROR_DOES_NOT_MATCH', () => {
      expect(Schema.ERROR_DOES_NOT_MATCH).toBeTruthy();
    });
    test('should expose ERROR_NOT_EQUAL', () => {
      expect(Schema.ERROR_NOT_EQUAL).toBeTruthy();
    });
    test('should expose ERROR_NOT_INTEGER', () => {
      expect(Schema.ERROR_NOT_INTEGER).toBeTruthy();
    });
    test('should expose ERROR_NOT_STRING', () => {
      expect(Schema.ERROR_NOT_STRING).toBeTruthy();
    });
    test('should expose ERROR_NOT_NUMBER', () => {
      expect(Schema.ERROR_NOT_NUMBER).toBeTruthy();
    });
    test('should expose ERROR_NOT_BOOLEAN', () => {
      expect(Schema.ERROR_NOT_BOOLEAN).toBeTruthy();
    });
    test('should expose ERROR_NOT_ARRAY', () => {
      expect(Schema.ERROR_NOT_ARRAY).toBeTruthy();
    });
    test('should expose ERROR_NOT_OBJECT', () => {
      expect(Schema.ERROR_NOT_OBJECT).toBeTruthy();
    });
    test('should expose ERROR_NOT_DATE', () => {
      expect(Schema.ERROR_NOT_DATE).toBeTruthy();
    });
    test('should expose ERROR_NOT_INSTANCE_OF', () => {
      expect(Schema.ERROR_NOT_INSTANCE_OF).toBeTruthy();
    });
    test('should expose ERROR_NO_ALTERNATIVE', () => {
      expect(Schema.ERROR_NO_ALTERNATIVE).toBeTruthy();
    });
    test('should expose ERROR_VALUE_NOT_ALLOWED', () => {
      expect(Schema.ERROR_VALUE_NOT_ALLOWED).toBeTruthy();
    });
    test('should expose ERROR_TOO_MANY', () => {
      expect(Schema.ERROR_TOO_MANY).toBeTruthy();
    });
    test('should expose ERROR_TOO_FEW', () => {
      expect(Schema.ERROR_TOO_FEW).toBeTruthy();
    });
    test('should expose ERROR_TOO_LONG', () => {
      expect(Schema.ERROR_TOO_LONG).toBeTruthy();
    });
    test('should expose ERROR_TOO_SHORT', () => {
      expect(Schema.ERROR_TOO_SHORT).toBeTruthy();
    });
    test('should expose ERROR_TOO_LARGE', () => {
      expect(Schema.ERROR_TOO_LARGE).toBeTruthy();
    });
    test('should expose ERROR_TOO_SMALL', () => {
      expect(Schema.ERROR_TOO_SMALL).toBeTruthy();
    });
    test('should expose ERROR_IS_EMPTY', () => {
      expect(Schema.ERROR_IS_EMPTY).toBeTruthy();
    });
  });

  describe('Given "any" schema', () => {
    beforeEach(() => {
      testContext.schema = Schema.any();
    });
    test('should set "any" flag', () => {
      expect(testContext.schema.compiled.isAny).toBe(true);
    });
    test('should accept an empty object', () => {
      expect(testContext.schema.getErrors({})).toBeFalsy();
    });
    test('should accept a number', () => {
      expect(testContext.schema.getErrors(1)).toBeFalsy();
    });
  });

  describe('Given "blackbox" schema', () => {
    beforeEach(() => {
      testContext.schema = Schema.blackbox();
    });
    test('should set "blackbox" flag', () => {
      expect(testContext.schema.compiled.isBlackbox).toBe(true);
    });
    test('should accept an empty object', () => {
      expect(testContext.schema.getErrors({})).toBeFalsy();
    });
    test('should accept object with additional fields', () => {
      expect(testContext.schema.getErrors({
        x: 1,
        y: 1,
      })).toBeFalsy();
    });
    test('should not accept a number', () => {
      expect(testContext.schema.getErrors(1)).toEqual({
        actual: 1,
        error: ERROR_NOT_OBJECT,
      });
    });
  });

  describe('Given "empty" schema', () => {
    beforeEach(() => {
      testContext.schema = Schema.empty();
    });
    test('should validate empty object', () => {
      expect(testContext.schema.getErrors({})).toBeFalsy();
    });
    test('should not accept object with properties', () => {
      expect(testContext.schema.getErrors({
        x: 1,
        y: 1,
      })).toEqual({
        errors: {
          x: { error: ERROR_KEY_NOT_ALLOWED },
          y: { error: ERROR_KEY_NOT_ALLOWED },
        },
      });
    });
    test('should not accept object with undefined properties', () => {
      expect(testContext.schema.getErrors({
        x: undefined,
        y: undefined,
      })).toEqual({
        errors: {
          x: { error: ERROR_KEY_NOT_ALLOWED },
          y: { error: ERROR_KEY_NOT_ALLOWED },
        },
      });
    });
  });

  describe('Given "maybe" schema', () => {
    beforeEach(() => {
      testContext.schema = Schema.maybe(Number);
    });
    test('should set "maybe" flag', () => {
      expect(testContext.schema.compiled.isMaybe).toBe(true);
    });
    test('should accept if value is present', () => {
      expect(testContext.schema.getErrors(1)).toBeFalsy();
    });
    test('should not accept if value is of different type', () => {
      expect(testContext.schema.getErrors('a')).toEqual({
        actual: 'a',
        error: ERROR_NOT_NUMBER,
      });
    });
    test('should accept if value is missing', () => {
      expect(testContext.schema.getErrors(null)).toBeFalsy();
    });
    test('should accept if value is void', () => {
      expect(testContext.schema.getErrors(undefined)).toBeFalsy();
    });
  });

  describe('Given "enum" schema', () => {
    beforeEach(() => {
      testContext.schema = Schema.enum(['A', 'B', 'C']);
    });
    test('should set "atomic" flag', () => {
      expect(testContext.schema.compiled.isAtomic).toBe(true);
    });
    test('should accept each of the enumrated values', () => {
      expect(testContext.schema.getErrors('A')).toBeFalsy();
      expect(testContext.schema.getErrors('B')).toBeFalsy();
      expect(testContext.schema.getErrors('C')).toBeFalsy();
    });
    test('should not accept a string that is not explicitly listed', () => {
      expect(testContext.schema.getErrors('D')).toEqual({
        error: ERROR_VALUE_NOT_ALLOWED,
        actual: 'D',
        expected: ['A', 'B', 'C'],
      });
    });
    test('should not accept a number', () => {
      expect(testContext.schema.getErrors(1)).toEqual({
        error: ERROR_NOT_STRING,
        actual: 1,
      });
    });
  });

  describe('Given object schema that overwrites property options', () => {
    beforeEach(() => {
      const MyNumber = new Schema(Number, { decimal: false });
      testContext.schema = new Schema({
        a: MyNumber,
        b: { type: MyNumber, decimal: true },
      });
    });
    test('should accept integers', () => {
      expect(testContext.schema.getErrors({
        a: 1,
        b: 2,
      })).toBeFalsy();
    });
    test('should accept one decimal', () => {
      expect(testContext.schema.getErrors({
        a: 1,
        b: 2.5,
      })).toBeFalsy();
    });
    test('should reject two decimals', () => {
      expect(testContext.schema.getErrors({
        a: 1.5,
        b: 2.5,
      })).toEqual({
        errors: {
          a: { error: ERROR_NOT_INTEGER, actual: 1.5 },
        },
      });
    });
  });

  describe('Given an array schema', () => {
    beforeEach(() => {
      testContext.schema = new Schema([String]);
    });
    test(
      'should throw descriptive error if the first element is invalid',
      () => {
        expect(() => {
          testContext.schema.validate([1]);
        }).toThrowError('0 should be a string');
      },
    );
    test(
      'should throw descriptive error if the second element is invalid',
      () => {
        expect(() => {
          testContext.schema.validate(['a', 1]);
        }).toThrowError('1 should be a string');
      },
    );
  });

  describe('Given a schema with allowedValues', () => {
    describe('and the schema is an array', () => {
      beforeEach(() => {
        testContext.schema1 = new Schema([String], { '$.allowedValues': ['a', 'b', 'c'] });
      });
      test('should reject value that is not allowed', () => {
        expect(testContext.schema1.getErrors(['a', 'b', 'x'])).toEqual({
          errors: [
            undefined,
            undefined,
            {
              error: ERROR_VALUE_NOT_ALLOWED,
              actual: 'x',
              expected: ['a', 'b', 'c'],
            },
          ],
        });
      });
      test('should accept value that is allowed', () => {
        expect(testContext.schema1.getErrors(['a', 'b', 'c'])).toBeFalsy();
      });
    });
  });

  describe('Given a schema with regular expression', () => {
    describe('and the schema is an array', () => {
      beforeEach(() => {
        testContext.schema1 = new Schema([String], { '$.regEx': /\d+/ });
      });
      test('should reject value that is not allowed', () => {
        expect(testContext.schema1.getErrors(['1', '12', 'xxx'])).toEqual({
          errors: [
            undefined,
            undefined,
            {
              error: ERROR_DOES_NOT_MATCH,
              expected: 'match /\\d+/',
            },
          ],
        });
      });
      test('should accept value that is allowed', () => {
        expect(testContext.schema1.getErrors(['1', '12', '123'])).toBeFalsy();
      });
    });
  });

  describe('Given a nested object schema', () => {
    beforeEach(() => {
      testContext.schema1 = new Schema({
        a: new Schema({
          x: Number,
          y: Number,
        }),
        b: {
          type: new Schema({
            x: Number,
            y: Number,
          }),
        },
        c: {
          type: {
            x: Number,
            y: Number,
          },
        },
      }, {
        emptyStringsAreMissingValues: true,
      });
    });
    test('should reject object with missing properties', () => {
      expect(testContext.schema1.getErrors({
        a: { x: 1 },
        b: { x: 1 },
        c: { x: 1 },
      })).toEqual({
        errors: {
          a: { errors: { y: { error: ERROR_MISSING_FIELD } } },
          b: { errors: { y: { error: ERROR_MISSING_FIELD } } },
          c: { errors: { y: { error: ERROR_MISSING_FIELD } } },
        },
      });
    });
    test('should not report empty string, if object is expected', () => {
      expect(testContext.schema1.getErrors({
        a: '',
        b: null,
        c: undefined,
      })).toEqual({
        errors: {
          a: { error: ERROR_NOT_OBJECT, actual: '' },
          b: { error: ERROR_MISSING_FIELD },
          c: { error: ERROR_MISSING_FIELD },
        },
      });
    });
    test('should not report missing string, if number is expected', () => {
      expect(testContext.schema1.getErrors({
        a: { x: '', y: 1 },
      })).toEqual({
        errors: {
          a: {
            errors: {
              x: { error: ERROR_NOT_NUMBER, actual: '' },
            },
          },
          b: { error: ERROR_MISSING_FIELD },
          c: { error: ERROR_MISSING_FIELD },
        },
      });
    });
  });

  describe('Given a merge schema', () => {
    beforeEach(() => {
      testContext.schema1 = Schema.merge([
        {
          a: { type: Number },
          b: { type: String },
        },
        {
          b: { type: Number },
          c: { type: String },
        },
      ]);
    });

    test('should accept a valid object', () => {
      expect(testContext.schema1.getErrors({
        a: 1,
        b: 1,
        c: 'x',
      })).toBeFalsy();
    });

    test('should reject an object with invalid property type', () => {
      expect(testContext.schema1.getErrors({
        a: 1,
        b: 'x',
        c: 'x',
      })).toEqual({
        errors: {
          b: { error: ERROR_NOT_NUMBER, actual: 'x' },
        },
      });
    });
  });

  describe('Given a schema with "pick"', () => {
    beforeEach(() => {
      testContext.schema1 = Schema.pick({
        a: { type: Number },
        b: { type: String },
        c: { type: Number },
      }, {
        properties: ['a', 'b'],
      });
      testContext.schema2 = Schema.pick({
        a: { type: Number },
        b: { type: String },
        c: { type: Number },
      }, {
        properties: {
          a: { optional: true },
          b: { optional: true },
          c: {},
        },
      });
    });

    test('should accept a valid object', () => {
      expect(testContext.schema1.getErrors({
        a: 1,
        b: 'x',
      })).toBeFalsy();
    });

    test('should reject an object with invalid property type', () => {
      expect(testContext.schema1.getErrors({
        a: 1,
        b: 1,
        c: 'x',
      })).toEqual({
        errors: {
          b: { error: ERROR_NOT_STRING, actual: 1 },
          c: { error: ERROR_KEY_NOT_ALLOWED },
        },
      });
    });

    test('should allow changing property options', () => {
      expect(testContext.schema2.getErrors({
        c: 'x',
      })).toEqual({
        errors: {
          c: {
            actual: 'x',
            error: ERROR_NOT_NUMBER,
          },
        },
      });
    });
  });

  describe('Given a merged schema', () => {
    beforeEach(() => {
      testContext.schema1 = Schema.merge([
        {
          a: { type: String },
          b: { type: String },
        },
        {
          b: { type: String, optional: true },
          c: { type: String },
          d: { type: String },
        },
      ]);
      testContext.schema2 = Schema.merge([
        Schema.blackbox(),
        {
          a: { type: String, optional: true },
          b: { type: String, optional: true },
        },
      ]);
    });

    test('should accept a valid object', () => {
      expect(testContext.schema1.getErrors({
        a: 'a',
        c: 'c',
        d: 'd',
      })).toBeFalsy();
    });

    test('should reject an invalid object', () => {
      expect(testContext.schema1.getErrors({
        c: 'c',
        d: 'd',
      })).toEqual({
        errors: {
          a: { error: ERROR_MISSING_FIELD },
        },
      });
    });

    test('should flag itself with isObject', () => {
      expect(testContext.schema1.compiled.isObject).toBe(true);
    });

    test('should flag isBlackbox if one of elements allows additional properties', () => {
      expect(testContext.schema2.compiled.isBlackbox).toBe(true);
    });

    test('should allow additional properties', () => {
      expect(testContext.schema2.getErrors({
        x: 1,
        y: 1,
      })).toBeFalsy();
    });
  });

  describe('Given a hash with object sub-schema', () => {
    beforeEach(() => {
      testContext.schema = Schema.hash({
        key: new Schema(String, { max: 3 }),
        value: {
          a: Number,
          b: String,
        },
      });
    });
    test('should accept a valid object', () => {
      expect(testContext.schema.getErrors({
        xxx: { a: 1, b: 'x' },
        yyy: { a: 2, b: 'y' },
      })).toBeFalsy();
    });
    test('should reject if key is too long', () => {
      expect(testContext.schema.getErrors({
        xxxx: { a: 1, b: 'x' },
      })).toEqual({
        errors: {
          xxxx: {
            actual: 'xxxx',
            error: ERROR_TOO_LONG,
            expected: 3,
          },
        },
      });
    });
    test('should reject an invalid object', () => {
      expect(testContext.schema.getErrors({
        xxx: { b: 'x' },
        yyy: { c: 2, a: 1, b: 'y' },
      })).toEqual({
        errors: {
          xxx: {
            errors: {
              a: {
                error: ERROR_MISSING_FIELD,
              },
            },
          },
          yyy: {
            errors: {
              c: {
                error: ERROR_KEY_NOT_ALLOWED,
              },
            },
          },
        },
      });
    });
  });

  describe('Given an alternative schema', () => {
    beforeEach(() => {
      testContext.schema = Schema.oneOf([
        new Schema({}, { typeName: 'empty' }),
        new Schema(String, { typeName: 'text' }),
        Schema.arrayOf(Number),
      ]);
    });

    test('should generate a descriptive error of there is no match', () => {
      expect(testContext.schema.validate(true, { noException: true })).toBe('Value should be one of: empty, text, array of number');
    });
  });

  describe('Schema.clean()', () => {
    beforeEach(() => {
      testContext.schema1 = new Schema({
        a: new Schema({
          x: { type: Number, defaultValue: 0 },
          y: { type: String, defaultValue: '' },
        }, {
          defaultValue: {},
        }),
        b: [new Schema(Number)],
      });
      testContext.schema2 = new Schema({
        a: Number,
        b: Number,
        c: String,
      }, {
        additionalProperties: true,
      });
      testContext.schema3 = new Schema({
        a: Number,
        b: Number,
        c: String,
      }, {
        emptyStringsAreMissingValues: true,
      });
      testContext.schema4 = Schema.tuple([
        Number,
        Number,
        Number,
      ], {
        defaultValue: [0, 0, 0],
      });
      testContext.schema5 = Schema.objectOf(
        new Schema(Number, { defaultValue: 0 }),
        {
          defaultValue: {},
        },
      );
    });
    test('should not modify a valid object', () => {
      expect(testContext.schema1.clean({
        a: { x: 1, y: 'y' },
        b: [1, 2, 3],
      })).toEqual({
        a: { x: 1, y: 'y' },
        b: [1, 2, 3],
      });
    });
    test('should convert strings to numbers', () => {
      expect(testContext.schema1.clean({
        a: { x: '1.5', y: '' },
        b: ['1', '2', 3],
      })).toEqual({
        a: { x: 1.5, y: '' },
        b: [1, 2, 3],
      });
    });
    test('should convert numbers to strings', () => {
      expect(testContext.schema1.clean({
        a: { x: 0, y: 1 },
      })).toEqual({
        a: { x: 0, y: '1' },
      });
    });
    test('should remove properties that are not allowed', () => {
      expect(testContext.schema1.clean({
        a: { x: 0, y: '', z: {} },
      })).toEqual({
        a: { x: 0, y: '' },
      });
    });
    test('should set default values', () => {
      expect(testContext.schema1.clean({})).toEqual({
        a: {
          x: 0,
          y: '',
        },
      });
    });
    test(
      'should remove properties that are null, undefined or empty',
      () => {
        expect(testContext.schema3.clean({
          a: null,
          b: undefined,
          c: '',
        })).toEqual({});
      },
    );
    test(
      'should not remove empty strings if they are not considerd missing values',
      () => {
        expect(testContext.schema2.clean({
          a: null,
          b: undefined,
          c: '',
        })).toEqual({
          c: '',
        });
      },
    );
    test('should keep additional properties if they are allowed', () => {
      expect(testContext.schema2.clean({
        d: 3,
      })).toEqual({
        d: 3,
      });
    });
    test('should not change things that cannot be cleaned', () => {
      expect(testContext.schema1.clean({
        a: [1, 2, 3],
      })).toEqual({
        a: [1, 2, 3],
      });
    });
    test('should tuple elements', () => {
      expect(testContext.schema4.clean(
        [1, 2, '3'],
      )).toEqual(
        [1, 2, 3],
      );
    });
    test('should remove outstanding elements from tuple', () => {
      expect(testContext.schema4.clean(
        [1, 2, 3, 4, 5],
      )).toEqual(
        [1, 2, 3],
      );
    });
    test('should append missing elements to tuple', () => {
      expect(testContext.schema4.clean(
        [1],
      )).toEqual(
        [1, 0, 0],
      );
    });
    test('should clean hash values', () => {
      expect(testContext.schema5.clean({
        a: '1',
        b: 1,
        c: undefined,
      })).toEqual({
        a: 1,
        b: 1,
        c: 0,
      });
    });
  });

  describe('Given a an object schema with default value', () => {
    beforeEach(() => {
      testContext.schema1 = new Schema({
        a: new Schema({
          x: { type: Number, defaultValue: 0, optional: true, min: 1 },
          y: { type: new Schema(Number, { defaultValue: 0 }) },
        }),
        b: {
          type: new Schema({
            x: Number,
            y: Number,
          }, {
            defaultValue: {
              x: 0,
            },
          }),
          optional: true,
        },
      }, {
        defaultValue: {},
      });
    });
    test('should return relevant errors web validating null', () => {
      expect(testContext.schema1.getErrors(undefined, { clean: true })).toEqual({
        errors: {
          a: { error: ERROR_MISSING_FIELD },
          b: { errors: { y: { error: ERROR_MISSING_FIELD } } },
        },
      });
    });
    test(
      'should return relevant errors when validating empty object ',
      () => {
        expect(testContext.schema1.getErrors({}, { clean: true })).toEqual({
          errors: {
            a: { error: ERROR_MISSING_FIELD },
            b: { errors: { y: { error: ERROR_MISSING_FIELD } } },
          },
        });
      },
    );
    test(
      'should return relevant errors when properties are empty objects',
      () => {
        expect(testContext.schema1.getErrors({
          a: {},
          b: {},
        }, { clean: true })).toEqual({
          errors: {
            a: {
              errors: {
                x: { error: ERROR_TOO_SMALL, expected: 1, actual: 0 },
              },
            },
            b: {
              errors: {
                x: { error: ERROR_MISSING_FIELD },
                y: { error: ERROR_MISSING_FIELD },
              },
            },
          },
        });
      },
    );
  });

  describe('Given a hash schema with default value', () => {
    beforeEach(() => {
      testContext.schema1 = Schema.objectOf(
        new Schema({
          x: { type: Number, defaultValue: 0, optional: true, min: 1 },
          y: { type: Number },
        }, { defaultValue: {} }),
        {
          defaultValue: {},
        },
      );
    });
    test('should not return any errors on null', () => {
      expect(testContext.schema1.getErrors(undefined, { clean: true })).toBeFalsy();
    });
    test(
      'should return relevant errors there is key with null value',
      () => {
        expect(testContext.schema1.getErrors({
          a: undefined,
        }, { clean: true })).toEqual({
          errors: {
            a: {
              errors: {
                x: { error: ERROR_TOO_SMALL, actual: 0, expected: 1 },
                y: { error: ERROR_MISSING_FIELD },
              },
            },
          },
        });
      },
    );
  });

  describe('Given two schemas with referencing properties', () => {
    beforeEach(() => {
      testContext.schema1 = new Schema({
        a: { type: String, optional: true },
        b: { type: Number },
        c: {
          type: new Schema({
            x: Number,
            y: Number,
          }),
        },
        d: {
          type: Schema.arrayOf({
            x: Number,
            y: Number,
          }),
          optional: true,
        },
      });
      testContext.schema2 = new Schema({
        a: testContext.schema1.property('a'),
        b: testContext.schema1.property('b'),
        x: testContext.schema1.property('c.x'),
        y: { type: testContext.schema1.property('c.y'), label: 'Y', optional: true },
      });
      testContext.schema3 = new Schema({
        x: testContext.schema1.property('d.x'),
        y: testContext.schema1.property('d.y'),
      });
    });
    test('should not affect the original validator', () => {
      expect(testContext.schema1.getErrors({
        b: 1,
        c: {},
      })).toEqual({
        errors: {
          c: {
            errors: {
              x: { error: ERROR_MISSING_FIELD },
              y: { error: ERROR_MISSING_FIELD },
            },
          },
        },
      });
    });
    test('should reject object with missing properties', () => {
      expect(testContext.schema2.getErrors({})).toEqual({
        errors: {
          b: { error: ERROR_MISSING_FIELD },
          x: { error: ERROR_MISSING_FIELD },
        },
      });
    });
    test('should properly report relevant errors', () => {
      expect(testContext.schema2.getErrors({
        b: 1,
        x: 'x',
        y: 'y',
      })).toEqual({
        errors: {
          x: {
            actual: 'x',
            error: ERROR_NOT_NUMBER,
          },
          y: {
            actual: 'y',
            error: ERROR_NOT_NUMBER,
            label: 'Y',
          },
        },
      });
    });
    test('should accept a valid object', () => {
      expect(testContext.schema2.getErrors({
        a: 'a',
        b: 1,
        x: 1,
        y: 1,
      })).toBeFalsy();
    });
    test('should pick properties from object nested in array', () => {
      expect(testContext.schema3.getErrors({
        x: 1,
        y: 1,
      })).toBeFalsy();
    });
  });

  describe('Given a schema with labels', () => {
    beforeEach(() => {
      testContext.schema1 = new Schema({
        a: { type: String, label: 'A' },
        b: {
          type: {
            x: { type: Number, label: 'X' },
            y: { type: Number, label: 'Y' },
          },
        },
      });
      testContext.schema2 = new Schema([new Schema(String, { label: 'Item' })], { maxCount: 2, label: 'Array' });
    });
    test('should attach labels to error descriptor', () => {
      expect(testContext.schema1.getErrors({
        b: {
          x: '',
        },
      })).toEqual({
        errors: {
          a: {
            error: ERROR_MISSING_FIELD,
            label: 'A',
          },
          b: {
            errors: {
              x: {
                error: ERROR_NOT_NUMBER,
                label: 'X',
                actual: '',
              },
              y: {
                error: ERROR_MISSING_FIELD,
                label: 'Y',
              },
            },
          },
        },
      });
    });
    test('should properly attach label to an array', () => {
      expect(testContext.schema2.getErrors([1, 2, 3])).toEqual({
        actual: [1, 2, 3],
        error: ERROR_TOO_MANY,
        expected: 2,
        label: 'Array',
      });
    });
    test('should properly attach label to an array elements', () => {
      expect(testContext.schema2.getErrors([1, 2])).toEqual({
        label: 'Array',
        errors: [
          {
            actual: 1,
            error: ERROR_NOT_STRING,
            label: 'Item',
          },
          {
            actual: 2,
            error: ERROR_NOT_STRING,
            label: 'Item',
          },
        ],
      });
    });
  });
});
