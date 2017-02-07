import {
  ERROR_REQUIRED,
} from '../constants.js';

import {
  isObject,
  validateIsObject,
  combine,
} from '../validators.js';

const has = Object.prototype.hasOwnProperty;
const pluginObject = {
  transform(compiler, compiled, options, next) {
    const { schemaDef } = compiled;
    if (isObject(schemaDef)) {
      const memberValidators = {};
      Object.keys(schemaDef).forEach((key) => {
        const {
          type,
          optional,
          ...otherOptions
        } = schemaDef[key];
        memberValidators[key] = compiler.compile(type, otherOptions);
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
              if (!has.call(value, key)) {
                if (!validator.optional) {
                  errors[key] = { error: ERROR_REQUIRED };
                }
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

export default pluginObject;
