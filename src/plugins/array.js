import {
  validateIsArray,
  createValidateMinCount,
  createValidateMaxCount,
} from '../validators.js';
import {
  combine,
  isArray,
} from '../utils.js';

const pluginArray = {
  compile: compiler => next => (validator, schemaDef, schemaOptions) => {
    if (isArray(schemaDef) && schemaDef.length === 1) {
      const {
        label,
        minCount,
        maxCount,
        ...otherOptions
      } = schemaOptions;
      const element = compiler.compile({}, schemaDef[0], otherOptions);
      return next({
        ...validator,
        element,
        isArray: true,
        typeName: `array of ${element.typeName}`,
        validate: combine([
          validateIsArray,
          minCount !== undefined && createValidateMinCount(minCount),
          maxCount !== undefined && createValidateMaxCount(maxCount),
          (value) => {
            const errors = value.map(x => element.validate(x));
            return errors.some(err => !!err) ? { errors } : undefined;
          },
        ]),
        clean: value => (isArray(value)
          ? value.map(x => element.clean(x))
          : value
        ),
        getSubSchema: () => element,
      }, schemaDef, { label });
    }
    return next(validator, schemaDef, schemaOptions);
  },
};

export default pluginArray;
