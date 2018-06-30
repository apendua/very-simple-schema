import {
  validateIsObject,
} from '../validators.js';
import {
  each,
  combine,
  isPlainObject,
} from '../utils.js';

const pluginHash = {
  compile: compiler => next => (validator, schemaDef, schemaOptions) => {
    if (schemaDef instanceof compiler.Schema.Hash) {
      const { defaultValue } = schemaOptions;
      const hashKey = compiler.compile({}, schemaDef.keySchemaDef);
      const hashValue = compiler.compile({}, schemaDef.valueSchemaDef);
      return next({
        ...validator,
        isHash: true,
        hashKey,
        hashValue,
        typeName: `object of ${hashValue.typeName}`,
        validate: combine([
          validateIsObject,
          (value) => {
            let hasErrors = false;
            const errors = {};
            each(value, (x, key) => {
              const keyErrors = hashKey.validate(key);
              if (keyErrors) {
                hasErrors = true;
                errors[key] = keyErrors;
              } else {
                const valueErrors = hashValue.validate(x);
                if (valueErrors) {
                  hasErrors = true;
                }
                errors[key] = valueErrors;
              }
            });
            return hasErrors ? { errors } : undefined;
          },
        ]),
        clean: (value = defaultValue) => {
          if (!isPlainObject(value)) {
            return value;
          }
          const clean = {};
          each(value, (valueAtKey, key) => {
            clean[key] = hashValue.clean(valueAtKey);
          });
          return clean;
        },
      }, schemaDef, schemaOptions);
    }
    return next(validator, schemaDef, schemaOptions);
  },
  mixin(Schema) {
    class Hash {
      constructor({ value: valueSchemaDef, key: keySchemaDef = String }) {
        Object.assign(this, {
          keySchemaDef,
          valueSchemaDef,
        });
      }
    }
    Object.assign(Schema, {
      Hash,
      hash: (schemaDef, schemaOptions) =>
        new Schema(new Hash(schemaDef), schemaOptions),
      objectOf: (schemaDef, schemaOptions) =>
        new Schema(new Hash({ key: String, value: schemaDef }), schemaOptions),
    });
  },
};

export default pluginHash;
