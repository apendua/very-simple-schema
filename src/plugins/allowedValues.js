import {
  ERROR_VALUE_NOT_ALLOWED,
} from '../constants.js';
import {
  combine,
} from '../utils.js';
import Validator from '../Validator';

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
        throw new Error('You can only specify allowed values for an atomic schema');
      }
      return new Validator({
        ...compiled,
        validate: combine([
          compiled.validate,
          createValidateIsAllowed(allowedValues),
        ], {
          label: schemaOptions.label,
        }),
      });
    }
    return next(validator, schemaDef, schemaOptions);
  },
};

export default pluginAllowedValues;
