import {
  createValidateEquals,
  createValidateInstanceOf,
  createValidateIsAllowed,
  validateIsString,
  validateIsNumber,
  validateIsBoolean,
  validateIsValidDate,
  validateIsDate,
  combine,
} from '../validators.js';

const pluginAtomic = {
  transform(compiler, compiled, options, next) {
    const { schemaDef } = compiled;
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
    if (!validate) {
      return next(compiled);
    }
    const {
      allowedValues,
    } = options;
    return next({
      ...compiled,
      validate: combine([
        compiled.validate,
        validate,
        allowedValues && createValidateIsAllowed(allowedValues),
      ]),
    });
  },
};

export default pluginAtomic;
