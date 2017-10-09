
const pluginImplicit = {
  compile(compiler, schemaDef, {
    implicit,
    emptyStringsAreMissingValues = compiler.options.emptyStringsAreMissingValues,
    ...otherOptions
  }) {
    if (implicit !== undefined) {
      const compiled = compiler.compile(schemaDef, {
        emptyStringsAreMissingValues,
        ...otherOptions,
      });
      const isString = compiled.isString;
      const validate = compiled.validate;
      const valueIsMissing = value => value === undefined ||
                                      value === null ||
                                      !!(emptyStringsAreMissingValues && value === '' && isString);
      return {
        ...compiled,
        isImplicit: true,
        validate: value => (valueIsMissing(value) ? validate(implicit) : validate(value)),
      };
    }
    return null;
  },
};

export default pluginImplicit;
