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
    const schema = {
      isAtomic: true,
    };

    if (schemaDef === Number) {
      validators.push(validateIsNumber);
      validators.push(validateIsInteger);
      validators.push(min !== undefined && createValidateMin(min));
      validators.push(max !== undefined && createValidateMax(max));
      schema.isNumber = true;
    } else if (schemaDef === String) {
      validators.push(validateIsString);
      validators.push(min !== undefined && createValidateMinCount(min));
      validators.push(max !== undefined && createValidateMaxCount(max));
      schema.isString = true;
    } else if (schemaDef === Boolean) {
      validators.push(validateIsBoolean);
      schema.isBoolean = true;
    } else if (schemaDef === Date) {
      validators.push(validateIsDate);
      validators.push(validateIsValidDate);
      validators.push(min !== undefined && createValidateMin(min));
      validators.push(max !== undefined && createValidateMax(max));
      schema.isDate = true;
    } else if (typeof schemaDef === 'function') {
      validators.push(createValidateInstanceOf(schemaDef));
      schema.isFunction = true;
    } else if (typeof schemaDef !== 'object' || schemaDef === null) {
      validators.push(createValidateEquals(schemaDef));
      schema.isLiteral = true;
    } else {
      schema.isAtomic = false;
    }

    schema.validate = combine(validators);
    return schema;
  },
};

export default pluginAtomic;
