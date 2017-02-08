const pluginLazy = {
  compile(compiler, schemaDef, options) {
    const { lazy = false } = options;
    if (lazy) {
      if (typeof schemaDef !== 'function') {
        throw new Error('If lazy flag is set, schemaDef must be a function');
      }
      let validate;
      return {
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
