
const pluginAssumed = {
  compile(compiler, schemaDef, {
    assumed,
    emptyStringsAreMissingValues = compiler.options.emptyStringsAreMissingValues,
    ...otherOptions
  }) {
    if (assumed !== undefined) {
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
        isAssumed: true,
        validate: value => (valueIsMissing(value) ? validate(assumed) : validate(value)),
      };
    }
    return null;
  },
};

export default pluginAssumed;
