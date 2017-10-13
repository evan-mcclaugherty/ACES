const db = require('./db');
const bcrypt = require('bcrypt');
const debug = require('debug')('path');

const createUser = [
  'CREATE (n:User {salt: {salt}, username: {username},name: {name}, password: {password}, location: {location}, extension: {extension},photo: {photo}})',
  'RETURN n'
].join('\n');

const deleteUser = [
  '',
  ''
].join('\n');

const verify = [
  'MATCH (n:User {username: {username}})',
  'RETURN n'
].join('\n');
module.exports = {
  create: function (user, cb) {
    this.hashPassword(user.password, (hash, salt) => {
      let params = {
        username: user.username,
        name: user.name,
        password: hash,
        location: user.location,
        extension: user.extension,
        photo: user.photo,
        salt: salt
      };
      db.cypher({
        query: createUser,
        params
      }, cb);
      params = {};
    });
  },
  delete: (name, cb) => {
    const params = {
      name
    };
    db.cypher({
      query: deleteUser,
      params
    }, cb)
  },
  verify: (username, cb) => {
    const params = {
      username
    }
    db.cypher({
      query: verify,
      params: params,
    }, cb);
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