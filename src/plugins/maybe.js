const isNil = value => value === undefined || value === null;

const pluginMaybe = {
  compile: compiler => next => (validator, schemaDef, {
    maybe,
    ...schemaOptions
  }) => {
    let original;
    if (schemaDef instanceof compiler.Schema.Maybe) {
      original = compiler.compile({}, schemaDef.schemaDef, schemaOptions);
    } else if (maybe !== undefined) {
      original = compiler.compile({}, schemaDef, schemaOptions);
    }
    if (!original) {
      return next(validator, schemaDef, schemaOptions);
    }
    while (original.isMaybe) {
      original = original.original;
    }
    if (maybe === false) {
      return original;
    }
    return {
      ...original,
      original,
      isMaybe: true,
      validate: (value) => {
        if (isNil(value)) {
          return undefined;
        }
        return original.validate(value);
      },
    };
  },
  mixin(Schema) {
    class Maybe {
      constructor(schemaDef) {
        Object.assign(this, {
          schemaDef,
        });
      }
    }
    Object.assign(Schema, {
      Maybe,
      maybe: (schemaDef, schemaOptions) => new Schema(new Maybe(schemaDef), schemaOptions),
    });
  },
};

export default pluginMaybe;
