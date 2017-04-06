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
      const element = compiler.compile(schemaDef[0], schemaOptions);
      const { minCount, maxCount } = schemaOptions;
      return {
        element,
        isArray: true,
        typeName: `array of ${element.typeName}`,
        compiled: true,
        validate: combine([
          validateIsArray,
          minCount !== undefined && createValidateMinCount(minCount),
          maxCount !== undefined && createValidateMaxCount(maxCount),
          (value) => {
            const errors = value.map(x => element.validate(x));
            return errors.some(err => !!err) ? { errors } : undefined;
          },
        ]),
        getSubSchema: () => element,
      };
    }
    return null;
  },
};

export default pluginArray;
