import {
  isArray,
  each,
  isEmpty,
  isPlainObject,
} from './utils.js';
import * as constants from './constants.js';
import createCompiler from './createCompiler.js';
import createError from './createError.js';

const { MESSAGES, ...ERRORS } = constants;

function createSchema(options = {}) {
  const {
    defaultLabelCreator = (keys, label) => label || keys.join('.'),
    defaultLabel = 'Value',
    defaultErrorCreator = createError,
    // eslint-disable-next-line no-use-before-define
    defaultGetMessageTemplate = type => Schema.messages[type],
    ...compilerOptions
  } = options;

  if (!compilerOptions.plugins) {
    throw new Error('At minimum you need to prvide an array of plugins');
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
        value: this.constructor.compiler.compile({}, this.schemaDef, this.schemaOptions),
      });
      return this.compiled;
    }

    get properties() {
      Object.defineProperty(this, 'properties', {
        value: this.compiled.properties,
      });
      return this.properties;
    }

    get meta() {
      Object.defineProperty(this, 'meta', {
        value: this.compiled.meta,
      });
      return this.meta;
    }

    property(key) {
      return this.compiled.property(key);
    }

    clean(value) {
      return this.compiled.clean(value);
    }

    getErrors(value, {
      clean = false,
    } = {}) {
      const errors = this.compiled.validate(clean ? this.compiled.clean(value) : value);
      if (!isEmpty(errors)) {
        return errors;
      }
      return undefined;
    }

    validator(validateOptions) {
      return value => this.validate(value, validateOptions);
    }

    validate(value, {
      clean = false,
      noException = false,
      errorCreator = defaultErrorCreator,
      labelCreator = defaultLabelCreator,
      getMessageTemplate = defaultGetMessageTemplate,
    } = {}) {
      const errors = this.getErrors(value, { clean });
      if (errors) {
        const details = this.describe(errors, {
          labelCreator,
          getMessageTemplate,
        });
        if (!noException) {
          throw errorCreator(details);
        }
        return details;
      }
      return undefined;
    }

    describe(...args) {
      return this.constructor.describe(...args);
    }

    static pick(schemaDef, { properties, ...schemaOptions }) {
      const compiled = this.compiler.compile({}, schemaDef);
      if (!compiled.isObject) {
        throw new Error('Pick requires an object schema');
      }
      const newSchemaDef = {};
      if (isArray(properties)) {
        each(properties, (name) => {
          newSchemaDef[name] = compiled.properties[name];
        });
      } else if (isPlainObject(properties)) {
        each(properties, (propertyOptions, name) => {
          if (compiled.properties[name]) {
            newSchemaDef[name] = {
              type: compiled.properties[name],
              ...propertyOptions,
            };
          }
        });
      }
      return new this(newSchemaDef, schemaOptions);
    }

    static merge(schemaDefs, schemaOptions) {
      const newSchemaDef = {};
      const newSchemaOptions = {
        ...schemaOptions,
      };
      each(schemaDefs, (schemaDef) => {
        const compiled = this.compiler.compile({}, schemaDef);
        if (!compiled.isObject) {
          throw new Error('Merge requires all elements to be objects');
        }
        if (newSchemaOptions.sealed !== true && !compiled.isSealed) {
          newSchemaOptions.sealed = false;
        }
        Object.assign(newSchemaDef, compiled.properties);
      });
      return new this(newSchemaDef, newSchemaOptions);
    }

    static describe(descriptor, {
      keys = [],
      labelCreator = defaultLabelCreator,
      getMessageTemplate = defaultGetMessageTemplate,
    } = {}) {
      if (descriptor && typeof descriptor === 'object') {
        if (descriptor.error) {
          const messageTemplate = getMessageTemplate(descriptor.error) || descriptor.error;
          return typeof messageTemplate === 'function'
            ? messageTemplate({
              ...descriptor,
              label: labelCreator(keys, descriptor && descriptor.label) || defaultLabel,
            })
            : messageTemplate;
        } else if (descriptor.errors) {
          if (isArray(descriptor.errors)) {
            return descriptor.errors.map((item, idx) => this.describe(item, {
              labelCreator,
              getMessageTemplate,
              keys: [...keys, idx],
            }));
          } else if (typeof descriptor.errors === 'object') {
            const described = {};
            each(descriptor.errors, (error, key) => {
              described[key] = this.describe(error, {
                labelCreator,
                getMessageTemplate,
                keys: [...keys, key],
              });
            });
            return described;
          }
        }
      }
      return undefined;
    }
  }

  Schema.compiler = createCompiler(Schema, compilerOptions);
  Schema.messages = { ...MESSAGES };
  Object.assign(Schema, ERRORS);

  each(compilerOptions.plugins, plugin => plugin.mixin && plugin.mixin(Schema));

  return Schema;
}

export default createSchema;
