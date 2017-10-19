const game = require('../models/gameModel');
const schema = require('../models/db').schema;

exports.get = (req, res, next) => {
  const obj = {
    username: req.session.username,
    relationship: schema.relationship.Likes
  }
  game.getFavGames(obj)
    .then(results => {
      results = results.records.map(game => {
        return game._fields[0].properties;
      })
      res.render('profile', {
        favorite: results
      });
    })
    .catch(error => {
      next(error);
    })
}