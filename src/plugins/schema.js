
const pluginSchema = {
  compile: compiler => next => (validator, schemaDef, schemaOptions) => {
    if (schemaDef instanceof compiler.Schema) {
      // Recompile the original schemaDef with (potentionally) new options.
      return compiler.compile({}, schemaDef.schemaDef, {
        ...schemaDef.schemaOptions,
        ...schemaOptions,
      });
    }
    return next(validator, schemaDef, schemaOptions);
  },
};

export default pluginSchema;
