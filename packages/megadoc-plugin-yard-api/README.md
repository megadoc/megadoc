# [YARD-API](http://amireh.github.io/yard-api/) megadoc Plugin

This plugin parses Rails controllers that are documented in the YARD-API format.

## Configuration

```javascript
// megadoc.conf.js

exports['yard-api'] = {
    /**
     * @property {String}
     *
     * The full command to use for generating the JSON YARD-API documents.
     * This will be run in the repository's root (dir of megadoc.conf.js).
     */
    command: "bundle exec rake yard_api",

    /**
     * @property {String}
     *
     * Pattern to find the generated JSON documents.
     */
    source: "public/doc/api/**/*.json",

    /**
     * @property {RegExp}
     *
     * Pattern to exclude any matched JSON source files.
     */
    exclude: null,

    /**
     * @property {Boolean}
     *
     * TODO: this is currenty dysfunctional.
     */
    showEndpointPath: false
};
```