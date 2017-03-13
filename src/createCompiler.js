
export function createCompiler(Schema, options) {
  const compiler = {
    options: { ...options },
    compile: (schemaDef, schemaOptions = {}) => {
      if (schemaDef instanceof Schema) {
        return schemaDef.compiled;
      }
      return options.plugins.reduce((previous, plugin) => {
        if (previous.compiled) {
          return previous;
        }
        const current = plugin.compile.call(previous, compiler, schemaDef, schemaOptions);
        if (!current || typeof current.validate !== 'function') {
          return {
            ...previous,
            ...current,
            validate: previous.validate,
          };
        }
        return {
          ...previous,
          ...current,
          validate: value => previous.validate(value) || current.validate(value),
        };
      }, {
        ...schemaOptions.label && { label: schemaOptions.label },
        validate: () => {},
      });
    },
  };
  return compiler;
}
