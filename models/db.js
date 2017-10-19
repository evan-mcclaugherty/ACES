"use strict"
require('dotenv').config();
const neo4j = require('neo4j-driver').v1;
let db;
if (process.env.NODE_ENV === 'production') {
  db = neo4j.driver(process.env.BOLT, neo4j.auth.basic(process.env.ACESU, process.env.ACESP));
} else {
  db = neo4j.driver("bolt://localhost", neo4j.auth.basic('neo4j', process.env.LOCALP));
}

const schema = Object.freeze({
  node: Object.freeze({
    User: 'User',
    Game: 'Game',
  }),
  relationship: Object.freeze({
    Likes: 'LIKES',
    Owns: 'OWN',
    Played: 'PLAYED',
    Won: 'WON'
  }),
});

module.exports = {
  db,
  schema
};