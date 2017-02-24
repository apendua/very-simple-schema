import {
  isArray,
} from './validators.js';
import {
  MESSAGES,
} from './constants.js';

function createCompiler(Schema, plugins, options) {
  const compiler = {
    options,
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

function createSchema(defaultPlugins, compilerOptions) {
  const options = { ...compilerOptions };

  let plugins = [...defaultPlugins];
  let messages = {
    ...MESSAGES,
  };

  const compilers = [];
  function getCompiler(Schema) {
    const index = plugins.length;
    if (!compilers[index]) {
      compilers[index] = createCompiler(Schema, plugins, options);
    }
    return compilers[index];
  }

  class Schema {
    constructor(schemaDef, schemaOptions = {}) {
      Object.assign(this, {
        schemaDef,
        schemaOptions,
      });
      this.compiler = getCompiler(this.constructor);
    }

    get compiled() {
      Object.defineProperty(this, 'compiled', {
        value: this.compiler.compile(this.schemaDef, this.schemaOptions),
      });
      return this.compiled;
    }

    getErrors(value) {
      return this.compiled.validate(value);
    }

    validate(value, {
      label = 'Value',
    } = {}) {
      const error = this.getErrors(value);
      return error && this.constructor.describe(error, {
        label,
      });
    }

    validator(validatorOptions) {
      return value => this.validate(value, validatorOptions);
    }

    static describe(descriptor, {
      label = 'Value',
    } = {}) {
      if (descriptor && typeof descriptor === 'object') {
        if (descriptor.error) {
          const messageTemplate = messages[descriptor.error];
          if (!messageTemplate) {
            return descriptor.error;
          }
          return messageTemplate({
            ...descriptor,
            label,
          });
        } else if (descriptor.errors) {
          if (isArray(descriptor.errors)) {
            return descriptor.errors.map((item, index) => this.describe(item, { label: `${label}.${index}` }));
          } else if (typeof descriptor.errors === 'object') {
            const described = {};
            Object.keys(descriptor.errors).forEach((key) => {
              described[key] = this.describe(descriptor.errors[key], { label: `${label}.${key}` });
            });
            return described;
          }
        }
      }
      return undefined;
    }

    static messages(errorsMap) {
      messages = {
        ...messages,
        errorsMap,
      };
    }

    static use(plugin) {
      plugins = [
        ...plugins,
        plugin,
      ];
    }

    static oneOf(array) {
      if (!isArray(array)) {
        throw new Error('Expected an array.');
      }
      if (array.length < 2) {
        throw new Error('Array should contain at least two elements');
      }
      return new this(array);
    }

    static arrayOf(schemaDef) {
      return new this([schemaDef]);
    }
  }

  return Schema;
}

export default createSchema;
