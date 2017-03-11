import pluginAllowedValues from './allowedValues.js';
import pluginLazy from './lazy.js';
import pluginAtomic from './atomic.js';
import pluginArray from './array.js';
import pluginMerge from './merge.js';
import pluginObject from './object.js';
import pluginOneOf from './oneOf.js';
import pluginRegExp from './regExp.js';

export default [
  pluginObject,
  pluginArray,
  pluginOneOf,
  pluginMerge,
  pluginLazy,
  pluginAtomic,
  pluginAllowedValues,
  pluginRegExp,
];
