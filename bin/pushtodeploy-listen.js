#! /usr/bin/env node
var express = require("express"),
    commandLineArgs = require('command-line-args'),
    http = require("http"),
    app = express(),
    spawn = require("child_process").spawn,
    needsDeploy = false,
    deploying = false,
    cli,
    args;

cli = commandLineArgs([
  { name: 'port', alias: 'p', type: Number, defaultValue: 3123 },
  { name: 'path', alias: 'u', type: String, defaultValue: "/push" }
]);

args = cli.parse();

if (typeof args.port === "undefined") {
  throw new Error("You must provide the 'port' argument.");
}
if (typeof args.path === "undefined") {
  throw new Error("You must provide the 'path' argument.");
}

function checkDeploy () {
  if (deploying || !needsDeploy) {
    return;
  }

  needsDeploy = false;
  deploying = true;

  var cp = spawn("npm", ["run", "deploy"]);

  cp.stdout.on('data', function (data) {
    console.log(data.toString());
  });

  cp.stderr.on('data', function (data) {
    console.error(data.toString());
  });

  cp.on('close', function () {
    deploying = false;
    checkDeploy();
  });
}

app.use(args.path, function (req, res) {
  res.send(200);
  needsDeploy = true;
  checkDeploy();
});

http.createServer(app).listen(Number(args.port));
