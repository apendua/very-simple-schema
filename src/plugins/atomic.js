import {
  createValidateEquals,
  createValidateInstanceOf,
  validateIsString,
  validateIsNumber,
  validateIsInteger,
  validateIsBoolean,
  validateIsValidDate,
  validateIsDate,
  combine,
  createValidateMin,
  createValidateMax,
  createValidateMinCount,
  createValidateMaxCount,
} from '../validators.js';

const pluginAtomic = {
  compile(compiler, schemaDef, schemaOptions) {
    const { min, max } = schemaOptions;
    const validators = [];

    if (schemaDef === Number) {
      validators.push(validateIsNumber);
      validators.push(validateIsInteger);
      validators.push(min !== undefined && createValidateMin(min));
      validators.push(max !== undefined && createValidateMax(max));
    } else if (schemaDef === String) {
      validators.push(validateIsString);
      validators.push(min !== undefined && createValidateMinCount(min));
      validators.push(max !== undefined && createValidateMaxCount(max));
    } else if (schemaDef === Boolean) {
      validators.push(validateIsBoolean);
    } else if (schemaDef === Date) {
      validators.push(validateIsDate);
      validators.push(validateIsValidDate);
      validators.push(min !== undefined && createValidateMin(min));
      validators.push(max !== undefined && createValidateMax(max));
    } else if (typeof schemaDef === 'function') {
      validators.push(createValidateInstanceOf(schemaDef));
    } else if (typeof schemaDef !== 'object' || schemaDef === null) {
      validators.push(createValidateEquals(schemaDef));
    }

    return {
      validate: combine(validators),
    };
  },
};

export default pluginAtomic;
