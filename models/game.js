const db = require('./db');
const session = db.session();

module.exports = {
  create: function (game, cb) {
    session
      .run('CREATE (n:Game {title: {title}, photo: {photo}}) RETURN n', {
        title: game.title,
        photo: game.src
      })
      .then(function (result) {
        cb(null, result.records);
        session.close();
      })
      .catch(function (error) {
        cb(error);
      });
  },
  delete: function (title, cb) {
    session
      .run('MATCH (n:Game {title: {title}}) DELETE n', {
        title
      })
      .then(function (result) {
        cb(null, result.records);
        session.close();
      })
      .catch(function (error) {
        cb(error);
      });
  },
  getAll: function (cb) {
    session
      .run('MATCH (n:Game) RETURN n')
      .then(function (result) {
        cb(null, result.records);
        session.close();
      })
      .catch(function (error) {
        cb(error)
      });
  },
  lookup: function (title, cb) {
    session
      .run('MATCH (n:Game {title: {title}}) RETURN n.title', {
        title
      })
      .then(function (result) {
        cb(null, result.records);
        session.close();
      })
      .catch(function (error) {
        cb(error);
      });
  }
}