#!/usr/bin/env node

const { utils, Compiler: C } = require('megadoc-compiler');
const { asyncEnsure } = utils;

const compiler = C.create({
  purge: false
})

C.boot(compiler, function(err, state) {
  if (err) {
    throw err;
  }
  else {
    C.start(compiler)(state, function(startErr, started) {
      if (startErr) {
        throw startErr;
      }
      else {
        asyncEnsure(C.stop)(C.compileAndEmit(compiler))(started, function(compileErr, compiled) {
          if (compileErr) {
            throw compileErr;
          }
          else {
            console.log(compiled)
          }
        })
      }
    })
  }
})