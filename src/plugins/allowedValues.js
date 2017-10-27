import {
  ERROR_VALUE_NOT_ALLOWED,
} from '../constants.js';
import {
  combine,
} from '../utils.js';

const createValidateIsAllowed = expected => actual =>
  (expected.indexOf(actual) >= 0 ? undefined : { error: ERROR_VALUE_NOT_ALLOWED, actual, expected });

const pluginAllowedValues = {
  compile: () => next => (validator, schemaDef, schemaOptions) => {
    const {
      allowedValues,
    } = schemaOptions;
    if (allowedValues) {
      const compiled = next(validator, schemaDef, schemaOptions);
      if (!compiled.isAtomic) {
        throw new Error('AllowedValues requires an atomic schema');
      }
      return {
        ...compiled,
        validate: combine([
          compiled.validate,
          createValidateIsAllowed(allowedValues),
        ]),
      };
    }
    return next(validator, schemaDef, schemaOptions);
  },
};

export default pluginAllowedValues;
