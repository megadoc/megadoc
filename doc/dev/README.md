# Megadoc Developer's Handbook

Megadoc was built from the ground-up to be extensible. In fact, its core is
unable to do anything useful beyond orchestrating plugins.

What the core does provide is a compiler that is equipped with three primary
modules your plugin will interact with: the [Compiler@assets asset registry](),
the [serializer](Compiler@serializer) and the [corpus](Compiler@corpus).

## The compilation

A compilation is basically a serial process composed of separate phases.

### The `scan` phase

Sources are scraped and the corpus is populated.

### The `render` phase

This phase deals with compiling content into HTML, and generating links.

### The `write` phase

By this point, the corpus contains all the documents that are ready to be
rendered in a web browser. Our serializer now renders the corpus into the
output format, and we emit any assets we require at run-time in this phase.

## The UI

The UI of megadoc is written in [React](https://facebook.github.io/react/) and is also extensible through different means: outlets and full-fledged plugins.

_TODO_: UI plugin guide.
