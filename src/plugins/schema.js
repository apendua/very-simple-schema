const pluginSchema = {
  transform(compiler, compiled, options, next) {
    const { schemaDef } = compiled;
    if (schemaDef instanceof compiler.Schema) {
      return next(schemaDef.compiled);
    }
    return next(compiled);
  },
};

export default pluginSchema;
