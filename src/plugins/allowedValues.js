import {
  isArray,
  createValidateIsAllowed,
} from '../validators.js';

const pluginAllowedValues = {
  compile(compiler, schemaDef, options) {
    const {
      allowedValues,
    } = options;
    if (allowedValues && !isArray(schemaDef)) {
      return {
        validate: createValidateIsAllowed(allowedValues),
      };
    }
    return null;
  },
};

export default pluginAllowedValues;
