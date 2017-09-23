const R = require('ramda');
const chalk = require('chalk');
const columnify = require('columnify');
const program = require('commander');

program
  .option('--common')
  .option('--verbose')
  .option('--no-internal')
  .parse(process.argv)
;

const filter = R.pipe(
  R.sortBy(R.prop('name')),
  (
    program.common ? R.filter(x => x.packages.length > 1) : R.identity
  ),
  (
    program.internal ? R.identity : R.filter(x => !x.name.match(/^megadoc/))
  )
)

module.exports = function reportDependencies(depVersions) {
  const withVersionStrings = Object.keys(depVersions).reduce(function(list, depName) {
    const entries = depVersions[depName];
    const versions = entries.reduce(function(map, { version, package: packageName }) {
      if (!map[version]) {
        map[version] = { name: `${depName}@${version}`, packages: [] };
      }

      map[version].packages.push(packageName);

      return map;
    }, {})

    return list.concat(
      Object.keys(versions).map(key => versions[key])
    )
  }, [])

  console.log(
    columnify(filter(withVersionStrings), {
      columns: [ 'name', 'packages' ],
      preserveNewLines: true,
      config: {
        packages: {
          dataTransform: x => {
            const asList = x.split(',')

            return asList.map((line, index) => {
              return `${index+1}. ${line}\n`;
            }).join('')
          }
        },
        name: {
          dataTransform: x => chalk.yellow(chalk.bold(x))
        }
      }
    })
  )
}