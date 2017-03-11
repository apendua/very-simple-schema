import {
  isArray,
  validateIsObject,
  createValidateProperties,
  combine,
} from '../validators.js';

const pluginMerge = {
  compile(compiler, schemaDef, { merge, additionalProperties }) {
    if (merge && isArray(schemaDef)) {
      const properties = {};
      schemaDef.forEach((memberSchemaDef) => {
        const schema = compiler.compile(memberSchemaDef);
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
