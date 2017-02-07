import {
  MESSAGES,
} from './constants.js';

const noError = () => undefined;

function createCompiler(Schema, plugins) {
  const compiler = {
    Schema,
    plugins,
    compile: (schemaDef, options = {}) => {
      const next = index => (compiled) => {
        const plugin = plugins[index];
        if (plugin) {
          return plugin.transform(compiler, compiled, options, next(index + 1));
        }
        return compiled;
      };
      return next(0)({ schemaDef, validate: noError });
    },
  };
  return compiler;
}

function createSchema(defaultPlugins) {
  let messages = {
    ...MESSAGES,
  };

  let plugins = [...defaultPlugins];

  const compilers = [];
  function getCompiler(Schema) {
    const index = plugins.length;
    if (!compilers[index]) {
      compilers[index] = createCompiler(Schema, plugins);
    }
    return compilers[index];
  }

  class Schema {
    constructor(schemaDef, options) {
      Object.assign(this, {
        schemaDef,
        options,
      });
      this.compiler = getCompiler(this.constructor);
    }

    get compiled() {
      Object.defineProperty(this, 'compiled', {
        value: this.compiler.compile(this.schemaDef, this.options),
      });
      return this.compiled;
    }

    getErrors(value) {
      return this.compiled.validate(value);
    }

    validate(value) {
      const errors = this.getErrors(value);
      return errors && this.constructor.describe(errors);
    }

    validator() {
      return value => this.compiled.validate(value);
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
          if (Array.isArray(descriptor.errors)) {
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
      if (!Array.isArray(array)) {
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
