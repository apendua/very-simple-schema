import { validateAlways } from './validators.js';

const identity = x => x;

function createCompiler(Schema, options) {
  const compiler = {
    Schema,
    options: { ...options },
    compile: (schemaDef, schemaOptions = {}) => {
      if (schemaDef instanceof Schema) {
        // Return a proxy because users of this method may potentionally
        // add additional fields to it, e.g. "optiona" in object plugin.
        return Object.create(schemaDef.compiled);
      }
      return options.plugins.reduce((previous, plugin) => {
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
    },
  };
  return compiler;
}

export default createCompiler;
