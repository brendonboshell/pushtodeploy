var Logger = require("./logger"),
    gitpull = require("./gitpull"),
    buildsrc = require("./buildsrc"),
    install = require("./install");

module.exports = function (opts, cb) {
  var logger = new Logger("pushtodeploy"),
      afterGitpull,
      afterBuildsrc,
      afterInstall;

  logger.log("the simple way to deploy an app");

  // 1. Update the repo
  // 2. Create a new build folder, copy node modules and symlink secrets
  // 3. Install the app
  // 4. Run tests
  // 5. Switch

  afterGitpull = function (err, _logger) {
    logger.addLogger(_logger);

    if (err) {
      return cb(err);
    }

    buildsrc(opts.buildsrc, afterBuildsrc);
  };

  afterBuildsrc = function (err, _logger, repoPath, buildPath) {
    logger.addLogger(_logger);

    if (err) {
      return cb(err);
    }

    install(opts.install, repoPath, buildPath, afterInstall);
  };

  afterInstall = function (err, _logger) {
    logger.addLogger(_logger);

    if (err) {
      return cb(err);
    }

    cb(null);
  };

  gitpull(opts.gitpull, afterGitpull);
};
