import {
  isArray,
} from './utils';

class Validator {
  constructor(props) {
    Object.assign(this, props);
    const validate = this.validate;
    this.validate = (value) => {
      const error = validate && validate(value);
      if (error && this.label) {
        return {
          label: this.label,
          ...error,
        };
      }
      return error;
    };
  }

  clean(value = this.defaultValue) {
    return value;
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
