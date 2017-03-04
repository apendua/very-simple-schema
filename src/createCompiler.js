
export function createCompiler(Schema, plugins, options) {
  const compiler = {
    options: { ...options },
    compile: (schemaDef, schemaOptions = {}) => {
      if (schemaDef instanceof Schema) {
        return schemaDef.compiled;
      }
      return plugins.reduce((previous, plugin) => {
        if (previous.compiled) {
          return previous;
        }
        const current = plugin.compile(compiler, schemaDef, schemaOptions);
        if (!current || typeof current.validate !== 'function') {
          return previous;
        }
        return {
          ...current,
          validate: value => previous.validate(value) || current.validate(value),
        };
      }, { validate: () => {} });
    },
  };
  return compiler;
}
