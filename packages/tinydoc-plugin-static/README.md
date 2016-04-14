# tinydoc-plugin-static

A plugin for rendering static markdown, text, or HTML files into another
plugin's outlet. Useful for rendering README files and such.

## Usage

    npm install --save tinydoc tinydoc-plugin-static

### Stand-alone usage

Here's an example that will render the file at `doc/my-shiny-new-article.md` 
at the URL `/something`. Note that you are responsible for linking to that
file somwhere in the UI if you need to.

```javascript
// @file tinydoc.conf.js
module.exports = {
  plugins: [
    require('tinydoc-plugin-static')({
      url: '/something',
      source: 'doc/my-shiny-new-article.md'
    })
  ]
};
```

### Plugging into another plugin

Here's an example that will render the file at `doc/js/README.md` at the URL
`/js` which is handled by `tinydoc-plugin-js` (into its `CJS::Landing` outlet)
so that whenever you visit the JS landing page, we view that file.

```javascript
// @file tinydoc.conf.js

module.exports = {
  plugins: [
    require('tinydoc-plugin-js')({
      routeName: 'js',
      // ...
    }),

    require('tinydoc-plugin-static')({
      url: '/js',
      source: 'doc/js/README.md',
      outlet: 'CJS::Landing'
    })
  ]
};
```

## License

MIT