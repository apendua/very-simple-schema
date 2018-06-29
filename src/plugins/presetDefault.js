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
import pluginRegExp from './regExp.js';
import pluginSchema from './schema.js';

export default [
  pluginSchema,
  pluginImplicit,
  pluginAny,
  pluginMerge,
  pluginArray,
  pluginHash,
  pluginLazy,
  pluginObject,
  pluginOneOf,
  pluginAtomic,
  pluginAllowedValues,
  pluginRegExp,
];
