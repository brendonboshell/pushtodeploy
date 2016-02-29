var Logger = require('./logger'),
    exec = require('./exec');

module.exports = function (opts, cb) {
  var logger = new Logger('gitpull     '),
      uptodate = true;

  if (typeof opts.enabled === "undefined") {
    opts.enabled = true;
  }

  if (!opts.enabled) {
    logger.log('gitpull is disabled. Moving on.');
    return cb(null, logger);
  }

  logger.log('Doing a git pull');

  exec(logger, 'git pull', function (err, out) {
    if (typeof out === "string" && !out.match(/^Already up-to-date/i)) {
      uptodate = false;
    }

    cb(err, logger, uptodate);
  });
};
