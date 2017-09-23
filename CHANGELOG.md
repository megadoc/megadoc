# Changelog

## 6.0.0

This is a very exciting release; a new model for representing the documents
rendered by megadoc is introduced called the [Corpus](). This model enables us
to analyze the database in a source-agnostic manner and provide many features
out-of-the-box such as automatic indexing, URI generation, and more!

Probably the more exciting part is that we're now able to pre-render the
documents to raw .html files, resulting in a greater level of accessibility and
runtime performance.

- (semver-minor) Now using [urijs](https://github.com/medialize/URI.js/) for
  manipulating URIs
- (semver-major) Generated URLs to internal documents are now relative
- (semver-major) `alias` configuration property has been changed to have the
  keys be the aliases themselves and the values are the paths of the nodes they
  point to
- (semver-minor) A suffix may be appended to document URLs, like `.html`, see
  [Config.format]()
- (semver-minor) HTMLSerializer is now able to pre-render and emit an html file
  for every document! A boon to SEO and No-JavaScript browsers. See
  [Config.emitFiles]() and [Config.emittedFileExtension]()
- (semver-minor) runtime config now contains a `pluginNames` list of the
  registered plugin names (inferred from the distributable JS files)
- ~~(semver-major) megadoc-plugin-static now requires a `title` config item~~
- ~~(semver-minor) megadoc-plugin-static now integrates with the corpus for
  indexing~~
- (semver-major) megadoc-plugin-static **has been dropped** - it was
  duplicating functionality that could be achieved using other plugins like
  [megadoc-plugin-markdown](). Now with the new layouting engine, it is
  possible to achieve the same effect.
- (semver-major) links to document entities are now represented as a hash-tag
  following the document's URI
- (semver-patch) `bin/devserver.sh` has been modified to use
  [connect](https://github.com/senchalabs/connect) with [webpack-hot-
  middleware](https://github.com/glenjamin/webpack-hot-middleware) for local
  development. Also, `/.local` file support has been dropped; the server will
  now automatically resolve which plugins to use and use the local versions of
  them
- (semver-patch) introduced a few localized hacks to react-router to make it
  ignore any suffixes in links (file extension)
- (semver-major) [megadoc-ui](): no longer using the HashLocation
- (semver-major) [megadoc-plugin-markdown]() will now discard file extensions
  by default (this will cause URLs to change unless you opt-out)
- (semver-major) [megadoc]() no longer accepts a `readme` config; use the
  markdown plugin with a rewrite for serving such a file
- (semver-major) [megadoc]() no longer accepts a `home` config for redirecting
- (semver-major) configuration property `publicPath` is no longer required and
  has been dropped
- (semver-major) [[megadoc-html-serializer]] configuration property
  `stylesheet` renamed to `styleSheet`
- (semver-major) configuration property `useHashLocation` has been removed
- (semver-major) [[megadoc-compiler/Config.sources]] no longer accepts
  `pattern`
- (semver-major) [[megadoc-compiler/Config.exclude]] is now a minimatch pattern
  like `include` instead of being regex patterns
- greatly improved error reporting

## 6.0.0-beta.13

Revisited the mess of CorpusTypes being prototypal objects which was the source
of so much pain. Now they're plain POJOs and we've changed the way UIDs are handled:

1. the assignment of UIDs is done explicitly by the creator (in our case, we do it at reduction time and tree composition time (for the namespace) in the compiler)
2. file paths are relativized upon reduction
3. the UIDs are (guaranteed to be) calculated based on the relativized file
   path (finally)

Also, the type checkers for all corpus type builders have been removed.

What has been fixed by those changes is, mainly, the tree merging routine so
watch works very reliably now, we only need to tackle the issue of emitted
document ordering now and it will be seamless.

## 6.0.0-beta.12

- [[megadoc-plugin-markdown]] Added a new option `titleOverrides` for
  overriding a title of a document (for use in the sidebar or spotlight, for
  example) while keeping its contents intact

## 6.0.0-beta.11

- [[megadoc-plugin-js]] Added a new option `inferNamespaces`  for controlling
  the behaviour of inferring namespaces from @module tags when `.` is used
- [[megadoc-html-serializer]] Added a new outlet SidebarLink that allows the
  user to define a link in the sidebar
- [[megadoc-html-serializer]] LinkOutlet now accepts "to" besides "href" to
  point to a document instead of a hard-coded URI

## 6.0.0-beta.10

[[megadoc-compiler]]'s scanSources will now apply a uniqueness filter to the
list. This allows users to specify a file more than once (the case when they're
using both a glob and a specific file path) but only the first entry will have
an effect.

For example:

```javascript
{
  sources: [
    {
      include: [
        'README.md',
        '*.md'
      ]
    }
  ]
}
// => include: [ 'README.md', 'a.md', 'b.md' ]
```

## 6.0.0-beta.9

- [[megadoc-plugin-js]]: added a new option `inferNamespaces`  for controlling
  the behaviour of inferring namespaces from @module tags when `.` is used
- [[jsdoc-parser-extended]]: implemented option `inferNamespaces`

## 5.0.0

- Markdown renderer now accepts a `anchorableHeadings: Boolean` option that
  controls whether the `<h{1..4} />` tags should have anchors. This affects
  the `renderMarkdown` routines passed to the `render` phase plugins.
- layout capabilities are no longer in core, instead we have two primary layout
  plugins; read more about this below
- a few of the compiler phases are now _parallelized_ which should greatly speed the compilation up if you're using many plugins

### New Feature - Spotlight

Spotlight is here! All the indexed documents have a chance to enter the Spotlight (engaged using `Ctrl+K` or `CMD+K`) and allow the user to quickly find the document they're looking for, or other related documents thanks to the [fuzzy search algorithm](https://github.com/jeancroy/fuzzaldrin-plus) it utilizes.

The Spotlight can operate in two useful modes:

- "Jump-to-Document" mode (default) in which the _corpus_ is composed of all the documents in the database
- "Jump-to-Symbol" mode, engaged by typing `@` as the first character of the query, or by using `Ctrl+.` or `CMD+.`, in which the corpus is the set of entities for that document (what this means depends on the document type; for a markdown article, this would be the headings, for a JS module, this would be its functions/properties, etc.)

The Spotlight also sports an intuitive keyboard navigation interface.

Currently supported plugins:

- [megadoc-plugin-js]()
- [megadoc-plugin-markdown]()
- [megadoc-plugin-react]()
- [megadoc-plugin-yard-api]()

### New Feature - Preview Tooltips

Anytime you're hovering over a link to an internal document, megadoc will now show a small tooltip that gives the reader a brief description of that document.

Very helpful for the times when you are not yet ready to leave the document you're currently reading, but have no idea what the referenced document is.

Currently supported plugins:

- [megadoc-plugin-js]()
- [megadoc-plugin-markdown]()
- [megadoc-plugin-react]()
- [megadoc-plugin-yard-api]()

### New Plugin - [megadoc-plugin-static]()

A new plugin for rendering static files at arbitrary URLs. Useful for rendering
landing pages for other plugins, like js/markdown/API.

### New Plugin - [megadoc-layout-single-page]()

A plugin for rendering all the content in a single page. Useful for small
projects orlibraries that consist of a bunch of files and a single API
reference.

Navigation is done using a static/fixed sidebar to the left.

### New Plugin - [megadoc-layout-multi-page]()

A plugin for rendering content in multiple pages. Primary navigation is 
achieved using a banner on the top, which supports arbitrary links and menus
of links, and sub-navigation using a sidebar.

### New Plugin - [megadoc-theme-qt]()

A new theme plugin that mimics [Qt docs](http://doc.qt.io). Very nice looking
for multi-page layouts.

### New Plugin - [megadoc-plugin-reference-graph]()

This plugin will build an internal graph of all the inter-document links in the database. When viewing a document, a list of external documents that talk about the current one will be displayed. This helps the reader find related articles and explore the document database.

Currently supported plugins:

- [megadoc-plugin-js]()
- [megadoc-plugin-markdown]()
- [megadoc-plugin-react]()

### Plugin API changes

**`megadoc.use` signature change**

The new signature is:

    megadoc.use(String, Function) -> void

And the function will be passed two arguments, the first is the plugin API,
and the second is the runtime configs registered for that plugin. This is for
convenience instead of having to reach out to `megadoc.getRuntimeConfigs(...)`
and is (currently) backwards compatible.

### Plugin Changes

#### [megadoc-plugin-js]()

- now using [babeljs](https://github.com/thejameskyle/babel-handbook/blob/master/translations/en/README.md) instead of recast for parsing code
- now supports an outlet `CJS::Landing` for rendering custom landing content
- the plugin no longer defines any links in the banner, hence the config parameters `config.navigationLabel` and `config.icon` were dropped. Instead, use the layout for defining links.
- Spotlight support for indexing modules and their properties, static methods and instance methods
- Tooltip Preview support for modules and all their entities. The tooltips should the document's type, its summary, and its corpus context.
- some style updates for better readability, especially when method parameters are involved
- interoperability with `megadoc-plugin-reference-graph` for generating a "Related Documents" list for modules
- new config param, `alias: Object<String,Array.<String>>` that supports explicit aliasing of modules. Very useful when you do not control the source code for those modules, or do not want to change it.

#### [megadoc-plugin-react]()

- now using [babeljs](https://github.com/thejameskyle/babel-handbook/blob/master/translations/en/README.md) instead of recast for parsing code

#### [megadoc-plugin-yard-api]()

- now supports an outlet `yard-api::Landing` for rendering custom landing content
- fixed a styling issue when scrolling or using anchors to API objects that caused the heading of those objects to be outside of the visible viewport

#### [megadoc-plugin-markdown]()

- the `<meta name="description">` is now modified to reflect the current article's summary. Very link when you're linking to megadoc documents in Slack or such that utilize the meta of the document when displaying those links.
- Spotlight support for indexing articles and their headings
- Spotlight Symbol-Jumping support for scanning and jumping between sections of the current article quickly
- Tooltip Preview support: the name of the article plus an estimated reading time in minutes

## 4.0.2

- [[megadoc-plugin-js]] turned off the debugging messages during parse. To turn them on, run megadoc with the environment variable `NODE_DEBUG=megadoc` exported.

## 4.0.1

- `megadoc-run` or `megadoc run` binary was restored to just `megadoc`
- `megadoc compile` is no longer a thing, use the `megadoc-compile` binary directly instead
- [[megadoc-plugin-js]] fixed a missing dependency in package.json

## 4.0.0

Pulled out the plugins that were previously in core into their own packages:

- `megadoc/plugins/cjs` is now in `megadoc-plugin-js`
- `megadoc/plugins/yard-api` is now in `megadoc-plugin-yard-api`
- `megadoc/plugins/markdown` is now in `megadoc-plugin-markdown`
- `megadoc/plugins/git` is now in `megadoc-plugin-git`

## 3.2.0

This patch was mainly concerned with file-size and run-time performance.

- jQuery and jQueryUI dependencies were dropped
- introduced a helper module for performing ScrollSpy functionality
- now using an internal `scrollIntoView` implementation
- now using an internal `resizable` implementation
- a new component `CollapsibleGroup` was extracted from the CJS plugin and is now in core UI

## 3.1.0

This patch introduces a Single-Page layout in which all the documents are 
displayed in a single page. This is very useful for small projects that do not 
need the navigation functionality in the regular, multi-page layout.

One can toggle this layout by either specifying `--layout="single-page"` on 
the command-line, or adding `layout: "single-page"` to the config file.

Only the CJS and Markdown plugins currently support the single-page layout.

**Changes**

- many performance improvements that were necessary in order to support the single-page rendering
- CJS: fixed an issue that was preventing the option `inferModuleIdFromFileName` from being respected
- CJS: can now link to modules using their relative file path
- CJS: instance and prototype properties are now displayed in the same group in the UI
- Core: externals links were incorrectly being highlighted in the UI
- fixed an issue with some markdown headings not being properly rendered to plain-text

**(BREAKING) Internal changes**

- megadoc's plugin registrar API has changed:
  + `registerRoutes` has been renamed to `addRoutes`
  + `registerOutletElement` was dropped; use `Outlet.add` directly instead

## 3.0.0

This release brings a whole lot of improvements to the robustness of megadoc's parsers, the UI, and runtime performance since we now do all the content rendering at compile-time instead.

Also, plugins have been revisited and it's now very easy to write a custom plugin and hook it into the system.

### Major changes to the plugin architecture

1. megadoc no longer configures plugins by itself, instead the caller configures each plugin manually.
2. a plugin is now any object that contains a `run` function
3. a plugin's UI runtime context is no longer saved in a separate file and exposed to an arbitrary global. Instead, a plugin registers its runtime config at write-time and it can later retrieve it at runtime through a custom API.

Thanks to #3 above, the same plugin can now be used more than once with different configs.

### Compilation changes

The compilation now has two more phases:

1. `index` in which all the linkable entities may be indexed
2. `render` in which all plugins are expected to render their content to something the UI can display (mainly: markdown -> html and linkifying everything in that content)

### Breaking plugin API changes

- the `compilation` object that was being passed to all stage processors has been dropped
- the `$inject` and `$defaults` properties are no longer supported. A plugin's runner will receive the compiler as the only argument, and from there it can reach whatever dependencies it requires.
- the `emitter` module is now the same as the compiler; just use `compiler.on()`.

### CLI changes

- the `megadoc` binary now supports two commands: `run` for generating the docs, and `compile` for compiling external plugins
- The output directory is now purged before writing unless you pass in `--no-purge` to `run`

### Internal API changes

- New utility helper for generating temporary files, [AssetUtils#writeTmpFile]()
- A new Assets API for plugins to register different kinds of assets they generate. See [Assets]().
- Markdown plugin now supports multiple instances

### CJS Plugin changes

- parsing was switched to an AST-based implementation using [recast](https://github.com/benjamn/recast). We still use [dox](https://github.com/tj/dox) for parsing docstrings.
- the plugin can now accept custom tag definitions, see [js__megadoc-plugin-js/Plugin#defineCustomTag]()
- the plugin can now accept custom processors for the following entities:
  + tags: [js__megadoc-plugin-js/Plugin#addTagProcessor]()
  + docs (the entire database): [js__megadoc-plugin-js/Plugin#addPostProcessor]()
  + recast node analyzer: [js__megadoc-plugin-js/Plugin#addNodeAnalyzer]()
  + dox docstring processor: [js__megadoc-plugin-js/Plugin#addDocstringProcessor]()
- much better `@lends` support:
  + you can now lend to a prototype: `@lends SomeObject.prototype`
  + or lend to an instance: `@lends exports`
  + or to an object: `@lends SomeObject`
- The following tags now support typeInfo (like name, type, and description):
  + `@throws`
  + `@example`

### New options

- new core option `motto: String` for tuning the motto/slogan next to the title
- new core option `metaDescription: String` for tuning the `<meta description />` tag
- new JS plugin option: `showSourcePaths: Boolean` for displaying the file path inside the module header

### Bugfixes

- Fixed an issue that was causing the compiler to silently fail when facing fatal errors during the write phase

## 2.3.0

- CJS parsing is now done using a custom AST-based parser instead of dox.
- UI: better JSX syntax highlighting
- new runtime option `--stats` for generating compile-time stats

## 2.2.4

- CJS: support for the `@alias` tag
- fixed an issue that was causing links not to be intercepted when running in history location mode

## 2.2.3

- more whitespace around the content panel

## 2.2.0

- compile-time indexing of link tokens, this allows for linting in the future
- (UI) global plugin hook `megadocReact.use` renamed to `megadoc.use`
- fixed an issue that was causing some markdown headings to be out-of-sync with their links/anchors
- fixed an issue that was causing CJS entities not to be reachable via sidebar links

Internal changes:

- UI tests can now be run using `/bin/test-ui.sh` or `karma start ui/karma.conf.js`
- `npm test` (and `npm publish`) will now fail if there are any eslint, core-test, or ui-test failures

## 2.1.5

- functional sidebar resizing using jQueryUI.resizable

## 2.1.4

- clicking a link with the CTRL or META keys held down will now work properly
- adjusted the class/module browser to show list bullets & squares to improve readability

## 2.1.3

- Fixed an issue with double-HTML escaping in links

## 2.1.2

- new markdown option: `discardIdPrefix`
- new UI option: `launchExternalLinksInNewTabs`
- external links are now highlighted by a small icon
- links and markdown headings will now contain only plain-text, no weird markdown artficats
- improved markdown linking

## 2.1.1

- support for custom link titles in the format: `\[/path/to/entity Custom Title]()`
- new markdown option: `allowLeadingSlashInLinks`

## 2.1.0

- markdown no longer accepts multiple "collections"
- Utils#assetPath renamed to Utils#getAssetPath

## 2.0.22

- `cjs` plugin: module "static" methods (like `exports.something = function()`) are now linked to using the `.` symbol. For example: `\[exports.something]()` instead of `\[exports#something]()`

## 2.0.21

- `cjs` plugin now supports the `@memberOf` tag for documenting a module defined in a different file
- the CLI now accepts a `--plugin` parameter for filtering active plugins at run-time

## 2.0.20

- `git` plugin now accepts a `transform()` function that can post-process a 
  commit message's body for display in the Recent Activity section
- fixed an issue that was preventing hot items from being marked as such
- `git` team leaderboard now displays the member count as well as the age of 
  the team (based on their first and last commit timestamps)

## 2.0.19

- node 0.10 compatibility

## 2.0.15

- git-stat parser now works in bulk-mode, should no longer cause issues of spawning too many child processes
- CLI now accepts `--verbose` and `--debug` flags
- JS sources now display git authors

## 2.0.14

- When not using the Hash location, internals links are now intercepted to prevent the browser from refreshing the page when navigating.
- If `config.publicPath` is set to an empty string `""`, the router will start serving from `/` and will no longer complain that no route matches `/`.