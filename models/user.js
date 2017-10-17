const db = require('./db');
const session = db.session();
const bcrypt = require('bcrypt');

module.exports = {
  create: function (user, cb) {
    this.hashPassword(user.password, (hash, salt) => {
      session
        .run(`CREATE (n:User {
          salt: {salt}, 
          username: {username},
          name: {name}, 
          password: {password},  
          location: {location}, 
          extension: {extension},
          photo: {photo}
        }) RETURN n`, {
          username: user.username,
          name: user.name,
          password: hash,
          location: user.location,
          extension: user.extension,
          photo: user.src,
          salt: salt
        })
        .then(function (result) {
          cb(null, result.records[0])
          session.close();
        })
        .catch(function (error) {
          console.log(error);
          cb(error);
        });
    })
  },
  delete: function (name, cb) {
    session
      .run('MATCH (n:User {name: {name}}) DELETE n', {
        name
      })
      .then(function (result) {
        cb(error, result.records[0])
        session.close();
      })
      .catch(function (error) {
        cb(error);
      });
  },
  verify: function (username, cb) {
    session
      .run("MATCH (n:User {username: {username}}) RETURN n", {
        username
      })
      .then(function (result) {
        cb(null, result.records);
        session.close();
      })
      .catch(function (error) {
        cb(error);
      });
  },
  hashPassword: (password, cb) => {
    bcrypt.genSalt(12, (err, salt) => {
      bcrypt.hash(password, salt, (err, hash) => {
        cb(hash, salt);
      })
    })
  },
  authenticate: (hash1, password, salt, cb) => {
    bcrypt.hash(password, salt, (err, hash2) => {
      if (err) {
        return cb(err);
      } else if (hash1 === hash2) {
        return cb(null, true);
      } else {
        cb();
      }
    })
  }
}