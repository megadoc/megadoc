var path = require('path');
var spawn = require('child_process').spawn;
var massGitBlamePath = path.resolve(__dirname, 'parseGitStats__massGitBlame.sh');

function Parser() {
  this.entries = [];
}

Parser.prototype.buildContext = function() {
  return {
    file: null,
    names: [],
    mails: [],
    times: []
  };
};

Parser.prototype.eat = function(chunk) {
  chunk.split("\n").forEach(this.consumeLine.bind(this));
};

Parser.prototype.consumeLine = function(line) {
  var scanner;

  if ((scanner = line.match(/file: (.*)/))) {
    if (this.context) {
      this.save();
    }

    this.context = this.buildContext();
    this.context.file = scanner[1];
  }
  else if ((scanner = line.match(/committer (.*)/))) {
    this.context.names.push(scanner[1].trim());
  }
  else if ((scanner = line.match(/committer-mail <(.*)>/))) {
    this.context.mails.push(scanner[1].trim());
  }
  else if ((scanner = line.match(/committer-time (.*)/))) {
    this.context.times.push(scanner[1].trim());
  }
};

Parser.prototype.save = function() {
  var context = this.context;
  var entry = {
    filePath: context.file,
    lastCommittedAt: parseInt(context.times.sort().reverse()[0], 10),
    committers: context.names.reduce(function(committers, name, index) {
      committers[context.mails[index]] = name;
      return committers;
    }, {})
  };

  this.entries.push(entry);
  this.context = null;
};

Parser.prototype.discardCurrentEntry = function() {
  if (this.context) {
    this.context = null;
  }
};

Parser.prototype.finish = function() {
  if (this.context && this.context.file) {
    this.save();
  }
};

Parser.prototype.toJSON = function() {
  return this.entries;
};

module.exports = function(repoPath, files, done) {
  var parser = new Parser();
  var git = spawn(massGitBlamePath, [ files.join(' ') ], {
    cwd: path.dirname(repoPath)
  });
  var yielded;

  git.stderr.on('data', function(errChunk) {
    var err = errChunk.toString();
    var errCapture;

    if ((errCapture = err.match(/fatal: no such path '(.*)' in HEAD/))) {
      console.warn("[git] File could not be git-statted:", errCapture[1]);
      parser.discardCurrentEntry();
      // ignore the file
    }
    else {
      if (!yielded) {
        yielded = true;
        done('An error occured while parsing git stats for files:\n' + err.toString());
      }
    }
  });

  git.stdout.on('data', function(chunk) {
    parser.eat(chunk.toString());
  });

  git.stdout.on('end', function() {
    parser.finish();

    if (!yielded) {
      yielded = true;
      done(null, parser.toJSON());
    }
  });
};