#! /usr/bin/env node
var deploy = require('../deployandemail'),
    commandLineArgs = require('command-line-args'),
    fs = require("fs"),
    cli,
    args,
    opts;

cli = commandLineArgs([
  { name: 'config', alias: 'c', type: String }
]);

args = cli.parse();

if (typeof args.config === "undefined") {
  throw new Error("You must provide the 'config' argument.");
}

opts = JSON.parse(fs.readFileSync(args.config));

deploy(opts, function (err) {
  if (err) {
    process.exit(1);
  }

  process.exit(0);
});
