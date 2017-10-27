import {
  validateIsObject,
  createValidateProperties,
} from '../validators.js';
import {
  combine,
  isArray,
} from '../utils.js';

const pluginPick = {
  compile: compiler => next => (validator, schemaDef, schemaOptions = {}) => {
    if (schemaDef instanceof compiler.Schema.Pick) {
      const {
        typeName = 'object',
        additionalProperties = compiler.options.additionalProperties,
        emptyStringsAreMissingValues = compiler.options.emptyStringsAreMissingValues,
        ...otherOptions
      } = schemaOptions;
      const schema = compiler.compile({}, schemaDef.originalSchemaDef, otherOptions);
      if (!schema.isObject) {
        throw new Error('Pick the original type to be an object');
      }
      const properties = {};
      schemaDef.fields.forEach((name) => {
        properties[name] = schema.properties[name];
      });
      return {
        properties,
        typeName,
        compiled: true,
        isObject: true,
        validate: combine([
          validateIsObject,
          createValidateProperties({
            properties,
            additionalProperties,
            emptyStringsAreMissingValues,
          }),
        ]),
      };
    }
    return next(validator, schemaDef, schemaOptions);
  },
  mixin(Schema) {
    class Pick {
      constructor(originalSchemaDef, fields) {
        if (!isArray(fields)) {
          throw new Error('Pick requires and array fields as the second argument');
        }
        Object.assign(this, {
          fields,
          originalSchemaDef,
        });
      }
    }
    Object.assign(Schema, {
      Pick,
      pick: (schemaDef, fields, schemaOptions) =>
        new Schema(new Pick(schemaDef, fields), schemaOptions),
    });
  },
};

export default pluginPick;
