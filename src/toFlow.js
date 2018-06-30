import {
  each,
} from './utils';

const indent = (text, spaces, firstRow) => text.split('\n').map((line, i) => (firstRow || i > 0 ? `${spaces}${line}` : line)).join('\n');

const toFlow = (validator) => {
  if (validator.isObject) {
    const properties = [];
    each(validator.properties, (property, key) => {
      properties.push(`  ${key}${property.optional ? '?' : ''}: ${indent(toFlow(property), '  ')}`);
    });
    if (!validator.isSealed) {
      return `{\n${properties.join(',\n')},\n}`;
    }
    return `{|\n${properties.join(',\n')},\n|}`;
  }
  if (validator.isArray) {
    // if (!validator.$.isAtomic) {
    //   return `(${toFlow(validator.$)})[]`;
    // }
    return `Array<${toFlow(validator.$)}>`;
  }
  if (validator.isHash) {
    return `{ [${toFlow(validator.hashKey)}]: ${toFlow(validator.hashValue)} }`;
  }
  if (validator.isOneOf) {
    const alternatives = [];
    each(validator.alternatives, (alternative) => {
      alternatives.push(toFlow(alternative));
    });
    return alternatives.join(' | ');
  }
  if (validator.isTuple) {
    const elements = [];
    each(validator.elements, (element) => {
      elements.push(`${indent(toFlow(element), '  ', true)},\n`);
    });
    return `[\n${elements.join('')}]`;
  }
  if (validator.isMaybe) {
    return `?${toFlow(validator.related)}`;
  }
  if (validator.isString) {
    return 'string';
  }
  if (validator.isNumber) {
    return 'number';
  }
  if (validator.isBoolean) {
    return 'boolean';
  }
  if (validator.isDate) {
    return 'Date';
  }
  if (validator.isLiteral) {
    return JSON.stringify(validator.value);
  }
  if (validator.isVoid) {
    return 'void';
  }
  return 'mixed';
};

export default toFlow;
