# megadoc-regression-tests

Run megadoc against external "packages" and ensure it is still functional.

## Usage

- `bin/bootstrap` fetches the packages from their remote sources and stages
  them under `repos/`
- `bin/build` will run megadoc against every project using its config file
  found under `config/${name}.megadoc.conf.js`. The output is stored under
  `public/${name}`.
- `bin/test` will run the tests against the built documentation. The specs are
  defined under `spec/${name}.spec.yml` and are run by `spec/runner.js`.

## Defining a new package

Three things need to be done:

- add a new entry under `Packages` inside `/parameters.yml`
- add the configuration file under `config/${name}.megadoc.conf.js`
- add the spec file under `config/${name}.spec.yml`

Then use the scripts under `bin/` to test your package.