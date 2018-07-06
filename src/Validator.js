import {
  isArray,
} from './utils';

class Validator {
  constructor(props) {
    Object.defineProperty(this, 'private', {
      value: {},
    });
    Object.assign(this, props);
  }

  set validate(value) {
    this.private.validate = value;
  }

  get validate() {
    const validate = (value) => {
      const error = this.private.validate && this.private.validate(value);
      if (error && this.label) {
        return {
          label: this.label,
          ...error,
        };
      }
      return error;
    };
    Object.defineProperty(this, 'validate', {
      value: validate,
    });
    return validate;
  }

  set clean(value) {
    this.private.clean = value;
  }

  get clean() {
    const clean = (value = this.defaultValue) => {
      if (this.private.clean) {
        return this.private.clean(value, this.defaultValue);
      }
      return value;
    };
    Object.defineProperty(this, 'clean', {
      value: clean,
    });
    return clean;
  }

  property(key) {
    if (!isArray(key)) {
      return this.property(key.split('.'));
    }
    if (!this.isObject && !this.isArray) {
      throw new Error(`Cannot get ${key.join('.')} from ${this.typeName}`);
    }
    if (this.isArray) {
      return this.$.property(key);
    }
    const [k, ...tail] = key;
    if (tail.length === 0) {
      return this.properties[k];
    }
    if (!this.properties[k]) {
      throw new Error(`Unknown property ${k}`);
    }
    return this.properties[k].property(tail);
  }
}

export default Validator;
