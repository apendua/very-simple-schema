import {
  isArray,
  validateIsArray,
  combine,
} from '../validators.js';

const pluginArray = {
  compile(compiler, schemaDef, schemaOptions) {
    if (isArray(schemaDef) && schemaDef.length === 1) {
      if (schemaDef.length !== 1) {
        throw new Error('SchemaDef must be an array of length 1');
      }
      const memeberValidator = compiler.compile(schemaDef[0], schemaOptions);
      return {
        compiled: true,
        validate: combine([
          validateIsArray,
          (value) => {
            const errors = value.map(member => memeberValidator.validate(member));
            return errors.some(err => !!err) ? { errors } : undefined;
          },
        ]),
      };
    }
    return null;
  },
};

export default pluginArray;
