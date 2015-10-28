# Changelog

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

- tinydoc's plugin registrar API has changed:
  + `registerRoutes` has been renamed to `addRoutes`
  + `registerOutletElement` was dropped; use `Outlet.add` directly instead

## 3.0.0

This release brings a whole lot of improvements to the robustness of tinydoc's parsers, the UI, and runtime performance since we now do all the content rendering at compile-time instead.

Also, plugins have been revisited and it's now very easy to write a custom plugin and hook it into the system.

### Major changes to the plugin architecture

1. tinydoc no longer configures plugins by itself, instead the caller configures each plugin manually.
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

- the `tinydoc` binary now supports two commands: `run` for generating the docs, and `compile` for compiling external plugins
- The output directory is now purged before writing unless you pass in `--no-purge` to `run`

### Internal API changes

- New utility helper for generating temporary files, [Utils#writeTmpFile]()
- A new Assets API for plugins to register different kinds of assets they generate. See [Assets]().
- Markdown plugin now supports multiple instances

### CJS Plugin changes

- parsing was switched to an AST-based implementation using [recast](https://github.com/benjamn/recast). We still use [dox](https://github.com/tj/dox) for parsing docstrings.
- the plugin can now accept custom tag definitions, see [Plugins.CJS#defineCustomTag]()
- the plugin can now accept custom processors for the following entities:
  + tags: [Plugins.CJS#addTagProcessor]()
  + docs (the entire database): [Plugins.CJS#addPostProcessor]()
  + recast node analyzer: [Plugins.CJS#addNodeAnalyzer]()
  + dox docstring processor: [Plugins.CJS#addDocstringProcessor]()
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
- (UI) global plugin hook `tinydocReact.use` renamed to `tinydoc.use`
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

- support for custom link titles in the format: `[/path/to/entity Custom Title]()`
- new markdown option: `allowLeadingSlashInLinks`

## 2.1.0

- markdown no longer accepts multiple "collections"
- Utils#assetPath renamed to Utils#getAssetPath

## 2.0.22

- `cjs` plugin: module "static" methods (like `exports.something = function()`) are now linked to using the `.` symbol. For example: `[exports.something]()` instead of `[exports#something]()`

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