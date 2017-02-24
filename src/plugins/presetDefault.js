import pluginAllowedValues from './allowedValues.js';
import pluginLazy from './lazy.js';
import pluginAtomic from './atomic.js';
import pluginArray from './array.js';
import pluginOneOf from './oneOf.js';
import pluginObject from './object.js';
import pluginRegExp from './regExp.js';

export default [
  pluginObject,
  pluginArray,
  pluginOneOf,
  pluginLazy,
  pluginAtomic,
  pluginAllowedValues,
  pluginRegExp,
];
