import {
  ERROR_NO_MATCH,
} from '../constants.js';

import {
  isArray,
} from '../validators.js';

const pluginOneOf = {
  compile(compiler, schemaDef, { oneOf }) {
    if (oneOf) {
      if (!(isArray(schemaDef) && schemaDef.length > 1)) {
        throw new Error('OneOf requires and array with at least two elements');
      }
      const memberValidators = schemaDef.map(x => compiler.compile(x));
      return {
        isOneOf: true,
        compiled: true,
        validate: (value) => {
          for (const { validate } of memberValidators) {
            const error = validate(value);
            if (!error) {
              return undefined;
            }
          }
          return { error: ERROR_NO_MATCH };
        },
      };
    }
    return {};
  },
};

export default pluginOneOf;
