import {
  ERROR_REQUIRED,
} from '../constants.js';

import {
  isArray,
  isObject,
  validateIsObject,
  combine,
} from '../validators.js';

const has = Object.prototype.hasOwnProperty;
const pluginObject = {
  compile(compiler, schemaDef) {
    if (isObject(schemaDef)) {
      const properties = {};
      Object.keys(schemaDef).forEach((key) => {
        const memberSchemaDef = schemaDef[key];
        if (memberSchemaDef &&
            typeof memberSchemaDef === 'object' &&
            !isArray(memberSchemaDef) &&
            has.call(memberSchemaDef, 'type')) {
          const {
            type,
            optional,
            ...otherOptions
          } = memberSchemaDef;
          properties[key] = compiler.compile(type, otherOptions);
          properties[key].optional = !!optional;
        } else {
          properties[key] = compiler.compile(memberSchemaDef);
        }
      });
      return {
        properties,
        compiled: true,
        isObject: true,
        validate: combine([
          validateIsObject,
          (value) => {
            const errors = {};
            Object.keys(properties).forEach((key) => {
              const validator = properties[key];
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
    return {};
  },
};

export default pluginObject;
