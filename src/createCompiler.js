import {
  annotateError,
} from './utils.js';
import Validator from './Validator';

const identity = x => x;
const constant = x => () => x;

export const compose = (...functions) => {
  if (functions.length === 0) {
    return identity;
  }
  if (functions.length === 1) {
    return functions[0];
  }
  return functions.reduce((a, b) => (...args) => a(b(...args)));
};

/**
 * Take compiler object and transform it by applying
 * the provided array of plugins.
 *
 * A plugin can be an object of shape { compile: Function, ... },
 * or a single function which is interpreted as the "compile".
 * @param {Object} compiler
 * @param {Object[]} plugins
 * @returns {Object}
 */
export const applyPlugins = (compiler, plugins = []) => {
  const compile = compiler.compile || identity;
  const options = {
    ...compiler,
    compile() {
      throw new Error('You should not call "compile" before compiler is created.');
    },
  };

  const compilers = plugins.map((plugin) => {
    let f;
    if (!plugin) {
      f = constant(identity);
    } else if (typeof plugin === 'function') {
      f = plugin;
    } else if (typeof plugin === 'object') {
      f = plugin.compile || constant(identity);
    } else {
      throw new Error(`Invalid plugin: ${plugin}`);
    }
    return f(options);
  });

  options.compile = compose(...compilers)(compile);
  return options;
};

const createCompiler = (Schema, options) => {
  const pluginValidator = () => next => (validator, schemaDef, schemaOptions) => {
    if (schemaDef instanceof Validator) {
      // NOTE: It's not necessary to make a copy here, because at the end of compile chain
      //       we are making a copy anyway (see a couple lines below).
      return schemaDef;
    }
    return next(validator, schemaDef, schemaOptions);
  };
  const compiler = {
    Schema,
    options: { ...options },
    compile: (validator, schemaDef, { label } = {}) => new Validator({
      ...validator,
      ...label && { label },
      validate: annotateError(validator.validate, label),
    }),
  };
  return applyPlugins(compiler, [
    pluginValidator,
    ...options.plugins || [],
  ]);
};

export default createCompiler;
