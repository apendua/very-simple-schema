import {
  createValidateEquals,
  createValidateInstanceOf,
  validateIsString,
  validateIsNumber,
  validateIsBoolean,
  validateIsValidDate,
  validateIsDate,
  combine,
} from '../validators.js';

const pluginAtomic = {
  compile(compiler, schemaDef) {
    let validate;
    if (schemaDef === Number) {
      validate = validateIsNumber;
    } else if (schemaDef === String) {
      validate = validateIsString;
    } else if (schemaDef === Boolean) {
      validate = validateIsBoolean;
    } else if (schemaDef === Date) {
      validate = combine([
        validateIsDate,
        validateIsValidDate,
      ]);
    } else if (typeof schemaDef === 'function') {
      validate = createValidateInstanceOf(schemaDef);
    } else if (typeof schemaDef !== 'object' || schemaDef === null) {
      validate = createValidateEquals(schemaDef);
    }
    return {
      validate,
    };
  },
};

export default pluginAtomic;
