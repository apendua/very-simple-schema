import {
  ERROR_VALUE_NOT_ALLOWED,
} from '../constants.js';

import {
  isArray,
  each,
  every,
  combine,
} from '../utils.js';
import {
  validateIsObject,
} from '../validators.js';

const createValidateIsAllowed = (allowed) => {
  const values = {};
  const expected = [];
  each(allowed, ({ isLiteral, value, typeName }) => {
    if (!isLiteral || typeof value !== 'string') {
      throw new Error('Expected allowedValues to be an array of strings');
    }
    expected.push(typeName);
    values[value] = true;
  });
  return actual => (values[actual] ? undefined : { error: ERROR_VALUE_NOT_ALLOWED, actual, expected });
};

const isArrayOfStringLiteralValidators = validators =>
  isArray(validators) && every(validators, validator => validator.isLiteral && typeof validator.value === 'string');

const isArrayOfStrings = values => isArray(values) && every(values, x => typeof x === 'string');

const pluginOneOf = {
  compile: compiler => next => (validator, schemaDef, schemaOptions) => {
    const {
      allowedValues,
    } = schemaOptions;
    let allowed;
    if (allowedValues) {
      if (!validator.isString) {
        throw new Error('Option allowedValues can only be used with string');
      }
      if (!isArrayOfStrings(allowedValues)) {
        throw new Error('Expected allowed values to be an array');
      }
      allowed = allowedValues.map(x => compiler.compile({}, x, {}));
    } else if (schemaDef instanceof compiler.Schema.OneOf) {
      allowed = schemaDef.allowedSchemaDefs.map(x => compiler.compile({}, x, {}));
    }
    if (allowed) {
      const {
        disjointBy,
      } = schemaOptions;
      if (disjointBy) {
        each(allowed, (alternative) => {
          if (!alternative.isObject) {
            throw new Error('If disjointBy is used each alternative must be an object');
          }
          if (!alternative.properties[disjointBy]) {
            throw new Error(`Validator ${alternative.typeName} does not have property ${disjointBy}`);
          }
        });
      }
      return next({
        ...validator,
        allowed,
        isOneOf: true,
        typeName: `one of ${allowed.map(x => x.typeName).join(', ')}`,
        validate: isArrayOfStringLiteralValidators(allowed)
          ? combine([
            validator.validate,
            // Use optimized version for strings only ...
            createValidateIsAllowed(allowed),
          ])
          : combine([
            validator.validate,
            disjointBy && validateIsObject,
            (value) => {
              const expected = [];
              if (disjointBy) {
                for (let i = 0; i < allowed.length; i += 1) {
                  const property = allowed[i].properties[disjointBy];
                  if (!property.validate(value && value[disjointBy])) {
                    return allowed[i].validate(value);
                  }
                  expected.push(property.typeName || '[unknown]');
                }
              } else {
                for (const { validate, typeName } of allowed) {
                  const error = validate(value);
                  if (!error) {
                    return undefined;
                  }
                  expected.push(typeName || '[unknown]');
                }
              }
              return { error: ERROR_VALUE_NOT_ALLOWED, expected };
            },
          ]),
      }, schemaDef, schemaOptions);
    }
    return next(validator, schemaDef, schemaOptions);
  },
  mixin(Schema) {
    class OneOf {
      constructor(allowedSchemaDefs) {
        if (!isArray(allowedSchemaDefs)) {
          throw new Error('OneOf requires and array with alternative schemas');
        }
        Object.assign(this, {
          allowedSchemaDefs,
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
