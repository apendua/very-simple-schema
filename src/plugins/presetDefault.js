import pluginAllowedValues from './allowedValues.js';
import pluginLazy from './lazy.js';
import pluginAtomic from './atomic.js';
import pluginArray from './array.js';
import pluginMerge from './merge.js';
import pluginObject from './object.js';
import pluginOneOf from './oneOf.js';
import pluginPick from './pick.js';
import pluginRegExp from './regExp.js';

export default [
  pluginMerge,
  pluginPick,
  pluginObject,
  pluginArray,
  pluginOneOf,
  pluginLazy,
  pluginAtomic,
  pluginAllowedValues,
  pluginRegExp,
];
