import {
  ERROR_KEY_NOT_ALLOWED,
} from '../constants.js';
import {
  validateIsArray,
  validateIsObject,
} from '../validators.js';
import {
  each,
  combine,
  isEmpty,
  isPlainObject,
} from '../utils.js';

const isInteger = key => +key % 1 === 0;

const splitKey = (key) => {
  const index = key.indexOf('.');
  if (index >= 0) {
    return [
      key.substr(0, index),
      key.substr(index + 1),
    ];
  }
  return [key];
};

const isLiteral = object => Object.keys(object).every(key => key[0] !== '$');
const createValidateArray = validate => (value) => {
  const errors = value.map(validate);
  return errors.some(err => !!err) ? { errors } : undefined;
};

class Validator {
  constructor({ operators }) {
    this.operators = {};
    each(operators, (createOperator, keys) => {
      keys.split(',').forEach((key) => {
        this.operators[key] = createOperator;
      });
    });
    this.validateKeys = this.validateKeys.bind(this);
    this.validateSelector = this.validateSelector.bind(this);
    this.validateExpression = this.validateExpression.bind(this);
  }

  validateKeys(currentValidator) {
    return (expression) => {
      const errors = {};
      each(expression, (value, key) => {
        let validatorAtKey;
        if (key[0] === '$') {
          validatorAtKey = this.operators[key] && this.operators[key]({
            validateExpression: this.validateExpression,
            validateSelector:   this.validateSelector,
            validator:          currentValidator,
            arrayOf:            validate => ({
              isArray: true,
              validate: combine([
                validateIsArray,
                createValidateArray(validate),
              ]),
            }),
          });
        } else if (currentValidator.isObject) {
          validatorAtKey = currentValidator.properties[key];
        } else if (currentValidator.isArray) {
          if (isInteger(key) || key === '$') {
            validatorAtKey = currentValidator.element;
          } else if (currentValidator.element.isObject) {
            validatorAtKey = currentValidator.element.properties[key];
          }
        }
        if (!validatorAtKey) {
          errors[key] = { error: ERROR_KEY_NOT_ALLOWED };
        } else {
          const errorsAtKey = this.validateExpression(validatorAtKey)(value);
          if (errorsAtKey) {
            errors[key] = errorsAtKey;
          }
        }
      });
      return !isEmpty(errors) ? { errors } : undefined;
    };
  }

  validateExpression(currentValidator) {
    return (expression) => {
      if (!isPlainObject(expression)) {
        return currentValidator.validate(expression);
      } else if (isLiteral(expression)) {
        if (currentValidator.isObject) {
          return currentValidator.validate(expression);
        } else if (currentValidator.isArray) {
          return currentValidator.element.validate(expression);
        }
        return currentValidator.validate(expression);
      }
      // expression is a plain object but not an object literal (so it contains some operators)
      return this.validateKeys(currentValidator)(expression);
    };
  }

  validateSelector(currentValidator) {
    return (value) => {
      const errors = {};
      const byPrefix = {};
      const object = {};
      each(value, (valueAtKey, key) => {
        const [prefix, tail] = splitKey(key);
        if (tail) {
          byPrefix[prefix] = {
            ...byPrefix[prefix],
            [tail]: valueAtKey,
          };
        } else {
          object[key] = valueAtKey;
        }
      });
      if (!isEmpty(object)) {
        const objectErrors = this.validateKeys(currentValidator)(object);
        if (objectErrors) {
          if (isPlainObject(objectErrors.errors)) {
            Object.assign(errors, objectErrors.errors);
          } else {
            return objectErrors;
          }
        }
      }
      each(byPrefix, (valueAtKey, key) => {
        // NOTE: If there are already errors set for that key, it means that that key
        //       had an explicit value so we prioritize them, e.g.
        //       {
        //         a: {
        //           x: 1,
        //           y: 1,
        //         },
        //         'a.x': 1, // error will be shadowed by error from the sub document
        //       }
        if (errors[key]) {
          return;
        }
        let validatorAtKey;
        if (currentValidator.isObject) {
          validatorAtKey = currentValidator.properties[key];
        } else if (currentValidator.isArray) {
          if (isInteger(key) || key === '$') {
            validatorAtKey = currentValidator.element;
          } else if (currentValidator.element.isObject) {
            validatorAtKey = currentValidator.element.properties[key];
          }
        }
        const errorsAtKey = this.validateSelector(validatorAtKey)(valueAtKey);
        if (errorsAtKey) {
          errors[key] = errorsAtKey;
        }
      });
      return !isEmpty(errors) ? { errors } : undefined;
    };
  }
}

const pluginSelector = {
  compile: compiler => next => (validator, schemaDef, schemaOptions = {}) => {
    if (schemaDef instanceof compiler.Schema.Operator) {
      const schemaValidator = compiler.compile({}, schemaDef.schemaDef);
      const {
        operators = {},
      } = schemaOptions;
      const operatorValidator = new Validator({
        operators,
      });
      return next({
        ...validator,
        typeName: `operator on ${schemaValidator.typeName}`,
        validate: combine([
          validator.validate,
          validateIsObject,
          operatorValidator.validateSelector(schemaValidator),
        ]),
      }, schemaDef, schemaOptions);
    }
    return next(validator, schemaDef, schemaOptions);
  },
  mixin(Schema) {
    class Operator {
      constructor(schemaDef) {
        Object.assign(this, {
          schemaDef,
        });
      }
    }
    Object.assign(Schema, {
      Operator,
      operator: (schemaDef, schemaOptions) =>
        new Schema(new Operator(schemaDef), schemaOptions),
    });
  },
};

export default pluginSelector;
