import {
  ERROR_MISSING_FIELD,
  ERROR_KEY_NOT_ALLOWED,
} from '../constants';
import {
  validateIsObject,
} from '../validators.js';
import {
  has,
  each,
  combine,
  isEmpty,
  isArray,
  isPlainObject,
} from '../utils.js';

const createValidateProperties = ({
  properties,
  additionalProperties,
  emptyStringsAreMissingValues,
}) => (value) => {
  const errors = {};
  each(properties, (property, key) => {
    const valueAtKey = value[key];
    const valueMissing = valueAtKey === undefined ||
                         valueAtKey === null ||
                         (emptyStringsAreMissingValues && valueAtKey === '' && property.isString);
    if (valueMissing && !property.optional) {
      errors[key] = {
        error: ERROR_MISSING_FIELD,
      };
      if (property.label) {
        errors[key].label = property.label;
      }
    } else if (!valueMissing) {
      const error = property.validate(valueAtKey);
      if (error) {
        errors[key] = error;
      }
    }
  });
  if (!additionalProperties) {
    each(value, (_, key) => {
      if (!has(properties, key)) {
        errors[key] = { error: ERROR_KEY_NOT_ALLOWED };
      }
    });
  }
  return !isEmpty(errors) ? { errors } : undefined;
};

const pluginObject = {
  compile: compiler => next => (validator, schemaDef, schemaOptions) => {
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
