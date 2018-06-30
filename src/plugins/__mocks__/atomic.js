import {
  validateIsNumber,
  validateIsString,
} from '../../validators';
import {
  combine,
} from '../../utils';

const pluginAtomic = {
  compile: () => next => (validator, schemaDef, schemaOptions) => {
    if (schemaDef === Number) {
      return next({
        ...validator,
        isNumber: true,
        typeName: 'number',
        validate: combine([
          validator.validate,
          validateIsNumber,
        ]),
      }, schemaDef, schemaOptions);
    } else if (schemaDef === String) {
      return next({
        ...validator,
        isString: true,
        typeName: 'string',
        validate: combine([
          validator.validate,
          validateIsString,
        ]),
      }, schemaDef, schemaOptions);
    }
    return next(validator, schemaDef, schemaOptions);
  },
};

export default pluginAtomic;
