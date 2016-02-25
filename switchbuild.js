var Logger = require('./logger'),
    exec = require('./exec'),
    path = require("path"),
    escapeshellarg = require("escapeshellarg"),
    cwd = process.cwd();

module.exports = function (opts, repoPath, buildPath, cb) {
  var logger = new Logger('switch'),
      currentPath,
      afterSwitch;

  afterSwitch = function (err) {
    if (err) {
      return cb(err, logger);
    }

    cb(null, logger);
  };

  currentPath = path.join(cwd, ".pushtodeploy/current");

  exec(logger, "ln -sfn " + escapeshellarg(buildPath) + " " +
    escapeshellarg(currentPath), afterSwitch);
};
