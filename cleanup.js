var Logger = require('./logger'),
    fs = require('fs'),
    path = require('path'),
    exec = require('./exec'),
    cwd = process.cwd(),
    async = require('async'),
    _ = require('underscore'),
    escapeshellarg = require("escapeshellarg");

module.exports = function (opts, buildPath, cb) {
  var logger = new Logger('cleanup     '),
      findCommit,
      removeDir,
      afterFindCommits,
      afterRemove;

  findCommit = function (hash, commitCb) {
    exec(logger, "git log --max-count=1 --pretty='format:%ct' " + hash, function (err, out) {
      if (err) {
        return commitCb(err);
      }

      commitCb(null, {
        hash: hash,
        time: Number(out.split(/[\r\n]/)[0])
      });
    });
  };

  removeDir = function (dir, removeCb) {
    exec(logger, "rm -rf " + escapeshellarg(dir), function (err) {
      if (err) {
        return removeCb(err);
      }

      removeCb(null);
    });
  };

  if (typeof opts.maxVersions === "undefined") {
    opts.maxVersions = 1;
  }

  logger.log('Cleaning up.');

  afterFindCommits = function (err, commits) {
    var numkept = 0,
        dirsToRemove = [];

    if (err) {
      return cb(err, logger);
    }

    _.sortBy(commits, function (c) { return (- c.time); }).forEach(function (commit) {
      if (buildPath.indexOf(commit.hash) !== -1) {
        logger.log("Keeping the current = " + commit.hash);
        return false;
      }

      if (numkept < opts.maxVersions) {
        numkept++;
        logger.log("Keeping " + commit.hash);
        return false;
      }

      logger.log("Removing " + commit.hash);
      dirsToRemove.push(path.join(cwd, ".pushtodeploy/", commit.hash));
    });

    async.map(dirsToRemove, removeDir, afterRemove);
  };

  afterRemove = function (err) {
    return cb(err, logger);
  };

  fs.readdir(path.join(cwd, ".pushtodeploy/"), function (err, dirs) {
    var hashes;

    if (err) {
      return cb(err, logger);
    }

    hashes = _.filter(dirs, function (dir) {
      return dir !== "current";
    });

    async.map(hashes, findCommit, afterFindCommits);
  });
};
