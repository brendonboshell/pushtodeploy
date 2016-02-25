var Logger = function (category) {
  this.category = category;
  this.logs = [];
  this.incompleteLine = "";
};

Logger.prototype.addLogger = function (logger) {
  this.logs.push(logger);
};

Logger.prototype._log = function (str, isAppend, isError) {
  var index,
      line;

  if (!isAppend) {
    // if there's an outstanding line, terminate it.
    if (this.incompleteLine) {
      this.incompleteLine += "\n";
    }

    str += "\n";
  }

  str = this.incompleteLine + str;

  do {
    index = str.indexOf("\n");

    if (index !== -1) {
      line = "[" + this.category + "] " + str.substr(0, index + 1);

      if (isError) {
        process.stdout.write("\u001b[31m" + line + "\u001b[39m");
      } else {
        process.stdout.write(line);
      }
      this.logs.push(line);
      str = str.substr(index + 1);
    }
  } while (index !== -1);

  this.incompleteLine = str;
};

Logger.prototype.log = function (str, isAppend) {
  this._log(str, isAppend);
};

Logger.prototype.error = function (str, isAppend) {
  this._log(str, isAppend, true);
};

module.exports = Logger;
