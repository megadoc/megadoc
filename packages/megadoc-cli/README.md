# Megadoc CLI

## Filtering with tags

It is possible to perform a partial compilation of only a subset of the sources
defined in your configuration file. The following command-line options help you
perform such filtering:

1. `-t, --only` for compiling only the sources with the specified tags
2. `-e, --exclude` for skipping the sources with the specified tags

Tags may be explicitly specified in the source declaration:

```javascript
config.sources = [{
  include: [ 'lib/*.js' ],
  tags: [ 'js', 'api' ]
}]
```

Or, when unspecified and an `id` is specified for a source, an implicit tag
of that id is created for you:

```javascript
config.sources = [{
  id: 'js',
  include: [ 'lib/*.js' ]
}]
// tags => [ 'js' ]
```

The exclusion tags have precedence over the inclusion tags. For example, the
following invocation will cause only "bar" to be compiled and "foo" to be
skipped even though it was specified in the whitelist:

```shell
megadoc build --only foo --only bar --exclude foo
```

**Examples**

Compile only the "js" source:

    megadoc build -t js

Compile everything except the "js" source:

    megadoc build -e js



