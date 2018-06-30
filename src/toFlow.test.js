/* eslint-env jest */
import toFlow from './toFlow';
import Schema from './Schema';

describe('Test toFlow', () => {
  test('generates flow type from number literal', () => {
    const schema = new Schema(1);
    expect(toFlow(schema.compiled)).toEqual('1');
  });

  test('generates flow type from string literal', () => {
    const schema = new Schema('a');
    expect(toFlow(schema.compiled)).toEqual('"a"');
  });

  test('generates flow type from boolean literal', () => {
    const schema = new Schema(true);
    expect(toFlow(schema.compiled)).toEqual('true');
  });

  test('generates flow type from null literal', () => {
    const schema = new Schema(null);
    expect(toFlow(schema.compiled)).toEqual('null');
  });

  test('generates flow type from undefined literal', () => {
    const schema = new Schema(undefined);
    expect(toFlow(schema.compiled)).toEqual('void');
  });

  test('generates flow type from number', () => {
    const schema = new Schema(Number);
    expect(toFlow(schema.compiled)).toEqual('number');
  });

  test('generates flow type from string', () => {
    const schema = new Schema(String);
    expect(toFlow(schema.compiled)).toEqual('string');
  });

  test('generates flow type from boolean', () => {
    const schema = new Schema(Boolean);
    expect(toFlow(schema.compiled)).toEqual('boolean');
  });

  test('generates flow type from Date', () => {
    const schema = new Schema(Date);
    expect(toFlow(schema.compiled)).toEqual('Date');
  });

  test('generates flow type from maybe', () => {
    const schema = new Schema(Boolean, { maybe: true });
    expect(toFlow(schema.compiled)).toEqual('?boolean');
  });

  test('generates flow type from array of atomic types', () => {
    const schema = new Schema([String]);
    expect(toFlow(schema.compiled)).toEqual('Array<string>');
  });

  test('generates flow type from hash', () => {
    const schema = Schema.objectOf(Number);
    expect(toFlow(schema.compiled)).toEqual('{ [string]: number }');
  });

  test('generates flow type from one of', () => {
    const schema = Schema.oneOf([Number, String, null]);
    expect(toFlow(schema.compiled)).toEqual('number | string | null');
  });

  test('generates flow type from tuple', () => {
    const schema = Schema.tuple([Number, String, Date]);
    expect(toFlow(schema.compiled)).toEqual(`\
[
  number,
  string,
  Date,
]`);
  });

  test('generates flow type from hash with nested object', () => {
    const schema = Schema.objectOf({ x: Number, y: Number });
    expect(toFlow(schema.compiled)).toEqual(`\
{ [string]: {|
  x: number,
  y: number,
|} }`);
  });

  test('generates flow type from array of objects', () => {
    const schema = new Schema([{ x: Number, y: Number }]);
    expect(toFlow(schema.compiled)).toEqual(`\
Array<{|
  x: number,
  y: number,
|}>`);
  });

  test('generates flow type from simple object', () => {
    const schema = new Schema({
      x: Number,
      y: Number,
    });
    expect(toFlow(schema.compiled)).toEqual(`\
{|
  x: number,
  y: number,
|}`);
  });

  test('generates flow type from object with optional properties', () => {
    const schema = new Schema({
      x: { type: Number, optional: true },
      y: Number,
    });
    expect(toFlow(schema.compiled)).toEqual(`\
{|
  x?: number,
  y: number,
|}`);
  });

  test('generates flow type for object that allows additional properties', () => {
    const schema = new Schema({
      x: Number,
      y: Number,
    }, {
      sealed: false,
    });
    expect(toFlow(schema.compiled)).toEqual(`\
{
  x: number,
  y: number,
}`);
  });

  test('generates flow type for object that contains nested objects', () => {
    const schema = new Schema({
      a: Number,
      b: new Schema({
        x: Number,
        y: Number,
      }),
    }, {
      sealed: false,
    });
    expect(toFlow(schema.compiled)).toEqual(`\
{
  a: number,
  b: {|
    x: number,
    y: number,
  |},
}`);
  });
});
