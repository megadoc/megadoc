# tinydoc

tinydoc is a documentation generation tool that is able to scan, parse, and present documentation found in different sources in a coherent UI. Example sources are JavaScript modules, Markdown articles, and Rails APIs.

## Motivation

- Write anywhere: docs may live inside the main codebase (right next to your code) or outside; the tool shouldn't care. This caters for people who don't like to look up documentation online and would rather find everything in their code editor, and for others who either do not have the code base, or prefer reading in a browser.
- Aggregate, linkable docs: the ability to inter-link entities regardless of the source; like pointing to a JavaScript module from a markdown article.
- Easy deployment: an .html file that requires no webserver to power, so that one can easily host the docs anywhere (like on GitHub Pages or any static server.)

## Installation

tinydoc requires [Node.js](http://nodejs.org) to run and you can get it through NPM by running:

```
npm install -g tinydoc
```

Now run `tinydoc --help` for more information.

## Configuration

tinydoc will look for a file called `tinydoc.conf.js` in the CWD, or use the file specified using the `--config` command-line argument. The file is a regular JavaScript module. For example:

```javascript
module.exports = {
    outputDir: "./public/doc"
};
```

For the actual configuration parameters, please refer to each plugin's README file found under `plugins/`.

## Extending

tinydoc accepts plugins that can hook into the compilation of the docs. The compilation is composed of several phases:

1. the scanning phase: sources are scraped and a _database_ is generated
2. the indexing phase: a registry of all linkable entities is generated
3. the rendering phase: all non-HTML content is converted to HTML and links are resolved 
4. the writing phase: the database, now containing rendered content, is exported to some file which the UI can use to render its stuff

The UI of tinydoc is written in [React](https://facebook.github.io/react/) and is also extensible through different means: outlets and full-fledged plugins.

_TODO_: UI plugin guide.
