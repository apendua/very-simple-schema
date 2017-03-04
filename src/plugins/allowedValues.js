import {
  isArray,
  createValidateIsAllowed,
} from '../validators.js';

const pluginAllowedValues = {
  compile(compiler, schemaDef, schemaOptions) {
    const {
      allowedValues,
    } = schemaOptions;
    if (allowedValues && !isArray(schemaDef)) {
      return {
        validate: createValidateIsAllowed(allowedValues),
      };
    }
    return null;
  },
};

export default pluginAllowedValues;
