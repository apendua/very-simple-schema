const pluginLazy = {
  compile(compiler, schemaDef, schemaOptions) {
    const { lazy = false } = schemaOptions;
    if (lazy) {
      if (typeof schemaDef !== 'function') {
        throw new Error('If lazy flag is set, schemaDef must be a function');
      }
      let validate;
      return {
        isLazy: true,
        compiled: true,
        validate: (value) => {
          if (!validate) {
            validate = compiler.compile(schemaDef()).validate;
          }
          return validate(value);
        },
      };
    }
    return {};
  },
};

export default pluginLazy;
