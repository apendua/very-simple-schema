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
  createValidateMinLength,
  createValidateMaxLength,
  validateNonEmpty,
} from '../validators.js';

const pluginAtomic = {
  compile(compiler, schemaDef, schemaOptions) {
    const {
      min,
      max,
      typeName,
      nonEmpty,
      decimal = compiler.options.decimal,
    } = schemaOptions;
    const validators = [];
    const schema = {
      isAtomic: true,
    };

    if (schemaDef === Number) {
      validators.push(validateIsNumber);
      validators.push(decimal ? undefined : validateIsInteger);
      validators.push(min !== undefined && createValidateMin(min));
      validators.push(max !== undefined && createValidateMax(max));
      schema.isNumber = true;
      schema.typeName = 'number';
    } else if (schemaDef === String) {
      validators.push(validateIsString);
      validators.push(nonEmpty && validateNonEmpty);
      validators.push(min !== undefined && createValidateMinLength(min));
      validators.push(max !== undefined && createValidateMaxLength(max));
      schema.isString = true;
      schema.typeName = 'string';
    } else if (schemaDef === Boolean) {
      validators.push(validateIsBoolean);
      schema.isBoolean = true;
      schema.typeName = 'boolean';
    } else if (schemaDef === Date) {
      validators.push(validateIsDate);
      validators.push(validateIsValidDate);
      validators.push(min !== undefined && createValidateMin(min));
      validators.push(max !== undefined && createValidateMax(max));
      schema.isDate = true;
      schema.typeName = 'date';
    } else if (typeof schemaDef === 'function') {
      validators.push(createValidateInstanceOf(schemaDef));
      schema.isFunction = true;
      schema.typeName = schemaDef.name || '[unknown]';
    } else if (typeof schemaDef !== 'object' || schemaDef === null) {
      validators.push(createValidateEquals(schemaDef));
      schema.isLiteral = true;
      schema.typeName = schemaDef === undefined ? 'undefined' : JSON.stringify(schemaDef);
    } else {
      schema.isAtomic = false;
    }

    if (typeName) {
      schema.typeName = typeName;
    }
    schema.validate = combine(validators);
    return schema;
  },
};

export default pluginAtomic;
