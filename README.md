# tinydoc

tinydoc is a documentation scraper library that is able to scan and present documentation found in different sources, like CommonJS JavaScript modules, Markdown articles, and Rails API sources.

The scanning and rendering is done through plugins so it is possible to support more sources by writing new ones.

## Configuration

tinydoc will look for a file called `tinydoc.conf.js` in the CWD, or use the file specified using the `--config` command-line argument. The file is a regular JavaScript module. For example:

```javascript
module.exports = {
    outputDir: "./public/doc"
};
```

Of course, you can use any JavaScript libraries in your config file since it's run in Node.

For the actual configuration parameters, please refer to each plugin's README file found under `plugins/`.

## Extending

Like mentioned earlier, tinydoc can accept plugins that are run during the compilation of the docs. The compilation basically has two phases: a scanning phase, in which the sources are scraped and a _database_ is generated, and a writing phase in which the database is exported to some file which the UI can render.

The UI of tinydoc is written in React and also supports plugins. You are not forced to actually use React to write the UI for your plugin; any JavaScript module can do.

See the core plugin implementations for guidance. The scanners & writers can be found under `plugins/*` and their UIs under `ui/plugins/*`.