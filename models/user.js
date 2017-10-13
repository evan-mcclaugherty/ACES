const db = require('./db');

const createUser = [
  'CREATE (n:User {username: {username},name: {name}, password: {password}, location: {location}, extension: {extension},photo: {photo}})',
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
  create: (user, cb) => {
    const params = {
      username: user.username,
      name: user.name,
      password: user.password,
      location: user.location,
      extension: user.extension,
      photo: user.photo
    };
    db.cypher({
      query: createUser, params
    }, cb);
  },
  delete: (name, cb) => {
    const params = {
      name
    };
    db.cypher({
      query: deleteUser, params
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
  }
}