import {
  validateIsObject,
  createValidateProperties,
  combine,
} from '../validators.js';
import {
  isArray,
} from '../utils.js';

const pluginPick = {
  compile(compiler, schemaDef, {
    pick,
    typeName = 'object',
    additionalProperties = compiler.options.additionalProperties,
    emptyStringsAreMissingValues = compiler.options.emptyStringsAreMissingValues,
    ...otherOptions
  }) {
    if (pick) {
      if (!isArray(pick)) {
        throw new Error('Pick requires an array of fields');
      }
      const schema = compiler.compile(schemaDef, otherOptions);
      if (!schema.isObject) {
        throw new Error('Pick requires all source schema to be objects');
      }
      const properties = {};
      pick.forEach((name) => {
        properties[name] = schema.properties[name];
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
      };
    }
    return {};
  },
};

export default pluginPick;
