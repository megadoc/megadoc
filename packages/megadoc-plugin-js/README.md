# tinydoc-plugin-js

[![Build Status](https://travis-ci.org/tinydoc/tinydoc-plugin-js.svg?branch=master)](https://travis-ci.org/tinydoc/tinydoc-plugin-js)

This plugin parses [JSDoc3](usejsdoc.org) annotated JavaScript source code files. The parser performs an AST-based analysis of the source files and it tries to infer what it can for you when you leave some parts blank (like function parameter names, property types and names, etc.)

## Usage

```bash
npm install tinydoc tinydoc-plugin-js
```

In your `tinydoc.conf.js`:

```javascript
exports.plugins = [
  require('tinydoc-plugin-js')({
    source: [ 'lib/**/*.js' ]
  })
];
```

## Configuration

See `lib/config.js`.

## Features: supported tags

- `@module`
- `@namespace`
- `@type`
- `@property`
- `@param`
- `@return`
- `@throws`
- `@example`
- `@interface`
- `@memberOf`
- `@protected`
- `@private`
- `@alias`
- `@lends`

_TODO_ explain these tags.

## Features: CommonJS support

Variant 1:

```javascript
var SomeModule = {};
module.exports = SomeModule;
```

Variant 2:

```javascript
var SomeModule = exports;
```

Variant 3:

```javascript
module.exports = {
    someProperty: 'a',
    someFunction: function() {
    }
};
```

Variant 4:

```javascript
module.exports = function someNamedFunction() {
};
```

## Features: module identification

The parser (and UI) will classify modules into several categories based on how they look like (and how, consequently, their usage is expected to be like.) 

Those categories are described below.

### Object Modules

A plain object that has no custom prototype and may contain a number of functions and properties.

```javascript
var SomeModule = {};

SomeModule.someStaticFunction = function() {
};

SomeModule.someStaticProperty = 'a';
```

### Function Modules

Variant 1 - a function declaration expression:

```javascript
function SomeModule() {}
```

Variant 2 - a function assigned to a variable:

```javascript
var SomeModule = function() {}
```

Variant 3 - a function with static properties:

```javascript
var SomeModule = function() {};

SomeModule.someStaticFunction = function() {};
SomeModule.someStaticProperty = 'a';
```

### Prototypal Modules (or classes, really)

Any Object that writes something to its `prototype` is considered a "prototype" module and is expected to be instantiated using the `new` keyword.

```javascript
function SomeModule() {
    this.someProperty = 'a';
}

SomeModule.prototype.someMethod = function() {};

// Static functions are supported too:
SomeModule.someStaticFunction = function() {};

// As well as static properties:
SomeModule.staticProp = 'a';
```

### ES6 Classes

```javascript
class SomeModule {
    static someStaticProperty = 5;
    static someStaticFunction() {
    }

    constructor() {
        this.someProperty = 'a';
    }

    someMethod() {
    }
}
```

### Factory Modules

This is probably the trickiest of the types to classify (and probably the most common in JavaScript), but the parser tries to do its best.

The rule it tries to follow is:

> A factory module is any function that returns an object or a function.

```javascript
function createSomeModule() {
    return {
        someProperty: 'a',
        someMethod: function() {}
    };
}
```

Variant 2 - assigning to some exported object.

```javascript
function createSomeModule() {
    let api = {};

    api.someProperty = 'a';
    api.someMethod = function() {}
    };

    return api;
}
```
