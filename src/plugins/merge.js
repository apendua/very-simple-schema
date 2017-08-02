import {
  validateIsObject,
  createValidateProperties,
  combine,
} from '../validators.js';
import {
  isArray,
} from '../utils.js';

const pluginMerge = {
  compile(compiler, schemaDef, {
    typeName = 'object',
    additionalProperties = compiler.options.additionalProperties,
    emptyStringsAreMissingValues = compiler.options.emptyStringsAreMissingValues,
  }) {
    if (schemaDef instanceof compiler.Schema.Merge) {
      const properties = {};
      schemaDef.schemaDefs.forEach((definition) => {
        // NOTE: We are not passing any options here. It's intentional.
        const schema = compiler.compile(definition);
        if (!schema.isObject) {
          throw new Error('Merge requires all source schema to be objects');
        }
        Object.assign(properties, schema.properties);
      });
      return {
        properties,
        typeName,
        compiled: true,
        isObject: true,
        validate: combine([
          validateIsObject,
          createValidateProperties({
            properties,
            additionalProperties,
            emptyStringsAreMissingValues,
          }),
        ]),
        getSubSchema: key => properties[key],
      };
    }
    return null;
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
