var Logger = require('./logger'),
    exec = require('./exec'),
    path = require("path"),
    escapeshellarg = require("escapeshellarg"),
    fs = require('fs'),
    cwd = process.cwd();

module.exports = function (opts, cb) {
  var logger = new Logger('buildsrc'),
      repoPath,
      buildPath,
      commit = {},
      afterGetGitPath,
      afterGetCommitHash,
      afterGetBranchName,
      afterGitClone,
      afterCopyNodeModules;

  afterGetGitPath = function (err, path) {
    if (err) {
      return cb(err);
    }

    repoPath = path.replace(/\s+/g, "");
    logger.log('Repo path: ' + repoPath);
    logger.log('Getting commit hash at HEAD');

    exec(logger, 'git rev-parse HEAD', afterGetCommitHash);
  };

  afterGetCommitHash = function (err, hash) {
    if (err) {
      return cb(err);
    }

    commit.hash = hash.replace(/\s+/g, "");
    logger.log('Commit hash: ' + commit.hash);
    logger.log('Getting branch name');

    exec(logger, 'git rev-parse --abbrev-ref HEAD', afterGetBranchName);
  };

  afterGetBranchName = function (err, branchname) {
    var currentPath;

    if (err) {
      return cb(err);
    }

    commit.branch = branchname.replace(/\s+/g, "");
    buildPath = path.join(cwd, ".pushtodeploy/" + commit.hash);
    currentPath = path.join(cwd, ".pushtodeploy/current");

    logger.log('Branch: ' + commit.branch);
    logger.log('Cloning into ' + buildPath);

    exec(logger, "git clone " + escapeshellarg(repoPath) + " " +
      escapeshellarg(buildPath), afterGitClone);
  };

  afterGitClone = function (err) {
    var relativePath,
        nodeModulesFrom,
        nodeModulesTo;

    if (err) {
      return cb(err);
    }

    if (!opts.copyNodeModules) {
      logger.log('Copying node_modules is disabled. Moving on.');
      return afterCopyNodeModules(null);
    }

    logger.log('Copying node_modules from current deployment');
    relativePath = path.relative(repoPath, cwd);
    nodeModulesFrom = path.join(cwd, ".pushtodeploy/current", relativePath);

    exec(logger, "cp -R " + escapeshellarg(nodeModulesFrom) + " " +
      escapeshellarg(nodeModulesTo), afterCopyNodeModules);
  };

  afterCopyNodeModules = function (err) {
    if (err) {
      logger.log('Copy of node modules failed. Ignoring this error.');
    }

    logger.log('Symlinking secrets');
  };

  logger.log('Getting the repo path');

  exec(logger, 'git rev-parse --show-toplevel', afterGetGitPath);
};
