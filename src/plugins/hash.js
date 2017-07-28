import {
  validateIsObject,
  combine,
} from '../validators.js';
import {
  each,
} from '../utils.js';

const pluginHash = {
  compile(compiler, schemaDef, schemaOptions) {
    if (schemaDef instanceof compiler.Schema.Hash) {
      const element = compiler.compile(schemaDef.elementSchemaDef, schemaOptions);
      return {
        element,
        typeName: `hash of ${element.typeName}`,
        compiled: true,
        validate: combine([
          validateIsObject,
          (value) => {
            let hasErrors = false;
            const errors = {};
            each(value, (x, key) => {
              const elementErrors = element.validate(x);
              if (elementErrors) {
                hasErrors = true;
              }
              errors[key] = elementErrors;
            });
            return hasErrors ? { errors } : undefined;
          },
        ]),
        getSubSchema: () => element,
      };
    }
    return null;
  },
  mixin(Schema) {
    class Hash {
      constructor(schemaDef) {
        this.elementSchemaDef = schemaDef;
      }
    }
    Object.assign(Schema, {
      Hash,
      hash: (schemaDef, schemaOptions) => new Schema(new Hash(schemaDef), schemaOptions),
    });
  },
};

export default pluginHash;
