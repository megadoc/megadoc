# Megadoc Developer's Handbook

Megadoc was built from the ground-up to be extensible. In fact, its core is
unable to do anything useful beyond orchestrating plugins.

What the core does provide is a compiler that is equipped and configured 
with several modules your plugin can interact with:

- the [Compiler@assets asset registry](/lib/Compiler.js#L75) for registering static assets for serving at run-time, like images and free-form JS scripts (perhaps a Google Analytics snippet)
- the [Compiler@linkResolver link-resolver](/lib/Compiler.js#L98) for "linkifying" blocks of documentation
- the [Compiler@renderer renderer](/lib/Compiler.js#L108) for rendering Markdown to HTML
- the [Compiler@corpus corpus](/lib/Compiler.js#L90) instance for the current compilation

In this guide, we'll create a very basic plugin that reads Markdown files and
presents them in the UI.

Before we start, make sure you have your [./env.md local environment](./env.md) set up 
and ready to start developing plugins.

## Plugin file structure

The following is the required plugin file-structure - most of the development
tools expect plugins to be structured this way so it's good to stick to the
conventions for things to work out.

For a plugin named "X", the package must be named one of the following based on
what it is:

- `megadoc-theme-x` if it's a theme plugin
- `megadoc-serializer-x` if it's a serializer (like a JSON serializer, `man`, etc.)
- `megadoc-plugin-x` otherwise (most common)

```shell
# megadoc-plugin-x
| + dist
|   | - megadoc-plugin-x.js
| + lib
|   | - config.js
|   | - index.js
| + ui
|   | + css/
|   | + components/
|   | + outlets/
|   | - index.js
|   | - index.less
| - package.json
| - README.md
```

- `dist/` is optional unless you have any UI scripts, then it's mandatory. It
  contains the compiled UI scripts for your plugin which are generated using
  [/cli/megadoc-compile](/cli/megadoc-compile).
- `lib/` contains the plugin implementation files.
- `lib/config.js` must contain all the configuration parameters your plugin accepts and they should be documented
- `lib/index.js` is the entry point for your plugin - the one that the users will be using so it should export a function
- `ui/` contains the plugin HTML UI implementation files.
- `package.json` must contain a `peerDependency` on the version of megadoc you're working with

For convenience, you can also clone the [megadoc-plugin-skeleton](/packages/megadoc-plugin-skeleton) 
package which has this wrapped up for you.

Okay, time to get started!

## Defining a plugin

The only requirement for a plugin to function is to expose a `#run` function
that accepts a single argument; the [Compiler](/lib/Compiler.js) instance.

```javascript
// @file: megadoc-plugin-markdown/lib/index.js
module.exports = function MarkdownPlugin(userConfig) {
  return {
    run: function(compiler) {
    }
  }
}
```

Within the `#run` routine, you have the chance to define any state you may
need, accept user configuration, validate the config, and so on.

Let's get to what a regular Megadoc compilation looks like.

## The compilation

A compilation is basically a serial process composed of separate phases.

```dot
# direction: right
[scan] -> [render]
[render] -> [write]
```

Your plugin may hook into any of these stages using the compiler's
[Compiler#on]() routine.

```javascript
{ // ...
  run: function(compiler) {
    compiler.on('some-hook', function() {
      // ...
    })
  }
}
```

From now on, the example snippets will assume we're inside the definition of
the `#run` routine for brevity.

### The `scan` phase

The scan phase is where we analyze source files and populate the corpus with
documents. You'd usually use a source analyzer (like for generating an AST or 
some form of structured output from the source files your plugin covers) and 
then _reduce_ those structures into corpus nodes.

Check out the [./using-the-corpus.md](./using-the-corpus.md) guide for more information on 
reduction.

#### Example: a basic Markdown scanner

```javascript
var config = {
  id: 'articles',
  sources: '**/*.md',
  exclude: [ /vendor/ ]
};

compiler.on('scan', function(done) {
  // shortcut to access the CorpusTypes@builders
  var b = compiler.corpus.b;

  // Build the list of file paths we'll be reading from. See note below on
  // utilizing the AssetUtils helpers here.
  var filePaths = compiler.utils.globAndFilter(config.sources, config.exclude);

  // Create our T.Namespace node:
  var namespaceNode = b.namespace({
    id: config.id,
    name: 'megadoc-plugin-markdown',

    // Create a T.Document node for every Markdown document we scan:
    documents: filePaths.map(function(filePath) {
      return b.document({
        id: path.basename(filePath),
        filePath: filePath,
        properties: {
          contents: fs.readFileSync(filePath, 'utf-8')
        }
      });
    });
  });

  // Finally, we register our namespaceNode with the corpus
  compiler.corpus.add(namespaceNode);
});
```

The [AssetUtils](/lib/AssetUtils.js) contains a number of helpers for dealing with source files
and emitted files. The compiler has an instance of that factory configured for
the current compilation which you can access using
[Compiler@utils compiler.utils](/lib/Compiler.js#L85).

Okay! Now we have scanned the markdown files the user had listed and built a 
set of abstract representations of them for use in the Corpus. However, we 
didn't really do any form of analysis on the sources; we could've inferred a
title for each document, counted the number of words, etc.

For the purposes of our tutorial, we'll let go of these details and focus
on what the process generally looks like. What we need to do now is to
linkify the contents of those documents and render the markdown source to HTML.

On to the render phase...

### The `render` phase

This phase deals with two things: converting internal links found in content to
valid links and compiling that content down to HTML.

Megadoc doesn't know where your content is, or how to get to it, but you do. 
So, it exposes a few helpers that you can use to perform these tasks. Let's
see:

```javascript
compiler.on('render', function(md, linkify, done) {
  done();
});
```
/Users/lwilkins/sandbox/megadoc/lib/HTMLSerializer__LinkResolver.js
The [Renderer#renderMarkdown md](/lib/Renderer.js#L72) parameter will compile Markdown to HTML, 
while [LinkResolver#linkify linkify](/lib/HTMLSerializer__LinkResolver.js#L96) will convert links to internal documents
to either: Markdown (the default), assuming you will render the source into 
HTML, or to HTML directly[1].

Following up with our example plugin:

```javascript
compiler.on('render', function(md, linkify, done) {
  // Grab on to the T.Namespace node we registered with the Corpus earlier in
  // #scan:
  var namespaceNode = compiler.corpus.get(config.id);
  
  namespaceNode.documents.forEach(function(documentNode) {
    // Grab the source, raw Markdown we got in our scan phase:
    var sourceContents = documentNode.properties.contents;

    // Linkify it:
    var linkedContents = linkify({
      text: sourceContents,
      contextNode: documentNode
    });

    // Render it to HTML:
    var htmlContents = md(linkedContents);

    // Finally, attach the rendered version to our documentNode so we can use 
    // it in the UI[2]:
    documentNode.properties.html = htmlContents;
  });

  done();
});
```

Finally, it's worth noting here that the link "schemes" (i.e. the notation 
used to define an internal link) [./defining-link-schemes.md can be customized](./defining-link-schemes.md) to support different schemes, like a MediaWiki scheme (`\[[Object]]` or 
`\[[Custom Text | Object]]`).

This may be necessary if you're parsing docs from an external source, maybe 
like [YARD](http://yardoc.org/) for Ruby which uses a different notation for 
links and you can't require users to change all their docs - instead, you tell 
Megadoc how to parse these links and support will be added transparently.

[1]: This is useful if you have links found in blocks that are already HTML, or
should not be passed through the Markdown renderer.

[2]: You can choose to overwrite `properties.contents` to save space if you do 
not need the source any longer.

### The `write` phase

By this point, the corpus contains all the documents that are ready to be
rendered by a web browser. Our [HTMLSerializer serializer](/lib/HTMLSerializer.js) now renders the 
corpus into the output format, and we emit any assets we may require at 
run-time.

The write phase signature is as such:

```javascript
compiler.on('write', function(done) {
  done(); // make SURE you call done!
});
```

In our example, we do not have any assets to write (yet). We will come back to
this phase later when we have developed our UI and are ready to integrate it
into Megadoc's HTML UI.

## The UI

We're now ready to get to the UI of our plugin - present the Markdown documents
we've rendered as beautiful HTML.

The UI of megadoc is written in [React](https://facebook.github.io/react/) and is extensible through different means which is covered extensively in
[./building-interfaces.md](./building-interfaces.md).

## Where to go from here

