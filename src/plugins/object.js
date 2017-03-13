import {
  has,
  isArray,
  isObject,
  validateIsObject,
  combine,
  createValidateProperties,
} from '../validators.js';

const pluginObject = {
  compile(compiler, schemaDef, {
    additionalProperties = compiler.options.additionalProperties,
    emptyStringsAreMissingValues = compiler.options.emptyStringsAreMissingValues,
  }) {
    if (isObject(schemaDef)) {
      const properties = {};
      Object.keys(schemaDef).forEach((key) => {
        const definition = schemaDef[key];
        if (definition &&
            typeof definition === 'object' &&
            !isArray(definition) &&
            has(definition, 'type')) {
          const {
            type,
            optional,
            ...otherOptions
          } = definition;
          properties[key] = compiler.compile(type, {
            ...otherOptions,
          });
          properties[key].optional = !!optional;
        } else {
          properties[key] = compiler.compile(definition);
        }
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

export default pluginObject;
