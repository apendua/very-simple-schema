import {
  ERROR_NO_MATCH,
} from '../constants.js';

import {
  isArray,
} from '../validators.js';

const pluginOneOf = {
  compile(compiler, schemaDef) {
    if (isArray(schemaDef) && schemaDef.length > 1) {
      const memberValidators = schemaDef.map(x => compiler.compile(x));
      return {
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
