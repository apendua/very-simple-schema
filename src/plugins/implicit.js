
const pluginImplicit = {
  compile: compiler => next => (validator, schemaDef, schemaOptions = {}) => {
    const {
      implicit,
      ...otherOptions
    } = schemaOptions;
    if (implicit !== undefined) {
      const {
        emptyStringsAreMissingValues = compiler.options.emptyStringsAreMissingValues,
      } = otherOptions;
      const compiled = next(validator, schemaDef, otherOptions);
      const isString = compiled.isString;
      const validate = compiled.validate;
      const valueIsMissing = value => value === undefined ||
                                      value === null ||
                                      !!(emptyStringsAreMissingValues && value === '' && isString);
      return new compiler.Validator({
        ...compiled,
        isImplicit: true,
        validate: value => (valueIsMissing(value) ? validate(implicit) : validate(value)),
      });
    }
    return next(validator, schemaDef, schemaOptions);
  },
};

export default pluginImplicit;
