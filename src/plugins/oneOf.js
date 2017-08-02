import {
  ERROR_NO_ALTERNATIVE,
} from '../constants.js';

import {
  isArray,
} from '../utils.js';

const pluginOneOf = {
  compile(compiler, schemaDef) {
    if (schemaDef instanceof compiler.Schema.OneOf) {
      const alternativeSchemas = schemaDef.alternativeSchemaDefs.map(x => compiler.compile(x));
      return {
        isOneOf: true,
        compiled: true,
        typeName: `one of ${alternativeSchemas.map(x => x.typeName).join(', ')}`,
        validate: (value) => {
          const expected = [];
          for (const { validate, typeName } of alternativeSchemas) {
            const error = validate(value);
            if (!error) {
              return undefined;
            }
            expected.push(typeName || '[unknown]');
          }
          return { error: ERROR_NO_ALTERNATIVE, expected };
        },
      };
    }
    return null;
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
