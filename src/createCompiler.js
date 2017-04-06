import { validateAlways } from './validators.js';

function createCompiler(Schema, options) {
  const compiler = {
    options: { ...options },
    compile: (schemaDef, schemaOptions = {}) => {
      if (schemaDef instanceof Schema) {
        return schemaDef.compiled;
      }
      if (schemaDef === Schema.Any) {
        return { isAny: true, typeName: 'any', validate: validateAlways };
      }
      return options.plugins.reduce((previous, plugin) => {
        if (previous.compiled) {
          return previous;
        }
        const current = plugin.compile.call(previous, compiler, schemaDef, schemaOptions);
        return {
          ...previous,
          ...current,
          validate: (
            current && typeof current.validate === 'function'
              ? value => previous.validate(value) || current.validate(value)
              : previous.validate
          ),
        };
      }, {
        ...schemaOptions.label && { label: schemaOptions.label },
        validate: validateAlways,
      });
    },
  };
  return compiler;
}

export default createCompiler;
