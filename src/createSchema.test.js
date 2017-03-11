/* eslint-env mocha */
/* eslint no-unused-expressions: "off" */
/* eslint prefer-arrow-callback: "off" */
import chai from 'chai';
import createSchema from './createSchema.js';
import {
  ERROR_REQUIRED,
  ERROR_NOT_ALLOWED,
  ERROR_NO_MATCH,
  ERROR_EXPECTED_STRING,
  ERROR_EXPECTED_NUMBER,
  ERROR_BAD_FORMAT,
  ERROR_EXPECTED_ARRAY,
  ERROR_MIN_COUNT,
  ERROR_MAX_COUNT,
} from './constants.js';
import presetDefault from './plugins/presetDefault.js';

const should = chai.should();

describe('Test createSchema', function () {
  beforeEach(function () {
    this.Schema = createSchema(presetDefault);
  });
});
