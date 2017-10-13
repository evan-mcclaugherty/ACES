var logs = require('debug')('path');
module.exports = () => {
  return (req, res, next) => {
    let locals = res.locals;
    locals.message = message(req);
    locals.error = (msg) => {
      return locals.message(msg, "error");
    };
    locals.messages = req.session.messages || [];
    locals.removeMessages = () => {
      req.session.messages = [];
    };
    next();
  }
}

function message(req) {
  return (msg, type) => {
    type = type || 'info';
    let sesh = req.session;
    sesh.messages = sesh.messages || [];
    sesh.messages.push({
      msg,
      type
    })
  }
}