import {
  validateIsArray,
  createValidateMinCount,
  createValidateMaxCount,
} from '../validators.js';
import {
  combine,
  isArray,
  each,
} from '../utils.js';

const getOptions = (options) => {
  const newOptions = {};
  each(options, (value, key) => {
    if (key.charAt(0) === '$' && key.charAt(1) === '.') {
      newOptions[key.substr(2)] = value;
    }
  });
  return newOptions;
};

const pluginArray = {
  compile: compiler => next => (validator, schemaDef, schemaOptions) => {
    if (isArray(schemaDef) && schemaDef.length === 1) {
      const {
        label,
        minCount,
        maxCount,
        ...options
      } = schemaOptions;
      const $ = compiler.compile({}, schemaDef[0], getOptions(options));
      return next({
        ...validator,
        $,
        isArray: true,
        typeName: `array of ${$.typeName}`,
        validate: combine([
          validateIsArray,
          minCount !== undefined && createValidateMinCount(minCount),
          maxCount !== undefined && createValidateMaxCount(maxCount),
          (value) => {
            const errors = value.map(x => $.validate(x));
            return errors.some(err => !!err) ? { errors } : undefined;
          },
        ]),
        clean: value => (isArray(value)
          ? value.map(x => $.clean(x))
          : value
        ),
      }, schemaDef, { label });
    }
    return next(validator, schemaDef, schemaOptions);
  },
  mixin(Schema) {
    Object.assign(Schema, {
      arrayOf: (schemaDef, schemaOptions) =>
        new Schema([schemaDef], schemaOptions),
    });
  },
};

export default pluginArray;
