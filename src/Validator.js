import {
  isArray,
  combine,
} from './utils';

const wrapValidate = ({
  meta,
  label,
  custom,
  validate,
}) => {
  const combinedValidator = combine([
    validate,
    custom && (actual => custom(actual, meta)),
  ]);
  return (value) => {
    const error = combinedValidator(value, meta);
    if (error && label) {
      return {
        ...error,
        label, // note that error can already have another label
      };
    }
    return error;
  };
};

const wrapClean = ({
  clean,
  defaultValue,
}) => (value = defaultValue) => {
  if (clean) {
    return clean(value, defaultValue);
  }
  return value;
};

class Validator {
  constructor(props) {
    Object.assign(this, props);
    this.clean = wrapClean(props);
    this.validate = wrapValidate(props);
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
