import {
  isArray,
  each,
  isEmpty,
} from './utils.js';
import * as constants from './constants.js';
import createCompiler from './createCompiler.js';
import createError from './createError.js';

const { MESSAGES, ...ERRORS } = constants;

function createSchema(options = {}) {
  const {
    defaultLabelCreator = (keys, label) => label || keys.join('.'),
    defaultLabel = 'Value',
    defaultCustomErrors,
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

    static pick(schemaDef, fields) {
      return new this(schemaDef, { pick: fields });
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

    clean(value) {
      return this.compiled.clean(value);
    }

    getErrors(value, customErrors) {
      let errors = this.compiled.validate(value);
      if (customErrors) {
        errors = {
          ...errors,
          ...customErrors(value, errors),
        };
      }
      if (!isEmpty(errors)) {
        return errors;
      }
      return undefined;
    }

    validator(validateOptions) {
      return value => this.validate(value, validateOptions);
    }

    validate(value, {
      noException = false,
      customErrors = defaultCustomErrors,
      errorCreator = defaultErrorCreator,
      labelCreator = defaultLabelCreator,
      getMessageTemplate = defaultGetMessageTemplate,
    } = {}) {
      const errors = this.getErrors(value, customErrors);
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

  compilerOptions.plugins.forEach(plugin => plugin.mixin && plugin.mixin(Schema));

  return Schema;
}

export default createSchema;
