import {
  isArray,
} from './validators.js';
import {
  MESSAGES,
} from './constants.js';
import createCompiler from './createCompiler.js';
import createError from './createError.js';

function createSchema(options = {}) {
  const {
    defaultLabel = 'Value',
    defaultCustomErrors,
    defaultErrorCreator = createError,
    defaultLabelCreator = (keys, custom) => custom || keys.join('.'),
  } = options;

  if (!options.plugins) {
    throw new Error('At lest you need to prvide an array of plugins');
  }

  class Schema {
    constructor(schemaDef, schemaOptions = {}) {
      Object.assign(this, {
        schemaDef,
        schemaOptions,
      });
    }

    get compiled() {
      Object.defineProperty(this, 'compiled', {
        value: this.constructor.compiler.compile(this.schemaDef, this.schemaOptions),
      });
      return this.compiled;
    }

    getErrors(value, customErrors) {
      let errors = this.compiled.validate(value);
      if (customErrors) {
        errors = {
          ...errors,
          ...customErrors(value, errors),
        };
      }
      if (errors && Object.keys(errors).length > 0) {
        return errors;
      }
      return undefined;
    }

    validate(value, {
      noException = false,
      customErrors = defaultCustomErrors,
      errorCreator = defaultErrorCreator,
      labelCreator = defaultLabelCreator,
    } = {}) {
      const errors = this.getErrors(value, customErrors);
      if (errors) {
        const details = this.describe(errors, { labelCreator });
        if (!noException) {
          throw errorCreator(details);
        }
        return details;
      }
      return undefined;
    }

    validator(validateOptions) {
      return value => this.validate(value, validateOptions);
    }

    describe(descriptor, {
      keys = [],
      context = this.compiled,
      labelCreator = defaultLabelCreator,
    } = {}) {
      if (descriptor && typeof descriptor === 'object') {
        if (descriptor.error) {
          const messageTemplate = this.constructor.messages[descriptor.error];
          if (!messageTemplate) {
            return descriptor.error;
          }
          return messageTemplate({
            ...descriptor,
            label: labelCreator(keys, context && context.label) || defaultLabel,
          });
        } else if (descriptor.errors) {
          if (isArray(descriptor.errors)) {
            return descriptor.errors.map((item, index) => this.describe(item, {
              labelCreator,
              keys: [...keys, index],
              context: context && context.getSubSchema && context.getSubSchema(index),
            }));
          } else if (typeof descriptor.errors === 'object') {
            const described = {};
            Object.keys(descriptor.errors).forEach((key) => {
              described[key] = this.describe(descriptor.errors[key], {
                labelCreator,
                keys: [...keys, key],
                context: context && context.getSubSchema && context.getSubSchema(key),
              });
            });
            return described;
          }
        }
      }
      return undefined;
    }

    static oneOf(array) {
      return new this(array, { oneOf: true });
    }

    static merge(array) {
      return new this(array, { merge: true });
    }

    static pick(schemaDef, fields) {
      return new this(schemaDef, { pick: fields });
    }
  }

  Schema.compiler = createCompiler(Schema, options);
  Schema.messages = { ...MESSAGES };

  options.plugins.forEach(plugin => plugin.mixin && plugin.mixin(Schema));

  return Schema;
}

export default createSchema;
