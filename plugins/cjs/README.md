# CommonJS tinydoc Plugin

This plugin parses [JSDoc3](usejsdoc.org) annotated source code files using the [Dox](https://github.com/tj/dox) parser.

## Configuration

```javascript
module.exports = {
  cjs: {

    /**
     * @property {String}
     * 
     * The source files to parse.
     */
    source: '**/*.js',

    /**
     * @property {RegExp}
     *
     * A pattern to exclude source files.
     */
    exclude: null,

    /**
     * @property {Boolean}
     *
     * Turn this on if you want to use the file's folder name as its namespace.
     * This will be used only if the source file defines no @namespace tag.
     */
    useDirAsNamespace: true,

    /**
     * @property {Function} classifyDoc
     *
     * You can implement this function if you need to perform any custom
     * decoration or transformation on a source file's doc entry.
     *
     * The parameter you receive is a Dox construct. Please refer to its
     * documentation for how that looks like.
     */
    classifyDoc: function(doc) {
    },

    /**
     * @property {Boolean}
     *
     * Turn this on if you want to extract git stats for the files, like
     * the last commit timestamp and the authors of each file.
     *
     * This is needed if you want to use the "Hot Items" feature.
     */
    gitStats: true
  }
};
```

## CommonJS support

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

## Recognized Module Types

### Object Modules

```javascript
var SomeModule = {};

SomeModule.someStaticFunction = function() {
};

SomeModule.someStaticProperty = 'a';
```

### Function Modules

Variant 1:

```javascript
var SomeModule = function() {
};

SomeModule.someStaticFunction = function() {
};

SomeModule.someStaticProperty = 'a';
```

Variant 2:

```javascript
function SomeModule() {
}

SomeModule.someStaticFunction = function() {
};

SomeModule.someStaticProperty = 'a';
```

### Prototypal Modules

```javascript
function SomeModule() {
    this.someProperty = 'a';
}

SomeModule.prototype.someMethod = function() {

};

SomeModule.someStaticFunction = function() {

};

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

```javascript
function createSomeModule() {
    return {
        someProperty: 'a',
        someMethod: function() {}
    };
}
```

Variant 2: assigning to some exported object.

```javascript
function createSomeModule() {
    let api = {};

    api.someProperty = 'a';
    api.someMethod = function() {}
    };

    return api;
}
```
