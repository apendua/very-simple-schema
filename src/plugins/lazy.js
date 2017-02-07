const pluginLazy = {
  transform(compiler, compiled, options, next) {
    const { lazy = false } = options;
    if (lazy) {
      const { schemaDef } = compiled;
      if (typeof schemaDef !== 'function') {
        throw new Error('If lazy flag is set, schemaDef must be a function');
      }
      return next({
        ...compiled,
        schemaDef: schemaDef(),
      }, {
        ...options,
        lazy: false,
      });
    }
    return next(compiled);
  },
};

export default pluginLazy;
