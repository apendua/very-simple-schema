import {
  isArray,
} from '../validators.js';
import {
  ERROR_NOT_ALLOWED,
} from '../constants.js';

const createValidateIsAllowed = allowedValues => value =>
  (allowedValues.indexOf(value) >= 0 ? undefined : { value, expected: allowedValues, error: ERROR_NOT_ALLOWED });

const pluginAllowedValues = {
  compile(compiler, schemaDef, options) {
    const {
      allowedValues,
    } = options;
    if (allowedValues && !isArray(schemaDef)) {
      return {
        validate: createValidateIsAllowed(allowedValues),
      };
    }
    return null;
  },
};

export default pluginAllowedValues;
