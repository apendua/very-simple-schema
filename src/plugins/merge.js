import {
  isArray,
  validateIsObject,
  createValidateProperties,
  combine,
} from '../validators.js';

const pluginMerge = {
  compile(compiler, schemaDef, {
    merge,
    additionalProperties = compiler.options.additionalProperties,
    emptyStringsAreMissingValues = compiler.options.emptyStringsAreMissingValues,
  }) {
    if (merge) {
      if (!isArray(schemaDef)) {
        throw new Error('Merge requires an array');
      }
      const properties = {};
      schemaDef.forEach((definition) => {
        // NOTE: We are not passing any options here. It's intentional.
        const schema = compiler.compile(definition);
        if (!schema.isObject) {
          throw new Error('Merge requires all source schema to be objects');
        }
        Object.assign(properties, schema.properties);
      });
      return {
        properties,
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
    return {};
  },
};

export default pluginMerge;
