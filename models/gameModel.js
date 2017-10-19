const {
  db,
  schema
} = require('./db');
const session = db.session();

module.exports = {
  singleGame: function (title) {
    return session
      .run(`
        MATCH (n:Game {title: '${title}'}) RETURN n as game
      `)
      .then(result => {
        session.close();
        return result.records;
      });
  },
  singleGameWins: function (title) {
    return session
      .run(`
        match (g:Game)-[r:WON]-(u) where g.title = '${title}' return r.times as wins, u.username as username order by r.times desc
      `)
      .then(result => {
        session.close();
        return result.records;
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
    if (obj.relationship === 'LIKES') {
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
        });
    } else {
      return session
        .run(`
          MATCH (a:User {username: '${obj.username}'}),(b:Game {title: '${obj.title}'})
          MERGE (a)-[r:${obj.relationship}]->(b)
            ON CREATE SET r.times = 1
            ON MATCH SET r.times = r.times + 1
            RETURN a.username, r, r.times
      `)
        .then(result => {
          session.close();
          return result;
        });
    }
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
  getAllGames: function () {
    return session
      .run(`
        MATCH (g:Game)
        RETURN g
      `)
      .then(result => {
        session.close();
        return result.records;
      })
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