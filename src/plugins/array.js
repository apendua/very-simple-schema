import {
  isArray,
  validateIsArray,
  combine,
} from '../validators.js';

const pluginArray = {
  transform(compiler, compiled, options, next) {
    const { schemaDef } = compiled;
    if (isArray(schemaDef) && schemaDef.length === 1) {
      if (schemaDef.length !== 1) {
        throw new Error('SchemaDef must be an array of length 1');
      }
      const memeberValidator = compiler.compile(schemaDef[0], options);
      return {
        ...compiled,
        validate: combine([
          compiled.validate,
          validateIsArray,
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

export default pluginArray;
