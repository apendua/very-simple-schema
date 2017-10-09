import {
  validateIsObject,
  combine,
} from '../validators.js';
import {
  each,
} from '../utils.js';

const pluginHash = {
  compile(compiler, schemaDef) {
    if (schemaDef instanceof compiler.Schema.Hash) {
      const valueSchema = compiler.compile(schemaDef.valueSchemaDef);
      const keySchema = compiler.compile(schemaDef.keySchemaDef);
      return {
        typeName: `hash of ${valueSchema.typeName}`,
        compiled: true,
        validate: combine([
          validateIsObject,
          (value) => {
            let hasErrors = false;
            const errors = {};
            each(value, (x, key) => {
              const keyErrors = keySchema.validate(key);
              if (keyErrors) {
                hasErrors = true;
                errors[key] = keyErrors;
              } else {
                const valueErrors = valueSchema.validate(x);
                if (valueErrors) {
                  hasErrors = true;
                }
                errors[key] = valueErrors;
              }
            });
            return hasErrors ? { errors } : undefined;
          },
        ]),
        getSubSchema: () => valueSchema,
      };
    }
    return null;
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
    });
  },
};

export default pluginHash;
