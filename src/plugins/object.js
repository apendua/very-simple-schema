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
      const requiredKeys = {};
      if (required) {
        if (!fieldsOptionalByDefault) {
          throw new Error('Required is only allowed when fields are optional by default');
        }
        if (!isArray(required)) {
          throw new Error('Required should be an array');
        }
        required.forEach((key) => {
          if (!properties[key]) {
            throw new Error(`Unknown required property ${key}`);
          }
          requiredKeys[key] = true;
        });
      }
      Object.keys(schemaDef).forEach((key) => {
        const memberSchemaDef = schemaDef[key];
        const optional = fieldsOptionalByDefault ? !requiredKeys[key] : false;
        properties[key] = compiler.compile(
          compiler.Schema.member(isPlainObject(memberSchemaDef)
            ? {
              optional,
              ...memberSchemaDef,
            }
            : {
              optional,
              type: memberSchemaDef,
            }
          ),
        );
      });
      if (required) {
        required.forEach((key) => {
          if (!properties[key]) {
            throw new Error(`Unknown required property ${key}`);
          }
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
          each(value, (val, key) => {
            if (has(properties, key)) {
              cleaned[key] = properties[key].clean(val);
            } else if (additionalProperties) {
              cleaned[key] = val;
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
