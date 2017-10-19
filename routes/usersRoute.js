const users = require('../models/userModel');

exports.get = function (req, res, next) {
  users.getAll((error, users) => {
    if (error) {
      next(error);
    } else {
      users = users.map(user => user._fields[0].properties);
      res.render('users', {
        users
      });
    }
  })
}