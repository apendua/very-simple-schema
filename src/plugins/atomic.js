import {
  createValidateEquals,
  createValidateInstanceOf,
  validateIsString,
  validateIsNumber,
  validateIsBoolean,
  validateIsValidDate,
  validateIsDate,
  combine,
  createValidateMin,
  createValidateMax,
} from '../validators.js';

const pluginAtomic = {
  compile(compiler, schemaDef, schemaOptions) {
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
    const { min, max } = schemaOptions;
    return {
      validate: combine([
        validate,
        min !== undefined && createValidateMin(min),
        max !== undefined && createValidateMax(max),
      ]),
    };
  },
};

export default pluginAtomic;
