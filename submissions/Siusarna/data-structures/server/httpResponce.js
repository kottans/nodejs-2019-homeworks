function success (res, data = null) {
  if (data) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
  } else {
    res.writeHead(200);
  }
  res.end(data);
}

function error (res, message) {
  res.writeHead(400, message);
  res.end();
}

const responseSender = {
  success,
  error
};

module.exports = responseSender;
