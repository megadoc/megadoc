# megadoc-plugin-dot

Draw [dot](http://www.graphviz.org/doc/info/lang.html) /
[Graphviz](https://en.wikipedia.org/wiki/Graphviz) diagrams right in your 
Markdown and present them as beautiful SVG graphs in the browser.

Here, catch!

```dot
[Pirate|eyeCount: Int|raid();pillage()|
  [beard]--[parrot]
  [beard]-:>[foul mouth]
]

[<abstract>Marauder]<:--[Pirate]
[Pirate]- 0..7[mischief]
[jollyness]->[Pirate]
[jollyness]->[rum]
[jollyness]->[singing]
[Pirate]-> *[rum|tastiness: Int|swig()]
[Pirate]->[singing]
[singing]<->[rum]

[<start>st]->[<state>plunder]
[plunder]->[<choice>more loot]
[more loot]->[st]
[more loot] no ->[<end>e]

[<actor>Sailor] - [<usecase>shiver me;timbers]
```

The plugin uses the wonderful [nomnoml](https://github.com/skanaar/nomnoml) 
package for converting code to SVG, so the syntax for using this plugin is
what nomnoml supports.

## Installation

```shell
npm install megadoc megadoc-plugin-markdown megadoc-plugin-dot
```

Add it to your list of plugins:

```javascript
// @file: megadoc.conf.js
exports.plugins = [
  require('megadoc-plugin-markdown')({
    source: '**/*.md'
  }),

  require('megadoc-plugin-dot')({})
];
```

## Usage

Inside your Markdown blocks, name your fenced code blocks with the `dot` 
language and type away!

    ```dot
    graph {
      A -> B;
      C -> B;
    }
    ```

Or, use UML:

    ```dot
    [<frame>My Model|
      [A] -> [B]
      [C] -> [B]
    ]
    ```

## Configuration

At this moment, the plugin doesn't really accept any config. By default, we
override the following "directives" to make the graphs more in-line with 
megadoc's color scheme:

- `#fontSize: 10`
- `#font: Monospace`
- `#lineWidth: 1`
- `#fill: #eaeaea` 
- `#stroke: #404244`

You can still override this on a per-graph basis in your ````dot` blocks.

## Credits

Big thanks to [nomnoml](https://github.com/skanaar/nomnoml) and
[dagre](https://github.com/cpettitt/dagre) for making this possible. Such 
beautiful work.