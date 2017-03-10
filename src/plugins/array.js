import {
  isArray,
  validateIsArray,
  combine,
  createValidateMinCount,
  createValidateMaxCount,
} from '../validators.js';

const pluginArray = {
  compile(compiler, schemaDef, schemaOptions) {
    if (isArray(schemaDef) && schemaDef.length === 1) {
      if (schemaDef.length !== 1) {
        throw new Error('SchemaDef must be an array of length 1');
      }
      const items = compiler.compile(schemaDef[0], schemaOptions);
      const { minCount, maxCount } = schemaOptions;
      return {
        items,
        isArray: true,
        compiled: true,
        validate: combine([
          validateIsArray,
          minCount !== undefined && createValidateMinCount(minCount),
          maxCount !== undefined && createValidateMaxCount(maxCount),
          (value) => {
            const errors = value.map(member => items.validate(member));
            return errors.some(err => !!err) ? { errors } : undefined;
          },
        ]),
      };
    }
    return null;
  },
};

export default pluginArray;
