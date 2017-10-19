const {
  db,
  schema
} = require('./db');
const session = db.session();

module.exports = {
  singleGame: function (title) {
    return session
      .run(`
        MATCH (n:Game {title: '${title}'}) RETURN n
      `)
      .then(result => {
        result = result.records[0]._fields[0].properties;
        session.close();
        return result;
      });
  },
  getFavGames: function (obj) {
    return session
      .run(`
        MATCH (a:User)-[:${obj.relationship}]->(g:Game)
        WHERE a.username = '${obj.username}'
        RETURN g
      `)
      .then(result => {
        session.close();
        return result;
      })
  },
  deleteRelationship: function (obj) {
    return session
      .run(`
        MATCH (a:User)-[r:${obj.relationship}]->(b:Game)
        WHERE a.username = '${obj.username}' 
        AND b.title = '${obj.title}'
        DELETE r
      `)
      .then(result => {
        session.close();
        return result;
      })
  },
  addRelationship: function (obj) {
    return session
      .run(`
        MATCH (a:User),(b:Game)
        WHERE a.username = '${obj.username}' AND b.title = '${obj.title}'
        CREATE UNIQUE (a)-[r:${obj.relationship}]->(b)
        RETURN r
      `)
      .then(result => {
        session.close();
        return result;
      })
  },
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
      .run('MATCH (n:Game {title: {title}}) DETACH DELETE n', {
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
  getNonFavGames: function (username, cb) {
    let query = `
      MATCH (g:Game)
      where not (g)<-[:LIKES]-(:User {username: '${username}'})
      return g
    `;
    session
      .run(query)
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