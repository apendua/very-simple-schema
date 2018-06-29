
const pluginLazy = {
  compile: compiler => next => (validator, schemaDef, schemaOptions = {}) => {
    const {
      lazy = false,
      ...otherOptions
    } = schemaOptions;
    if (lazy) {
      if (typeof schemaDef !== 'function') {
        throw new Error('If lazy flag is set, schemaDef must be a function');
      }
      let validate;
      return {
        ...validator,
        isLazy: true,
        typeName: 'lazy',
        validate: (value) => {
          if (!validate) {
            validate = compiler.compile({}, schemaDef(), otherOptions).validate;
          }
          return validate(value);
        },
      };
    }
    return next(validator, schemaDef, schemaOptions);
  },
};

export default pluginLazy;
