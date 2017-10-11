var express = require('express');
var router = express.Router();
const games = [
  {title: 'Escape From Space'},
  {title: 'Monopoly'},
  {title: 'Tic Tac Toe'}
]
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {
    games
  });
});

module.exports = router;