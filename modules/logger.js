const fs = require('fs');


function getLogStream(log_file_path) {

  if (!fs.existsSync(log_file_path)) {
    fs.mkdirSync(log_file_path, { recursive: true });
  }
  // Create a writable stream to the log file
  const log_stream = fs.createWriteStream(`${log_file_path}/logs.txt` || './logs-file.txt', { flags: 'a' }); // 'a' flag appends to the file

  // Redirect console.log output to the log stream
  console.oldLog = console.log;
  console.log = function (...args) {
    let log_msg = `[${new Date().toISOString()}] ${args.map(arg => (typeof arg !== 'string') ? JSON.stringify(arg, null, 4) : arg)}\n`;
    log_stream.write(log_msg);
    console.oldLog.apply(console, arguments);
  };

  return log_stream;

}

module.exports = getLogStream;
