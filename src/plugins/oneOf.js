import {
  ERROR_NO_ALTERNATIVE,
  ERROR_VALUE_NOT_ALLOWED,
} from '../constants.js';

import {
  isArray,
  each,
  combine,
} from '../utils.js';
import {
  validateIsObject,
} from '../validators.js';

const createValidateIsAllowed = (expected) => {
  const values = {};
  each(expected, (value) => {
    if (typeof value !== 'string') {
      throw new Error('Expected allowedValues to an array of strings');
    }
    values[value] = true;
  });
  return actual => (values[actual] ? undefined : { error: ERROR_VALUE_NOT_ALLOWED, actual, expected });
};

const pluginOneOf = {
  compile: compiler => next => (validator, schemaDef, schemaOptions) => {
    const {
      allowedValues,
    } = schemaOptions;
    if (allowedValues) {
      if (!validator.isString) {
        throw new Error('Option allowedValues can only be used with string');
      }
      if (!isArray(allowedValues)) {
        throw new Error('Expected allowed values to be an array of strings');
      }
      const alternatives = allowedValues.map(x => compiler.compile({}, x, {}));
      return next({
        ...validator,
        alternatives,
        isOneOf: true,
        typeName: `one of ${allowedValues.map(x => x.typeName).join(', ')}`,
        validate: combine([
          validator.validate,
          createValidateIsAllowed(allowedValues),
        ]),
      }, schemaDef, schemaOptions);
    }
    if (schemaDef instanceof compiler.Schema.OneOf) {
      const alternatives = schemaDef.alternativeSchemaDefs.map(x => compiler.compile({}, x, {}));
      const {
        disjointBy,
      } = schemaOptions;
      if (disjointBy) {
        each(alternatives, (alternative) => {
          if (!alternative.isObject) {
            throw new Error('If disjointBy is used each alternative must be an object');
          }
          if (!alternative.properties[disjointBy]) {
            throw new Error(`Validator ${alternative.typeName} does not have property ${disjointBy}`);
          }
        });
      }
      return next({
        alternatives,
        isOneOf: true,
        typeName: `one of ${alternatives.map(x => x.typeName).join(', ')}`,
        validate: combine([
          disjointBy && validateIsObject,
          (value) => {
            const expected = [];
            if (disjointBy) {
              for (let i = 0; i < alternatives.length; i += 1) {
                const property = alternatives[i].properties[disjointBy];
                if (!property.validate(value && value[disjointBy])) {
                  return alternatives[i].validate(value);
                }
                expected.push(property.typeName || '[unknown]');
              }
            } else {
              for (const { validate, typeName } of alternatives) {
                const error = validate(value);
                if (!error) {
                  return undefined;
                }
                expected.push(typeName || '[unknown]');
              }
            }
            return { error: ERROR_NO_ALTERNATIVE, expected };
          },
        ]),
      }, schemaDef, schemaOptions);
    }
    return next(validator, schemaDef, schemaOptions);
  },
  mixin(Schema) {
    class OneOf {
      constructor(alternativeSchemaDefs) {
        if (!isArray(alternativeSchemaDefs)) {
          throw new Error('OneOf requires and array with alternative schemas');
        }
        Object.assign(this, {
          alternativeSchemaDefs,
        });
      }
    }
    Object.assign(Schema, {
      OneOf,
      oneOf: (schemaDef, schemaOptions) =>
        new Schema(new OneOf(schemaDef), schemaOptions),
    });
  },
};

export default pluginOneOf;
