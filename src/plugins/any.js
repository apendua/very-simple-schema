import {
  validateAlways,
} from '../validators.js';

const identity = x => x;

const pluginAny = {
  compile: compiler => next => (validator, schemaDef, schemaOptions) => {
    if (schemaDef instanceof compiler.Schema.Any) {
      return {
        ...validator,
        typeName: 'any',
        validate: validateAlways,
        clean:    identity,
        isAny:    true,
      };
    }
    return next(validator, schemaDef, schemaOptions);
  },
  mixin(Schema) {
    class Any {
    }
    Object.assign(Schema, {
      Any,
      any: () => new Schema(new Any()),
    });
  },
};

export default pluginAny;
