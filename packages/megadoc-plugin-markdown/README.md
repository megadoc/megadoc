# megadoc-plugin-markdown

Read markdown files and render them as HTML with syntax highlighting and linking.

## Installation

    npm install megadoc megadoc-plugin-markdown

## Usage

Let's assume we have a source folder like this:

```text
|-- docs/usage.md
|-- docs/help.md
| README.md
```

We can build up a plugin to parse these files as such:

```javascript
// @file: megadoc.conf.js
module.exports = {
  plugins: [
    require('megadoc-plugin-markdown')({
      id: 'articles',
      source: [ 'README.md', 'docs/**/*.md' ]
    })
  ]
}
```

See [megadoc-plugin-markdown.Config Config]() for the available settings.