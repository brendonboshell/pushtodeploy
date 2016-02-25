var exec = require("child_process").exec;

module.exports = function (logger, cmd, execOpts, cb) {
  var stdout = "";

  // third argument is optional
  if (!cb) {
    cb = execOpts;
    execOpts = {};
  }

  logger.log("Exec: " + cmd + JSON.stringify(execOpts, null, 4));

  var cp = exec(cmd, execOpts);

  cp.stdout.on('data', function (data) {
    stdout += data.toString();
    logger.log(data.toString(), true);
  });

  cp.stderr.on('data', function (data) {
    logger.error(data.toString(), true);
  });

  cp.on("close", function (code) {
    if (code !== 0) {
      logger.error("Exec: Returned with non-zero error code");
      return cb(new Error(code));
    }

    logger.log("Exec: Complete!");
    return cb(null, stdout);
  });
};
