import {
  isArray,
  validateIsObject,
  createValidateProperties,
  combine,
} from '../validators.js';

const pluginPick = {
  compile(compiler, schemaDef, { pick, ...otherOptions }) {
    if (pick) {
      if (!isArray(pick)) {
        throw new Error('Pick needs to be an array.');
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

export default pluginPick;
