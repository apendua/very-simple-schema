import {
  validateAlways,
} from './validators.js';
import {
  has,
  isPlainObject,
} from './utils.js';

const identity = x => x;

function createCompiler(Schema, options) {
  const compiler = {
    Schema,
    options: { ...options },
    compile: (schemaDef, additionalSchemaOptions = {}) => {
      if (schemaDef instanceof Schema) {
        // Return a proxy because users of this method may potentionally
        // add additional fields to it, e.g. "optiona" in object plugin.
        return Object.create(schemaDef.compiled);
      }
      let schemaType;
      let schemaOptions;
      if (isPlainObject(schemaDef) && has(schemaDef, 'type')) {
        const {
          type,
          ...otherOptions,
        } = schemaDef;
        schemaType = type;
        schemaOptions = {
          ...otherOptions,
          ...additionalSchemaOptions,
        };
      } else {
        schemaType = schemaDef;
        schemaOptions = additionalSchemaOptions;
      }
      return options.plugins.reduce((previous, plugin) => {
        if (previous.compiled) {
          return previous;
        }
        const current = plugin.compile.call(previous, compiler, schemaType, schemaOptions);
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
