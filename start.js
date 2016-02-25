var Logger = require('./logger'),
    exec = require('./exec'),
    path = require("path"),
    escapeshellarg = require("escapeshellarg"),
    cwd = process.cwd();

module.exports = function (opts, repoPath, buildPath, cb) {
  var logger = new Logger('start       '),
      relativePath,
      packagePath,
      afterStart;

  afterStart = function (err) {
    if (err) {
      return cb(err, logger);
    }

    cb(null, logger);
  };

  relativePath = path.relative(repoPath, cwd);
  packagePath = path.join(cwd, ".pushtodeploy/current", relativePath);

  exec(logger, 'cd ' + escapeshellarg(packagePath) + ' && npm start', {
    cwd: packagePath
  }, afterStart);
};
