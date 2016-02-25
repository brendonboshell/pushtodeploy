var deploy = require("./deploy"),
    nodemailer = require("nodemailer"),
    transport;

module.exports = function (opts, cb) {
  var afterDeploy;

  transport = nodemailer.createTransport(opts.email.smtp);

  afterDeploy = function (err, logger, commit) {
    if (err) {
      transport.sendMail({
        from: opts.email.from,
        to: opts.email.to,
        subject: "Build FAILURE - " + commit.hash.substr(0, 6) + " on " + commit.branch,
        text: logger.toString()
      }, function (err) {
        if (err) {
          logger.error("Failed to send email");
          return cb(new Error("Could not send email"));
        }

        cb(null);
      });
      return;
    }

    transport.sendMail({
      from: opts.email.from,
      to: opts.email.to,
      subject: "Build SUCCESS - " + commit.hash.substr(0, 6) + " on " + commit.branch,
      text: logger.toString()
    }, function (err) {
      if (err) {
        logger.error("Failed to send email");
        return cb(new Error("Could not send email"));
      }

      cb(null);
    });
  };

  deploy(opts, afterDeploy);
};
