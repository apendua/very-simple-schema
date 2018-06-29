import {
  createValidateEquals,
  createValidateInstanceOf,
  validateIsString,
  validateIsNumber,
  validateIsInteger,
  validateIsBoolean,
  validateIsValidDate,
  validateIsDate,
  createValidateMin,
  createValidateMax,
  createValidateMinLength,
  createValidateMaxLength,
  validateNonEmpty,
} from '../validators.js';
import {
  each,
  combine,
  isArray,
} from '../utils.js';
import {
  ERROR_VALUE_NOT_ALLOWED,
} from '../constants.js';

const createValidateIsAllowed = (expected) => {
  const values = {};
  each(expected, (value) => {
    if (typeof value !== 'string') {
      throw new Error('Expected allowedValues to be a list of strings');
    }
    values[value] = true;
  });
  return actual => (values[actual] ? undefined : { error: ERROR_VALUE_NOT_ALLOWED, actual, expected });
};

const pluginAtomic = {
  compile: compiler => next => (validator, schemaDef, schemaOptions = {}) => {
    const {
      min,
      max,
      typeName,
      nonEmpty,
      decimal = compiler.options.decimal,
      allowedValues,
    } = schemaOptions;
    const validators = [
      validator.validate,
    ];
    const properties = {
      isAtomic: true,
    };

    if (schemaDef === Number) {
      validators.push(validateIsNumber);
      validators.push(decimal ? undefined : validateIsInteger);
      validators.push(min !== undefined && createValidateMin(min));
      validators.push(max !== undefined && createValidateMax(max));
      properties.isNumber = true;
      properties.typeName = 'number';
      properties.clean = x => (typeof x === 'string' ? +x : x);
    } else if (schemaDef === String) {
      validators.push(validateIsString);
      validators.push(nonEmpty && validateNonEmpty);
      validators.push(min !== undefined && createValidateMinLength(min));
      validators.push(max !== undefined && createValidateMaxLength(max));
      validators.push(isArray(allowedValues) && createValidateIsAllowed(allowedValues));
      properties.isString = true;
      properties.typeName = 'string';
      properties.clean = x => (typeof x !== 'string' ? JSON.stringify(x) : x);
    } else if (schemaDef === Boolean) {
      validators.push(validateIsBoolean);
      properties.isBoolean = true;
      properties.typeName = 'boolean';
    } else if (schemaDef === Date) {
      validators.push(validateIsDate);
      validators.push(validateIsValidDate);
      validators.push(min !== undefined && createValidateMin(min));
      validators.push(max !== undefined && createValidateMax(max));
      properties.isDate = true;
      properties.typeName = 'date';
    } else if (typeof schemaDef === 'function') {
      validators.push(createValidateInstanceOf(schemaDef));
      properties.isFunction = true;
      properties.typeName = schemaDef.name || '[unknown]';
    } else if (typeof schemaDef !== 'object' || schemaDef === null) {
      validators.push(createValidateEquals(schemaDef));
      properties.isLiteral = true;
      properties.typeName = schemaDef === undefined ? 'undefined' : JSON.stringify(schemaDef);
    } else {
      properties.isAtomic = false;
    }

    if (typeName) {
      properties.typeName = typeName;
    }

    return next({
      ...validator,
      ...properties,
      validate: combine(validators),
    }, schemaDef, schemaOptions);
  },
};

export default pluginAtomic;
