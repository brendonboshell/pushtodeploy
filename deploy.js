var Logger = require("./logger"),
    gitpull = require("./gitpull"),
    buildsrc = require("./buildsrc"),
    install = require("./install"),
    tests = require("./tests"),
    switchbuild = require("./switchbuild");

module.exports = function (opts, cb) {
  var logger = new Logger("pushtodeploy"),
      repoPath,
      buildPath,
      afterGitpull,
      afterBuildsrc,
      afterInstall,
      afterTests,
      afterSwitchBuild;

  logger.log("the simple way to deploy an app");

  afterGitpull = function (err, _logger) {
    logger.addLogger(_logger);

    if (err) {
      return cb(err);
    }

    buildsrc(opts.buildsrc, afterBuildsrc);
  };

  afterBuildsrc = function (err, _logger, _repoPath, _buildPath) {
    logger.addLogger(_logger);

    if (err) {
      return cb(err);
    }

    repoPath = _repoPath;
    buildPath = _buildPath;

    install(opts.install, repoPath, buildPath, afterInstall);
  };

  afterInstall = function (err, _logger) {
    logger.addLogger(_logger);

    if (err) {
      return cb(err);
    }

    tests(opts.tests, repoPath, buildPath, afterTests);
  };

  afterTests = function (err, _logger) {
    logger.addLogger(_logger);

    if (err) {
      return cb(err);
    }

    switchbuild(opts.switchbuild, repoPath, buildPath, afterSwitchBuild);
  };

  afterSwitchBuild = function (err, _logger) {
    logger.addLogger(_logger);

    if (err) {
      return cb(err);
    }

    cb(null);
  };

  gitpull(opts.gitpull, afterGitpull);
};
