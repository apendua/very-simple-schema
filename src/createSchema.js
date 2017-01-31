import {
  MODE_MERGE,
  MODE_ONE_OF,
  MODE_ARRAY,
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
    builtIn.pluginType,
    builtIn.pluginArray,
    builtIn.pluginMerge,
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
    constructor(schemaDef, {
      mode = MODE_MERGE,
      lazy = false,
    } = {}) {
      Object.assign(this, {
        schemaDef,
        mode,
        lazy,
      });
      this.compiler = getCompiler(this.constructor);
    }

    get compiled() {
      Object.defineProperty(this, 'compiled', {
        value: this.compiler.compile(this.schemaDef, {
          mode: this.mode,
          lazy: this.lazy,
        }),
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
      return new this(array, { mode: MODE_ONE_OF });
    }

    static arrayOf(schemaDef) {
      return new this([schemaDef], { mode: MODE_ARRAY });
    }
  }

  return Schema;
}

export default createSchema;
