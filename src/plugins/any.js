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
    const schemaDef = new Any();
    Object.assign(Schema, {
      Any,
      any: () => new Schema(schemaDef),
    });
  },
};

export default pluginAny;
