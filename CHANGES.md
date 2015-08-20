**2.0.15**

- git-stat parser now works in bulk-mode, should no longer cause issues of spawning too many child processes
- CLI now accepts `--verbose` and `--debug` flags
- JS sources now display git authors

**2.0.14**

- When not using the Hash location, internals links are now intercepted to prevent the browser from refreshing the page when navigating.
- If `config.publicPath` is set to an empty string `""`, the router will start serving from `/` and will no longer complain that no route matches `/`.