# very-simple-schema

Bundle size: ~22.5 kB, ~5.5 kB gzipped

[![Build Status](https://travis-ci.org/apendua/very-simple-schema.svg?branch=master)](https://travis-ci.org/apendua/very-simple-schema)

## Like SimpleSchema but even simpler

This package implements an essential subset of [SimpleSchema](https://github.com/aldeed/node-simple-schema).
Unlike the original version it does not provide validation of Mongo selectors, nor does it allow you to define default and auto values.
Despite the limited functionality it may still be an interesting alternative for solving problems like:

- form validation - it integrates nicely with [redux-form](https://github.com/erikras/redux-form)
- function parameters validation, e.g. in remote api calls

## Instllation

```
npm install --save very-simple-schema
```

## Basic usage

```javascript
import { Schema } from 'very-simple-schema';

const Book = new Schema({
  author:    { type: String, nonEmpty: true }, // must be present and non-empty
  title:     { type: String, optional: true, nonEmpty: true }, // can be missing, but if present then must be non-empty
  abstract:  { type: String, optional: true }, // can be missing
  signature: { type: String }, // must be present, if present can be empty
});
```

## Gotchas

Unlkie in `SimpleSchema`, empty strings are accepted even if a property is required. The reason `SimpleSchema` treats them
differently is that `clean` method is being called on an object before it's validated. To emulate the original behavior
you can create a custom `Schema` class with different default behavior:
```javascript
import { createSchema, presetDefault } from 'very-simple-schema';

const Schema = createSchema({
  plugins: [
    ...presetDefault,
  ],
  emptyStringsAreMissingValues: true,
});
```

## Examples

```javascript
import { Schema } from 'very-simple-schema';

// a number between 0 and 10
new Schema(Number, { min: 0, max: 10 });

// array with at least element
Schema.arrayOf(Schema.any(), { minCount: 1 });

// object that contains anything
Schema.blackbox();
Schema.objectOf(Schema.any());

// either Yes or No
Schema.enum(['Yes', 'No']);

// can be one of the specified types
const Id = Schema.oneOf([String, Number]);

const User = new Schema({
  name: { type: String },
  email: { type: String, regEx: Schema.RegEx.Email, optional: true },
}, {
  // custom typeName can improve some error messages
  typeName: 'User',
});

const Book = new Schema({
  id: { type: Id },
  // type can reference another schema
  author: { type: User },
  // strings can be requested to be non empty
  title: { type: String, nonEmpty: true },
  abstract: { type: String },
  // array can be constructed with [] shortcut, maxCount refers to array lenght, max refers to string length
  chapters: { type: [String], '$.max': 128, maxCount: 10 },
}, { typeName: 'Book' });

const Library = new Schema({
  books: { type: [Book], maxCount: 1000 },
}, {
  typeName: 'Library',
});
```
