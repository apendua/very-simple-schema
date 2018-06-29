import {
  isArray,
} from './utils';

class Validator {
  constructor(props) {
    Object.assign(this, props);
  }

  validate() { // eslint-disable-line class-methods-use-this
    return undefined;
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
