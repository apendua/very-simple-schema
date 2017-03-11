import {
  has,
  isArray,
  isObject,
  validateIsObject,
  combine,
  createValidateProperties,
} from '../validators.js';

const pluginObject = {
  compile(compiler, schemaDef) {
    if (isObject(schemaDef)) {
      const properties = {};
      Object.keys(schemaDef).forEach((key) => {
        const propSchemaDef = schemaDef[key];
        if (propSchemaDef &&
            typeof propSchemaDef === 'object' &&
            !isArray(propSchemaDef) &&
            has(propSchemaDef, 'type')) {
          const {
            type,
            optional,
            ...otherOptions
          } = propSchemaDef;
          properties[key] = compiler.compile(type, otherOptions);
          properties[key].optional = !!optional;
        } else {
          properties[key] = compiler.compile(propSchemaDef);
        }
      });
      return {
        properties,
        compiled: true,
        isObject: true,
        validate: combine([
          validateIsObject,
          createValidateProperties(properties),
        ]),
      };
    }
    return {};
  },
};

export default pluginObject;
