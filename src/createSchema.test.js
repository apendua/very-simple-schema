/* eslint-env jest */
import createSchema from './createSchema.js';
import presetDefault from './plugins/presetDefault.js';

describe('Test createSchema', () => {
  let testContext;

  beforeEach(() => {
    testContext = {};
  });

  beforeEach(() => {
    testContext.errorCreator = jest.fn();
    testContext.labelCreator = jest.fn();
    testContext.customErrors = jest.fn();
    testContext.getMessageTemplate = jest.fn();
    testContext.Schema = createSchema({
      plugins: presetDefault,
      defaultCustomErrors: testContext.customErrors,
      defaultLabelCreator: testContext.labelCreator,
      defaultErrorCreator: () => {
        testContext.errorCreator();
        return new Error('error');
      },
      defaultGetMessageTemplate: () => testContext.getMessageTemplate,
    });
  });

  describe('When validation fails', () => {
    beforeEach(() => {
      expect(() => {
        new testContext.Schema(Number).validate('');
      }).toThrowError();
    });
    test('should use custom error creator', () => {
      expect(testContext.errorCreator).toHaveBeenCalledTimes(1);
    });
    test('should use custom label creator', () => {
      expect(testContext.labelCreator).toHaveBeenCalledTimes(1);
    });
    test('should ask for custom errors', () => {
      expect(testContext.customErrors).toHaveBeenCalledTimes(1);
    });
    test('should ask for custom message tempaltes', () => {
      expect(testContext.getMessageTemplate).toHaveBeenCalledTimes(1);
    });
  });

  describe('Given a customized validator is used', () => {
    beforeEach(() => {
      testContext.errorCreator2 = jest.fn();
      testContext.labelCreator2 = jest.fn();
      testContext.customErrors2 = jest.fn();
      testContext.getMessageTemplateSpy = jest.fn();
      testContext.getMessageTemplate2 = (error) => {
        testContext.getMessageTemplateSpy();
        return () => error;
      };
    });

    beforeEach(() => {
      testContext.validate = new testContext.Schema(Number).validator({
        customErrors: testContext.customErrors2,
        labelCreator: testContext.labelCreator2,
        errorCreator: () => {
          testContext.errorCreator2();
          return new Error('error');
        },
        getMessageTemplate: testContext.getMessageTemplate2,
      });
      expect(() => {
        testContext.validate('');
      }).toThrowError('error');
    });
    test('should use custom error creator', () => {
      expect(testContext.errorCreator2).toHaveBeenCalledTimes(1);
    });
    test('should use custom label creator', () => {
      expect(testContext.labelCreator2).toHaveBeenCalledTimes(1);
    });
    test('should ask for custom errors', () => {
      expect(testContext.customErrors2).toHaveBeenCalledTimes(1);
    });
    test('should ask for custom message tempaltes', () => {
      expect(testContext.getMessageTemplateSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Given custom message templates are used', () => {
    beforeEach(() => {
      testContext.schema = new testContext.Schema({
        a: { type: Number },
        b: { type: Number },
      });
    });
    test('should throw a custom error message', () => {
      const errors = testContext.schema.getErrors({ a: 'a', b: 'b' });
      expect(testContext.schema.describe(errors, {
        getMessageTemplate: type => () => type,
      })).toEqual({
        a: testContext.Schema.ERROR_NOT_NUMBER,
        b: testContext.Schema.ERROR_NOT_NUMBER,
      });
    });
  });
});
