# very-simple-schema

Bundle size: ~18.8 kB, ~4.6 kB gzipped

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
