const user = require('../models/userModel');

module.exports = () => {
  return (req, res, next) => {
    const username = req.session.username;
    if (!username) {
      return next();
    } else {
      user.verify(username, (err, record) => {
        if (err) {
          return next(err);
        } else if (record.length === 0) {
          next();
        } else {
          let userData = record[0]._fields[0].properties
          userData = {
            username: userData.username,
            name: userData.name,
            photo: userData.photo,
            extension: userData.extension,
            location: userData.location
          }
          req.user = res.locals.user = userData;
          next();
        }
      })
    }
  }
}