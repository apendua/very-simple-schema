import {
  ERROR_NO_ALTERNATIVE,
} from '../constants.js';

import {
  isArray,
} from '../utils.js';

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
        typeName: `one of ${memberValidators.map(x => x.typeName).join(', ')}`,
        validate: (value) => {
          const expected = [];
          for (const { validate, typeName } of memberValidators) {
            const error = validate(value);
            if (!error) {
              return undefined;
            }
            expected.push(typeName || '[unknown]');
          }
          return { error: ERROR_NO_ALTERNATIVE, expected };
        },
      };
    }
    return {};
  },
};

export default pluginOneOf;
