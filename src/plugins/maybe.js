const isNil = value => value === undefined || value === null;

const pluginMaybe = {
  compile: compiler => next => (validator, schemaDef, {
    maybe,
    ...schemaOptions
  }) => {
    let compiled;
    if (schemaDef instanceof compiler.Schema.Maybe) {
      compiled = compiler.compile({}, schemaDef.schemaDef, {
        ...schemaDef.schemaOptions,
        ...schemaOptions,
      });
    } else if (maybe) {
      compiled = compiler.compile({}, schemaDef, schemaOptions);
    }
    if (compiled) {
      return {
        ...compiled,
        isMaybe: true,
        validate: (value) => {
          if (isNil(value)) {
            return undefined;
          }
          return compiled.validate(value);
        },
      };
    }
    return next(validator, schemaDef, schemaOptions);
  },
  mixin(Schema) {
    class Maybe {
      constructor(schemaDef, schemaOptions) {
        Object.assign(this, {
          schemaDef,
          schemaOptions,
        });
      }
    }
    Object.assign(Schema, {
      Maybe,
      maybe: (schemaDef, schemaOptions) => new Schema(new Maybe(schemaDef, schemaOptions)),
    });
  },
};

export default pluginMaybe;
