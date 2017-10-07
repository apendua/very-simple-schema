import { validateAlways } from './validators.js';

const identity = x => x;

function createCompiler(Schema, options) {
  const compiler = {
    Schema,
    options: { ...options },
    compile: (schemaDef, schemaOptions = {}) => {
      if (schemaDef instanceof Schema) {
        // Recompile the original schemaDef with (potentionally) new options.
        return compiler.compile(schemaDef.schemaDef, {
          ...schemaDef.schemaOptions,
          ...schemaOptions,
        });
      }
      const compiled = options.plugins.reduce((previous, plugin) => {
        if (previous.compiled) {
          return previous;
        }
        const current = plugin.compile.call(previous, compiler, schemaDef, schemaOptions);
        if (!current) {
          return previous;
        }
        return {
          ...previous,
          ...current,
          validate: (
            current && typeof current.validate === 'function'
              ? value => previous.validate(value) || current.validate(value)
              : previous.validate
          ),
          clean: (
            current && typeof current.clean === 'function'
              ? value => current.clean(previous.clean(value))
              : previous.clean
          ),
        };
      }, {
        ...schemaOptions.label && { label: schemaOptions.label },
        validate: validateAlways,
        clean: identity,
      });
      // Make sure compiled flag is eventually set.
      return {
        ...compiled,
        compiled: true,
      };
    },
  };
  return compiler;
}

export default createCompiler;
