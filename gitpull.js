var Logger = require('./logger'),
    exec = require('./exec');

module.exports = function (opts, cb) {
  var logger = new Logger('gitpull     ');

  if (typeof opts.enabled === "undefined") {
    opts.enabled = true;
  }

  if (!opts.enabled) {
    logger.log('gitpull is disabled. Moving on.');
    return cb(null, logger);
  }

  logger.log('Doing a git pull');

  exec(logger, 'git pull', function (err) {
    cb(err, logger);
  });
};
