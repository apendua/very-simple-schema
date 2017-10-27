import pluginAllowedValues from './allowedValues.js';
import pluginAtomic from './atomic.js';
import pluginArray from './array.js';
import pluginObject from './object.js';
import pluginRegExp from './regExp.js';
import pluginSchema from './schema.js';

export default [
  pluginSchema,
  pluginObject,
  pluginArray,
  pluginAtomic,
  pluginAllowedValues,
  pluginRegExp,
];
