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

export const pluginValidator = () => next => (validator, schemaDef, schemaOptions) => {
  if (schemaDef instanceof Validator) {
    return next({
      ...validator,
      ...schemaDef,
      ...schemaDef.private,
    }, schemaDef, schemaOptions);
  }
  return next(validator, schemaDef, schemaOptions);
};

export const pluginSchema = compiler => next => (validator, schemaDef, schemaOptions) => {
  if (schemaDef instanceof compiler.Schema) {
    // Recompile the original schemaDef with (potentionally) new options.
    return compiler.compile(validator, schemaDef.schemaDef, {
      ...schemaDef.schemaOptions,
      ...schemaOptions,
    });
  }
  return next(validator, schemaDef, schemaOptions);
};

export const pluginEnsureOptions = () => next =>
  (validator, schemaDef, schemaOptions = {}) => next(validator, schemaDef, schemaOptions);

const createCompiler = (Schema, options) => {
  const compiler = {
    Schema,
    options: {
      sealedByDefault: true,
      ...options,
    },
    compile: (validator, schemaDef, {
      label,
      defaultValue,
    }) => new Validator({
      ...validator,
      label,
      defaultValue,
    }),
  };
  return applyPlugins(compiler, [
    pluginEnsureOptions,
    pluginValidator,
    pluginSchema,
    ...options.plugins || [],
  ]);
};

export default createCompiler;
