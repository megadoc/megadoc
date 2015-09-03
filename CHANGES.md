**2.1.3**

- Fixed an issue with double-HTML escaping in links

**2.1.2**

- new markdown option: `discardIdPrefix`
- new UI option: `launchExternalLinksInNewTabs`
- external links are now highlighted by a small icon
- links and markdown headings will now contain only plain-text, no weird markdown artficats
- improved markdown linking

**2.1.1**

- support for custom link titles in the format: `[/path/to/entity Custom Title]()`
- new markdown option: `allowLeadingSlashInLinks`

**2.1.0**

- markdown no longer accepts multiple "collections"
- Utils#assetPath renamed to Utils#getAssetPath

**2.0.22**

- `cjs` plugin: module "static" methods (like `exports.something = function()`) are now linked to using the `.` symbol. For example: `[exports.something]()` instead of `[exports#something]()`

**2.0.21**

- `cjs` plugin now supports the `@memberOf` tag for documenting a module defined in a different file
- the CLI now accepts a `--plugin` parameter for filtering active plugins at run-time

**2.0.20**

- `git` plugin now accepts a `transform()` function that can post-process a 
  commit message's body for display in the Recent Activity section
- fixed an issue that was preventing hot items from being marked as such
- `git` team leaderboard now displays the member count as well as the age of 
  the team (based on their first and last commit timestamps)

**2.0.19**

- node 0.10 compatibility

**2.0.15**

- git-stat parser now works in bulk-mode, should no longer cause issues of spawning too many child processes
- CLI now accepts `--verbose` and `--debug` flags
- JS sources now display git authors

**2.0.14**

- When not using the Hash location, internals links are now intercepted to prevent the browser from refreshing the page when navigating.
- If `config.publicPath` is set to an empty string `""`, the router will start serving from `/` and will no longer complain that no route matches `/`.