var Logger = require('./logger'),
    exec = require('./exec'),
    path = require("path"),
    escapeshellarg = require("escapeshellarg"),
    cwd = process.cwd();

module.exports = function (opts, cb) {
  var logger = new Logger('buildsrc    '),
      repoPath,
      buildPath,
      commit = { hash: "unknown", branch: "unknown" },
      afterGetGitPath,
      afterGetCommitHash,
      afterGetBranchName,
      afterGitClone,
      afterCopy,
      afterSymlink;

  afterGetGitPath = function (err, path) {
    if (err) {
      return cb(err, logger, repoPath, buildPath, commit);
    }

    repoPath = path.replace(/\s+/g, "");
    logger.log('Repo path: ' + repoPath);
    logger.log('Getting commit hash at HEAD');

    exec(logger, 'git rev-parse HEAD', afterGetCommitHash);
  };

  afterGetCommitHash = function (err, hash) {
    if (err) {
      return cb(err, logger, repoPath, buildPath, commit);
    }

    commit.hash = hash.replace(/\s+/g, "");
    logger.log('Commit hash: ' + commit.hash);
    logger.log('Getting branch name');

    exec(logger, 'git rev-parse --abbrev-ref HEAD', afterGetBranchName);
  };

  afterGetBranchName = function (err, branchname) {
    var currentPath;

    if (err) {
      return cb(err, logger, repoPath, buildPath, commit);
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
    var copyExecs = [];

    if (err) {
      return cb(err, logger, repoPath, buildPath, commit);
    }

    if (typeof opts.copyFromCurrent === "undefined") {
      opts.copyFromCurrent = [];
    }

    opts.copyFromCurrent.forEach(function (p) {
      var copyFrom,
          relativePath,
          copyTo;

      relativePath = path.relative(repoPath, cwd);
      copyFrom = path.join(cwd, ".pushtodeploy/current", relativePath, p);
      copyTo = path.join(cwd, ".pushtodeploy/" + commit.hash, relativePath, p);

      copyExecs.push("cp -R " + escapeshellarg(copyFrom) + " " +
        escapeshellarg(copyTo));
    });

    if (copyExecs.length === 0) {
      logger.log('Nothing to be copied.');
      return afterCopy(null);
    }

    exec(logger, copyExecs.join(' ; '), afterCopy);
  };

  afterCopy = function (err) {
    var symExecs = [];

    if (err) {
      logger.log('Copy failed. Ignoring this error.');
    }

    if (typeof opts.secrets === "undefined") {
      opts.secrets = [];
    }

    opts.secrets.forEach(function (secret) {
      var secretFrom,
          relativePath,
          secretTo;

      secretFrom = path.join(cwd, secret);
      relativePath = path.relative(repoPath, cwd);
      secretTo = path.join(cwd, ".pushtodeploy/" + commit.hash, relativePath, secret);

      symExecs.push("rm -rf " + escapeshellarg(secretTo) + " && ln -sfn " + escapeshellarg(secretFrom) + " " +
        escapeshellarg(secretTo));
    });

    if (symExecs.length === 0) {
      logger.log('No secrets to symlink');
      return afterSymlink(null);
    }

    exec(logger, symExecs.join(' && '), afterSymlink);
  };

  afterSymlink = function (err) {
    if (err) {
      return cb(err, logger, repoPath, buildPath, commit);
    }

    logger.log('buildsrc is completed successfully!');
    cb(null, logger, repoPath, buildPath, commit);
  };

  logger.log('Getting the repo path');

  exec(logger, 'git rev-parse --show-toplevel', afterGetGitPath);
};
