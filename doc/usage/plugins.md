# Plugins

The Megadoc compiler is extensible and in fact it hardly does much on its own
without the help of plugins. Plugins are responsible for scanning source files
to extract documentation from them and for producing human-readable documents.

Plugins are categorized into two classes: [[content processors |
./plugins.md#processors]] and [[decorators | ./plugins.md#decorators]].

## Processors

A content processor (or processor for brevity) is responsible for extracting
documentation from a specific type of source file. For example, a markdown
processor would render content found in `.md` files while a javascript
processor would extract documentation from comment annotations and syntax.

A processor operates on the set of files defined by the [[`source` |
packages/megadoc-compiler/lib/config.js#~Source]] to which it is applied. For
any one source, exactly one processor must be specified.

To use a processor plugin, it should be specified as the `processor` option of
a `source`:

```javascript
{
  sources: [
    {
      include: [ '**/*.md' ],
      processor: 'megadoc-plugin-markdown'
    }
  ]
}
```

### Available processors

- [[packages/megadoc-plugin-js/README.md]]
- [[packages/megadoc-plugin-lua/README.md]]
- [[packages/megadoc-plugin-markdown/README.md]]
- [[packages/megadoc-plugin-yard-api/README.md]]

## Decorators

Decorators are plugins that do not by themselves produce documentation, instead
they "decorate" documents produced by a processor with additional meta data.

A good example of a decorator is one that extracts source-file statistics from
a git repository to provide us with the modification timestamps as well as the
list of authors who wrote each file. Megadoc is then able to utilize that
meta-data at render-time and display it.

To use a decorator plugin, you may specify it in the relevant source:

```javascript
{
  sources: [
    {
      include: [ '**/*.md' ],
      processor: 'megadoc-plugin-markdown',
      decorators: [
        'megadoc-git-stats'
      ]
    }
  ]
}
```

Any number of decorator plugins may be attached to any one source.

### Available decorators

- [[packages/megadoc-git-stats/README.md]]
- [[packages/megadoc-html-dot/README.md]]
- [[packages/megadoc-plugin-reference-graph/README.md]]
