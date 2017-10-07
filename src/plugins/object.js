import {
  validateIsObject,
  combine,
  createValidateProperties,
} from '../validators.js';
import {
  has,
  each,
  isArray,
  isPlainObject,
} from '../utils.js';

const pluginObject = {
  compile(compiler, schemaDef, {
    typeName = 'object',
    required,
    additionalProperties = compiler.options.additionalProperties,
    fieldsOptionalByDefault = compiler.options.fieldsOptionalByDefault,
    emptyStringsAreMissingValues = compiler.options.emptyStringsAreMissingValues,
  }) {
    if (isPlainObject(schemaDef)) {
      const properties = {};
      Object.keys(schemaDef).forEach((key) => {
        const definition = schemaDef[key];
        if (isPlainObject(definition)) {
          const {
            type,
            optional = fieldsOptionalByDefault,
            ...otherOptions
          } = definition;
          if (!type) {
            throw new Error(`Missing type for property ${key}`);
          }
          properties[key] = compiler.compile(type, {
            ...otherOptions,
          });
          properties[key].optional = !!optional;
        } else {
          properties[key] = compiler.compile(definition);
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
        clean: (value) => {
          if (!isPlainObject(value)) {
            return value;
          }
          const cleaned = {};
          each(value, (valueAtKey, key) => {
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
          return cleaned;
        },
        getSubSchema: key => properties[key],
      };
    }
    return null;
  },
};

export default pluginObject;
