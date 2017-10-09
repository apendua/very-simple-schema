import pluginAllowedValues from './allowedValues.js';
import pluginAny from './any.js';
import pluginAtomic from './atomic.js';
import pluginArray from './array.js';
import pluginImplicit from './implicit.js';
import pluginHash from './hash.js';
import pluginLazy from './lazy.js';
import pluginMerge from './merge.js';
import pluginObject from './object.js';
import pluginOneOf from './oneOf.js';
import pluginPick from './pick.js';
import pluginRegExp from './regExp.js';

export default [
  pluginImplicit,
  pluginAny,
  pluginMerge,
  pluginPick,
  pluginArray,
  pluginHash,
  pluginLazy,
  pluginObject,
  pluginOneOf,
  pluginAtomic,
  pluginAllowedValues,
  pluginRegExp,
];
