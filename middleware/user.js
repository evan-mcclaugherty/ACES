const user = require('../models/user');

module.exports = () => {
  return (req, res, next) => {
    const username = req.session.username;
    if (!username) {
      return next();
    } else {
      user.verify(username, (err, user) => {
        if (err) {
          return next(err);
        } else {
          let props = user[0].n.properties;
          user = {
            username: props.username,
            name: props.name,
            photo: props.photo,
            extension: props.extension,
            location: props.location
          }
          req.user = res.locals.user = user;
          next();
        }
      })
    }
  }
}