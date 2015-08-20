**2.0.14**

- When not using the Hash location, internals links are now intercepted to prevent the browser from refreshing the page when navigating.
- If `config.publicPath` is set to an empty string `""`, the router will start serving from `/` and will no longer complain that no route matches `/`.