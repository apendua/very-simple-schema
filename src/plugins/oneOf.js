import {
  ERROR_NO_MATCH,
} from '../constants.js';

import {
  isArray,
  combine,
} from '../validators.js';

const pluginOneOf = {
  transform(compiler, compiled, options, next) {
    const { schemaDef } = compiled;
    if (isArray(schemaDef) && schemaDef.length > 1) {
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

export default pluginOneOf;
