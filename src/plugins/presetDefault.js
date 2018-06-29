import pluginAny from './any.js';
import pluginAtomic from './atomic.js';
import pluginArray from './array.js';
import pluginImplicit from './implicit.js';
import pluginHash from './hash.js';
import pluginLazy from './lazy.js';
import pluginObject from './object.js';
import pluginOneOf from './oneOf.js';
import pluginRegExp from './regExp.js';

export default [
  pluginImplicit,
  pluginAny,
  pluginArray,
  pluginHash,
  pluginLazy,
  pluginObject,
  pluginOneOf,
  pluginAtomic,
  pluginRegExp,
];
