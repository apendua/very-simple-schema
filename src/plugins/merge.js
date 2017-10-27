import {
  validateIsObject,
  createValidateProperties,
} from '../validators.js';
import {
  isArray,
  combine,
} from '../utils.js';

const pluginMerge = {
  compile: compiler => next => (validator, schemaDef, schemaOptions = {}) => {
    if (schemaDef instanceof compiler.Schema.Merge) {
      const {
        typeName = 'object',
        additionalProperties = compiler.options.additionalProperties,
        emptyStringsAreMissingValues = compiler.options.emptyStringsAreMissingValues,
      } = schemaOptions;
      const properties = {};
      schemaDef.schemaDefs.forEach((definition) => {
        // NOTE: We are not passing any options here. It's intentional.
        const schema = compiler.compile({}, definition, schemaOptions);
        if (!schema.isObject) {
          throw new Error('Merge requires all source schema to be objects');
        }
        Object.assign(properties, schema.properties);
      });
      return next({
        properties,
        typeName,
        isObject: true,
        validate: combine([
          validateIsObject,
          createValidateProperties({
            properties,
            additionalProperties,
            emptyStringsAreMissingValues,
          }),
        ]),
      }, schemaDef, schemaOptions);
    }
    return next(validator, schemaDef, schemaOptions);
  },
  mixin(Schema) {
    class Merge {
      constructor(schemaDefs) {
        if (!isArray(schemaDefs)) {
          throw new Error('Merge requires and array of object schemas');
        }
        Object.assign(this, {
          schemaDefs,
        });
      }
    }
    Object.assign(Schema, {
      Merge,
      merge: (schemaDefs, schemaOptions) =>
        new Schema(new Merge(schemaDefs), schemaOptions),
    });
  },
};

export default pluginMerge;
