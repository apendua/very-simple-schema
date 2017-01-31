import {
  MODE_ARRAY,
  MODE_ONE_OF,
  MODE_MERGE,
  ERROR_REQUIRED,
  ERROR_NO_MATCH,
} from './constants.js';

import {
  createValidateEquals,
  createValidateInstanceOf,
  validateIsString,
  validateIsNumber,
  validateIsBoolean,
  isArray,
  isDate,
  isObject,
  validateIsValidDate,
  validateIsObject,
  validateIsArray,
  validateIsDate,
  combine,
} from './validators.js';

export const pluginType = {
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
    return next({
      ...compiled,
      validate: combine([
        compiled.validate,
        validate,
      ]),
    });
  },
};

export const pluginLazy = {
  transform(compiler, compiled, options, next) {
    const { lazy = false } = options;
    if (lazy) {
      const { schemaDef } = compiled;
      if (typeof schemaDef !== 'function') {
        throw new Error('If lazy flag is set, schemaDef must be a function');
      }
      return next({
        ...compiled,
        schemaDef: schemaDef(),
      }, {
        ...options,
        lazy: false,
      });
    }
    return next(compiled);
  },
};

export const pluginSchema = {
  transform(compiler, compiled, options, next) {
    const { schemaDef } = compiled;
    if (schemaDef instanceof compiler.Schema) {
      return next(schemaDef.compiled);
    }
    return next(compiled);
  },
};

export const pluginArray = {
  transform(compiler, compiled, options, next) {
    const { schemaDef } = compiled;
    const { mode } = options;
    if (mode === MODE_ARRAY && isArray(schemaDef)) {
      if (schemaDef.length !== 1) {
        throw new Error('SchemaDef must be an array of length 1');
      }
      const memeberValidator = compiler.compile(schemaDef[0]);
      return {
        ...compiled,
        validate: combine([
          combine([
            compiled.validate,
            validateIsArray,
          ]),
          (value) => {
            const errors = value.map(member => memeberValidator.validate(member));
            return errors.some(err => !!err) ? { errors } : undefined;
          },
        ]),
      };
    }
    return next(compiled);
  },
};

export const pluginMerge = {
  transform(compiler, compiled, options, next) {
    const { schemaDef } = compiled;
    const { mode } = options;
    if (mode === MODE_MERGE && isArray(schemaDef)) {
      const memberValidators = schemaDef.map(x => compiler.compile(x));
      return {
        ...compiled,
        validate: combine([
          compiled.validate,
          ...memberValidators.map(x => x.validate),
        ]),
      };
    }
    return next(compiled);
  },
};

export const pluginOneOf = {
  transform(compiler, compiled, options, next) {
    const { schemaDef } = compiled;
    const { mode } = options;
    if (mode === MODE_ONE_OF && isArray(schemaDef)) {
      const memberValidators = schemaDef.map(x => compiler.compile(x));
      return {
        ...compiled,
        validate: combine([
          compiled.validate,
          (value) => {
            for (const { validate } of memberValidators) {
              const error = validate(value);
              if (!error) {
                return undefined;
              }
            }
            return { error: ERROR_NO_MATCH };
          },
        ]),
      };
    }
    return next(compiled);
  },
};

const has = Object.prototype.hasOwnProperty;
export const pluginObject = {
  transform(compiler, compiled, options, next) {
    const { schemaDef } = compiled;
    if (isObject(schemaDef)) {
      const memberValidators = {};
      Object.keys(schemaDef).forEach((key) => {
        const {
          type,
          lazy = false,
          optional,
        } = schemaDef[key];
        memberValidators[key] = compiler.compile(type, { lazy });
        memberValidators[key].optional = !!optional;
      });
      return {
        ...compiled,
        validate: combine([
          combine([
            compiled.validate,
            validateIsObject,
          ]),
          (value) => {
            const errors = {};
            Object.keys(memberValidators).forEach((key) => {
              const validator = memberValidators[key];
              if (!validator.optional && !has.call(value, key)) {
                errors[key] = { error: ERROR_REQUIRED };
              } else {
                const error = validator.validate(value[key]);
                if (error) {
                  errors[key] = error;
                }
              }
            });
            return Object.keys(errors).length > 0 ? { errors } : undefined;
          },
        ]),
      };
    }
    return next(compiled);
  },
};
