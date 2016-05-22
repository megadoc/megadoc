# Using the [Corpus](/lib/Corpus.js)

## Tuning the indexer

By default, the indexer will index a node using its `uid` and its `filePath`
values. However, it is possible to specify additional fields to index the node 
by, or change the default fields by overriding the `indexFields` property.

### `@indexFields`

This property is supported on every node. The indexer will search for this
property starting from the source node all the way up to the root [T.Corpus]() 
node in the tree - which has the default index field specification. This 
resolving behavior allows for greater control and fine-tuning of what nodes 
should be indexed by.

Fields that reside on the node itself are referenced by their name with a `$` 
prefix, like `$uid` or `$filePath`. Fields that omit the `$` are expected to
reside in the `properties` map. It is not allowed to index by `meta` fields.

The value for the index field must be either a string or an array of strings.
In the case of the latter, all values will be used as indices.

### Specifying index fields

For example, suppose we have an `alias` property that we'd like to index a
document by:

```javascript
b.namespace({
  id: 'A',
  documents: [
    b.document({
      id: 'X',
      indexFields: [ '$uid', 'alias' ],
      properties: {
        alias: 'F'
      }  
    })
  ]
})
```

Now, `A/X` can be resolved by any of: `A/X`, `A/F`, `F`. `X` will also resolve
to `A/X` if we are within the namespace `A`.

> Keep in mind that all indices beside the one generated from the `uid` field
> are _public_; they will be visible to all other documents in the corpus.
> 
> If you need to scope custom indices, you are responsible for doing so.

### Skipping indexing altogether

It is possible to remove a node from the index by specifying an empty
`indexFields` array, a la:

```javascript
b.document({
  id: 'bar'
  indexFields: []
});
```

This way, linking to `bar` will not resolve with that document.

