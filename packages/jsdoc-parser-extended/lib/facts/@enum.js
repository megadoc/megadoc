// http://usejsdoc.org/tags-enum.html
//
// > The @enum tag documents a collection of static properties whose values are
// > all of the same type.
//
// Then a little later:
//
// > Also you can override the type
//
// Fuck this shit.
module.exports = {
  syntax: {
    driver: 'jsdoc',
    string: '@enum',
    banned: true,
  },
}