var Logger = require('./logger'),
    exec = require('./exec'),
    path = require("path"),
    cwd = process.cwd();

module.exports = function (opts, repoPath, buildPath, cb) {
  var logger = new Logger('test        '),
      relativePath,
      packagePath,
      afterTest;

  if (process.env.NODE_ENV === "production") {
    logger.log("This is production. Not running tests. Moving on.");
    return cb(null, logger);
  }

  afterTest = function (err) {
    if (err) {
      return cb(err, logger);
    }

    cb(null, logger);
  };

  relativePath = path.relative(repoPath, cwd);
  packagePath = path.join(buildPath, relativePath);

  exec(logger, 'npm test', {
    cwd: packagePath
  }, afterTest);
};
