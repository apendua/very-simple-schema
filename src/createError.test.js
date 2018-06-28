/* eslint-env jest */
import createError from './createError';

describe('Test createError', () => {
  it('creates an instance of Error', () => {
    expect(createError('Message')).toBeInstanceOf(Error);
  });

  it('creates error if message is a string', () => {
    expect(createError('Message').toString()).toEqual('Error: Message');
  });

  it('creates error if message is an array', () => {
    expect(createError(['Message']).toString()).toEqual('Error: Message');
  });

  it('searches for the first non-empty element', () => {
    expect(createError([null, 'Message']).toString()).toEqual('Error: Message');
  });

  it('creates error if message is an object', () => {
    expect(createError({ key: 'Message' }).toString()).toEqual('Error: Message');
  });
});
