import {
  ERROR_LENGTH_NOT_EQUAL,
} from '../constants';

import {
  combine,
  isArray,
} from '../utils';
import {
  validateIsArray,
} from '../validators';

const createValidateLength = expected => actual => (actual.length === expected
  ? undefined
  : { error: ERROR_LENGTH_NOT_EQUAL, expected, actual: actual.length }
);

const pluginTuple = {
  compile: compiler => next => (validator, schemaDef, {
    defaultValue = [],
    ...schemaOptions
  }) => {
    if (schemaDef instanceof compiler.Schema.Tuple) {
      const elements = schemaDef.elementsDef.map(x => compiler.compile({}, x));
      return next({
        elements,
        isTuple: true,
        typeName: `tuple of ${elements.map(x => x.typeName).join(', ')}`,
        validate: combine([
          validateIsArray,
          createValidateLength(elements.length),
          (value) => {
            const errors = value.map((x, i) => elements[i].validate(x));
            return errors.some(err => !!err) ? { errors } : undefined;
          },
        ]),
        clean: (value) => {
          if (value === undefined) {
            return defaultValue;
          }
          if (!isArray(value)) {
            return value;
          }
          const newValue = value.slice(0, elements.length);
          while (newValue.length < elements.length) {
            newValue.push(defaultValue[newValue.length]);
          }
          return newValue.map((x, i) => elements[i].clean(x));
        },
      }, schemaDef, schemaOptions);
    }
    return next(validator, schemaDef, schemaOptions);
  },
  mixin(Schema) {
    class Tuple {
      constructor(elementsDef) {
        if (!isArray(elementsDef)) {
          throw new Error('Tuple requires an array of schemas');
        }
        Object.assign(this, {
          elementsDef,
        });
      }
    }
    Object.assign(Schema, {
      Tuple,
      tuple: (schemaDef, schemaOptions) =>
        new Schema(new Tuple(schemaDef), schemaOptions),
    });
  },
};

export default pluginTuple;
