var Logger = require('./logger'),
    exec = require('./exec'),
    path = require("path"),
    escapeshellarg = require("escapeshellarg"),
    fs = require('fs'),
    cwd = process.cwd();

module.exports = function (opts, repoPath, buildPath, cb) {
  var logger = new Logger('install'),
      relativePath,
      packagePath,
      afterInstall;

  afterInstall = function (err) {
    if (err) {
      return cb(err, logger);
    }

    cb(null, logger);
  };

  relativePath = path.relative(repoPath, cwd);
  packagePath = path.join(buildPath, relativePath);

  exec(logger, 'npm install', {
    cwd: packagePath
  }, afterInstall);
};
