def('JSModule', {
  base: 'Document',
  fields: {
    properties: t.shape({
      isModule: t.boolean,
      receiver: t.string,
      aliases: t.arrayOfType(t.string),
      loc: t.shape({
        start: t.shape({
          line: t.number,
          column: t.number,
        }),

        end: t.shape({
          line: t.number,
          column: t.number,
        })
      }),

      ctx: t.shape({
        type: t.string
      })
    })
  }
});

def('JSEntity', {
  base: 'DocumentEntity',
  fields: {
    properties: t.shape({
      isModule: t.boolean,
      receiver: t.string,
      aliases: t.arrayOfType(t.string),
      ctx: t.shape({
        type: t.oneOf([
          K.TYPE_OBJECT,
          K.TYPE_DEFAULT_EXPORTS,
          K.TYPE_FACTORY,
          K.TYPE_FUNCTION,
          K.TYPE_CLASS,
          K.TYPE_ARRAY,
          K.TYPE_LITERAL,
          K.TYPE_UNKNOWN,
        ]),

        symbol: t.oneOf([ '#', '@', '.', undefined ]),

        scope: t.oneOf([
          K.SCOPE_UNSCOPED,
          K.SCOPE_INSTANCE,
          K.SCOPE_PROTOTYPE,
          K.SCOPE_FACTORY_EXPORTS,
        ]),

        // K.TYPE_FUNCTION
        params: t.arrayOfType(t.shape({
          name: t.string,
          defaultValue: t.any,
        })),

        // K.TYPE_LITERAL
        value: t.any,

        // K.TYPE_OBJECT
        properties: t.array,

        // K.TYPE_ARRAY
        values: t.array,
      })
    })
  }
});
