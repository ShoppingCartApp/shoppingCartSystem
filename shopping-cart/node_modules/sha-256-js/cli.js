#!/usr/bin/env node
var sha256 = require("./index"),
  colors = require("colors"),
	fs = require('fs'),
  utf8 = require('utf8'),
  program = require('commander'),
  pkg = require('./package.json'),
  version = pkg.version,
  message,
  filePath,
  compare,
  result,
  done;
  
program
  .version(version)
  .option('-m, --message [text]', 'text to apply sha-256')
  .option('-f, --file [path]', 'file to apply sha-256')
  .option('-c, --compare [checksum]', 'Checksum to compare generated with')
  .parse(process.argv);

message = program.message;
filePath = program.file;
compare = program.compare;

done = function(result) {
  if (compare) {
    if (compare.toLowerCase() === result.toLowerCase()) {
      console.log(
        colors.green.bold(result)
      );
    } else {
      console.log(
        colors.red.bold(result)
      );
    }
  } else {
    console.log(
      colors.white.bold(result)
    );
  }
};

if (filePath) {
  done(
    sha256(
      fs.readFileSync(filePath)
    )
  );
} else if (message) {
  done(
    sha256(
      utf8.encode(message)
    )
  );
} else {
  console.log(
    colors.white.bold('ERROR: Must use with either -m [text] or -f [path]')
  );
  program.help();
}
