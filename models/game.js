const db = require('./db');
const debug = require('debug')('path');

const createGame = [
  'CREATE (n:Game {title: {title}, photo: {photo}})',
  'RETURN n'
].join('\n');

const deleteGame = [
  'MATCH (n:Game {title: {title}})',
  'DELETE n'
].join('\n');

const allGames = [
  'MATCH (n:Game)',
  'RETURN n'
].join('\n');

const lookupGame = [
  'MATCH (n:Game {title: {title}})',
  'RETURN n'
].join('\n');

module.exports = {
  create: function (game, cb) {
    let params = {
      title: game.title,
      photo: game.src
    };
    db.cypher({
      query: createGame,
      params
    }, cb);
    params = {};
  },
  delete: (title, cb) => {
    const params = {
      title
    };
    db.cypher({
      query: deleteGame,
      params
    }, cb)
  },
  getAll: (cb) => {
    db.cypher({
      query: allGames
    }, cb)
  },
  lookup: (title, cb) => {
    const params = {
      title
    }
    db.cypher({
      query: lookupGame,
      params: params,
    }, cb);
  }
}