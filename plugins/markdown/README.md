# Markdown tinydoc Plugin

Read markdown files and render them as HTML with syntax highlighting and linking.

## Configuration

```javascript
exports.markdown = {
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
  exclude: [],

  // Whether to use the full (relative) folder path as a title for the folder,
  // as opposed to the single folder name.
  // 
  // For example:
  // 
  //     "/doc/api"       turns into "API"
  //     "/doc/api/usage" turns into "API - Usage"
  //     
  // While if it is set to `false`:
  // 
  //     "/doc/api"       turns into "API"
  //     "/doc/api/usage" turns into "Usage"
  // 
  fullFolderTitles: true,
  fullFolderTitleDelimiter: " - ",

  folders: [
    {
      path: 'relative/path/to/folder',
      title: 'Custom Title',
      series: true
    }
  ],

  // Whether we should parse git statistics for the markdown files, like
  // last commit timestamp and the file authors.
  // 
  // You need to turn this on if you want to use the "Hot Items" feature.
  gitStats: true,

  // Allow links to contain a leading "/".
  // 
  // For example:
  // 
  //     [/doc/foo.md]() 
  // 
  // Is equivalent to:
  // 
  //     [doc/foo.md]()
  allowLeadingSlashInLinks: true
};
```