/* eslint-env mocha */
/* eslint no-unused-expressions: "off" */
/* eslint prefer-arrow-callback: "off" */
import chai from 'chai';
import createSchema from './createSchema.js';
import {
  ERROR_MISSING_FIELD,
  ERROR_VALUE_NOT_ALLOWED,
  ERROR_NO_ALTERNATIVE,
  ERROR_NOT_STRING,
  ERROR_NOT_NUMBER,
  ERROR_DOES_NOT_MATCH,
  ERROR_NOT_ARRAY,
  ERROR_TOO_FEW,
  ERROR_TOO_MANY,
} from './constants.js';
import presetDefault from './plugins/presetDefault.js';

const should = chai.should();

describe('Test createSchema', function () {
  beforeEach(function () {
    this.Schema = createSchema(presetDefault);
  });
});
