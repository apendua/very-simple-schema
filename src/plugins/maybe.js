const isNil = value => value === undefined || value === null;

const pluginMaybe = {
  compile: compiler => next => (validator, schemaDef, {
    maybe,
    ...schemaOptions
  }) => {
    let related;
    if (schemaDef instanceof compiler.Schema.Maybe) {
      related = compiler.compile({}, schemaDef.schemaDef, schemaOptions);
    } else if (maybe) {
      related = compiler.compile({}, schemaDef, schemaOptions);
    }
    if (related) {
      return {
        ...related,
        related,
        typeName: `nil or ${related.typeName}`,
        isMaybe: true,
        validate: (value) => {
          if (isNil(value)) {
            return undefined;
          }
          return related.validate(value);
        },
      };
    }
    return next(validator, schemaDef, schemaOptions);
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
