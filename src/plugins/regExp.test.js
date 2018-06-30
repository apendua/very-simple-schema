/* eslint-env jest */
import pluginRegExp from './regExp.js';
import {
  ERROR_DOES_NOT_MATCH,
} from '../constants.js';
import { applyPlugins } from '../createCompiler';
import pluginAtomic from './atomic';

jest.mock('./atomic'); // use a simplified version of the plugin

describe('Test regExp plugin', () => {
  let testContext;

  beforeEach(() => {
    testContext = {};
  });

  beforeEach(() => {
    const compiler = applyPlugins({
      Schema() {},
      Validator(props) {
        Object.assign(this, props);
      },
    }, [
      pluginAtomic,
      pluginRegExp,
    ]);
    testContext.Schema = compiler.Schema;
    pluginRegExp.mixin(compiler.Schema);
    testContext.createValidate =
      (schemaDef, schemaOptions) =>
        compiler.compile({}, schemaDef, schemaOptions).validate;
  });

  describe('given I use a custom regExp', () => {
    beforeEach(() => {
      testContext.validate = testContext.createValidate(String, { regEx: /^a+/ });
    });
    test('should not accept an empty string', () => {
      expect(testContext.validate('')).toEqual({
        error: ERROR_DOES_NOT_MATCH,
        expected: 'match /^a+/',
      });
    });
    test('should not accept a non-matching string', () => {
      expect(testContext.validate('b')).toEqual({
        error: ERROR_DOES_NOT_MATCH,
        expected: 'match /^a+/',
      });
    });
    test('should accept a matching string', () => {
      expect(testContext.validate('aaa')).toBeFalsy();
    });
  });

  describe('given I use built-in RegEx.Email', () => {
    beforeEach(() => {
      testContext.validate = testContext.createValidate(String, { regEx: testContext.Schema.RegEx.Email });
    });
    test('should not accept an empty string', () => {
      expect(testContext.validate('')).toEqual({
        error: ERROR_DOES_NOT_MATCH,
        expected: testContext.Schema.RegEx.Email.to,
      });
    });
    test('should not accept an invalid email', () => {
      expect(testContext.validate('a@')).toEqual({
        error: ERROR_DOES_NOT_MATCH,
        expected: testContext.Schema.RegEx.Email.to,
      });
    });
    test('should accept a basic email', () => {
      expect(testContext.validate('a@b.c')).toBeFalsy();
    });
  });

  describe('given I use built-in RegEx.Id', () => {
    beforeEach(() => {
      testContext.validate = testContext.createValidate(String, { regEx: testContext.Schema.RegEx.Id });
    });
    test('should not accept an empty string', () => {
      expect(testContext.validate('')).toEqual({
        error: ERROR_DOES_NOT_MATCH,
        expected: testContext.Schema.RegEx.Id.to,
      });
    });
    test('should not accept a string that is too short', () => {
      expect(testContext.validate('abcdefghijkmnopq')).toEqual({
        error: ERROR_DOES_NOT_MATCH,
        expected: testContext.Schema.RegEx.Id.to,
      });
    });
    test(
      'should not accept a string that contains invalid characters',
      () => {
        expect(testContext.validate('0bcdefghijkmnopqr')).toEqual({
          error: ERROR_DOES_NOT_MATCH,
          expected: testContext.Schema.RegEx.Id.to,
        });
      },
    );
    test('should accept 17 alphabet characters', () => {
      expect(testContext.validate('abcdefghijkmnopqr')).toBeFalsy();
    });
  });
});

