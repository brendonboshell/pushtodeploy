var Logger = require("./logger"),
    gitpull = require("./gitpull"),
    buildsrc = require("./buildsrc"),
    install = require("./install"),
    tests = require("./tests"),
    switchbuild = require("./switchbuild"),
    start = require("./start");

module.exports = function (opts, cb) {
  var logger = new Logger("pushtodeploy"),
      repoPath,
      buildPath,
      commit = { hash: "unknown", branch: "unknown" },
      afterGitpull,
      afterBuildsrc,
      afterInstall,
      afterTests,
      afterSwitchBuild,
      afterStart;

  logger.log("the simple way to deploy an app");

  afterGitpull = function (err, _logger) {
    logger.addLogger(_logger);

    if (err) {
      return cb(err, logger, commit);
    }

    buildsrc(opts.buildsrc, afterBuildsrc);
  };

  afterBuildsrc = function (err, _logger, _repoPath, _buildPath, _commit) {
    logger.addLogger(_logger);

    repoPath = _repoPath;
    buildPath = _buildPath;
    commit = _commit;

    if (err) {
      return cb(err, logger, commit);
    }

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
      return cb(err, logger, commit);
    }

    switchbuild(opts.switchbuild, repoPath, buildPath, afterSwitchBuild);
  };

  afterSwitchBuild = function (err, _logger) {
    logger.addLogger(_logger);

    if (err) {
      return cb(err, logger, commit);
    }

    start(opts.start, repoPath, buildPath, afterStart);
  };

  afterStart = function (err, _logger) {
    logger.addLogger(_logger);

    if (err) {
      return cb(err, logger, commit);
    }

    cb(null, logger, commit);
  };

  gitpull(opts.gitpull, afterGitpull);
};
