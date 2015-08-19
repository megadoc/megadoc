# Markdown tinydoc Plugin

Read markdown files and render them as HTML with syntax highlighting and linking.

## Configuration

```javascript
exports.markdown = {
  // Each "collection" will show up as a different tab in the navigation
  // bar.
  collections: [
    {
      // This is the routing path in the UI. So, "articles" will be 
      // visitable at http://your.tinydoc.com/articles
      name: 'articles',

      // The text of the navigation tab link.
      title: 'Articles',

      // Pattern (relative to tinydoc.conf.js) to match the source files.
      source: 'doc/articles/**/*.md',

      // An icon to use for the tab link.
      // See the `demo.html` file in the fonts directory for the available
      // icons which you can find at:
      // 
      //   https://github.com/tinydoc/tinydoc/tree/master/ui/app/css/fonts
      // 
      // Also, you can use a custom icon if you provide a custom css file.
      icon: 'icon-book',

      // Patterns to use to ignore source files.
      exclude: []
    }
  ],

  // Whether we should parse git statistics for the markdown files, like
  // last commit timestamp and the file authors.
  // 
  // You need to turn this on if you want to use the "Hot Items" feature.
  gitStats: true,
};
```