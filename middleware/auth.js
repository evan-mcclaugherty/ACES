module.exports = () => {
  return (req, res, next) => {
    if (!req.session.username) {
      res.render('auth');
    } else {
      next();
    }
  }
}