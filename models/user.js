const db = require('./db');

const createUser = [
  'CREATE (n:User {name: {name}, password: {password}, location: {location}, extension: {extension},photo: {photo}})',
  'RETURN n'
].join('\n');

const deleteUser = [
  '',
  ''
].join('\n');

module.exports = {
  create: (user, cb) => {
    const params = {
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
  match: (name, cb) => {
    db.cypher({
      query: query,
      params: params,
    }, cb);
  }
}