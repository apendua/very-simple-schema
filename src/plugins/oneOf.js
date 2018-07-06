import {
  ERROR_NO_ALTERNATIVE,
} from '../constants.js';

import {
  isArray,
  each,
  combine,
} from '../utils.js';
import {
  validateIsObject,
} from '../validators.js';

const pluginOneOf = {
  compile: compiler => next => (validator, schemaDef, schemaOptions) => {
    if (schemaDef instanceof compiler.Schema.OneOf) {
      const alternatives = schemaDef.alternativeSchemaDefs.map(x => compiler.compile({}, x));
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
