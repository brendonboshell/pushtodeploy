var Logger = require("./logger"),
    gitpull = require("./gitpull"),
    buildsrc = require("./buildsrc"),
    install = require("./install"),
    tests = require("./tests"),
    switchbuild = require("./switchbuild"),
    start = require("./start"),
    cleanup = require("./cleanup");

module.exports = function (opts, cb) {
  var logger = new Logger("pushtodeploy"),
      repoPath,
      buildPath,
      commit = null,
      afterGitpull,
      afterBuildsrc,
      afterInstall,
      afterTests,
      afterSwitchBuild,
      afterStart,
      afterCleanup;

  logger.log("the simple way to deploy an app");

  afterGitpull = function (err, _logger, uptodate) {
    logger.addLogger(_logger);

    if (err) {
      return cb(err, logger, commit);
    }

    if (typeof opts.buildsrc === "undefined") {
      opts.buildsrc = {};
    }

    if (typeof opts.deployIfUpToDate === "undefined") {
      opts.deployIfUpToDate = false;
    }

    if (uptodate && !opts.deployIfUpToDate) {
      logger.log("Repo is already up to date. Not deploying anything.");
      return cb(null, logger, commit);
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

    if (typeof opts.install === "undefined") {
      opts.install = {};
    }

    install(opts.install, repoPath, buildPath, afterInstall);
  };

  afterInstall = function (err, _logger) {
    logger.addLogger(_logger);

    if (err) {
      return cb(err, logger, commit);
    }

    if (typeof opts.tests === "undefined") {
      opts.tests = {};
    }

    tests(opts.tests, repoPath, buildPath, afterTests);
  };

  afterTests = function (err, _logger) {
    logger.addLogger(_logger);

    if (err) {
      return cb(err, logger, commit);
    }

    if (typeof opts.switchbuild === "undefined") {
      opts.switchbuild = {};
    }

    switchbuild(opts.switchbuild, repoPath, buildPath, afterSwitchBuild);
  };

  afterSwitchBuild = function (err, _logger) {
    logger.addLogger(_logger);

    if (err) {
      return cb(err, logger, commit);
    }

    if (typeof opts.start === "undefined") {
      opts.start = {};
    }

    start(opts.start, repoPath, buildPath, afterStart);
  };

  afterStart = function (err, _logger) {
    logger.addLogger(_logger);

    if (err) {
      return cb(err, logger, commit);
    }

    if (typeof opts.cleanup === "undefined") {
      opts.cleanup = {};
    }

    cleanup(opts.cleanup, buildPath, afterCleanup);
  };

  afterCleanup = function (err, _logger) {
    logger.addLogger(_logger);

    if (err) {
      return cb(err, logger, commit);
    }

    cb(null, logger, commit);
  };

  if (typeof opts.gitpull === "undefined") {
    opts.gitpull = {};
  }

  gitpull(opts.gitpull, afterGitpull);
};
