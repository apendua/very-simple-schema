import {
  isArray,
} from './validators.js';
import {
  MESSAGES,
} from './constants.js';
import {
  createCompiler,
} from './createCompiler.js';

function createSchema(plugins, compilerOptions) {
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
      label = 'Value',
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
      label = 'Value',
    } = {}) {
      if (descriptor && typeof descriptor === 'object') {
        if (descriptor.error) {
          const messageTemplate = this.messages[descriptor.error];
          if (!messageTemplate) {
            return descriptor.error;
          }
          return messageTemplate({
            ...descriptor,
            label,
          });
        } else if (descriptor.errors) {
          if (isArray(descriptor.errors)) {
            return descriptor.errors.map((item, index) => this.describe(item, { label: `${label}.${index}` }));
          } else if (typeof descriptor.errors === 'object') {
            const described = {};
            Object.keys(descriptor.errors).forEach((key) => {
              described[key] = this.describe(descriptor.errors[key], { label: `${label}.${key}` });
            });
            return described;
          }
        }
      }
      return undefined;
    }

    static oneOf(array) {
      if (!isArray(array)) {
        throw new Error('Expected an array.');
      }
      if (array.length < 2) {
        throw new Error('Array should contain at least two elements');
      }
      return new this(array, { isOneOf: true });
    }

    static arrayOf(schemaDef) {
      return new this([schemaDef]);
    }
  }

  Schema.compiler = createCompiler(Schema, plugins, compilerOptions);
  Schema.messages = { ...MESSAGES };

  plugins.forEach(plugin => plugin.mixin && plugin.mixin(Schema));

  return Schema;
}

export default createSchema;
