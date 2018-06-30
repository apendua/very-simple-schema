import {
  validateIsObject,
  createValidateProperties,
} from '../validators.js';
import {
  has,
  each,
  combine,
  isArray,
  isPlainObject,
} from '../utils.js';

const pluginObject = {
  compile: compiler => next => (validator, schemaDef, schemaOptions = {}) => {
    if (isPlainObject(schemaDef)) {
      const {
        typeName = 'object',
        required,
        defaultValue,
        additionalProperties = compiler.options.additionalProperties,
        fieldsOptionalByDefault = compiler.options.fieldsOptionalByDefault,
        emptyStringsAreMissingValues = compiler.options.emptyStringsAreMissingValues,
      } = schemaOptions;
      const properties = {};
      const isMissing = value => (
        value === undefined ||
        (emptyStringsAreMissingValues && value === '')
      );
      each(schemaDef, (definition, key) => {
        if (isPlainObject(definition)) {
          const {
            type,
            label,
            optional = fieldsOptionalByDefault,
            ...otherOptions
          } = definition;
          if (!type) {
            throw new Error(`Missing type for property ${key}`);
          }
          properties[key] = compiler.compile({}, type, {
            ...otherOptions,
          });
          properties[key].optional = !!optional;
          if (label) {
            properties[key].label = label;
          }
        } else {
          properties[key] = compiler.compile({}, definition);
        }
      });
      if (required) {
        if (!fieldsOptionalByDefault) {
          throw new Error('Required is only allowed when fields are optional by default');
        }
        if (!isArray(required)) {
          throw new Error('Required should be an array');
        }
        required.forEach((key) => {
          if (!properties[key]) {
            throw new Error(`Unknown required property "${key}"`);
          }
          properties[key].optional = false;
        });
      }
      return next({
        ...validator,
        properties,
        typeName,
        isBlackbox: !!additionalProperties,
        isObject: true,
        validate: combine([
          validateIsObject,
          createValidateProperties({
            properties,
            additionalProperties,
            emptyStringsAreMissingValues,
          }),
        ]),
        clean: (value = defaultValue) => {
          if (!isPlainObject(value)) {
            return value;
          }
          const cleaned = {};
          each(value, (valueAtKey, key) => {
            // TODO: Refine this logic ...
            if (valueAtKey === undefined ||
                valueAtKey === null ||
                (emptyStringsAreMissingValues && valueAtKey === '')) {
              delete cleaned[key];
            } else if (has(properties, key)) {
              cleaned[key] = properties[key].clean(valueAtKey);
            } else if (additionalProperties) {
              cleaned[key] = valueAtKey;
            }
          });
          each(properties, (property, key) => {
            if (!has(cleaned, key)) {
              const valueAtKey = property.clean();
              if (!isMissing(valueAtKey)) {
                cleaned[key] = valueAtKey;
              }
            }
          });
          return cleaned;
        },
      }, schemaDef, schemaOptions);
    }
    return next(validator, schemaDef, schemaOptions);
  },
  mixin(Schema) {
    Object.assign(Schema, {
      empty: () => new Schema({}, { additionalProperties: false }),
      blackbox: () => new Schema({}, { additionalProperties: true }),
    });
  },
};

export default pluginObject;
