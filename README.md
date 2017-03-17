# very-simple-schema

Bundle size: ~21.1 kB, ~5.0 kB gzipped

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
  // must be present and non-empty
  author: { type: String, nonEmpty: true },
  // can be missing, but if present then must be non-empty
  title: { type: String, optional: true, nonEmpty: true },
  // can be missing
  abstract: { type: String, optional: true },
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
