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
  }) {
    if (merge && isArray(schemaDef)) {
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
          createValidateProperties(properties, additionalProperties),
        ]),
      };
    }
    return {};
  },
};

export default pluginMerge;
