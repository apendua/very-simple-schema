import {
  validateAlways,
} from '../validators.js';

const identity = x => x;

const pluginAny = {
  compile(compiler, schemaDef) {
    if (schemaDef instanceof compiler.Schema.Any) {
      return {
        typeName: 'any',
        validate: validateAlways,
        clean:    identity,
        isAny:    true,
      };
    }
    return null;
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
