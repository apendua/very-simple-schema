/* eslint-env jest */
import Validator from './Validator';

describe('Test Validator', () => {
  it('creates an empty validator', () => {
    const validator = new Validator({});
    expect(validator.validate()).toBeFalsy();
  });
});
