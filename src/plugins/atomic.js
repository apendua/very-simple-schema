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
  combine,
} from '../utils.js';

const pluginAtomic = {
  compile: compiler => next => (validator, schemaDef, schemaOptions = {}) => {
    const {
      min,
      max,
      typeName,
      nonEmpty,
      decimal = compiler.options.decimal,
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
    } else if (typeof schemaDef === 'number' || typeof schemaDef === 'string' || typeof schemaDef === 'boolean' || schemaDef === null) {
      validators.push(createValidateEquals(schemaDef));
      properties.value = schemaDef;
      properties.isLiteral = true;
      properties.typeName = JSON.stringify(schemaDef);
    } else if (schemaDef === undefined) {
      properties.isVoid = true;
      properties.typeName = 'undefined';
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
  mixin(Schema) {
    Object.assign(Schema, {
      enum: allowedValues => new Schema(String, { allowedValues }),
    });
  },
};

export default pluginAtomic;
