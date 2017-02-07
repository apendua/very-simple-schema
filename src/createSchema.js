import {
  MESSAGES,
} from './constants.js';
import * as builtIn from './plugins.js';

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
      return next(0)({ schemaDef });
    },
  };
  return compiler;
}

function createSchema() {
  let messages = {
    ...MESSAGES,
  };

  let plugins = [
    builtIn.pluginLazy,
    builtIn.pluginSchema,
    builtIn.pluginAtomic,
    builtIn.pluginArray,
    builtIn.pluginOneOf,
    builtIn.pluginObject,
  ];

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

    validate(value) {
      const errors = this.compiled.validate(value);
      return errors && this.constructor.describe(errors);
    }

    validator() {
      return value => this.compiled.validate(value);
    }

    static describe(errors) {
      return errors;
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
