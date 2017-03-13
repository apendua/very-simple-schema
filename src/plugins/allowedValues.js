import {
  createValidateIsAllowed,
} from '../validators.js';

const pluginAllowedValues = {
  compile(compiler, schemaDef, schemaOptions) {
    const {
      allowedValues,
    } = schemaOptions;
    if (allowedValues) {
      if (!this.isAtomic) {
        throw new Error('AllowedValues requires an atomic schema');
      }
      return {
        validate: createValidateIsAllowed(allowedValues),
      };
    }
    return null;
  },
};

export default pluginAllowedValues;
