import {
  isArray,
} from './validators.js';
import {
  MESSAGES,
} from './constants.js';
import {
  createCompiler,
} from './createCompiler.js';

function createSchema(options = {}) {
  const {
    defaultLabel = 'Value',
    defaultLabelCreator = keys => keys.join('.'),
    defaultErrorCreator = error => new Error(error),
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

    getErrors(value) {
      return this.compiled.validate(value);
    }

    validate(value, {
      label = defaultLabel,
    } = {}) {
      const error = this.getErrors(value);
      return error && this.constructor.describe(error, {
        label,
      });
    }

    validator(validateOptions, transform) {
      return (value) => {
        const error = this.validate(value, validateOptions);
        if (typeof transform === 'function') {
          return transform(value, error);
        }
        return error;
      };
    }

    static describe(descriptor, {
      keys = [],
      labelCreator = defaultLabelCreator,
    } = {}) {
      if (descriptor && typeof descriptor === 'object') {
        if (descriptor.error) {
          const messageTemplate = this.messages[descriptor.error];
          if (!messageTemplate) {
            return descriptor.error;
          }
          return messageTemplate({
            ...descriptor,
            label: labelCreator(keys) || defaultLabel,
          });
        } else if (descriptor.errors) {
          if (isArray(descriptor.errors)) {
            return descriptor.errors.map((item, index) => this.describe(item, { keys: [...keys, index], labelCreator }));
          } else if (typeof descriptor.errors === 'object') {
            const described = {};
            Object.keys(descriptor.errors).forEach((key) => {
              described[key] = this.describe(descriptor.errors[key], { keys: [...keys, key], labelCreator });
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
