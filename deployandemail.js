var deploy = require("./deploy"),
    nodemailer = require("nodemailer");

module.exports = function (opts, cb) {
  var afterDeploy,
      transport;

  if (typeof opts.email === "undefined") {
    opts.email = {};
  }

  if (typeof opts.email.enabled === "undefined") {
    opts.email.enabled = false;
  }

  if (typeof opts.email.smtp === "undefined") {
    opts.email.smtp = {};
  }

  if (opts.email.enabled) {
    transport = nodemailer.createTransport(opts.email.smtp);
  }

  afterDeploy = function (err, logger, commit) {
    // if commit is null, it was determined that a deployment is not necessary.
    if (!err && commit === null) {
      return cb(null);
    }

    if (!opts.email.enabled) {
      logger.log("Sending email disabled.");
      return cb(err);
    }

    if (err) {
      transport.sendMail({
        from: opts.email.from,
        to: opts.email.to,
        subject: "Build FAILURE - " + (commit ? commit.hash.substr(0, 6) : "Unknown Commit") + " on " + (commit ? commit.branch : "Unknown Branch"),
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
